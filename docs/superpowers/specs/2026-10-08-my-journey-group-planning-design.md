# My Journey & Group Planning: lên kế hoạch chuyến đi cùng bạn bè

Ngày: 2026-10-08 · Trạng thái: chờ duyệt spec

## Mục tiêu

Một nơi để khách lên kế hoạch chuyến đi trước khi đặt: chọn các dịch vụ của Vietravel (khách sạn, vé máy bay, thuê xe, vui chơi, tour), xếp theo ngày, ước tính chi phí cả nhóm, và mời bạn bè cùng bàn, bình chọn, bình luận. Khi chốt, khách bấm "Đặt" để sang travel.com.vn.

Nguồn yêu cầu: tin nhắn của người dùng (08/10) và mục 13 "My Journey & Group Planning" trong `docs/spec/Vietravel_Explorer_Dac_Ta_Tong_The_Trinh_Ban_Lanh_Dao.docx`.

Đã chốt với người dùng:
- Dữ liệu khách sạn, vé máy bay, thuê xe, giá vé vui chơi là **mockup**. Tour dùng dữ liệu thật trong `tours.json`.
- Mời bạn bè **bằng link, không có tài khoản**. Người mở link nhập tên hiển thị.
- Lưu **file JSON trên server**. Cập nhật nhóm bằng polling 3 giây.
- Tính năng nhóm bản đầu: **bình chọn, bình luận, tổng chi phí dự kiến, link được sửa / link chỉ xem**.
- Kiến trúc: **mỗi thao tác là một lệnh gửi lên server** (không gửi nguyên kế hoạch), để hai người sửa cùng lúc không đè nhau.
- **Giữ cổng mật khẩu demo**: người được mời cũng phải đăng nhập `DEMO_PASSWORD`.

Journey là nơi lập kế hoạch, không phải giỏ hàng: không giữ chỗ, không thanh toán.

## Phạm vi

Có:
- `/hanh-trinh`: danh sách kế hoạch đã tạo hoặc đã tham gia trên trình duyệt này, nút tạo kế hoạch.
- `/hanh-trinh/[token]`: màn hình kế hoạch. Token quyết định quyền sửa hay chỉ xem.
- Nút "+ Thêm vào kế hoạch" trên trang `/diem-den/phu-quoc`.
- Mục "Kế hoạch của tôi" trên header Explorer.

Không có (giai đoạn sau): tài khoản và đăng nhập riêng, copy/remix kế hoạch công khai, bản đồ lộ trình, Tripi tối ưu kế hoạch, checklist chung, lịch sử thay đổi, đặt và thanh toán trong app, điểm đến khác ngoài Phú Quốc, cập nhật thời gian thực qua WebSocket.

## Dữ liệu

### Danh mục dịch vụ

```ts
type ServiceKind = "hotel" | "flight" | "vehicle" | "activity" | "tour"
type PriceUnit = "per_person" | "per_room_night" | "per_day" | "per_booking"

interface ChildRate {
  /** Áp dụng cho trẻ có tuổi < underAge. Bậc đầu tiên khớp được dùng. */
  underAge: number
  /** 0 = miễn phí, 0.75 = 75% giá người lớn. */
  rate: number
}

interface ServiceItem {
  id: string
  kind: ServiceKind
  destinationSlug: string
  name: string
  tag: string
  blurb: string
  imageUrl?: string
  priceVnd: number
  priceUnit: PriceUnit
  /** Sắp tăng dần theo underAge. Thiếu thì trẻ em trả như người lớn. */
  childRates?: ChildRate[]
  bookUrl: string
  /** true: dữ liệu mockup, giao diện hiện nhãn "Giá tham khảo (demo)". */
  mock: boolean
}
```

| Loại | Nguồn | id | Ghi chú |
|---|---|---|---|
| hotel | mock, 6 mục (homestay → resort), tên tự đặt, không dùng tên khách sạn thật | `hotel-pq-01`… | `per_room_night`, trẻ em không tính tiền |
| flight | mock, khứ hồi SGN/HAN/DAD/VCA → PQC | `flight-sgn-pqc`… | `per_person`; trẻ < 2 tuổi 10%, < 12 tuổi 75% |
| vehicle | mock: xe máy, ô tô 4 chỗ có tài xế, ô tô 7 chỗ, đưa đón sân bay | `vehicle-pq-01`… | `per_day` hoặc `per_booking` |
| activity | `guide.activities` có sẵn + giá vé mock | `activity-<slug tên>` | `per_person`; trẻ < 1 tuổi miễn phí, < 12 tuổi 75% (mock) |
| tour | `toursForDestination(guide)` | `tour-<code>` | giá thật, `mock: false`; trẻ < 5 tuổi miễn phí, < 12 tuổi 75% (theo trang tour Vietravel) |

Trẻ từ 12 tuổi trở lên tính như người lớn ở mọi dịch vụ.

`bookUrl` của mock trỏ vào trang có thật trên travel.com.vn (`/du-lich-phu-quoc` hoặc trang tour). Không dùng `/khach-san-phu-quoc` và `/ve-may-bay` vì đang lỗi (báo cáo pq-traveler 08/10).

### Kế hoạch

```ts
interface JourneyMember { id: string; name: string; joinedAt: string }

interface JourneyComment { id: string; memberId: string; text: string; at: string }

interface JourneyItem {
  id: string
  serviceId: string
  /** Chụp lại lúc thêm; danh mục đổi sau đó không làm sai kế hoạch cũ. */
  snapshot: Pick<ServiceItem, "name" | "kind" | "tag" | "priceVnd" | "priceUnit" | "childRates" | "imageUrl" | "bookUrl" | "mock">
  /** null = "Đang cân nhắc"; 1..nights+1 = ngày trong chuyến. */
  day: number | null
  order: number
  /** null = tự tính theo số người (xem Chi phí). */
  quantity: number | null
  addedBy: string
  votes: Record<string, 1 | -1>
  comments: JourneyComment[]
}

interface Journey {
  id: string
  version: number
  title: string
  destinationSlug: string
  startDate: string | null
  nights: number
  travelers: { adults: number; childAges: number[] }
  editToken: string
  viewToken: string
  members: JourneyMember[]
  items: JourneyItem[]
  createdAt: string
  updatedAt: string
}
```

Giới hạn (kiểm tra ở server): tên kế hoạch 1–80 ký tự; `nights` 0–14; người lớn 1–20; trẻ em 0–10, tuổi 0–17; tên thành viên 1–40 ký tự; tối đa 30 thành viên, 100 mục; bình luận 1–500 ký tự, tối đa 50 bình luận mỗi mục.

Token: 16 byte ngẫu nhiên (`crypto.randomBytes`), dạng base64url. `id` là UUID.

Khi giảm `nights`, các mục có `day > nights + 1` chuyển về "Đang cân nhắc".

### Chi phí

`estimateCost(journey): { totalVnd; perAdultVnd; byKind: Record<ServiceKind, number> }`. Chỉ tính các mục có `day !== null`.

| Đơn vị | Công thức |
|---|---|
| `per_person` | giá × (người lớn + Σ hệ số từng bé theo `childRates`) |
| `per_room_night` | giá × max(nights, 1) × số phòng; số phòng = `quantity` ?? ceil(người lớn / 2) |
| `per_day` | giá × (nights + 1) × (`quantity` ?? 1) |
| `per_booking` | giá × (`quantity` ?? 1) |

`perAdultVnd` = tổng / số người lớn, làm tròn nghìn đồng. Giao diện luôn ghi "Giá tham khảo, chưa phải giá đặt".

## Màn hình

### Bắt đầu
- Header: thêm mục "Kế hoạch của tôi" → `/hanh-trinh`.
- `/hanh-trinh`: danh sách đọc từ localStorage (`journeys` = token + tên + quyền), nút "Tạo kế hoạch".
- Form tạo: tên chuyến (mặc định "Phú Quốc tháng <tháng sau>"), ngày đi (không bắt buộc), số đêm (mặc định 2), số người lớn, tuổi từng bé, tên của bạn. Tạo xong chuyển sang `/hanh-trinh/<editToken>`.
- Trang Phú Quốc: thẻ trong khối Vui chơi và danh sách Tour có nút "+ Thêm vào kế hoạch". Khối Lưu trú có một nút "Chọn khách sạn cho kế hoạch" mở bảng chọn ở tab Khách sạn. Nếu chưa có kế hoạch, nút mở form tạo nhanh; nếu có nhiều kế hoạch được sửa, hiện danh sách để chọn.

### Màn hình kế hoạch `/hanh-trinh/[token]`
- Đầu trang: tên, ngày, số người, avatar chữ cái của thành viên, nút "+ Mời", nhãn quyền ("Đang sửa · Lan" hoặc "Chỉ xem").
- Cột trái: nhóm "Đang cân nhắc" (sắp theo tổng phiếu giảm dần, rồi theo `order`), sau đó Ngày 1..nights+1 (có ngày cụ thể nếu có `startDate`). Nút "+ Thêm dịch vụ".
- Mỗi mục: ảnh nhỏ, tên, nhãn loại, giá và đơn vị, nhãn "Giá tham khảo (demo)" nếu `mock`; 👍/👎 kèm số phiếu (bấm lại để bỏ); 💬 số bình luận, bấm mở khung bình luận ngay dưới mục; menu ⋯: Chuyển sang ngày…, Lên, Xuống, Sửa số lượng, Xóa; nút "Đặt" mở `bookUrl` tab mới.
- Cột phải (desktop): Chi phí dự kiến: tổng, mỗi người lớn, theo loại; nút "Đặt dịch vụ trên travel.com.vn". Điện thoại: thanh dính đáy "Tổng ~18,4tr · Xem chi tiết" mở bảng chi tiết.
- Bảng chọn dịch vụ: tab Khách sạn / Vé máy bay / Thuê xe / Vui chơi / Tour, mỗi thẻ có nút Thêm (vào "Đang cân nhắc").
- Mời: hộp thoại hiện link được sửa và link chỉ xem, mỗi link có nút Sao chép. Link chỉ xem hiện cho cả người chỉ xem; link được sửa chỉ hiện cho người có quyền sửa.
- Lần đầu mở link: hỏi tên, gửi `join`, lưu `memberId` vào localStorage theo `journey.id`. Người chỉ xem không cần nhập tên.
- Người chỉ xem: thấy mọi thứ, ẩn mọi nút thao tác.
- Đổi thứ tự dùng nút Lên/Xuống, không kéo thả.

## Kiến trúc

| Đơn vị | Vai trò |
|---|---|
| `src/types/journey.ts` | Kiểu ở mục Dữ liệu |
| `src/data/services/phu-quoc.ts` | Mock khách sạn, vé bay, thuê xe; bảng giá vé mock cho activities |
| `src/lib/journey/catalog.ts` | `getServices(slug, kind?)`, `getService(id)`. Chỗ duy nhất phải đổi khi có API Hub |
| `src/lib/journey/cost.ts` | `estimateCost`, hàm thuần |
| `src/lib/journey/operations.ts` | `applyOp(journey, op, actor): Journey`, hàm thuần; kiểm tra dữ liệu và quyền, ném `JourneyError(status, message)` |
| `src/lib/journey/store.ts` | Interface `JourneyStore` + `FileJourneyStore` |
| `src/app/api/journeys/route.ts` | `POST` tạo kế hoạch |
| `src/app/api/journeys/by-token/[token]/route.ts` | `GET` lấy kế hoạch |
| `src/app/api/journeys/[id]/ops/route.ts` | `POST` một thao tác |
| `src/services/journey.service.ts` | Gọi HTTP phía client (axios, theo `avatar.service.ts`) |
| `src/hooks/use-journey.ts` | Polling, cập nhật lạc quan, rollback |
| `src/components/journey/*` | Giao diện |
| `src/app/hanh-trinh/page.tsx`, `src/app/hanh-trinh/[token]/page.tsx` | Trang |

### Store

```ts
interface JourneyStore {
  create(journey: Journey): Promise<void>
  get(id: string): Promise<Journey | null>
  findByToken(token: string): Promise<{ journey: Journey; role: "edit" | "view" } | null>
  update(id: string, fn: (journey: Journey) => Journey): Promise<Journey>
}
```

`FileJourneyStore`:
- Thư mục `process.env.JOURNEY_DATA_DIR ?? ".data/journeys"`, thêm `/.data/` vào `.gitignore`.
- Mỗi kế hoạch một file `<id>.json`, thêm `tokens.json` để tra token ra id và quyền.
- Ghi: ghi file tạm rồi `rename`. `update` chạy tuần tự theo từng id bằng hàng đợi Promise trong bộ nhớ; `update` tăng `version`, gán `updatedAt`.
- Hạn chế: khóa chỉ đúng trong một tiến trình Node. Ghi chú trong code: triển khai nhiều instance hoặc serverless thì thay bằng store Postgres/KV cài cùng interface.

### API

Tất cả nằm sau `middleware.ts` (cổng mật khẩu giữ nguyên). Không trả `editToken` cho người có quyền chỉ xem.

- `POST /api/journeys` body `{ title, startDate, nights, travelers, memberName, destinationSlug }` → `201 { journey, memberId }`.
- `GET /api/journeys/by-token/[token]?since=<version>` → `200 { journey, role }`, hoặc `204` khi `version` không đổi, `404` token sai.
- `POST /api/journeys/[id]/ops` body `{ token, memberId?, op }` → `200 { journey }`.

`op`:

```ts
type JourneyOp =
  | { type: "join"; name: string }
  | { type: "updateInfo"; title?: string; startDate?: string | null; nights?: number; travelers?: Journey["travelers"] }
  | { type: "addItem"; serviceId: string }
  | { type: "removeItem"; itemId: string }
  | { type: "moveItem"; itemId: string; day: number | null; order?: number }
  | { type: "setQuantity"; itemId: string; quantity: number | null }
  | { type: "vote"; itemId: string; value: 1 | -1 }
  | { type: "comment"; itemId: string; text: string }
```

Quyền: token chỉ xem → mọi op trả `403`. Token sửa → mọi op trừ `join` cần `memberId` thuộc `members` (sai → `403`). `token` không khớp `id` → `404`. `vote` cùng giá trị lần nữa thì bỏ phiếu.

### Lỗi
- `400` dữ liệu sai (serviceId không có, ngoài giới hạn); `403` không có quyền; `404` không thấy kế hoạch hoặc mục.
- Client: cập nhật lạc quan; lỗi thì rollback về bản server gần nhất và hiện toast tiếng Việt (`sonner`). Lỗi mạng khi polling: hiện nhãn "Mất kết nối", tiếp tục thử.
- Trang token sai: "Không tìm thấy kế hoạch" + nút về `/hanh-trinh`.

## Kiểm thử

Script `node:assert`, chạy `npx tsx <file>`:
- `src/lib/journey/cost.test.ts`: nhà 2 người lớn + bé 3 và 7 tuổi (vé bay bé 75%, tour bé 3 tuổi miễn phí); 3 người lớn → 2 phòng; mục "Đang cân nhắc" không tính; kế hoạch rỗng = 0; `nights = 0` vẫn tính 1 đêm phòng.
- `src/lib/journey/operations.test.ts`: thêm/xóa/chuyển ngày/đổi thứ tự; vote bấm lại để bỏ; bình luận rỗng hoặc > 500 ký tự bị từ chối; token chỉ xem bị 403; serviceId lạ bị 400; giảm `nights` đẩy mục về "Đang cân nhắc".
- `src/lib/journey/store.test.ts`: thư mục tạm, 20 `addItem` song song → đủ 20 mục, `version` tăng đúng 20; `findByToken` phân biệt edit/view.
- `src/lib/journey/catalog.test.ts`: id không trùng; mọi mục có `bookUrl`; mọi mock có `mock: true`; tour có `mock: false`.
- Thủ công: 2 trình duyệt (link sửa + link xem), thêm và vote ở một bên, bên kia thấy sau ≤ 3 giây; khổ 390px; `pnpm lint`, `npx tsc --noEmit`.

## Rủi ro / giả định
- Dữ liệu mock có thể bị hiểu là giá thật: luôn gắn nhãn "Giá tham khảo (demo)", tên khách sạn tự đặt.
- Ai có link sửa đều sửa được và có thể đổi tên giả người khác: chấp nhận cho demo nội bộ sau cổng mật khẩu.
- File JSON không hợp với Vercel/serverless; đường nâng cấp là store Postgres/KV cùng interface.
- Polling 3 giây với nhóm nhỏ không đáng kể; `204` khi không đổi để nhẹ.
