# My Journey & Group Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm nơi lên kế hoạch chuyến đi Phú Quốc: chọn dịch vụ (khách sạn, vé bay, thuê xe, vui chơi, tour), xếp theo ngày, ước tính chi phí cả nhóm, mời bạn bè bằng link để cùng bình chọn và bình luận.

**Architecture:** Logic thuần trong `src/lib/journey/` (danh mục, chi phí, thao tác `applyOp` dùng chung server và client). Server lưu mỗi kế hoạch một file JSON qua interface `JourneyStore`, ghi tuần tự theo từng kế hoạch. Client gửi từng thao tác lên `POST /api/journeys/[id]/ops`, cập nhật lạc quan bằng chính `applyOp`, và hỏi lại server mỗi 3 giây bằng `?since=<version>` (trả `204` khi không đổi).

**Tech Stack:** Next 15.5 App Router, React 19, Tailwind 4, `radix-ui` (Dialog, Tabs, DropdownMenu), `sonner`, `axios`, `lucide-react`. Test bằng `node:assert` chạy qua `npx tsx`.

**Spec:** [docs/superpowers/specs/2026-10-08-my-journey-group-planning-design.md](../specs/2026-10-08-my-journey-group-planning-design.md)

Điều chỉnh nhỏ so với spec (đã cân nhắc khi lập kế hoạch):
- Chỉ mục **tour** có ảnh thu nhỏ (ảnh S3 của Vietravel). Ảnh khách sạn/vui chơi hiện có là ảnh Creative Commons bắt buộc ghi công, nên các mục mock dùng icon theo loại thay vì ảnh.
- `getService(slug, id)` nhận thêm `slug` vì danh mục theo điểm đến.
- `ExplorerShell` thêm prop `showTripi` để ẩn nút nổi "Hỏi Tripi" trên trang kế hoạch (thanh chi phí trên điện thoại nằm ở cùng góc).

## Global Constraints

- Mọi chữ hiển thị, comment bằng tiếng Việt có dấu; gọi người dùng là "Quý khách".
- Không thêm dependency mới. Dùng `radix-ui`, `sonner`, `axios`, `lucide-react` đã có.
- Không sửa `src/middleware.ts`: mọi trang và API Journey nằm sau cổng mật khẩu demo.
- Dữ liệu khách sạn, vé bay, thuê xe, giá vé vui chơi là mock: `mock: true`, giao diện ghi "Giá tham khảo (demo)", tên khách sạn tự đặt. Tour dùng `tours.json`, `mock: false`.
- `bookUrl` không được dùng `https://travel.com.vn/khach-san-phu-quoc` hay `https://travel.com.vn/ve-may-bay` (đang lỗi).
- Giới hạn (server kiểm tra): tên kế hoạch 1–80 ký tự; `nights` 0–14; người lớn 1–20; trẻ em 0–10, tuổi 0–17; tên thành viên 1–40; tối đa 30 thành viên, 100 mục; bình luận 1–500 ký tự, tối đa 50 bình luận mỗi mục; số lượng 1–20.
- Lưu trữ ở `process.env.JOURNEY_DATA_DIR ?? .data/journeys`; `/.data/` nằm trong `.gitignore`.
- Radix Dialog/DropdownMenu render qua Portal bọc trong `<div className="explorer contents">` để nhận biến màu của `.explorer` và không bị `Reveal` (có transform) làm lệch `position: fixed`.
- Mỗi commit chỉ `git add` đúng file của task, không `git add -A`. Commit message kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Chạy lệnh từ `/Users/baoduong/vietravel-demo`. Type check: `pnpm exec tsc --noEmit`. Lint: `pnpm lint`.

## Review Focus

- Token hoặc id do người dùng gửi lên mang giá trị lạ (`__proto__`, `constructor`, `../tokens`, chuỗi không phải UUID): phải ra "không tìm thấy", không đọc file ngoài thư mục lưu trữ (test ở Task 4).
- Body không phải JSON, thiếu trường, `op` lạ: trả `400`/`404` có thông báo tiếng Việt, không bao giờ `500` (test ở Task 3, kiểm tra curl ở Task 5).
- Server tắt giữa lúc ghi: file kế hoạch và `tokens.json` không được hỏng hay còn file `.tmp` (ghi file tạm rồi `rename`, test ở Task 4).
- localStorage bị chặn (chế độ riêng tư) hoặc chứa dữ liệu hỏng: danh sách "Kế hoạch của tôi" trống, trang không crash (test ở Task 6).
- Mở link sửa nhưng chưa nhập tên, hoặc memberId đã lưu không còn trong kế hoạch: mọi thao tác sửa bị `403`, giao diện hiện form nhập tên (test ở Task 3, kiểm tra tay ở Task 8).

---

## File Structure

Mới:
- `src/types/journey.ts`: kiểu Journey, ServiceItem, thao tác, request/response; nhãn hiển thị.
- `src/data/services/phu-quoc.ts`: mock khách sạn, vé bay, thuê xe; giá vé mock cho hoạt động.
- `src/lib/journey/ids.ts`: `slugify`, id dịch vụ hoạt động/tour.
- `src/lib/journey/catalog.ts` (+ `catalog.test.ts`): `getServices`, `getService`. Chỗ duy nhất đổi khi có API Hub.
- `src/lib/journey/cost.ts` (+ `cost.test.ts`): `estimateCost`, `itemCost`, `childFactor`, `defaultQuantity`.
- `src/lib/journey/errors.ts`: `JourneyError`.
- `src/lib/journey/operations.ts` (+ `operations.test.ts`): parse dữ liệu, `applyOp`, `forRole`, `voteScore`. Không import gì của Node, dùng được ở client.
- `src/lib/journey/create.ts`: `createJourney` (server, dùng `node:crypto`).
- `src/lib/journey/store.ts` (+ `store.test.ts`): `JourneyStore`, `FileJourneyStore`, `getJourneyStore`.
- `src/lib/journey/http.ts`: `journeyErrorResponse`, `serverDeps`.
- `src/lib/journey/labels.ts` (+ `labels.test.ts`): chuỗi hiển thị (số người, ngày, giá).
- `src/lib/journey/local.ts` (+ `local.test.ts`): danh sách kế hoạch trong localStorage.
- `src/lib/journey/client.ts`: `createJourneyAndSave`.
- `src/app/api/journeys/route.ts`, `src/app/api/journeys/by-token/[token]/route.ts`, `src/app/api/journeys/[id]/ops/route.ts`.
- `src/services/journey.service.ts`: gọi HTTP phía client.
- `src/hooks/use-journey.ts`: polling, cập nhật lạc quan, rollback.
- `src/components/journey/`: `styles.ts`, `modal.tsx`, `journey-info-form.tsx`, `journeys-home.tsx`, `journey-view.tsx`, `journey-item-card.tsx`, `cost-panel.tsx`, `service-picker.tsx`, `invite-dialog.tsx`, `join-form.tsx`, `add-to-plan-button.tsx`.
- `src/app/hanh-trinh/page.tsx`, `src/app/hanh-trinh/[token]/page.tsx`.

Sửa: `.gitignore`, `src/components/explorer/explorer-shell.tsx`, `explorer-header.tsx`, `place-grid.tsx`, `play-block.tsx`, `stay-block.tsx`, `tour-list.tsx`, `src/app/page.tsx`, `src/app/diem-den/[slug]/page.tsx`, `CLAUDE.md`.

---

### Task 1: Kiểu dữ liệu và danh mục dịch vụ

**Files:**
- Create: `src/types/journey.ts`, `src/lib/journey/ids.ts`, `src/data/services/phu-quoc.ts`, `src/lib/journey/catalog.ts`
- Test: `src/lib/journey/catalog.test.ts`

**Interfaces:**
- Consumes: `getGuide(slug)` từ `@/data/destinations`, `toursForDestination(guide, today?)` từ `@/lib/destination-tours`, `phuQuoc` từ `@/data/destinations/phu-quoc`.
- Produces: mọi kiểu trong `@/types/journey` (dưới đây); `slugify(text)`, `activityServiceId(name)`, `tourServiceId(code)`; `getServices(slug, kind?, today?) => ServiceItem[]`, `getService(slug, id, today?) => ServiceItem | undefined`.

- [ ] **Step 1: Tạo `src/types/journey.ts`**

```ts
export type ServiceKind = "hotel" | "flight" | "vehicle" | "activity" | "tour"
export type PriceUnit = "per_person" | "per_room_night" | "per_day" | "per_booking"
export type JourneyRole = "edit" | "view"

export const SERVICE_KINDS: ServiceKind[] = ["hotel", "flight", "vehicle", "activity", "tour"]

export const SERVICE_KIND_LABEL: Record<ServiceKind, string> = {
  hotel: "Khách sạn",
  flight: "Vé máy bay",
  vehicle: "Thuê xe",
  activity: "Vui chơi",
  tour: "Tour",
}

export const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  per_person: "/ khách",
  per_room_night: "/ phòng / đêm",
  per_day: "/ ngày",
  per_booking: "/ lượt",
}

export const QUANTITY_LABEL: Record<PriceUnit, string> = {
  per_person: "Số khách",
  per_room_night: "Số phòng",
  per_day: "Số xe",
  per_booking: "Số lượt",
}

export function isServiceKind(value: unknown): value is ServiceKind {
  return typeof value === "string" && (SERVICE_KINDS as string[]).includes(value)
}

export interface ChildRate {
  /** Áp dụng cho trẻ có tuổi < underAge. Bậc đầu tiên khớp được dùng. */
  underAge: number
  /** 0 = miễn phí, 0.75 = 75% giá người lớn. */
  rate: number
}

export interface ServiceItem {
  id: string
  kind: ServiceKind
  destinationSlug: string
  name: string
  tag: string
  blurb: string
  /** Chỉ tour có ảnh (ảnh S3 của Vietravel). */
  imageUrl?: string
  priceVnd: number
  priceUnit: PriceUnit
  /** Sắp tăng dần theo underAge. Thiếu thì trẻ em trả như người lớn. */
  childRates?: ChildRate[]
  bookUrl: string
  /** true: dữ liệu mockup, giao diện hiện nhãn "Giá tham khảo (demo)". */
  mock: boolean
}

export type ServiceSnapshot = Pick<
  ServiceItem,
  "name" | "kind" | "tag" | "priceVnd" | "priceUnit" | "childRates" | "imageUrl" | "bookUrl" | "mock"
>

export interface Travelers {
  adults: number
  childAges: number[]
}

export interface JourneyMember {
  id: string
  name: string
  joinedAt: string
}

export interface JourneyComment {
  id: string
  memberId: string
  text: string
  at: string
}

export interface JourneyItem {
  id: string
  serviceId: string
  /** Chụp lại lúc thêm; danh mục đổi sau đó không làm sai kế hoạch cũ. */
  snapshot: ServiceSnapshot
  /** null = "Đang cân nhắc"; 1..nights+1 = ngày trong chuyến. */
  day: number | null
  order: number
  /** null = tự tính theo số người (xem defaultQuantity). */
  quantity: number | null
  addedBy: string
  votes: Record<string, 1 | -1>
  comments: JourneyComment[]
}

export interface Journey {
  id: string
  version: number
  title: string
  destinationSlug: string
  startDate: string | null
  nights: number
  travelers: Travelers
  editToken: string
  viewToken: string
  members: JourneyMember[]
  items: JourneyItem[]
  createdAt: string
  updatedAt: string
}

/** Bản gửi xuống trình duyệt: người có link chỉ xem không nhận editToken. */
export type PublicJourney = Omit<Journey, "editToken"> & { editToken?: string }

export type JourneyOp =
  | { type: "join"; name: string }
  | { type: "updateInfo"; title?: string; startDate?: string | null; nights?: number; travelers?: Travelers }
  | { type: "addItem"; serviceId: string }
  | { type: "removeItem"; itemId: string }
  | { type: "moveItem"; itemId: string; day: number | null; order?: number }
  | { type: "setQuantity"; itemId: string; quantity: number | null }
  | { type: "vote"; itemId: string; value: 1 | -1 }
  | { type: "comment"; itemId: string; text: string }

export interface CreateJourneyRequest {
  title: string
  destinationSlug: string
  startDate: string | null
  nights: number
  travelers: Travelers
  memberName: string
}

export type JourneyInfoValues = Omit<CreateJourneyRequest, "destinationSlug">

export interface CreateJourneyResponse {
  journey: PublicJourney
  memberId: string
}

export interface GetJourneyResponse {
  journey: PublicJourney
  role: JourneyRole
}

export interface JourneyOpRequest {
  token: string
  memberId?: string
  op: JourneyOp
}

export interface JourneyOpResponse {
  journey: PublicJourney
  /** Chỉ có khi op là join: id thành viên vừa tạo. */
  memberId?: string
}
```

- [ ] **Step 2: Viết test `src/lib/journey/catalog.test.ts` (sẽ fail vì chưa có code)**

```ts
import assert from "node:assert/strict"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { phuQuocActivityPrices } from "@/data/services/phu-quoc"
import { SERVICE_KINDS } from "@/types/journey"
import { getService, getServices } from "./catalog"
import { activityServiceId, slugify, tourServiceId } from "./ids"

const today = "2026-10-08"
const all = getServices("phu-quoc", undefined, today)

// slugify bỏ dấu tiếng Việt, kể cả đ/Đ.
assert.equal(slugify("Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc"), "dinh-cau-va-thien-vien-truc-lam-ho-quoc")
assert.equal(slugify("Đường Đi  "), "duong-di")
assert.equal(tourServiceId("NDSGN8701"), "tour-NDSGN8701")

// Đủ 5 loại; đúng 6 khách sạn mock.
for (const kind of SERVICE_KINDS) assert.ok(getServices("phu-quoc", kind, today).length > 0, `thiếu loại ${kind}`)
assert.equal(getServices("phu-quoc", "hotel", today).length, 6)

// id không trùng.
assert.equal(new Set(all.map((service) => service.id)).size, all.length, "id dịch vụ bị trùng")

for (const service of all) {
  assert.ok(service.bookUrl.startsWith("https://travel.com.vn/"), `${service.id}: bookUrl phải về travel.com.vn`)
  assert.ok(!service.bookUrl.includes("khach-san-phu-quoc") && !service.bookUrl.includes("ve-may-bay"), `${service.id}: link đang lỗi`)
  assert.ok(Number.isInteger(service.priceVnd) && service.priceVnd >= 0, `${service.id}: giá không hợp lệ`)
  assert.equal(service.mock, service.kind !== "tour", `${service.id}: cờ mock sai`)
  // Chỉ tour có ảnh (ảnh của Vietravel); ảnh CC khác bắt buộc ghi công nên không dùng ở đây.
  assert.equal(service.imageUrl === undefined, service.kind !== "tour", `${service.id}: ảnh sai quy ước`)
  assert.equal(service.destinationSlug, "phu-quoc")
}

// Mọi hoạt động trong cẩm nang có giá mock.
for (const place of phuQuoc.activities) {
  assert.ok(Object.hasOwn(phuQuocActivityPrices, place.name), `thiếu giá cho "${place.name}"`)
}

// Tra cứu.
assert.equal(getService("phu-quoc", activityServiceId("Vinpearl Safari"), today)?.name, "Vinpearl Safari")
assert.equal(getService("phu-quoc", "khong-co", today), undefined)
assert.deepEqual(getServices("da-nang", undefined, today), [])
assert.deepEqual(getServices("khong-co", undefined, today), [])

console.log("catalog.test OK")
```

- [ ] **Step 3: Chạy để thấy fail**

Run: `npx tsx src/lib/journey/catalog.test.ts`
Expected: FAIL, lỗi không tìm thấy module `@/data/services/phu-quoc` hoặc `./catalog`.

- [ ] **Step 4: Tạo `src/lib/journey/ids.ts`**

```ts
/** "Vinpearl Safari" → "vinpearl-safari"; bỏ dấu tiếng Việt để id ổn định. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function activityServiceId(name: string): string {
  return `activity-${slugify(name)}`
}

export function tourServiceId(code: string): string {
  return `tour-${code}`
}
```

- [ ] **Step 5: Tạo `src/data/services/phu-quoc.ts`**

```ts
import { phuQuoc } from "@/data/destinations/phu-quoc"
import type { ChildRate, ServiceItem } from "@/types/journey"

/** Trẻ < 2 tuổi 10%, < 12 tuổi 75%: mức phổ biến của hãng bay nội địa (mock). */
const FLIGHT_CHILD: ChildRate[] = [
  { underAge: 2, rate: 0.1 },
  { underAge: 12, rate: 0.75 },
]

/** Trẻ < 1 tuổi miễn phí, < 12 tuổi 75% (mock). */
export const ACTIVITY_CHILD: ChildRate[] = [
  { underAge: 1, rate: 0 },
  { underAge: 12, rate: 0.75 },
]

function mock(item: Omit<ServiceItem, "destinationSlug" | "bookUrl" | "mock">): ServiceItem {
  return { ...item, destinationSlug: phuQuoc.slug, bookUrl: phuQuoc.links.tours, mock: true }
}

/** Dữ liệu mẫu cho bản demo: tên khách sạn tự đặt, giá tham khảo. Thay bằng API Hub khi có. */
export const phuQuocServices: ServiceItem[] = [
  mock({ id: "hotel-pq-01", kind: "hotel", name: "Homestay Gió Biển", tag: "Tiết kiệm · Ông Lang", blurb: "Phòng gọn gàng, đi bộ 3 phút ra biển, hợp nhóm bạn trẻ.", priceVnd: 650000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-02", kind: "hotel", name: "Khách sạn Phố Đêm", tag: "Tầm trung · Dương Đông", blurb: "Gần chợ đêm và quán ăn, thuê xe máy ngay tại sảnh.", priceVnd: 1100000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-03", kind: "hotel", name: "Khách sạn Nhà Mình", tag: "Tầm trung · phòng liên thông", blurb: "Phòng liên thông cho gia đình, bữa sáng có thực đơn trẻ em.", priceVnd: 1450000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-04", kind: "hotel", name: "Resort Hoàng Hôn", tag: "Cao cấp · Bãi Trường", blurb: "Bãi biển riêng, hồ bơi lớn, phòng hướng biển ngắm hoàng hôn.", priceVnd: 2900000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-05", kind: "hotel", name: "Resort Rừng Biển", tag: "Cao cấp · Bắc đảo", blurb: "Gần VinWonders và Safari, có câu lạc bộ trẻ em và hồ bơi nông.", priceVnd: 3400000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-06", kind: "hotel", name: "Villa Hồ Bơi Riêng", tag: "Sang trọng · Nam đảo", blurb: "Villa riêng tư có hồ bơi, bữa sáng phục vụ tại villa.", priceVnd: 6800000, priceUnit: "per_room_night" }),
  mock({ id: "flight-sgn-pqc", kind: "flight", name: "Vé khứ hồi TP.HCM ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 1 giờ bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 2200000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-han-pqc", kind: "flight", name: "Vé khứ hồi Hà Nội ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 2 giờ 10 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 3600000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-dad-pqc", kind: "flight", name: "Vé khứ hồi Đà Nẵng ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 1 giờ 45 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 3100000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-vca-pqc", kind: "flight", name: "Vé khứ hồi Cần Thơ ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 50 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 1700000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "vehicle-pq-01", kind: "vehicle", name: "Thuê xe máy tay ga", tag: "Tự lái · giao tại khách sạn", blurb: "Kèm 2 mũ bảo hiểm. Cần bằng lái xe máy.", priceVnd: 150000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-02", kind: "vehicle", name: "Ô tô 4 chỗ có tài xế", tag: "Có tài xế · 10 giờ/ngày", blurb: "Đi Nam đảo, Bắc đảo theo lịch trình của Quý khách.", priceVnd: 1200000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-03", kind: "vehicle", name: "Ô tô 7 chỗ có tài xế", tag: "Có tài xế · 10 giờ/ngày", blurb: "Rộng cho gia đình có trẻ nhỏ, có thể yêu cầu ghế trẻ em.", priceVnd: 1500000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-04", kind: "vehicle", name: "Đưa đón sân bay 2 chiều", tag: "Xe 7 chỗ · sân bay ⇄ khách sạn", blurb: "Tài xế đón tại cửa ra, hỗ trợ hành lý.", priceVnd: 500000, priceUnit: "per_booking" }),
]

/** Giá vé mock cho từng mục trong phuQuoc.activities, khóa là tên mục. 0 = vào cửa miễn phí. */
export const phuQuocActivityPrices: Record<string, number> = {
  "Cáp treo vượt biển và Hòn Thơm": 650000,
  "Thị trấn Hoàng Hôn và Kiss Bridge": 0,
  "VinWonders Phú Quốc": 950000,
  "Vinpearl Safari": 650000,
  "Grand World": 0,
  "Bãi Sao": 0,
  "Lặn ngắm san hô và câu mực đêm": 750000,
  "Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc": 0,
  "Chợ đêm Phú Quốc": 0,
}
```

- [ ] **Step 6: Tạo `src/lib/journey/catalog.ts`**

```ts
import { getGuide } from "@/data/destinations"
import { ACTIVITY_CHILD, phuQuocActivityPrices, phuQuocServices } from "@/data/services/phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"
import { activityServiceId, tourServiceId } from "@/lib/journey/ids"
import type { DestinationGuide } from "@/types/destination"
import type { ChildRate, ServiceItem, ServiceKind } from "@/types/journey"

/** Theo mục "Lưu ý giá trẻ em" trên trang tour Vietravel: < 5 tuổi miễn phí, < 12 tuổi 75%. */
const TOUR_CHILD: ChildRate[] = [
  { underAge: 5, rate: 0 },
  { underAge: 12, rate: 0.75 },
]

// Khi có API Hub: thay hai bảng mock này và giữ nguyên kiểu ServiceItem.
const MOCK_SERVICES = new Map<string, ServiceItem[]>([["phu-quoc", phuQuocServices]])
const ACTIVITY_PRICES = new Map<string, Record<string, number>>([["phu-quoc", phuQuocActivityPrices]])

function activityServices(guide: DestinationGuide): ServiceItem[] {
  const prices = ACTIVITY_PRICES.get(guide.slug) ?? {}
  return guide.activities.map((place) => ({
    id: activityServiceId(place.name),
    kind: "activity",
    destinationSlug: guide.slug,
    name: place.name,
    tag: place.tag,
    blurb: place.blurb,
    priceVnd: prices[place.name] ?? 0,
    priceUnit: "per_person",
    childRates: ACTIVITY_CHILD,
    bookUrl: guide.links.tours,
    mock: true,
  }))
}

function tourServices(guide: DestinationGuide, today?: string): ServiceItem[] {
  return toursForDestination(guide, today).map((tour) => ({
    id: tourServiceId(tour.code),
    kind: "tour",
    destinationSlug: guide.slug,
    name: tour.name,
    tag: `${tour.days}N${tour.nights}Đ · từ ${tour.departureCity}`,
    blurb: tour.highlight,
    imageUrl: tour.imageUrl,
    priceVnd: tour.deal?.priceVnd ?? tour.priceVnd,
    priceUnit: "per_person",
    childRates: TOUR_CHILD,
    bookUrl: tour.url,
    mock: false,
  }))
}

/** Dịch vụ thêm được vào kế hoạch của một điểm đến. Điểm chưa mở trả mảng rỗng. */
export function getServices(slug: string, kind?: ServiceKind, today?: string): ServiceItem[] {
  const guide = getGuide(slug)
  if (!guide) return []
  const all = [...(MOCK_SERVICES.get(slug) ?? []), ...activityServices(guide), ...tourServices(guide, today)]
  return kind ? all.filter((service) => service.kind === kind) : all
}

export function getService(slug: string, id: string, today?: string): ServiceItem | undefined {
  return getServices(slug, undefined, today).find((service) => service.id === id)
}
```

- [ ] **Step 7: Chạy test cho tới khi pass**

Run: `npx tsx src/lib/journey/catalog.test.ts`
Expected: `catalog.test OK`

- [ ] **Step 8: Type check**

Run: `pnpm exec tsc --noEmit`
Expected: không có lỗi.

- [ ] **Step 9: Commit**

```bash
git add src/types/journey.ts src/lib/journey/ids.ts src/data/services/phu-quoc.ts src/lib/journey/catalog.ts src/lib/journey/catalog.test.ts
git commit -m "feat: danh mục dịch vụ cho kế hoạch chuyến đi (mock + tour thật)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Ước tính chi phí

**Files:**
- Create: `src/lib/journey/cost.ts`
- Test: `src/lib/journey/cost.test.ts`

**Interfaces:**
- Consumes: kiểu `ChildRate`, `Journey`, `JourneyItem`, `PriceUnit`, `ServiceKind`, `Travelers`, hằng `SERVICE_KINDS` từ `@/types/journey`.
- Produces: `childFactor(age, rates?) => number`; `defaultQuantity(unit, travelers) => number | null`; `itemCost(item, nights, travelers) => number`; `estimateCost(journey) => CostEstimate` với `CostEstimate = { totalVnd: number; perAdultVnd: number; byKind: Record<ServiceKind, number> }`.

- [ ] **Step 1: Viết test `src/lib/journey/cost.test.ts`**

```ts
import assert from "node:assert/strict"
import type { ChildRate, JourneyItem, PriceUnit, ServiceKind } from "@/types/journey"
import { childFactor, defaultQuantity, estimateCost, itemCost } from "./cost"

const FLIGHT: ChildRate[] = [{ underAge: 2, rate: 0.1 }, { underAge: 12, rate: 0.75 }]
const TOUR: ChildRate[] = [{ underAge: 5, rate: 0 }, { underAge: 12, rate: 0.75 }]

function item(kind: ServiceKind, priceVnd: number, priceUnit: PriceUnit, day: number | null, extra: Partial<JourneyItem> = {}, childRates?: ChildRate[]): JourneyItem {
  return {
    id: `${kind}-${priceVnd}`, serviceId: kind, day, order: 0, quantity: null, addedBy: "m1", votes: {}, comments: [],
    snapshot: { name: kind, kind, tag: "", priceVnd, priceUnit, childRates, bookUrl: "https://travel.com.vn/", mock: true },
    ...extra,
  }
}

// Hệ số trẻ em theo bậc tuổi.
assert.equal(childFactor(1, FLIGHT), 0.1)
assert.equal(childFactor(3, FLIGHT), 0.75)
assert.equal(childFactor(4, TOUR), 0)
assert.equal(childFactor(5, TOUR), 0.75)
assert.equal(childFactor(12, TOUR), 1, "từ 12 tuổi tính như người lớn")
assert.equal(childFactor(3), 1, "không có bậc giá trẻ em thì trả như người lớn")

// Số lượng mặc định.
const family = { adults: 2, childAges: [3, 7] }
assert.equal(defaultQuantity("per_person", family), null)
assert.equal(defaultQuantity("per_room_night", { adults: 3, childAges: [] }), 2)
assert.equal(defaultQuantity("per_day", family), 1)
assert.equal(defaultQuantity("per_booking", family), 1)

// Nhà 2 người lớn + bé 3 và 7 tuổi, 3N2Đ.
const journey = {
  nights: 2,
  travelers: family,
  items: [
    item("flight", 2200000, "per_person", 1, {}, FLIGHT), // 2.2tr × (2 + 0.75 + 0.75) = 7.700.000
    item("tour", 5000000, "per_person", 1, {}, TOUR), // 5tr × (2 + 0 + 0.75) = 13.750.000
    item("hotel", 1500000, "per_room_night", 1), // 1 phòng × 2 đêm = 3.000.000
    item("vehicle", 800000, "per_day", 2), // 3 ngày × 1 xe = 2.400.000
    item("hotel", 9999000, "per_room_night", null), // "Đang cân nhắc": không tính
  ],
}
const estimate = estimateCost(journey)
assert.equal(estimate.byKind.flight, 7700000)
assert.equal(estimate.byKind.tour, 13750000)
assert.equal(estimate.byKind.hotel, 3000000)
assert.equal(estimate.byKind.vehicle, 2400000)
assert.equal(estimate.byKind.activity, 0)
assert.equal(estimate.totalVnd, 26850000)
assert.equal(estimate.perAdultVnd, 13425000)

// Số phòng: 3 người lớn → 2 phòng; số lượng nhập tay thắng mặc định.
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1), 2, { adults: 3, childAges: [] }), 6000000)
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1, { quantity: 3 }), 2, family), 9000000)

// 0 đêm (đi trong ngày) vẫn tính 1 đêm phòng và 1 ngày xe.
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1), 0, family), 1500000)
assert.equal(itemCost(item("vehicle", 800000, "per_day", 1), 0, family), 800000)

// Tính theo lượt.
assert.equal(itemCost(item("vehicle", 500000, "per_booking", 1, { quantity: 2 }), 2, family), 1000000)

// Làm tròn đồng: 2.2tr × 1.1 không ra số lẻ.
assert.equal(itemCost(item("flight", 2200000, "per_person", 1, {}, FLIGHT), 2, { adults: 1, childAges: [1] }), 2420000)

// Kế hoạch rỗng.
assert.deepEqual(estimateCost({ nights: 2, travelers: family, items: [] }).totalVnd, 0)
assert.deepEqual(estimateCost({ nights: 2, travelers: family, items: [] }).perAdultVnd, 0)

console.log("cost.test OK")
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `npx tsx src/lib/journey/cost.test.ts`
Expected: FAIL, không tìm thấy module `./cost`.

- [ ] **Step 3: Tạo `src/lib/journey/cost.ts`**

```ts
import { SERVICE_KINDS, type ChildRate, type Journey, type JourneyItem, type PriceUnit, type ServiceKind, type Travelers } from "@/types/journey"

export interface CostEstimate {
  totalVnd: number
  /** Tổng chia số người lớn, làm tròn nghìn đồng. */
  perAdultVnd: number
  byKind: Record<ServiceKind, number>
}

/** Hệ số giá của một bé: bậc đầu tiên có tuổi < underAge; không khớp bậc nào thì trả như người lớn. */
export function childFactor(age: number, rates: ChildRate[] = []): number {
  return rates.find((rate) => age < rate.underAge)?.rate ?? 1
}

/** Số lượng khi người dùng chưa chỉnh. null với giá theo khách (đã tính theo số người). */
export function defaultQuantity(unit: PriceUnit, travelers: Travelers): number | null {
  switch (unit) {
    case "per_person":
      return null
    case "per_room_night":
      return Math.ceil(travelers.adults / 2)
    default:
      return 1
  }
}

/** Chi phí một mục, chưa xét mục đó đã xếp ngày hay chưa. */
export function itemCost(item: Pick<JourneyItem, "snapshot" | "quantity">, nights: number, travelers: Travelers): number {
  const { priceVnd, priceUnit, childRates } = item.snapshot
  const quantity = item.quantity ?? defaultQuantity(priceUnit, travelers) ?? 1
  switch (priceUnit) {
    case "per_person": {
      const children = travelers.childAges.reduce((sum, age) => sum + childFactor(age, childRates), 0)
      return Math.round(priceVnd * (travelers.adults + children))
    }
    case "per_room_night":
      return priceVnd * Math.max(nights, 1) * quantity
    case "per_day":
      return priceVnd * (nights + 1) * quantity
    case "per_booking":
      return priceVnd * quantity
  }
}

/** Chỉ tính các mục đã xếp vào ngày; mục "Đang cân nhắc" thường là các lựa chọn đang so sánh. */
export function estimateCost(journey: Pick<Journey, "items" | "nights" | "travelers">): CostEstimate {
  const byKind = Object.fromEntries(SERVICE_KINDS.map((kind) => [kind, 0])) as Record<ServiceKind, number>
  for (const item of journey.items) {
    if (item.day === null) continue
    byKind[item.snapshot.kind] += itemCost(item, journey.nights, journey.travelers)
  }
  const totalVnd = SERVICE_KINDS.reduce((sum, kind) => sum + byKind[kind], 0)
  return { totalVnd, perAdultVnd: Math.round(totalVnd / journey.travelers.adults / 1000) * 1000, byKind }
}
```

- [ ] **Step 4: Chạy test cho tới khi pass**

Run: `npx tsx src/lib/journey/cost.test.ts`
Expected: `cost.test OK`

- [ ] **Step 5: Commit**

```bash
git add src/lib/journey/cost.ts src/lib/journey/cost.test.ts
git commit -m "feat: ước tính chi phí kế hoạch theo số người và giá trẻ em

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Thao tác trên kế hoạch và tạo kế hoạch

**Files:**
- Create: `src/lib/journey/errors.ts`, `src/lib/journey/operations.ts`, `src/lib/journey/create.ts`
- Test: `src/lib/journey/operations.test.ts`

**Interfaces:**
- Consumes: kiểu từ `@/types/journey`; `getGuide` từ `@/data/destinations` (chỉ trong `create.ts`).
- Produces:
  - `class JourneyError extends Error { status: 400 | 403 | 404 }`
  - `LIMITS` (hằng giới hạn), `parseTravelers(value: unknown): Travelers`, `parseNewJourney(value: unknown): CreateJourneyRequest`, `parseOp(value: unknown): JourneyOp`
  - `interface OpActor { role: JourneyRole; memberId?: string }`, `interface OpDeps { lookup: (serviceId: string) => ServiceItem | undefined; newId: () => string; now: () => Date }`
  - `applyOp<T extends PublicJourney>(journey: T, rawOp: unknown, actor: OpActor, deps: OpDeps): T`: không đổi `version` (store làm), không sửa object gốc.
  - `forRole(journey: Journey, role: JourneyRole): PublicJourney`
  - `voteScore(item: Pick<JourneyItem, "votes">): number`
  - `newToken(): string`, `createJourney(body: unknown, now?: Date): { journey: Journey; memberId: string }`

- [ ] **Step 1: Viết test `src/lib/journey/operations.test.ts`**

```ts
import assert from "node:assert/strict"
import type { Journey, JourneyItem, ServiceItem } from "@/types/journey"
import { createJourney } from "./create"
import { JourneyError } from "./errors"
import { applyOp, forRole, parseOp, voteScore, type OpDeps } from "./operations"

const hotel: ServiceItem = {
  id: "hotel-x", kind: "hotel", destinationSlug: "phu-quoc", name: "Resort X", tag: "Cao cấp", blurb: "",
  priceVnd: 2000000, priceUnit: "per_room_night", bookUrl: "https://travel.com.vn/du-lich-phu-quoc", mock: true,
}
const flight: ServiceItem = { ...hotel, id: "flight-x", kind: "flight", name: "Vé bay X", priceUnit: "per_person" }
const otherPlace: ServiceItem = { ...hotel, id: "hotel-dn", destinationSlug: "da-nang" }
let counter = 0
const deps: OpDeps = {
  lookup: (id) => [hotel, flight, otherPlace].find((service) => service.id === id),
  newId: () => `id-${++counter}`,
  now: () => new Date("2026-10-08T00:00:00Z"),
}

function expectError(fn: () => unknown, status: number): void {
  assert.throws(fn, (error: unknown) => error instanceof JourneyError && error.status === status)
}

// createJourney: hợp lệ.
const valid = { title: " Phú Quốc tháng 11 ", destinationSlug: "phu-quoc", startDate: "2026-11-01", nights: 2, travelers: { adults: 2, childAges: [3, 7] }, memberName: " Lan " }
const { journey: created, memberId: lan } = createJourney(valid)
assert.equal(created.title, "Phú Quốc tháng 11")
assert.equal(created.version, 1)
assert.deepEqual(created.members.map((member) => [member.id, member.name]), [[lan, "Lan"]])
assert.notEqual(created.editToken, created.viewToken)
assert.ok(created.editToken.length >= 22, "token 16 byte base64url")
assert.match(created.id, /^[0-9a-f-]{36}$/)

// createJourney: dữ liệu sai đều 400.
for (const bad of [
  null,
  "chuỗi",
  { ...valid, title: "   " },
  { ...valid, title: "a".repeat(81) },
  { ...valid, nights: 15 },
  { ...valid, nights: 1.5 },
  { ...valid, travelers: { adults: 0, childAges: [] } },
  { ...valid, travelers: { adults: 2, childAges: [18] } },
  { ...valid, travelers: { adults: 2, childAges: Array(11).fill(3) } },
  { ...valid, travelers: { adults: 2 } },
  { ...valid, startDate: "01/11/2026" },
  { ...valid, memberName: "" },
  { ...valid, destinationSlug: "da-nang" },
]) {
  expectError(() => createJourney(bad), 400)
}
assert.equal(createJourney({ ...valid, startDate: null }).journey.startDate, null)

const edit = { role: "edit" as const, memberId: lan }
const find = (journey: Journey, item: JourneyItem): JourneyItem => journey.items.find((entry) => entry.id === item.id)!
const dayOrder = (journey: Journey, day: number | null): string[] =>
  journey.items.filter((entry) => entry.day === day).sort((a, b) => a.order - b.order).map((entry) => entry.id)

// addItem: vào "Đang cân nhắc", chụp snapshot, không sửa object gốc.
let j: Journey = created
j = applyOp(j, { type: "addItem", serviceId: "hotel-x" }, edit, deps)
j = applyOp(j, { type: "addItem", serviceId: "flight-x" }, edit, deps)
assert.deepEqual(j.items.map((entry) => [entry.snapshot.name, entry.day, entry.order]), [["Resort X", null, 0], ["Vé bay X", null, 1]])
assert.equal(j.items[0].addedBy, lan)
assert.equal(j.items[0].snapshot.priceVnd, 2000000)
assert.equal(created.items.length, 0, "applyOp không được sửa journey gốc")
assert.equal(j.version, created.version, "applyOp không đổi version")
expectError(() => applyOp(j, { type: "addItem", serviceId: "khong-co" }, edit, deps), 400)
expectError(() => applyOp(j, { type: "addItem", serviceId: "hotel-dn" }, edit, deps), 400)
const [hotelItem, flightItem] = j.items

// moveItem: sang ngày, đổi thứ tự, ngoài chuyến, mục không tồn tại.
j = applyOp(j, { type: "moveItem", itemId: flightItem.id, day: 1 }, edit, deps)
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [flightItem.id, hotelItem.id])
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1, order: 0 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [hotelItem.id, flightItem.id])
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1, order: 1 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [flightItem.id, hotelItem.id])
assert.deepEqual(dayOrder(j, null), [])
expectError(() => applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 4 }, edit, deps), 400)
expectError(() => applyOp(j, { type: "moveItem", itemId: "khong-co", day: 1 }, edit, deps), 404)

// vote: bấm lại để bỏ, đổi phiếu, giá trị lạ.
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, { [lan]: 1 })
assert.equal(voteScore(find(j, hotelItem)), 1)
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: -1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, { [lan]: -1 })
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: -1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, {})
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 2 }, edit, deps), 400)

// comment: cắt khoảng trắng, rỗng hoặc quá dài bị từ chối.
j = applyOp(j, { type: "comment", itemId: hotelItem.id, text: "  Có hồ bơi cho bé không?  " }, edit, deps)
assert.equal(find(j, hotelItem).comments[0].text, "Có hồ bơi cho bé không?")
assert.equal(find(j, hotelItem).comments[0].memberId, lan)
expectError(() => applyOp(j, { type: "comment", itemId: hotelItem.id, text: "   " }, edit, deps), 400)
expectError(() => applyOp(j, { type: "comment", itemId: hotelItem.id, text: "a".repeat(501) }, edit, deps), 400)

// setQuantity.
j = applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 2 }, edit, deps)
assert.equal(find(j, hotelItem).quantity, 2)
j = applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: null }, edit, deps)
assert.equal(find(j, hotelItem).quantity, null)
expectError(() => applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 0 }, edit, deps), 400)
expectError(() => applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 21 }, edit, deps), 400)

// join: link sửa không cần memberId; sau đó người lạ hoặc chưa nhập tên đều 403.
j = applyOp(j, { type: "join", name: "Minh" }, { role: "edit" }, deps)
assert.deepEqual(j.members.map((member) => member.name), ["Lan", "Minh"])
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, { role: "edit", memberId: "nguoi-la" }, deps), 403)
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, { role: "edit" }, deps), 403)

// Link chỉ xem: mọi thao tác 403, kể cả join.
expectError(() => applyOp(j, { type: "join", name: "Hoa" }, { role: "view" }, deps), 403)
expectError(() => applyOp(j, { type: "addItem", serviceId: "hotel-x" }, { role: "view", memberId: lan }, deps), 403)

// updateInfo: giảm số đêm đẩy mục ở ngày bị cắt về "Đang cân nhắc".
j = applyOp(j, { type: "moveItem", itemId: flightItem.id, day: 3 }, edit, deps)
j = applyOp(j, { type: "updateInfo", nights: 1, title: "Đi ngắn" }, edit, deps)
assert.equal(j.nights, 1)
assert.equal(j.title, "Đi ngắn")
assert.equal(find(j, flightItem).day, null)
assert.equal(find(j, hotelItem).day, 1)
expectError(() => applyOp(j, { type: "updateInfo", nights: -1 }, edit, deps), 400)

// removeItem.
j = applyOp(j, { type: "removeItem", itemId: hotelItem.id }, edit, deps)
assert.deepEqual(j.items.map((entry) => entry.id), [flightItem.id])
expectError(() => applyOp(j, { type: "removeItem", itemId: hotelItem.id }, edit, deps), 404)

// Op lạ hoặc không phải object: 400.
expectError(() => applyOp(j, { type: "xoa-het" }, edit, deps), 400)
expectError(() => applyOp(j, null, edit, deps), 400)
expectError(() => parseOp({ type: "addItem" }), 400)

// forRole: link chỉ xem không lộ editToken.
assert.equal(forRole(j, "view").editToken, undefined)
assert.equal(forRole(j, "edit").editToken, j.editToken)

console.log("operations.test OK")
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `npx tsx src/lib/journey/operations.test.ts`
Expected: FAIL, không tìm thấy module `./create`.

- [ ] **Step 3: Tạo `src/lib/journey/errors.ts`**

```ts
/** Lỗi có mã HTTP và thông báo tiếng Việt hiển thị thẳng cho người dùng. */
export class JourneyError extends Error {
  constructor(
    readonly status: 400 | 403 | 404,
    message: string,
  ) {
    super(message)
    this.name = "JourneyError"
  }
}
```

- [ ] **Step 4: Tạo `src/lib/journey/operations.ts`**

```ts
import { JourneyError } from "@/lib/journey/errors"
import type {
  CreateJourneyRequest,
  Journey,
  JourneyItem,
  JourneyOp,
  JourneyRole,
  PublicJourney,
  ServiceItem,
  Travelers,
} from "@/types/journey"

// File này không import gì của Node: client dùng lại applyOp để cập nhật lạc quan.

export const LIMITS = {
  titleLength: 80,
  maxNights: 14,
  maxAdults: 20,
  maxChildren: 10,
  maxChildAge: 17,
  nameLength: 40,
  maxMembers: 30,
  maxItems: 100,
  commentLength: 500,
  maxComments: 50,
  maxQuantity: 20,
} as const

export interface OpActor {
  role: JourneyRole
  memberId?: string
}

export interface OpDeps {
  lookup: (serviceId: string) => ServiceItem | undefined
  newId: () => string
  now: () => Date
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function bad(message: string): never {
  throw new JourneyError(400, message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function int(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) bad(`${label} phải từ ${min} đến ${max}.`)
  return value
}

function text(value: unknown, max: number, label: string): string {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (trimmed.length === 0 || trimmed.length > max) bad(`${label} cần từ 1 đến ${max} ký tự.`)
  return trimmed
}

function isoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) bad("Ngày đi không hợp lệ.")
  return value
}

export function parseTravelers(value: unknown): Travelers {
  const ages = isRecord(value) ? value.childAges : undefined
  if (!isRecord(value) || !Array.isArray(ages)) bad("Số người đi không hợp lệ.")
  if (ages.length > LIMITS.maxChildren) bad(`Tối đa ${LIMITS.maxChildren} bé.`)
  return {
    adults: int(value.adults, 1, LIMITS.maxAdults, "Số người lớn"),
    childAges: ages.map((age: unknown) => int(age, 0, LIMITS.maxChildAge, "Tuổi của bé")),
  }
}

export function parseNewJourney(value: unknown): CreateJourneyRequest {
  if (!isRecord(value)) bad("Dữ liệu kế hoạch không hợp lệ.")
  return {
    title: text(value.title, LIMITS.titleLength, "Tên kế hoạch"),
    destinationSlug: text(value.destinationSlug, 60, "Điểm đến"),
    startDate: isoDate(value.startDate),
    nights: int(value.nights, 0, LIMITS.maxNights, "Số đêm"),
    travelers: parseTravelers(value.travelers),
    memberName: text(value.memberName, LIMITS.nameLength, "Tên của Quý khách"),
  }
}

export function parseOp(value: unknown): JourneyOp {
  if (!isRecord(value)) bad("Thao tác không hợp lệ.")
  const itemId = (): string => text(value.itemId, 100, "Mã mục")
  switch (value.type) {
    case "join":
      return { type: "join", name: text(value.name, LIMITS.nameLength, "Tên của Quý khách") }
    case "updateInfo": {
      const op: Extract<JourneyOp, { type: "updateInfo" }> = { type: "updateInfo" }
      if (value.title !== undefined) op.title = text(value.title, LIMITS.titleLength, "Tên kế hoạch")
      if (value.startDate !== undefined) op.startDate = isoDate(value.startDate)
      if (value.nights !== undefined) op.nights = int(value.nights, 0, LIMITS.maxNights, "Số đêm")
      if (value.travelers !== undefined) op.travelers = parseTravelers(value.travelers)
      return op
    }
    case "addItem":
      return { type: "addItem", serviceId: text(value.serviceId, 100, "Mã dịch vụ") }
    case "removeItem":
      return { type: "removeItem", itemId: itemId() }
    case "moveItem": {
      const day = value.day === null ? null : int(value.day, 1, LIMITS.maxNights + 1, "Ngày")
      const order = value.order === undefined ? undefined : int(value.order, 0, LIMITS.maxItems, "Vị trí")
      return { type: "moveItem", itemId: itemId(), day, order }
    }
    case "setQuantity": {
      const quantity = value.quantity === null ? null : int(value.quantity, 1, LIMITS.maxQuantity, "Số lượng")
      return { type: "setQuantity", itemId: itemId(), quantity }
    }
    case "vote": {
      const vote = value.value
      if (vote !== 1 && vote !== -1) bad("Phiếu bầu không hợp lệ.")
      return { type: "vote", itemId: itemId(), value: vote }
    }
    case "comment":
      return { type: "comment", itemId: itemId(), text: text(value.text, LIMITS.commentLength, "Bình luận") }
    default:
      bad("Thao tác không hợp lệ.")
  }
}

function findItem(journey: PublicJourney, itemId: string): JourneyItem {
  const item = journey.items.find((entry) => entry.id === itemId)
  if (!item) throw new JourneyError(404, "Mục này không còn trong kế hoạch.")
  return item
}

/** Các mục của một ngày (hoặc "Đang cân nhắc" khi day = null), theo thứ tự. */
function groupOf(journey: PublicJourney, day: number | null): JourneyItem[] {
  return journey.items.filter((item) => item.day === day).sort((a, b) => a.order - b.order)
}

/** Chuyển mục sang nhóm đích tại vị trí order (mặc định cuối nhóm), đánh lại order cả hai nhóm. */
function moveItem(journey: PublicJourney, item: JourneyItem, day: number | null, order?: number): void {
  if (day !== null && day > journey.nights + 1) bad("Ngày này nằm ngoài chuyến đi.")
  const source = item.day
  const target = groupOf(journey, day).filter((entry) => entry !== item)
  target.splice(Math.min(order ?? target.length, target.length), 0, item)
  item.day = day
  target.forEach((entry, position) => {
    entry.order = position
  })
  if (source !== day) {
    groupOf(journey, source).forEach((entry, position) => {
      entry.order = position
    })
  }
}

function addItem(journey: PublicJourney, serviceId: string, memberId: string, deps: OpDeps): void {
  if (journey.items.length >= LIMITS.maxItems) bad(`Kế hoạch đã đủ ${LIMITS.maxItems} mục.`)
  const service = deps.lookup(serviceId)
  if (!service || service.destinationSlug !== journey.destinationSlug) bad("Dịch vụ không có trong danh mục.")
  const { name, kind, tag, priceVnd, priceUnit, childRates, imageUrl, bookUrl, mock } = service
  journey.items.push({
    id: deps.newId(),
    serviceId,
    snapshot: { name, kind, tag, priceVnd, priceUnit, childRates, imageUrl, bookUrl, mock },
    day: null,
    order: groupOf(journey, null).length,
    quantity: null,
    addedBy: memberId,
    votes: {},
    comments: [],
  })
}

function updateInfo(journey: PublicJourney, op: Extract<JourneyOp, { type: "updateInfo" }>): void {
  if (op.title !== undefined) journey.title = op.title
  if (op.startDate !== undefined) journey.startDate = op.startDate
  if (op.travelers !== undefined) journey.travelers = op.travelers
  if (op.nights !== undefined) {
    journey.nights = op.nights
    const cut = journey.items.filter((item) => item.day !== null && item.day > journey.nights + 1).sort((a, b) => a.order - b.order)
    for (const item of cut) moveItem(journey, item, null)
  }
}

/** Áp một thao tác lên bản sao của kế hoạch. Ném JourneyError nếu dữ liệu sai hoặc không có quyền. */
export function applyOp<T extends PublicJourney>(journey: T, rawOp: unknown, actor: OpActor, deps: OpDeps): T {
  if (actor.role !== "edit") throw new JourneyError(403, "Link chỉ xem không sửa được kế hoạch.")
  const op = parseOp(rawOp)
  const next = structuredClone(journey)

  if (op.type === "join") {
    if (next.members.length >= LIMITS.maxMembers) bad(`Kế hoạch đã đủ ${LIMITS.maxMembers} thành viên.`)
    next.members.push({ id: deps.newId(), name: op.name, joinedAt: deps.now().toISOString() })
    return next
  }

  const { memberId } = actor
  if (!memberId || !next.members.some((member) => member.id === memberId)) {
    throw new JourneyError(403, "Quý khách cần nhập tên trước khi sửa kế hoạch.")
  }

  switch (op.type) {
    case "updateInfo":
      updateInfo(next, op)
      break
    case "addItem":
      addItem(next, op.serviceId, memberId, deps)
      break
    case "removeItem": {
      const item = findItem(next, op.itemId)
      next.items = next.items.filter((entry) => entry !== item)
      groupOf(next, item.day).forEach((entry, position) => {
        entry.order = position
      })
      break
    }
    case "moveItem":
      moveItem(next, findItem(next, op.itemId), op.day, op.order)
      break
    case "setQuantity":
      findItem(next, op.itemId).quantity = op.quantity
      break
    case "vote": {
      const item = findItem(next, op.itemId)
      if (item.votes[memberId] === op.value) delete item.votes[memberId]
      else item.votes[memberId] = op.value
      break
    }
    case "comment": {
      const item = findItem(next, op.itemId)
      if (item.comments.length >= LIMITS.maxComments) bad(`Mỗi mục tối đa ${LIMITS.maxComments} bình luận.`)
      item.comments.push({ id: deps.newId(), memberId, text: op.text, at: deps.now().toISOString() })
      break
    }
  }
  return next
}

/** Người có link chỉ xem không được nhận editToken. */
export function forRole(journey: Journey, role: JourneyRole): PublicJourney {
  return role === "edit" ? journey : { ...journey, editToken: undefined }
}

export function voteScore(item: Pick<JourneyItem, "votes">): number {
  return Object.values(item.votes).reduce<number>((sum, value) => sum + value, 0)
}
```

- [ ] **Step 5: Tạo `src/lib/journey/create.ts`**

```ts
import { randomBytes, randomUUID } from "node:crypto"

import { getGuide } from "@/data/destinations"
import { JourneyError } from "@/lib/journey/errors"
import { parseNewJourney } from "@/lib/journey/operations"
import type { Journey } from "@/types/journey"

/** 16 byte ngẫu nhiên: đủ khó đoán để link mời thay cho tài khoản. */
export function newToken(): string {
  return randomBytes(16).toString("base64url")
}

export function createJourney(body: unknown, now: Date = new Date()): { journey: Journey; memberId: string } {
  const input = parseNewJourney(body)
  if (!getGuide(input.destinationSlug)) throw new JourneyError(400, "Điểm đến này chưa mở lập kế hoạch.")
  const memberId = randomUUID()
  const at = now.toISOString()
  return {
    memberId,
    journey: {
      id: randomUUID(),
      version: 1,
      title: input.title,
      destinationSlug: input.destinationSlug,
      startDate: input.startDate,
      nights: input.nights,
      travelers: input.travelers,
      editToken: newToken(),
      viewToken: newToken(),
      members: [{ id: memberId, name: input.memberName, joinedAt: at }],
      items: [],
      createdAt: at,
      updatedAt: at,
    },
  }
}
```

- [ ] **Step 6: Chạy test cho tới khi pass**

Run: `npx tsx src/lib/journey/operations.test.ts`
Expected: `operations.test OK`

- [ ] **Step 7: Type check và commit**

Run: `pnpm exec tsc --noEmit`
Expected: không có lỗi.

```bash
git add src/lib/journey/errors.ts src/lib/journey/operations.ts src/lib/journey/create.ts src/lib/journey/operations.test.ts
git commit -m "feat: thao tác kế hoạch (thêm, xếp ngày, bình chọn, bình luận) và tạo kế hoạch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Lưu trữ file JSON

**Files:**
- Create: `src/lib/journey/store.ts`
- Modify: `.gitignore` (thêm `/.data/`)
- Test: `src/lib/journey/store.test.ts`

**Interfaces:**
- Consumes: `JourneyError` (Task 3), `createJourney`, `applyOp`, `OpDeps` (Task 3, chỉ trong test).
- Produces: `interface JourneyStore { create(journey: Journey): Promise<void>; get(id: string): Promise<Journey | null>; findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null>; update(id: string, fn: (journey: Journey) => Journey): Promise<Journey> }`; `class FileJourneyStore` (constructor nhận đường dẫn thư mục); `getJourneyStore(): JourneyStore`. `update` tăng `version` thêm 1 và gán `updatedAt`.

- [ ] **Step 1: Viết test `src/lib/journey/store.test.ts`**

```ts
import assert from "node:assert/strict"
import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import type { ServiceItem } from "@/types/journey"
import { createJourney } from "./create"
import { JourneyError } from "./errors"
import { applyOp, type OpDeps } from "./operations"
import { FileJourneyStore } from "./store"

const hotel: ServiceItem = {
  id: "hotel-x", kind: "hotel", destinationSlug: "phu-quoc", name: "Resort X", tag: "", blurb: "",
  priceVnd: 1, priceUnit: "per_room_night", bookUrl: "https://travel.com.vn/du-lich-phu-quoc", mock: true,
}
let counter = 0
const deps: OpDeps = { lookup: (id) => (id === hotel.id ? hotel : undefined), newId: () => `id-${++counter}`, now: () => new Date() }
const input = { title: "Thử", destinationSlug: "phu-quoc", startDate: null, nights: 2, travelers: { adults: 2, childAges: [] }, memberName: "Lan" }

async function main(): Promise<void> {
  const dir = await mkdtemp(path.join(tmpdir(), "journey-store-"))
  try {
    const store = new FileJourneyStore(dir)

    // Tạo 2 kế hoạch cùng lúc: index token không được mất mục nào.
    const a = createJourney(input)
    const b = createJourney({ ...input, title: "Thử 2" })
    await Promise.all([store.create(a.journey), store.create(b.journey)])
    assert.equal((await store.get(a.journey.id))?.title, "Thử")
    assert.deepEqual(await store.findByToken(a.journey.editToken).then((found) => found && [found.journey.id, found.role]), [a.journey.id, "edit"])
    assert.deepEqual(await store.findByToken(a.journey.viewToken).then((found) => found && [found.journey.id, found.role]), [a.journey.id, "view"])
    assert.deepEqual(await store.findByToken(b.journey.viewToken).then((found) => found && found.journey.title), "Thử 2")

    // Token/id lạ: không thấy, không đọc ra ngoài thư mục.
    for (const token of ["khong-co", "__proto__", "constructor", "toString", ""]) {
      assert.equal(await store.findByToken(token), null, `token "${token}"`)
    }
    for (const id of ["../tokens", "tokens", "khong-phai-uuid", ""]) {
      assert.equal(await store.get(id), null, `id "${id}"`)
    }

    // 20 thao tác song song: đủ 20 mục, version 1 + 20.
    const actor = { role: "edit" as const, memberId: a.memberId }
    await Promise.all(
      Array.from({ length: 20 }, () => store.update(a.journey.id, (journey) => applyOp(journey, { type: "addItem", serviceId: "hotel-x" }, actor, deps))),
    )
    const after = await store.get(a.journey.id)
    assert.equal(after?.items.length, 20)
    assert.equal(after?.version, 21)

    // Thao tác lỗi không chặn hàng đợi, không đổi version.
    await assert.rejects(
      store.update(a.journey.id, (journey) => applyOp(journey, { type: "addItem", serviceId: "khong-co" }, actor, deps)),
      (error: unknown) => error instanceof JourneyError && error.status === 400,
    )
    const next = await store.update(a.journey.id, (journey) => applyOp(journey, { type: "join", name: "Minh" }, { role: "edit" }, deps))
    assert.equal(next.version, 22)
    assert.deepEqual(next.members.map((member) => member.name), ["Lan", "Minh"])

    // Kế hoạch không tồn tại.
    await assert.rejects(
      store.update("00000000-0000-4000-8000-000000000000", (journey) => journey),
      (error: unknown) => error instanceof JourneyError && error.status === 404,
    )

    // Không còn file tạm.
    assert.deepEqual((await readdir(dir)).filter((name) => name.endsWith(".tmp")), [])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

main().then(
  () => console.log("store.test OK"),
  (error: unknown) => {
    console.error(error)
    process.exit(1)
  },
)
```

- [ ] **Step 2: Chạy để thấy fail**

Run: `npx tsx src/lib/journey/store.test.ts`
Expected: FAIL, không tìm thấy module `./store`.

- [ ] **Step 3: Tạo `src/lib/journey/store.ts`**

```ts
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

import { JourneyError } from "@/lib/journey/errors"
import type { Journey, JourneyRole } from "@/types/journey"

export interface JourneyStore {
  create(journey: Journey): Promise<void>
  get(id: string): Promise<Journey | null>
  findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null>
  /** Chạy fn trên bản mới nhất rồi lưu; tăng version và updatedAt. */
  update(id: string, fn: (journey: Journey) => Journey): Promise<Journey>
}

type TokenIndex = Record<string, { id: string; role: JourneyRole }>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const TOKENS = "tokens"

/**
 * Mỗi kế hoạch một file `<id>.json`, thêm `tokens.json` tra token ra id và quyền.
 * Hàng đợi ghi chỉ nằm trong bộ nhớ của tiến trình này, nên chỉ đúng khi chạy MỘT server Node.
 * Triển khai nhiều instance hoặc serverless (Vercel) thì thay bằng store Postgres/KV cài cùng interface.
 */
export class FileJourneyStore implements JourneyStore {
  private readonly queues = new Map<string, Promise<unknown>>()

  constructor(private readonly dir: string) {}

  private file(name: string): string {
    return path.join(this.dir, `${name}.json`)
  }

  private async readJson<T>(name: string): Promise<T | null> {
    try {
      return JSON.parse(await readFile(this.file(name), "utf8")) as T
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
      throw error
    }
  }

  /** Ghi file tạm rồi rename: tắt server giữa chừng cũng không để lại file hỏng. */
  private async writeJson(name: string, value: unknown): Promise<void> {
    await mkdir(this.dir, { recursive: true })
    const target = this.file(name)
    const temp = `${target}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    await writeFile(temp, JSON.stringify(value, null, 2))
    await rename(temp, target)
  }

  /** Các tác vụ cùng key chạy lần lượt; tác vụ lỗi không chặn tác vụ sau. */
  private serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve()
    const run = previous.then(task)
    const settled = run.catch(() => undefined)
    this.queues.set(key, settled)
    void settled.then(() => {
      if (this.queues.get(key) === settled) this.queues.delete(key)
    })
    return run
  }

  async create(journey: Journey): Promise<void> {
    await this.serialize(journey.id, () => this.writeJson(journey.id, journey))
    await this.serialize(TOKENS, async () => {
      const index = (await this.readJson<TokenIndex>(TOKENS)) ?? {}
      index[journey.editToken] = { id: journey.id, role: "edit" }
      index[journey.viewToken] = { id: journey.id, role: "view" }
      await this.writeJson(TOKENS, index)
    })
  }

  async get(id: string): Promise<Journey | null> {
    // Chỉ nhận UUID: id đến từ URL, không được trỏ ra file khác như tokens.json hay ../
    if (!UUID.test(id)) return null
    return this.readJson<Journey>(id)
  }

  async findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null> {
    const index = (await this.readJson<TokenIndex>(TOKENS)) ?? {}
    // hasOwn: token như "__proto__" không được trỏ vào thuộc tính của Object.
    const entry = Object.hasOwn(index, token) ? index[token] : undefined
    if (!entry) return null
    const journey = await this.get(entry.id)
    return journey ? { journey, role: entry.role } : null
  }

  update(id: string, fn: (journey: Journey) => Journey): Promise<Journey> {
    return this.serialize(id, async () => {
      const current = await this.get(id)
      if (!current) throw new JourneyError(404, "Không tìm thấy kế hoạch.")
      const next: Journey = { ...fn(current), version: current.version + 1, updatedAt: new Date().toISOString() }
      await this.writeJson(id, next)
      return next
    })
  }
}

const globalStore = globalThis as typeof globalThis & { journeyStore?: JourneyStore }

/** Một store cho cả tiến trình; giữ qua hot reload để hàng đợi ghi không bị tách đôi. */
export function getJourneyStore(): JourneyStore {
  globalStore.journeyStore ??= new FileJourneyStore(process.env.JOURNEY_DATA_DIR ?? path.join(process.cwd(), ".data", "journeys"))
  return globalStore.journeyStore
}
```

- [ ] **Step 4: Thêm `/.data/` vào `.gitignore`**

Thêm vào cuối `.gitignore`:

```
# dữ liệu kế hoạch chuyến đi (FileJourneyStore)
/.data/
```

- [ ] **Step 5: Chạy test cho tới khi pass**

Run: `npx tsx src/lib/journey/store.test.ts`
Expected: `store.test OK`

- [ ] **Step 6: Type check và commit**

Run: `pnpm exec tsc --noEmit`
Expected: không có lỗi.

```bash
git add src/lib/journey/store.ts src/lib/journey/store.test.ts .gitignore
git commit -m "feat: lưu kế hoạch vào file JSON, ghi tuần tự theo từng kế hoạch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: API routes

**Files:**
- Create: `src/lib/journey/http.ts`, `src/app/api/journeys/route.ts`, `src/app/api/journeys/by-token/[token]/route.ts`, `src/app/api/journeys/[id]/ops/route.ts`

**Interfaces:**
- Consumes: `createJourney` (Task 3), `applyOp`, `forRole`, `OpDeps` (Task 3), `getJourneyStore` (Task 4), `getService` (Task 1), `JourneyError`, kiểu `ApiError` từ `@/types/chat`.
- Produces:
  - `POST /api/journeys` body `CreateJourneyRequest` → `201 CreateJourneyResponse`.
  - `GET /api/journeys/by-token/[token]?since=<version>` → `200 GetJourneyResponse`, `204` khi `since` bằng version hiện tại, `404 ApiError`.
  - `POST /api/journeys/[id]/ops` body `JourneyOpRequest` → `200 JourneyOpResponse` (`memberId` khi op là `join`), `400/403/404 ApiError`.
  - `journeyErrorResponse(error: unknown): NextResponse<ApiError>`, `serverDeps(destinationSlug: string): OpDeps`.

- [ ] **Step 1: Tạo `src/lib/journey/http.ts`**

```ts
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { getService } from "@/lib/journey/catalog"
import { JourneyError } from "@/lib/journey/errors"
import type { OpDeps } from "@/lib/journey/operations"
import type { ApiError } from "@/types/chat"

export const NO_STORE = { "Cache-Control": "no-store" }

export function journeyErrorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof JourneyError) return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE })
  console.error("[journey]", error)
  return NextResponse.json({ error: "Không lưu được kế hoạch, Quý khách thử lại nhé." }, { status: 500, headers: NO_STORE })
}

export function notFoundResponse(): NextResponse<ApiError> {
  return NextResponse.json({ error: "Không tìm thấy kế hoạch." }, { status: 404, headers: NO_STORE })
}

export function serverDeps(destinationSlug: string): OpDeps {
  return { lookup: (id) => getService(destinationSlug, id), newId: randomUUID, now: () => new Date() }
}
```

- [ ] **Step 2: Tạo `src/app/api/journeys/route.ts`**

```ts
import { NextResponse } from "next/server"

import { createJourney } from "@/lib/journey/create"
import { journeyErrorResponse, NO_STORE } from "@/lib/journey/http"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { CreateJourneyResponse } from "@/types/journey"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null)
    const { journey, memberId } = createJourney(body)
    await getJourneyStore().create(journey)
    return NextResponse.json<CreateJourneyResponse>({ journey: forRole(journey, "edit"), memberId }, { status: 201, headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
```

- [ ] **Step 3: Tạo `src/app/api/journeys/by-token/[token]/route.ts`**

```ts
import { NextResponse } from "next/server"

import { journeyErrorResponse, NO_STORE, notFoundResponse } from "@/lib/journey/http"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { GetJourneyResponse } from "@/types/journey"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }): Promise<NextResponse> {
  try {
    const found = await getJourneyStore().findByToken((await params).token)
    if (!found) return notFoundResponse()
    // Trình duyệt hỏi lại mỗi 3 giây: chưa đổi thì trả 204 rỗng cho nhẹ.
    const since = new URL(request.url).searchParams.get("since")
    if (since !== null && Number(since) === found.journey.version) return new NextResponse(null, { status: 204, headers: NO_STORE })
    return NextResponse.json<GetJourneyResponse>({ journey: forRole(found.journey, found.role), role: found.role }, { headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
```

- [ ] **Step 4: Tạo `src/app/api/journeys/[id]/ops/route.ts`**

```ts
import { NextResponse } from "next/server"

import { journeyErrorResponse, NO_STORE, notFoundResponse, serverDeps } from "@/lib/journey/http"
import { applyOp, forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { JourneyOpResponse } from "@/types/journey"

export const runtime = "nodejs"

function isJoin(op: unknown): boolean {
  return typeof op === "object" && op !== null && (op as Record<string, unknown>).type === "join"
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params
    const body: unknown = await request.json().catch(() => null)
    const { token, memberId, op } = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
    const store = getJourneyStore()
    const found = typeof token === "string" ? await store.findByToken(token) : null
    if (!found || found.journey.id !== id) return notFoundResponse()

    // Quyền lấy từ token, không tin role do client gửi lên.
    const actor = { role: found.role, memberId: typeof memberId === "string" ? memberId : undefined }
    const journey = await store.update(id, (current) => applyOp(current, op, actor, serverDeps(current.destinationSlug)))
    // Hàng đợi ghi tuần tự nên thành viên cuối chính là người vừa join.
    const joinedId = isJoin(op) ? journey.members.at(-1)?.id : undefined
    return NextResponse.json<JourneyOpResponse>({ journey: forRole(journey, found.role), memberId: joinedId }, { headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
```

- [ ] **Step 5: Type check và lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không có lỗi mới.

- [ ] **Step 6: Kiểm tra bằng curl trên dev server**

Chạy dev server ở nền (Bash `run_in_background: true`): `pnpm dev --port 3100`. Đợi tới khi `curl -s -o /dev/null -w '%{http_code}' localhost:3100/login` trả `200`.

Rồi chạy:

```bash
PW=$(grep '^DEMO_PASSWORD=' .env.local | cut -d= -f2- | tr -d '"')
C="Cookie: demo_auth=$(printf %s "$PW" | shasum -a 256 | cut -d' ' -f1)"
B=localhost:3100/api/journeys
J='Content-Type: application/json'
get() { python3 -c "import json,sys;d=json.load(sys.stdin);print(eval(sys.argv[1]))" "$1"; }

echo "1 không cookie:"; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B
echo "2 JSON hỏng:"; curl -s -w ' %{http_code}\n' -X POST $B -H "$C" -H "$J" -d '{hong'
RES=$(curl -s -X POST $B -H "$C" -H "$J" -d '{"title":"Thử curl","destinationSlug":"phu-quoc","startDate":null,"nights":2,"travelers":{"adults":2,"childAges":[3]},"memberName":"Lan"}')
ID=$(echo "$RES" | get 'd["journey"]["id"]'); EDIT=$(echo "$RES" | get 'd["journey"]["editToken"]'); VIEW=$(echo "$RES" | get 'd["journey"]["viewToken"]'); MEM=$(echo "$RES" | get 'd["memberId"]')
echo "3 tạo: id=$ID"
echo "4 xem bằng link xem (không có editToken):"; curl -s $B/by-token/$VIEW -H "$C" | get '(d["role"], "editToken" in d["journey"])'
echo "5 since=version:"; curl -s -o /dev/null -w '%{http_code}\n' "$B/by-token/$EDIT?since=1" -H "$C"
echo "6 link xem sửa:"; curl -s -w ' %{http_code}\n' -X POST $B/$ID/ops -H "$C" -H "$J" -d "{\"token\":\"$VIEW\",\"op\":{\"type\":\"addItem\",\"serviceId\":\"hotel-pq-01\"}}"
echo "7 thêm khách sạn:"; curl -s -X POST $B/$ID/ops -H "$C" -H "$J" -d "{\"token\":\"$EDIT\",\"memberId\":\"$MEM\",\"op\":{\"type\":\"addItem\",\"serviceId\":\"hotel-pq-01\"}}" | get '(d["journey"]["version"], len(d["journey"]["items"]))'
echo "8 join:"; curl -s -X POST $B/$ID/ops -H "$C" -H "$J" -d "{\"token\":\"$EDIT\",\"op\":{\"type\":\"join\",\"name\":\"Minh\"}}" | get 'bool(d["memberId"])'
echo "9 token sai:"; curl -s -o /dev/null -w '%{http_code}\n' $B/by-token/khong-co -H "$C"
echo "10 token đúng nhưng sai id:"; curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/00000000-0000-4000-8000-000000000000/ops -H "$C" -H "$J" -d "{\"token\":\"$EDIT\",\"op\":{\"type\":\"join\",\"name\":\"X\"}}"
```

Expected:
- 1: `401`
- 2: thông báo lỗi tiếng Việt kèm `400`
- 3: in ra một UUID
- 4: `('view', False)`
- 5: `204`
- 6: `{"error":"Link chỉ xem không sửa được kế hoạch."} 403`
- 7: `(2, 1)`
- 8: `True`
- 9: `404`
- 10: `404`

Dừng dev server sau khi kiểm tra. Xóa dữ liệu thử: `rm -rf .data/journeys`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/journey/http.ts src/app/api/journeys
git commit -m "feat: API tạo, đọc và thao tác kế hoạch chuyến đi

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Phía client: gọi API, localStorage, hook đồng bộ, nhãn hiển thị

**Files:**
- Create: `src/services/journey.service.ts`, `src/lib/journey/local.ts`, `src/lib/journey/labels.ts`, `src/lib/journey/client.ts`, `src/hooks/use-journey.ts`
- Test: `src/lib/journey/local.test.ts`, `src/lib/journey/labels.test.ts`

**Interfaces:**
- Consumes: API ở Task 5; `applyOp`, `OpDeps` (Task 3); `JourneyError`; `http`, `getErrorMessage` từ `@/services/http`; `formatShortDate`, `formatVnd` từ `@/lib/format`.
- Produces:
  - `journeyService.create(input: CreateJourneyRequest): Promise<CreateJourneyResponse>`, `journeyService.get(token: string, since?: number): Promise<GetJourneyResponse | null>` (null khi 204), `journeyService.op(journeyId: string, request: JourneyOpRequest): Promise<JourneyOpResponse>`.
  - `interface SavedJourney { id: string; token: string; title: string; role: JourneyRole; memberId?: string; savedAt: string }`; `browserStorage()`, `readSaved(storage?) => SavedJourney[]`, `saveJourney(entry: Omit<SavedJourney, "savedAt">, storage?, now?) => SavedJourney[]`.
  - `travelersLabel(travelers)`, `durationLabel(nights)`, `addDays(isoDate, days)`, `dayLabel(startDate, day)`, `priceLabel({ priceVnd, priceUnit })`, `shortVnd(vnd)`, `defaultJourneyInfo(destinationName, now?) => JourneyInfoValues`.
  - `createJourneyAndSave(destinationSlug: string, values: JourneyInfoValues): Promise<SavedJourney>`.
  - `useJourney(token, initial: { journey: PublicJourney; role: JourneyRole }, services: ServiceItem[]) => { journey; role; memberId: string | undefined; offline: boolean; missing: boolean; send(op: JourneyOp): Promise<boolean>; join(name: string): Promise<boolean> }`.

- [ ] **Step 1: Viết test `src/lib/journey/local.test.ts`**

```ts
import assert from "node:assert/strict"
import { readSaved, saveJourney } from "./local"

function memoryStorage(initial: Record<string, string> = {}): Pick<Storage, "getItem" | "setItem"> {
  const data = new Map(Object.entries(initial))
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) }
}
const now = new Date("2026-10-08T00:00:00Z")

// Trống, hỏng, sai kiểu, không có storage, storage ném lỗi: đều ra [].
assert.deepEqual(readSaved(memoryStorage()), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": "{hong" })), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": '{"a":1}' })), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": '[{"id":1},{"id":"x","token":"t","title":"T","role":"admin"}]' })), [])
assert.deepEqual(readSaved(null), [])
const throwing = { getItem: (): string | null => { throw new Error("bị chặn") }, setItem: (): void => { throw new Error("bị chặn") } }
assert.deepEqual(readSaved(throwing), [])
assert.doesNotThrow(() => saveJourney({ id: "a", token: "t", title: "A", role: "edit" }, throwing, now))

// Ghi mới lên đầu danh sách.
const storage = memoryStorage()
saveJourney({ id: "a", token: "edit-a", title: "A", role: "edit", memberId: "m1" }, storage, now)
saveJourney({ id: "b", token: "view-b", title: "B", role: "view" }, storage, now)
assert.deepEqual(readSaved(storage).map((item) => item.id), ["b", "a"])

// Mở link xem của kế hoạch đã có link sửa: giữ link sửa và memberId, cập nhật tên.
saveJourney({ id: "a", token: "view-a", title: "A mới", role: "view" }, storage, now)
const a = readSaved(storage).find((item) => item.id === "a")
assert.deepEqual([a?.token, a?.role, a?.memberId, a?.title], ["edit-a", "edit", "m1", "A mới"])
assert.equal(readSaved(storage).length, 2, "không nhân bản theo id")

// Có link sửa sau link xem: nâng lên quyền sửa.
saveJourney({ id: "b", token: "edit-b", title: "B", role: "edit", memberId: "m2" }, storage, now)
const b = readSaved(storage).find((item) => item.id === "b")
assert.deepEqual([b?.token, b?.role, b?.memberId], ["edit-b", "edit", "m2"])

console.log("local.test OK")
```

- [ ] **Step 2: Viết test `src/lib/journey/labels.test.ts`**

```ts
import assert from "node:assert/strict"
import { addDays, dayLabel, defaultJourneyInfo, durationLabel, priceLabel, shortVnd, travelersLabel } from "./labels"

assert.equal(travelersLabel({ adults: 2, childAges: [] }), "2 người lớn")
assert.equal(travelersLabel({ adults: 2, childAges: [3, 7] }), "2 người lớn, 2 bé (3, 7 tuổi)")
assert.equal(durationLabel(2), "3N2Đ")
assert.equal(durationLabel(0), "1N0Đ")
assert.equal(addDays("2026-10-31", 1), "2026-11-01")
assert.equal(addDays("2026-12-31", 1), "2027-01-01")
assert.equal(dayLabel("2026-11-01", 1), "Ngày 1 · 01/11")
assert.equal(dayLabel("2026-11-01", 3), "Ngày 3 · 03/11")
assert.equal(dayLabel(null, 2), "Ngày 2")
assert.equal(priceLabel({ priceVnd: 1500000, priceUnit: "per_room_night" }), "1.500.000đ / phòng / đêm")
assert.equal(priceLabel({ priceVnd: 0, priceUnit: "per_person" }), "Miễn phí")
assert.equal(shortVnd(18400000), "18,4tr")
assert.equal(shortVnd(3000000), "3tr")
assert.equal(shortVnd(500000), "500.000đ")

const info = defaultJourneyInfo("Phú Quốc", new Date("2026-10-08T00:00:00Z"))
assert.equal(info.title, "Phú Quốc tháng 11")
assert.deepEqual([info.nights, info.travelers, info.startDate, info.memberName], [2, { adults: 2, childAges: [] }, null, ""])
assert.equal(defaultJourneyInfo("Phú Quốc", new Date("2026-12-08T00:00:00Z")).title, "Phú Quốc tháng 1")

console.log("labels.test OK")
```

- [ ] **Step 3: Chạy để thấy fail**

Run: `npx tsx src/lib/journey/local.test.ts; npx tsx src/lib/journey/labels.test.ts`
Expected: cả hai FAIL vì chưa có module.

- [ ] **Step 4: Tạo `src/lib/journey/local.ts`**

```ts
import type { JourneyRole } from "@/types/journey"

/** Kế hoạch đã mở trên trình duyệt này: danh sách tiện ích, mất đi cũng không mất dữ liệu kế hoạch. */
export interface SavedJourney {
  id: string
  token: string
  title: string
  role: JourneyRole
  /** Có khi đã nhập tên trên link sửa. */
  memberId?: string
  savedAt: string
}

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">

const KEY = "explorer-journeys"

/** localStorage có thể ném lỗi (chế độ riêng tư, chặn dữ liệu trang); khi đó coi như không có. */
export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function isSaved(value: unknown): value is SavedJourney {
  if (typeof value !== "object" || value === null) return false
  const { id, token, title, role, memberId } = value as Record<string, unknown>
  return (
    typeof id === "string" &&
    typeof token === "string" &&
    typeof title === "string" &&
    (role === "edit" || role === "view") &&
    (memberId === undefined || typeof memberId === "string")
  )
}

export function readSaved(storage: KeyValueStorage | null = browserStorage()): SavedJourney[] {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(KEY) ?? "[]")
    return Array.isArray(parsed) && parsed.every(isSaved) ? parsed : []
  } catch {
    return []
  }
}

/** Ghi hoặc cập nhật theo id, đưa lên đầu. Đã có link sửa thì không hạ xuống link xem; giữ memberId cũ nếu bản mới không có. */
export function saveJourney(
  entry: Omit<SavedJourney, "savedAt">,
  storage: KeyValueStorage | null = browserStorage(),
  now: Date = new Date(),
): SavedJourney[] {
  const list = readSaved(storage)
  const existing = list.find((item) => item.id === entry.id)
  const keepEdit = existing !== undefined && existing.role === "edit" && entry.role === "view"
  const merged: SavedJourney = {
    id: entry.id,
    title: entry.title,
    token: keepEdit ? existing.token : entry.token,
    role: keepEdit ? "edit" : entry.role,
    memberId: entry.memberId ?? existing?.memberId,
    savedAt: now.toISOString(),
  }
  const next = [merged, ...list.filter((item) => item.id !== entry.id)]
  try {
    storage?.setItem(KEY, JSON.stringify(next))
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: chỉ mất danh sách tiện ích, kế hoạch vẫn nằm trên server.
  }
  return next
}
```

- [ ] **Step 5: Tạo `src/lib/journey/labels.ts`**

```ts
import { formatShortDate, formatVnd } from "@/lib/format"
import { PRICE_UNIT_LABEL, type JourneyInfoValues, type ServiceSnapshot, type Travelers } from "@/types/journey"

export function travelersLabel({ adults, childAges }: Travelers): string {
  const adultsText = `${adults} người lớn`
  if (childAges.length === 0) return adultsText
  return `${adultsText}, ${childAges.length} bé (${childAges.join(", ")} tuổi)`
}

export function durationLabel(nights: number): string {
  return `${nights + 1}N${nights}Đ`
}

/** "2026-10-31" + 1 → "2026-11-01"; tính theo UTC để không lệch múi giờ. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function dayLabel(startDate: string | null, day: number): string {
  return startDate ? `Ngày ${day} · ${formatShortDate(addDays(startDate, day - 1))}` : `Ngày ${day}`
}

export function priceLabel({ priceVnd, priceUnit }: Pick<ServiceSnapshot, "priceVnd" | "priceUnit">): string {
  return priceVnd === 0 ? "Miễn phí" : `${formatVnd(priceVnd)} ${PRICE_UNIT_LABEL[priceUnit]}`
}

/** 18.400.000 → "18,4tr" cho thanh tóm tắt trên điện thoại. */
export function shortVnd(vnd: number): string {
  if (vnd < 1_000_000) return formatVnd(vnd)
  return `${(vnd / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`
}

/** Giá trị mặc định của form tạo kế hoạch: tên theo tháng sau. */
export function defaultJourneyInfo(destinationName: string, now: Date = new Date()): JourneyInfoValues {
  const nextMonth = (now.getMonth() + 1) % 12 + 1
  return { title: `${destinationName} tháng ${nextMonth}`, startDate: null, nights: 2, travelers: { adults: 2, childAges: [] }, memberName: "" }
}
```

- [ ] **Step 6: Chạy hai test cho tới khi pass**

Run: `npx tsx src/lib/journey/local.test.ts && npx tsx src/lib/journey/labels.test.ts`
Expected: `local.test OK` rồi `labels.test OK`.

- [ ] **Step 7: Tạo `src/services/journey.service.ts`**

```ts
import { http } from "@/services/http"
import type {
  CreateJourneyRequest,
  CreateJourneyResponse,
  GetJourneyResponse,
  JourneyOpRequest,
  JourneyOpResponse,
} from "@/types/journey"

export const journeyService = {
  async create(input: CreateJourneyRequest): Promise<CreateJourneyResponse> {
    const { data } = await http.post<CreateJourneyResponse>("/journeys", input)
    return data
  },

  /** null khi kế hoạch chưa đổi so với `since` (server trả 204). */
  async get(token: string, since?: number): Promise<GetJourneyResponse | null> {
    const response = await http.get<GetJourneyResponse>(`/journeys/by-token/${encodeURIComponent(token)}`, {
      params: since === undefined ? undefined : { since },
    })
    return response.status === 204 ? null : response.data
  },

  async op(journeyId: string, request: JourneyOpRequest): Promise<JourneyOpResponse> {
    const { data } = await http.post<JourneyOpResponse>(`/journeys/${encodeURIComponent(journeyId)}/ops`, request)
    return data
  },
}
```

- [ ] **Step 8: Tạo `src/lib/journey/client.ts`**

```ts
import { saveJourney, type SavedJourney } from "@/lib/journey/local"
import { journeyService } from "@/services/journey.service"
import type { JourneyInfoValues } from "@/types/journey"

/** Tạo kế hoạch rồi nhớ link sửa và tên người tạo trên trình duyệt này. */
export async function createJourneyAndSave(destinationSlug: string, values: JourneyInfoValues): Promise<SavedJourney> {
  const { journey, memberId } = await journeyService.create({ ...values, destinationSlug })
  if (!journey.editToken) throw new Error("Máy chủ không trả về link sửa.")
  const [saved] = saveJourney({ id: journey.id, token: journey.editToken, title: journey.title, role: "edit", memberId })
  return saved
}
```

- [ ] **Step 9: Tạo `src/hooks/use-journey.ts`**

```ts
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import { JourneyError } from "@/lib/journey/errors"
import { readSaved, saveJourney } from "@/lib/journey/local"
import { applyOp, type OpDeps } from "@/lib/journey/operations"
import { getErrorMessage } from "@/services/http"
import { journeyService } from "@/services/journey.service"
import type { JourneyOp, JourneyRole, PublicJourney, ServiceItem } from "@/types/journey"

const POLL_MS = 3000

export interface JourneyState {
  journey: PublicJourney
  role: JourneyRole
  /** Chỉ có khi đã nhập tên trên link sửa và vẫn là thành viên của kế hoạch. */
  memberId: string | undefined
  offline: boolean
  missing: boolean
  send: (op: JourneyOp) => Promise<boolean>
  join: (name: string) => Promise<boolean>
}

export function useJourney(token: string, initial: { journey: PublicJourney; role: JourneyRole }, services: ServiceItem[]): JourneyState {
  const { role } = initial
  const [journey, setJourney] = useState(initial.journey)
  const [savedMemberId, setSavedMemberId] = useState<string>()
  const [offline, setOffline] = useState(false)
  const [missing, setMissing] = useState(false)
  const journeyRef = useRef(initial.journey)
  const pendingRef = useRef(0)

  const memberId = savedMemberId && journey.members.some((member) => member.id === savedMemberId) ? savedMemberId : undefined

  const accept = useCallback((next: PublicJourney) => {
    journeyRef.current = next
    setJourney(next)
  }, [])

  // Nhớ kế hoạch vào "Kế hoạch của tôi" và lấy lại tên đã nhập trên trình duyệt này.
  useEffect(() => {
    const saved = readSaved().find((item) => item.id === journey.id)
    setSavedMemberId(saved?.memberId)
    saveJourney({ id: journey.id, token, title: journey.title, role, memberId: saved?.memberId })
  }, [journey.id, journey.title, role, token])

  // Hỏi lại server mỗi 3 giây; bỏ qua khi đang gửi thao tác để không đè bản lạc quan.
  useEffect(() => {
    let busy = false
    const timer = window.setInterval(async () => {
      if (busy || pendingRef.current > 0 || document.hidden) return
      busy = true
      try {
        const result = await journeyService.get(token, journeyRef.current.version)
        setOffline(false)
        if (result && pendingRef.current === 0) {
          accept(result.journey)
          toast("Kế hoạch vừa được cập nhật", { id: "journey-updated" })
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) setMissing(true)
        else setOffline(true)
      } finally {
        busy = false
      }
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [token, accept])

  const deps = useMemo<OpDeps>(
    () => ({
      lookup: (id) => services.find((service) => service.id === id),
      // id tạm cho bản lạc quan; server trả id thật ngay sau đó. Không dùng crypto.randomUUID vì cần https.
      newId: () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      now: () => new Date(),
    }),
    [services],
  )

  const send = useCallback(
    async (op: JourneyOp): Promise<boolean> => {
      const before = journeyRef.current
      try {
        accept(applyOp(before, op, { role, memberId }, deps))
      } catch (error) {
        toast.error(error instanceof JourneyError ? error.message : "Thao tác không hợp lệ.")
        return false
      }
      pendingRef.current += 1
      try {
        const result = await journeyService.op(before.id, { token, memberId, op })
        accept(result.journey)
        return true
      } catch (error) {
        accept(before)
        toast.error(getErrorMessage(error, "Chưa lưu được thay đổi, Quý khách thử lại nhé."))
        return false
      } finally {
        pendingRef.current -= 1
      }
    },
    [accept, deps, memberId, role, token],
  )

  const join = useCallback(
    async (name: string): Promise<boolean> => {
      pendingRef.current += 1
      try {
        const result = await journeyService.op(journeyRef.current.id, { token, op: { type: "join", name } })
        accept(result.journey)
        if (result.memberId) {
          setSavedMemberId(result.memberId)
          saveJourney({ id: result.journey.id, token, title: result.journey.title, role, memberId: result.memberId })
        }
        return true
      } catch (error) {
        toast.error(getErrorMessage(error, "Chưa vào được kế hoạch, Quý khách thử lại nhé."))
        return false
      } finally {
        pendingRef.current -= 1
      }
    },
    [accept, role, token],
  )

  return { journey, role, memberId, offline, missing, send, join }
}
```

- [ ] **Step 10: Type check, lint, commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không có lỗi mới.

```bash
git add src/services/journey.service.ts src/lib/journey/local.ts src/lib/journey/local.test.ts src/lib/journey/labels.ts src/lib/journey/labels.test.ts src/lib/journey/client.ts src/hooks/use-journey.ts
git commit -m "feat: client kế hoạch: gọi API, nhớ kế hoạch trên trình duyệt, đồng bộ 3 giây

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Trang "Kế hoạch của tôi" và form tạo kế hoạch

**Files:**
- Create: `src/components/journey/styles.ts`, `src/components/journey/modal.tsx`, `src/components/journey/journey-info-form.tsx`, `src/components/journey/journeys-home.tsx`, `src/app/hanh-trinh/page.tsx`
- Modify: `src/components/explorer/explorer-header.tsx` (thêm mục điều hướng)

**Interfaces:**
- Consumes: `readSaved`, `SavedJourney` (Task 6), `createJourneyAndSave`, `defaultJourneyInfo`, `getErrorMessage`, `ExplorerShell`, `getGuide`.
- Produces:
  - `INPUT_CLASS`, `PRIMARY_BUTTON`, `GHOST_BUTTON`, `MENU_CLASS`, `MENU_ITEM_CLASS` (chuỗi class).
  - `Modal({ open, onOpenChange, title, description?, wide?, children })`.
  - `JourneyInfoForm({ initial: JourneyInfoValues; askName: boolean; submitLabel: string; onSubmit(values: JourneyInfoValues): Promise<void> })`.
  - Trang `/hanh-trinh`.

- [ ] **Step 1: Tạo `src/components/journey/styles.ts`**

```ts
/** text-base trên ô nhập để Safari iOS không tự phóng to khi chạm. */
export const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-xl bg-tint/[0.06] px-4 text-base font-normal text-title ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"

export const PRIMARY_BUTTON =
  "btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"

export const GHOST_BUTTON =
  "btn-glass inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"

export const ICON_BUTTON =
  "grid size-9 place-items-center rounded-full text-body outline-none hover:bg-tint/[0.08] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"

export const MENU_CLASS = "z-50 min-w-52 rounded-2xl bg-void p-1.5 shadow-2xl ring-1 ring-tint/10"

export const MENU_ITEM_CLASS =
  "flex h-9 cursor-pointer items-center rounded-xl px-3 text-sm text-body outline-none select-none data-[highlighted]:bg-tint/[0.08] data-[highlighted]:text-title"
```

- [ ] **Step 2: Tạo `src/components/journey/modal.tsx`**

```tsx
"use client"

import { Dialog } from "radix-ui"
import { XIcon } from "lucide-react"

import { ICON_BUTTON } from "@/components/journey/styles"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  wide?: boolean
  children: React.ReactNode
}

/**
 * Hộp thoại dùng chung. Portal bọc trong .explorer để nhận biến màu của trang,
 * và để không bị khối Reveal (có transform) làm lệch position: fixed.
 */
export function Modal({ open, onOpenChange, title, description, wide, children }: ModalProps): React.JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <div className="explorer contents">
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed inset-x-3 bottom-3 z-50 max-h-[85dvh] overflow-y-auto rounded-[1.75rem] bg-void p-6 text-body shadow-2xl ring-1 ring-tint/10 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2",
              wide ? "sm:max-w-3xl" : "sm:max-w-md",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-voyage text-2xl font-semibold tracking-tight text-title">{title}</Dialog.Title>
              <Dialog.Close aria-label="Đóng" className={ICON_BUTTON}>
                <XIcon aria-hidden strokeWidth={1.5} className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className={description ? "mt-1 text-sm text-muted-foreground" : "sr-only"}>{description ?? title}</Dialog.Description>
            <div className="mt-5">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 3: Tạo `src/components/journey/journey-info-form.tsx`**

```tsx
"use client"

import { useState } from "react"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { LIMITS } from "@/lib/journey/operations"
import type { JourneyInfoValues } from "@/types/journey"

interface JourneyInfoFormProps {
  initial: JourneyInfoValues
  /** true khi tạo kế hoạch: hỏi tên người tạo. */
  askName: boolean
  submitLabel: string
  onSubmit: (values: JourneyInfoValues) => Promise<void>
}

const DEFAULT_CHILD_AGE = 5

function Field({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <label className="flex flex-col text-sm font-semibold text-title">
      {label}
      {children}
    </label>
  )
}

function NumberSelect({ value, min, max, onChange, label, suffix = "" }: { value: number; min: number; max: number; onChange: (value: number) => void; label?: string; suffix?: string }): React.JSX.Element {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(Number(event.target.value))} className={INPUT_CLASS}>
      {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((option) => (
        <option key={option} value={option}>
          {option}
          {suffix}
        </option>
      ))}
    </select>
  )
}

export function JourneyInfoForm({ initial, askName, submitLabel, onSubmit }: JourneyInfoFormProps): React.JSX.Element {
  const [title, setTitle] = useState(initial.title)
  const [startDate, setStartDate] = useState(initial.startDate ?? "")
  const [nights, setNights] = useState(initial.nights)
  const [adults, setAdults] = useState(initial.travelers.adults)
  const [childAges, setChildAges] = useState(initial.travelers.childAges)
  const [memberName, setMemberName] = useState(initial.memberName)
  const [busy, setBusy] = useState(false)

  function setChildCount(count: number): void {
    setChildAges((ages) => (count > ages.length ? [...ages, ...Array<number>(count - ages.length).fill(DEFAULT_CHILD_AGE)] : ages.slice(0, count)))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setBusy(true)
    try {
      await onSubmit({ title: title.trim(), startDate: startDate || null, nights, travelers: { adults, childAges }, memberName: memberName.trim() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Tên chuyến">
        <input required maxLength={LIMITS.titleLength} value={title} onChange={(event) => setTitle(event.target.value)} className={INPUT_CLASS} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngày đi (không bắt buộc)">
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Số đêm">
          <NumberSelect value={nights} min={0} max={LIMITS.maxNights} onChange={setNights} />
        </Field>
        <Field label="Người lớn">
          <NumberSelect value={adults} min={1} max={LIMITS.maxAdults} onChange={setAdults} />
        </Field>
        <Field label="Trẻ em (dưới 18)">
          <NumberSelect value={childAges.length} min={0} max={LIMITS.maxChildren} onChange={setChildCount} />
        </Field>
      </div>
      {childAges.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-title">Tuổi từng bé (để tính giá trẻ em)</legend>
          <div className="grid grid-cols-3 gap-2">
            {childAges.map((age, index) => (
              <NumberSelect
                key={index}
                label={`Tuổi bé thứ ${index + 1}`}
                value={age}
                min={0}
                max={LIMITS.maxChildAge}
                suffix=" tuổi"
                onChange={(value) => setChildAges((ages) => ages.map((current, position) => (position === index ? value : current)))}
              />
            ))}
          </div>
        </fieldset>
      )}
      {askName && (
        <Field label="Tên của Quý khách (để cả nhóm biết ai góp ý)">
          <input required maxLength={LIMITS.nameLength} value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Ví dụ: Lan" className={INPUT_CLASS} />
        </Field>
      )}
      <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
        {busy ? "Đang lưu…" : submitLabel}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Tạo `src/components/journey/journeys-home.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { createJourneyAndSave } from "@/lib/journey/client"
import { defaultJourneyInfo } from "@/lib/journey/labels"
import { readSaved, type SavedJourney } from "@/lib/journey/local"
import { getErrorMessage } from "@/services/http"
import type { JourneyInfoValues } from "@/types/journey"

interface JourneysHomeProps {
  destinationSlug: string
  destinationName: string
}

export function JourneysHome({ destinationSlug, destinationName }: JourneysHomeProps): React.JSX.Element {
  const router = useRouter()
  // null = chưa đọc localStorage (lúc render phía server).
  const [saved, setSaved] = useState<SavedJourney[] | null>(null)

  useEffect(() => {
    setSaved(readSaved())
  }, [])

  async function handleCreate(values: JourneyInfoValues): Promise<void> {
    try {
      const journey = await createJourneyAndSave(destinationSlug, values)
      router.push(`/hanh-trinh/${journey.token}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa tạo được kế hoạch, Quý khách thử lại nhé."))
    }
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_26rem]">
      <section aria-labelledby="ke-hoach-da-luu">
        <h2 id="ke-hoach-da-luu" className="font-voyage text-2xl font-semibold tracking-tight text-title">
          Kế hoạch trên trình duyệt này
        </h2>
        {saved === null ? null : saved.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Chưa có kế hoạch nào. Tạo kế hoạch mới, hoặc mở link mời bạn bè gửi cho Quý khách.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {saved.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/hanh-trinh/${item.token}`}
                  className="glass-card flex items-center justify-between gap-4 p-5 outline-none hover:ring-tint/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-semibold text-title">{item.title}</span>
                  <span className="shrink-0 rounded-full bg-tint/[0.08] px-3 py-1 text-xs font-semibold">{item.role === "edit" ? "Được sửa" : "Chỉ xem"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Danh sách chỉ lưu trên trình duyệt này. Mở trên máy khác thì dùng link mời.</p>
      </section>
      <section aria-labelledby="tao-ke-hoach" className="glass-card p-6">
        <h2 id="tao-ke-hoach" className="font-voyage text-2xl font-semibold tracking-tight text-title">
          Tạo kế hoạch {destinationName}
        </h2>
        <div className="mt-5">
          <JourneyInfoForm initial={defaultJourneyInfo(destinationName)} askName submitLabel="Tạo kế hoạch" onSubmit={handleCreate} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Tạo `src/app/hanh-trinh/page.tsx`**

```tsx
import type { Metadata } from "next"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { JourneysHome } from "@/components/journey/journeys-home"
import { phuQuoc } from "@/data/destinations/phu-quoc"

export const metadata: Metadata = {
  title: "Kế hoạch của tôi · Vietravel Explorer",
  robots: { index: false, follow: false },
}

export default function JourneysPage(): React.JSX.Element {
  return (
    <ExplorerShell>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 lg:px-6">
        <h1 className="font-voyage text-[2rem] leading-tight font-medium tracking-[-0.01em] text-champagne sm:text-4xl">Kế hoạch của tôi</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Chọn khách sạn, vé máy bay, xe và điểm vui chơi cho chuyến đi, xếp theo ngày, rồi mời gia đình, bạn bè cùng bình chọn. Giá trong kế hoạch là giá tham khảo.
        </p>
        <JourneysHome destinationSlug={phuQuoc.slug} destinationName={phuQuoc.name} />
      </div>
    </ExplorerShell>
  )
}
```

- [ ] **Step 6: Thêm mục điều hướng trong `src/components/explorer/explorer-header.tsx`**

Sửa mảng `NAV`:

```ts
const NAV = [
  { href: "/#diem-den", label: "Điểm đến" },
  { href: "/diem-den/phu-quoc#tour", label: "Tour và ưu đãi" },
  { href: "/hanh-trinh", label: "Kế hoạch của tôi" },
  { href: "/tripi", label: "Hỏi Tripi" },
]
```

- [ ] **Step 7: Type check, lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không có lỗi mới.

- [ ] **Step 8: Kiểm tra tay**

Chạy `pnpm dev --port 3100` ở nền, đăng nhập bằng `DEMO_PASSWORD` trên trình duyệt, mở `http://localhost:3100/hanh-trinh`:
- Header có "Kế hoạch của tôi" (desktop ≥ 768px).
- Danh sách trống hiện câu "Chưa có kế hoạch nào…".
- Form mặc định tên "Phú Quốc tháng 11", 2 đêm, 2 người lớn. Chọn 2 trẻ em thì hiện 2 ô tuổi.
- Bấm "Tạo kế hoạch" với tên trống: trình duyệt chặn (required). Điền tên rồi bấm: chuyển sang `/hanh-trinh/<token>` (trang này sẽ 404 cho tới Task 8, như vậy là đúng ở bước này).
- Quay lại `/hanh-trinh`: kế hoạch vừa tạo nằm trong danh sách, nhãn "Được sửa".

Dừng dev server, xóa `.data/journeys`.

- [ ] **Step 9: Commit**

```bash
git add src/components/journey/styles.ts src/components/journey/modal.tsx src/components/journey/journey-info-form.tsx src/components/journey/journeys-home.tsx src/app/hanh-trinh/page.tsx src/components/explorer/explorer-header.tsx
git commit -m "feat: trang Kế hoạch của tôi và form tạo kế hoạch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Màn hình kế hoạch

**Files:**
- Create: `src/components/journey/join-form.tsx`, `src/components/journey/invite-dialog.tsx`, `src/components/journey/cost-panel.tsx`, `src/components/journey/service-picker.tsx`, `src/components/journey/journey-item-card.tsx`, `src/components/journey/journey-view.tsx`, `src/app/hanh-trinh/[token]/page.tsx`
- Modify: `src/components/explorer/explorer-shell.tsx` (prop `showTripi`)

**Interfaces:**
- Consumes: `useJourney` (Task 6), `estimateCost`, `defaultQuantity` (Task 2), `voteScore`, `forRole`, `LIMITS` (Task 3), `getJourneyStore` (Task 4), `getServices` (Task 1), nhãn ở `labels.ts`, `Modal`, `JourneyInfoForm`, class ở `styles.ts` (Task 7), `CtaLink`, `buttonClass` từ `@/components/explorer/cta-link`, `getGuide`.
- Produces: trang `/hanh-trinh/[token]` (đọc `?them=<ServiceKind>` để mở sẵn bảng chọn); `ExplorerShell({ children, showTripi?: boolean })`.

- [ ] **Step 1: Thêm prop `showTripi` vào `src/components/explorer/explorer-shell.tsx`**

```tsx
import { ExplorerFooter } from "@/components/explorer/explorer-footer"
import { ExplorerHeader } from "@/components/explorer/explorer-header"
import { TripiFab } from "@/components/explorer/tripi-fab"

interface ExplorerShellProps {
  children: React.ReactNode
  /** Tắt nút nổi "Hỏi Tripi" ở trang có thanh dính đáy riêng (trang kế hoạch). */
  showTripi?: boolean
}

export function ExplorerShell({ children, showTripi = true }: ExplorerShellProps): React.JSX.Element {
  return (
    <div className="explorer grain relative min-h-dvh">
      <div aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-linear-to-r from-amber-300 via-coral to-fuchsia-500" />
      <ExplorerHeader />
      {/* Kéo nội dung lên dưới thanh điều hướng nổi để ảnh hero tràn mép trên. */}
      <main className="-mt-[4.25rem]">{children}</main>
      <ExplorerFooter />
      {showTripi && <TripiFab />}
    </div>
  )
}
```

- [ ] **Step 2: Tạo `src/components/journey/join-form.tsx`**

```tsx
"use client"

import { useState } from "react"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { LIMITS } from "@/lib/journey/operations"

export function JoinForm({ onJoin }: { onJoin: (name: string) => Promise<boolean> }): React.JSX.Element {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    await onJoin(name.trim())
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col text-sm font-semibold text-title">
        Quý khách được mời cùng lên kế hoạch. Nhập tên để cả nhóm biết ai đang góp ý:
        <input required maxLength={LIMITS.nameLength} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Minh" className={INPUT_CLASS} />
      </label>
      <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
        {busy ? "Đang vào…" : "Vào kế hoạch"}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Tạo `src/components/journey/invite-dialog.tsx`**

```tsx
"use client"

import { useState } from "react"
import { CopyIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { Modal } from "@/components/journey/modal"
import { GHOST_BUTTON, INPUT_CLASS } from "@/components/journey/styles"
import type { PublicJourney } from "@/types/journey"

async function copy(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Đã sao chép link")
  } catch {
    toast.error("Không sao chép được, Quý khách chọn link và sao chép thủ công nhé.")
  }
}

export function InviteDialog({ journey }: { journey: PublicJourney }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const links = [
    ...(journey.editToken ? [{ label: "Link được sửa", hint: "Người nhận thêm dịch vụ, bình chọn và bình luận.", token: journey.editToken }] : []),
    { label: "Link chỉ xem", hint: "Người nhận xem kế hoạch và chi phí, không sửa được.", token: journey.viewToken },
  ]

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={GHOST_BUTTON}>
        <UsersIcon aria-hidden strokeWidth={1.5} className="size-4" />
        Mời
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Mời cùng lên kế hoạch" description="Gửi link qua Zalo, Messenger hoặc email. Người nhận cần mật khẩu demo để mở.">
        <ul className="flex flex-col gap-5">
          {links.map((link) => {
            // Chỉ chạy khi hộp thoại mở (phía trình duyệt), nên dùng được window.
            const url = `${window.location.origin}/hanh-trinh/${link.token}`
            return (
              <li key={link.token}>
                <p className="text-sm font-semibold text-title">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.hint}</p>
                <div className="flex items-end gap-2">
                  <input readOnly aria-label={link.label} value={url} onFocus={(event) => event.currentTarget.select()} className={INPUT_CLASS} />
                  <button type="button" onClick={() => void copy(url)} className={GHOST_BUTTON}>
                    <CopyIcon aria-hidden strokeWidth={1.5} className="size-4" />
                    Sao chép
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Modal>
    </>
  )
}
```

- [ ] **Step 4: Tạo `src/components/journey/cost-panel.tsx`**

```tsx
"use client"

import { useState } from "react"

import { CtaLink } from "@/components/explorer/cta-link"
import { Modal } from "@/components/journey/modal"
import { estimateCost } from "@/lib/journey/cost"
import { shortVnd } from "@/lib/journey/labels"
import { formatVnd } from "@/lib/format"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type PublicJourney } from "@/types/journey"

interface CostPanelProps {
  journey: PublicJourney
  /** Trang đặt dịch vụ của điểm đến trên travel.com.vn. */
  bookUrl: string
}

export function CostPanel({ journey, bookUrl }: CostPanelProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const cost = estimateCost(journey)
  const kinds = SERVICE_KINDS.filter((kind) => cost.byKind[kind] > 0)

  const details = (
    <>
      {kinds.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có mục nào được xếp vào ngày.</p>
      ) : (
        <dl className="flex flex-col gap-2 text-sm">
          {kinds.map((kind) => (
            <div key={kind} className="flex justify-between gap-3">
              <dt>{SERVICE_KIND_LABEL[kind]}</dt>
              <dd className="font-semibold text-title">{formatVnd(cost.byKind[kind])}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Giá tham khảo, chưa phải giá đặt. Chỉ tính các mục đã xếp vào ngày; giá trẻ em theo độ tuổi của từng dịch vụ.
      </p>
      <CtaLink href={bookUrl} className="mt-5 w-full justify-between">
        Đặt dịch vụ trên travel.com.vn
      </CtaLink>
    </>
  )

  return (
    <>
      <aside aria-label="Chi phí dự kiến" className="glass-card sticky top-28 hidden self-start p-6 lg:block">
        <h2 className="text-sm font-semibold text-gold">Chi phí dự kiến</h2>
        <p className="mt-2 font-sans text-3xl font-bold tracking-tight text-champagne">~{formatVnd(cost.totalVnd)}</p>
        <p className="mb-5 text-sm text-muted-foreground">~{formatVnd(cost.perAdultVnd)} / người lớn</p>
        {details}
      </aside>
      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full bg-void/90 py-2 pr-2 pl-5 shadow-2xl ring-1 ring-tint/10 backdrop-blur-xl lg:hidden">
        <p className="text-sm">
          Tổng <span className="font-bold text-champagne">~{shortVnd(cost.totalVnd)}</span>
        </p>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary h-10 rounded-full px-4 text-sm font-semibold">
          Xem chi tiết
        </button>
      </div>
      <Modal open={open} onOpenChange={setOpen} title={`Chi phí dự kiến ~${formatVnd(cost.totalVnd)}`} description={`~${formatVnd(cost.perAdultVnd)} / người lớn`}>
        {details}
      </Modal>
    </>
  )
}
```

- [ ] **Step 5: Tạo `src/components/journey/service-picker.tsx`**

```tsx
"use client"

import { Tabs } from "radix-ui"

import { Modal } from "@/components/journey/modal"
import { priceLabel } from "@/lib/journey/labels"
import { isServiceKind, SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

interface ServicePickerProps {
  services: ServiceItem[]
  kind: ServiceKind | null
  onKindChange: (kind: ServiceKind | null) => void
  onAdd: (service: ServiceItem) => void
  /** serviceId đã có trong kế hoạch, để đổi nhãn nút. */
  addedIds: Set<string>
}

export function ServicePicker({ services, kind, onKindChange, onAdd, addedIds }: ServicePickerProps): React.JSX.Element {
  return (
    <Modal
      open={kind !== null}
      onOpenChange={(open) => !open && onKindChange(null)}
      title="Thêm dịch vụ"
      description="Mục mới vào nhóm Đang cân nhắc để cả nhóm bình chọn."
      wide
    >
      <Tabs.Root value={kind ?? "hotel"} onValueChange={(value) => isServiceKind(value) && onKindChange(value)}>
        <Tabs.List aria-label="Loại dịch vụ" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {SERVICE_KINDS.map((option) => (
            <Tabs.Trigger
              key={option}
              value={option}
              className="h-10 shrink-0 rounded-full bg-tint/5 px-4 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-champagne data-[state=active]:text-void"
            >
              {SERVICE_KIND_LABEL[option]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {SERVICE_KINDS.map((option) => {
          const items = services.filter((service) => service.kind === option)
          return (
            <Tabs.Content key={option} value={option} className="mt-4 outline-none">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hiện chưa có dịch vụ loại này.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {items.map((service) => (
                    <li key={service.id} className="glass-card flex flex-col gap-1.5 p-4">
                      <p className="text-xs font-semibold text-gold">{service.tag}</p>
                      <h3 className="font-semibold text-title">{service.name}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{service.blurb}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <p className="text-sm font-semibold text-champagne">{priceLabel(service)}</p>
                        <button type="button" onClick={() => onAdd(service)} className="btn-primary h-9 shrink-0 rounded-full px-4 text-sm font-semibold">
                          {addedIds.has(service.id) ? "Thêm lần nữa" : "Thêm"}
                        </button>
                      </div>
                      {service.mock && <p className="text-[11px] text-muted-foreground">Giá tham khảo (demo)</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          )
        })}
      </Tabs.Root>
    </Modal>
  )
}
```

- [ ] **Step 6: Tạo `src/components/journey/journey-item-card.tsx`**

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { DropdownMenu } from "radix-ui"
import {
  BedDoubleIcon,
  CarIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  MapIcon,
  MessageCircleIcon,
  MinusIcon,
  PlaneIcon,
  PlusIcon,
  SendIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react"

import { ICON_BUTTON, INPUT_CLASS, MENU_CLASS, MENU_ITEM_CLASS } from "@/components/journey/styles"
import { defaultQuantity } from "@/lib/journey/cost"
import { priceLabel } from "@/lib/journey/labels"
import { LIMITS } from "@/lib/journey/operations"
import { cn } from "@/lib/utils"
import { QUANTITY_LABEL, SERVICE_KIND_LABEL, type JourneyItem, type JourneyOp, type ServiceKind, type Travelers } from "@/types/journey"

const KIND_ICON: Record<ServiceKind, LucideIcon> = {
  hotel: BedDoubleIcon,
  flight: PlaneIcon,
  vehicle: CarIcon,
  activity: TicketIcon,
  tour: MapIcon,
}

interface JourneyItemCardProps {
  item: JourneyItem
  /** Vị trí trong nhóm, để bật/tắt Lên trên, Xuống dưới. */
  index: number
  groupSize: number
  dayCount: number
  travelers: Travelers
  canEdit: boolean
  memberId: string | undefined
  memberName: (id: string) => string
  onOp: (op: JourneyOp) => void
}

export function JourneyItemCard({ item, index, groupSize, dayCount, travelers, canEdit, memberId, memberName, onOp }: JourneyItemCardProps): React.JSX.Element {
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState("")
  const { snapshot, day } = item
  const Icon = KIND_ICON[snapshot.kind]
  const quantity = item.quantity ?? defaultQuantity(snapshot.priceUnit, travelers)
  const votes = Object.values(item.votes)
  const mine = memberId ? item.votes[memberId] : undefined
  const targets: (number | null)[] = [null, ...Array.from({ length: dayCount }, (_, position) => position + 1)].filter((target) => target !== day)

  function submitComment(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!draft.trim()) return
    onOp({ type: "comment", itemId: item.id, text: draft })
    setDraft("")
  }

  function voteButton(value: 1 | -1): React.JSX.Element {
    const VoteIcon = value === 1 ? ThumbsUpIcon : ThumbsDownIcon
    const count = votes.filter((vote) => vote === value).length
    const label = value === 1 ? "Thích" : "Không thích"
    return (
      <button
        type="button"
        disabled={!canEdit}
        aria-pressed={mine === value}
        aria-label={`${label}, ${count} phiếu`}
        onClick={() => onOp({ type: "vote", itemId: item.id, value })}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          mine === value ? "bg-champagne text-void" : "bg-tint/5 text-body enabled:hover:bg-tint/10",
        )}
      >
        <VoteIcon aria-hidden strokeWidth={1.5} className="size-4" />
        {count}
      </button>
    )
  }

  return (
    <li className="glass-card p-4">
      <div className="flex gap-4">
        {snapshot.imageUrl ? (
          <Image src={snapshot.imageUrl} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-xl bg-tint/[0.06] text-gold">
            <Icon strokeWidth={1.5} className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gold">
            {SERVICE_KIND_LABEL[snapshot.kind]} · {snapshot.tag}
          </p>
          <h3 className="font-semibold text-title">{snapshot.name}</h3>
          <p className="text-sm text-muted-foreground">
            {priceLabel(snapshot)}
            {snapshot.mock && <span className="ml-2 rounded-full bg-tint/[0.08] px-2 py-0.5 text-[11px] whitespace-nowrap">Giá tham khảo (demo)</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Thêm bởi {memberName(item.addedBy)}</p>
        </div>
        {canEdit && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger aria-label={`Thao tác với ${snapshot.name}`} className={ICON_BUTTON}>
              <EllipsisIcon aria-hidden strokeWidth={1.5} className="size-5" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <div className="explorer contents">
                <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CLASS}>
                  {day !== null && index > 0 && (
                    <DropdownMenu.Item className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day, order: index - 1 })}>
                      Lên trên
                    </DropdownMenu.Item>
                  )}
                  {day !== null && index < groupSize - 1 && (
                    <DropdownMenu.Item className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day, order: index + 1 })}>
                      Xuống dưới
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Label className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Chuyển sang</DropdownMenu.Label>
                  {targets.map((target) => (
                    <DropdownMenu.Item key={target ?? "considering"} className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day: target })}>
                      {target === null ? "Đang cân nhắc" : `Ngày ${target}`}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="my-1 h-px bg-tint/10" />
                  <DropdownMenu.Item className={cn(MENU_ITEM_CLASS, "text-coral")} onSelect={() => onOp({ type: "removeItem", itemId: item.id })}>
                    Xóa khỏi kế hoạch
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {quantity !== null && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{QUANTITY_LABEL[snapshot.priceUnit]}</span>
          {canEdit && (
            <button type="button" aria-label="Giảm" disabled={quantity <= 1} onClick={() => onOp({ type: "setQuantity", itemId: item.id, quantity: quantity - 1 })} className={ICON_BUTTON}>
              <MinusIcon aria-hidden strokeWidth={1.5} className="size-4" />
            </button>
          )}
          <span className="min-w-6 text-center font-semibold text-title">{quantity}</span>
          {canEdit && (
            <button type="button" aria-label="Tăng" disabled={quantity >= LIMITS.maxQuantity} onClick={() => onOp({ type: "setQuantity", itemId: item.id, quantity: quantity + 1 })} className={ICON_BUTTON}>
              <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {voteButton(1)}
        {voteButton(-1)}
        <button
          type="button"
          aria-expanded={showComments}
          onClick={() => setShowComments((shown) => !shown)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-tint/5 px-3 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircleIcon aria-hidden strokeWidth={1.5} className="size-4" />
          {item.comments.length} bình luận
        </button>
        <a
          href={snapshot.bookUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-champagne outline-none hover:bg-tint/[0.08] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Đặt
          <ExternalLinkIcon aria-hidden strokeWidth={1.5} className="size-4" />
        </a>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-tint/10 pt-3">
          {item.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bình luận.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {item.comments.map((comment) => (
                <li key={comment.id} className="text-sm">
                  <span className="font-semibold text-title">{memberName(comment.memberId)}:</span> {comment.text}
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <form onSubmit={submitComment} className="mt-3 flex items-end gap-2">
              <input
                aria-label="Viết bình luận"
                maxLength={LIMITS.commentLength}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ví dụ: Resort này có hồ bơi cho bé không?"
                className={INPUT_CLASS}
              />
              <button type="submit" aria-label="Gửi bình luận" className={cn(ICON_BUTTON, "size-11")}>
                <SendIcon aria-hidden strokeWidth={1.5} className="size-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  )
}
```

Lưu ý: nếu class `text-coral` không tồn tại trong theme, dùng `text-destructive`. Kiểm tra bằng `grep -n "coral" src/app/globals.css` (thanh tiến trình đầu trang đang dùng `via-coral`, nên token `coral` có sẵn).

- [ ] **Step 7: Tạo `src/components/journey/journey-view.tsx`**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, WifiOffIcon } from "lucide-react"
import { toast } from "sonner"

import { CostPanel } from "@/components/journey/cost-panel"
import { InviteDialog } from "@/components/journey/invite-dialog"
import { JoinForm } from "@/components/journey/join-form"
import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { JourneyItemCard } from "@/components/journey/journey-item-card"
import { Modal } from "@/components/journey/modal"
import { ServicePicker } from "@/components/journey/service-picker"
import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/journey/styles"
import { useJourney } from "@/hooks/use-journey"
import { addDays, dayLabel, durationLabel, travelersLabel } from "@/lib/journey/labels"
import { voteScore } from "@/lib/journey/operations"
import { formatShortDate } from "@/lib/format"
import type { JourneyItem, JourneyOp, JourneyRole, PublicJourney, ServiceItem, ServiceKind } from "@/types/journey"

interface JourneyViewProps {
  token: string
  initial: { journey: PublicJourney; role: JourneyRole }
  services: ServiceItem[]
  bookUrl: string
  /** Mở sẵn bảng chọn ở tab này (từ nút "Chọn khách sạn cho kế hoạch"). */
  openPicker?: ServiceKind
}

export function JourneyView({ token, initial, services, bookUrl, openPicker }: JourneyViewProps): React.JSX.Element {
  const { journey, role, memberId, offline, missing, send, join } = useJourney(token, initial, services)
  const [pickerKind, setPickerKind] = useState<ServiceKind | null>(openPicker ?? null)
  const [editing, setEditing] = useState(false)
  const canEdit = role === "edit" && memberId !== undefined
  const dayCount = journey.nights + 1
  const memberName = (id: string): string => journey.members.find((member) => member.id === id)?.name ?? "Thành viên"
  const me = memberId ? memberName(memberId) : undefined
  const onOp = (op: JourneyOp): void => void send(op)

  if (missing) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
        <h1 className="font-voyage text-3xl font-semibold text-title">Kế hoạch này không còn tồn tại</h1>
        <Link href="/hanh-trinh" className={PRIMARY_BUTTON}>
          Về Kế hoạch của tôi
        </Link>
      </div>
    )
  }

  const considering = journey.items.filter((item) => item.day === null).sort((a, b) => voteScore(b) - voteScore(a) || a.order - b.order)
  const groups: { key: string; title: string; hint?: string; items: JourneyItem[] }[] = [
    { key: "considering", title: "Đang cân nhắc", hint: "Các lựa chọn để cả nhóm bình chọn. Mục chưa xếp vào ngày chưa tính vào chi phí.", items: considering },
    ...Array.from({ length: dayCount }, (_, position) => ({
      key: `day-${position + 1}`,
      title: dayLabel(journey.startDate, position + 1),
      items: journey.items.filter((item) => item.day === position + 1).sort((a, b) => a.order - b.order),
    })),
  ]
  const dateRange = journey.startDate ? ` · ${formatShortDate(journey.startDate)}–${formatShortDate(addDays(journey.startDate, journey.nights))}` : ""

  function handleAdd(service: ServiceItem): void {
    void send({ type: "addItem", serviceId: service.id }).then((ok) => ok && toast.success(`Đã thêm ${service.name} vào Đang cân nhắc`))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-32 pb-28 lg:px-6 lg:pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gold">Kế hoạch chuyến đi</p>
          <h1 className="font-voyage text-3xl font-semibold tracking-tight text-title sm:text-4xl">{journey.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {durationLabel(journey.nights)}
            {dateRange} · {travelersLabel(journey.travelers)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ul aria-label="Thành viên" className="flex -space-x-2">
            {journey.members.slice(0, 6).map((member) => (
              <li
                key={member.id}
                title={member.name}
                className="grid size-9 place-items-center rounded-full bg-champagne text-sm font-bold text-void ring-2 ring-void"
              >
                {member.name.charAt(0).toUpperCase()}
              </li>
            ))}
            {journey.members.length > 6 && (
              <li className="grid size-9 place-items-center rounded-full bg-tint/10 text-xs font-bold ring-2 ring-void">+{journey.members.length - 6}</li>
            )}
          </ul>
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} className={GHOST_BUTTON}>
              <PencilIcon aria-hidden strokeWidth={1.5} className="size-4" />
              Sửa thông tin
            </button>
          )}
          <InviteDialog journey={journey} />
        </div>
      </header>

      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-tint/[0.08] px-3 py-1 font-semibold">{role === "view" ? "Chỉ xem" : me ? `Đang sửa · ${me}` : "Nhập tên để bắt đầu sửa"}</span>
        {offline && (
          <span role="status" className="inline-flex items-center gap-1.5 text-coral">
            <WifiOffIcon aria-hidden strokeWidth={1.5} className="size-4" />
            Mất kết nối, đang thử lại…
          </span>
        )}
      </p>

      {role === "edit" && !memberId && <JoinForm onJoin={join} />}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={group.key}>
              <h2 id={group.key} className="font-voyage text-xl font-semibold tracking-tight text-title">
                {group.title} <span className="text-sm font-normal text-muted-foreground">({group.items.length})</span>
              </h2>
              {group.hint && <p className="mt-1 text-sm text-muted-foreground">{group.hint}</p>}
              {group.items.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-tint/15 p-4 text-sm text-muted-foreground">Chưa có mục nào.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {group.items.map((item, index) => (
                    <JourneyItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      groupSize={group.items.length}
                      dayCount={dayCount}
                      travelers={journey.travelers}
                      canEdit={canEdit}
                      memberId={memberId}
                      memberName={memberName}
                      onOp={onOp}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))}
          {canEdit && (
            <button type="button" onClick={() => setPickerKind("hotel")} className={`${PRIMARY_BUTTON} self-start`}>
              <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
              Thêm dịch vụ
            </button>
          )}
        </div>
        <CostPanel journey={journey} bookUrl={bookUrl} />
      </div>

      {canEdit && (
        <ServicePicker
          services={services}
          kind={pickerKind}
          onKindChange={setPickerKind}
          onAdd={handleAdd}
          addedIds={new Set(journey.items.map((item) => item.serviceId))}
        />
      )}
      {canEdit && (
        <Modal open={editing} onOpenChange={setEditing} title="Sửa thông tin chuyến">
          <JourneyInfoForm
            initial={{ title: journey.title, startDate: journey.startDate, nights: journey.nights, travelers: journey.travelers, memberName: "" }}
            askName={false}
            submitLabel="Lưu"
            onSubmit={async ({ title, startDate, nights, travelers }) => {
              if (await send({ type: "updateInfo", title, startDate, nights, travelers })) setEditing(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Tạo `src/app/hanh-trinh/[token]/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { JourneyView } from "@/components/journey/journey-view"
import { PRIMARY_BUTTON } from "@/components/journey/styles"
import { getGuide } from "@/data/destinations"
import { getServices } from "@/lib/journey/catalog"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import { isServiceKind } from "@/types/journey"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kế hoạch chuyến đi · Vietravel Explorer",
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function JourneyPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { token } = await params
  const found = await getJourneyStore().findByToken(token)
  const guide = found ? getGuide(found.journey.destinationSlug) : undefined

  if (!found || !guide) {
    return (
      <ExplorerShell>
        <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
          <h1 className="font-voyage text-3xl font-semibold text-title">Không tìm thấy kế hoạch</h1>
          <p className="text-muted-foreground">Link có thể bị thiếu ký tự hoặc kế hoạch đã bị xóa. Quý khách kiểm tra lại link được gửi nhé.</p>
          <Link href="/hanh-trinh" className={PRIMARY_BUTTON}>
            Về Kế hoạch của tôi
          </Link>
        </div>
      </ExplorerShell>
    )
  }

  const { them } = await searchParams
  return (
    <ExplorerShell showTripi={false}>
      <JourneyView
        token={token}
        initial={{ journey: forRole(found.journey, found.role), role: found.role }}
        services={getServices(guide.slug)}
        bookUrl={guide.links.tours}
        openPicker={isServiceKind(them) ? them : undefined}
      />
    </ExplorerShell>
  )
}
```

- [ ] **Step 9: Type check, lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không có lỗi mới.

- [ ] **Step 10: Kiểm tra tay với hai trình duyệt**

Chạy `pnpm dev --port 3100` ở nền. Trình duyệt A (thường) và B (ẩn danh), cả hai đăng nhập `DEMO_PASSWORD`.
1. A: `/hanh-trinh` → tạo "Phú Quốc tháng 11", 2 người lớn, 2 bé 3 và 7 tuổi, tên "Lan". Thấy trang kế hoạch, nhãn "Đang sửa · Lan", nhóm "Đang cân nhắc" và Ngày 1–3 trống, chi phí ~0đ.
2. A: "Thêm dịch vụ" → tab Khách sạn → Thêm "Resort Rừng Biển"; tab Vé máy bay → Thêm TP.HCM. Hai mục vào "Đang cân nhắc", chi phí vẫn 0.
3. A: menu ⋯ của vé bay → "Ngày 1". Chi phí = 2.200.000 × 3,5 = 7.700.000đ.
4. A: "Mời" → sao chép link được sửa và link chỉ xem.
5. B: mở link được sửa → thấy form nhập tên; bấm 👍 bị vô hiệu. Nhập "Minh" → nhãn "Đang sửa · Minh", avatar L và M.
6. B: 👍 cho Resort, bình luận "Có hồ bơi cho bé không?". Trong ≤ 3 giây A thấy 1 phiếu, 1 bình luận, toast "Kế hoạch vừa được cập nhật".
7. B: mở link chỉ xem trong tab mới → nhãn "Chỉ xem", không có nút Thêm dịch vụ, menu ⋯, ô bình luận, "Sửa thông tin"; hộp "Mời" chỉ có link chỉ xem.
8. A: "Sửa thông tin" → 1 đêm. Mục ở Ngày 2 hoặc 3 (nếu có) về "Đang cân nhắc".
9. Thu cửa sổ về 390px: thanh "Tổng ~…" dính đáy, không có nút "Hỏi Tripi" đè lên, không cuộn ngang; "Xem chi tiết" mở bảng chi phí.
10. Mở `/hanh-trinh/khong-co` → "Không tìm thấy kế hoạch".
11. Tắt dev server khi A đang mở → sau ~3 giây hiện "Mất kết nối, đang thử lại…"; bật lại → nhãn biến mất.
12. Mở `/hanh-trinh/<token>?them=vehicle` bằng link sửa (đã nhập tên) → bảng chọn mở sẵn ở tab Thuê xe.

Dừng dev server, xóa `.data/journeys`.

- [ ] **Step 11: Commit**

```bash
git add src/components/explorer/explorer-shell.tsx src/components/journey/join-form.tsx src/components/journey/invite-dialog.tsx src/components/journey/cost-panel.tsx src/components/journey/service-picker.tsx src/components/journey/journey-item-card.tsx src/components/journey/journey-view.tsx "src/app/hanh-trinh/[token]/page.tsx"
git commit -m "feat: màn hình kế hoạch: xếp ngày, bình chọn, bình luận, chi phí, mời bạn bè

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Nút "Thêm vào kế hoạch" trên trang Phú Quốc và Home

**Files:**
- Create: `src/components/journey/add-to-plan-button.tsx`
- Modify: `src/components/explorer/place-grid.tsx`, `src/components/explorer/play-block.tsx`, `src/components/explorer/stay-block.tsx`, `src/components/explorer/tour-list.tsx`, `src/app/page.tsx`, `src/app/diem-den/[slug]/page.tsx`

**Interfaces:**
- Consumes: `readSaved`, `SavedJourney`, `createJourneyAndSave`, `defaultJourneyInfo` (Task 6), `journeyService`, `Modal`, `JourneyInfoForm`, `GHOST_BUTTON` (Task 7), `activityServiceId`, `tourServiceId` (Task 1).
- Produces: `AddToPlanButton({ destinationSlug, destinationName, serviceId?, pickerKind?, label?, className? })`; prop mới `planDestination?: { slug: string; name: string }` trên `PlaceGrid` và `TourList`.

- [ ] **Step 1: Tạo `src/components/journey/add-to-plan-button.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { Modal } from "@/components/journey/modal"
import { GHOST_BUTTON } from "@/components/journey/styles"
import { createJourneyAndSave } from "@/lib/journey/client"
import { defaultJourneyInfo } from "@/lib/journey/labels"
import { readSaved, type SavedJourney } from "@/lib/journey/local"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { journeyService } from "@/services/journey.service"
import type { JourneyInfoValues, ServiceKind } from "@/types/journey"

interface AddToPlanButtonProps {
  destinationSlug: string
  destinationName: string
  /** Thêm thẳng dịch vụ này. Bỏ trống thì mở trang kế hoạch với bảng chọn ở tab pickerKind. */
  serviceId?: string
  pickerKind?: ServiceKind
  label?: string
  className?: string
}

export function AddToPlanButton({
  destinationSlug,
  destinationName,
  serviceId,
  pickerKind = "hotel",
  label = "Thêm vào kế hoạch",
  className,
}: AddToPlanButtonProps): React.JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [choices, setChoices] = useState<SavedJourney[]>([])

  async function addTo(saved: SavedJourney): Promise<void> {
    if (!serviceId) {
      router.push(`/hanh-trinh/${saved.token}?them=${pickerKind}`)
      return
    }
    try {
      await journeyService.op(saved.id, { token: saved.token, memberId: saved.memberId, op: { type: "addItem", serviceId } })
      setOpen(false)
      toast.success(`Đã thêm vào "${saved.title}"`, {
        action: { label: "Xem kế hoạch", onClick: () => router.push(`/hanh-trinh/${saved.token}`) },
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa thêm được vào kế hoạch, Quý khách thử lại nhé."))
    }
  }

  function handleClick(): void {
    // Chỉ kế hoạch có link sửa và đã nhập tên mới thêm được mục.
    const editable = readSaved().filter((item) => item.role === "edit" && item.memberId)
    if (editable.length === 1) {
      void addTo(editable[0])
      return
    }
    setChoices(editable)
    setOpen(true)
  }

  async function handleCreate(values: JourneyInfoValues): Promise<void> {
    try {
      const saved = await createJourneyAndSave(destinationSlug, values)
      await addTo(saved)
      if (serviceId) router.push(`/hanh-trinh/${saved.token}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa tạo được kế hoạch, Quý khách thử lại nhé."))
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={cn(GHOST_BUTTON, className)}>
        <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
        {label}
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Thêm vào kế hoạch"
        description={choices.length > 0 ? "Chọn kế hoạch, hoặc tạo kế hoạch mới." : "Tạo kế hoạch để lưu lựa chọn và mời bạn bè cùng bàn."}
      >
        {choices.length > 0 && (
          <ul className="mb-6 flex flex-col gap-2">
            {choices.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => void addTo(choice)}
                  className="w-full rounded-2xl bg-tint/[0.06] px-4 py-3 text-left text-sm font-semibold text-title ring-1 ring-tint/10 outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {choice.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        <JourneyInfoForm initial={defaultJourneyInfo(destinationName)} askName submitLabel="Tạo kế hoạch" onSubmit={handleCreate} />
      </Modal>
    </>
  )
}
```

- [ ] **Step 2: Thêm nút vào thẻ hoạt động trong `src/components/explorer/place-grid.tsx`**

Thêm import:

```tsx
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { activityServiceId } from "@/lib/journey/ids"
```

Thêm kiểu và prop:

```tsx
/** Có giá trị thì mỗi thẻ có nút "Thêm vào kế hoạch" (chỉ dùng cho hoạt động, không cho loại hình lưu trú). */
type PlanDestination = { slug: string; name: string }
```

Đổi chữ ký `PlaceCard` thành `function PlaceCard({ place, ratio, plan }: { place: Place; ratio: string; plan?: PlanDestination }): React.JSX.Element` và thêm ngay sau dòng `<p className="pt-1 text-xs text-muted-foreground">Phù hợp: …</p>`:

```tsx
        {plan && (
          <AddToPlanButton destinationSlug={plan.slug} destinationName={plan.name} serviceId={activityServiceId(place.name)} className="mt-3 self-start" />
        )}
```

Đổi chữ ký `PlaceGrid` thành:

```tsx
export function PlaceGrid({ items, variant, planDestination }: { items: Place[]; variant: "rail" | "mosaic"; planDestination?: PlanDestination }): React.JSX.Element {
```

và truyền `plan={planDestination}` vào cả hai chỗ render `<PlaceCard … />`.

- [ ] **Step 3: Truyền điểm đến trong `src/components/explorer/play-block.tsx`**

```tsx
      <PlaceGrid items={guide.activities} variant="mosaic" planDestination={{ slug: guide.slug, name: guide.name }} />
```

- [ ] **Step 4: Thêm nút chọn khách sạn trong `src/components/explorer/stay-block.tsx`**

Thêm import `import { AddToPlanButton } from "@/components/journey/add-to-plan-button"` và thay khối cuối:

```tsx
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CtaLink href={guide.links.hotels}>Xem khách sạn {guide.name} tại Vietravel</CtaLink>
        <AddToPlanButton destinationSlug={guide.slug} destinationName={guide.name} pickerKind="hotel" label="Chọn khách sạn cho kế hoạch" className="h-12" />
      </div>
```

- [ ] **Step 5: Thêm nút vào thẻ tour trong `src/components/explorer/tour-list.tsx`**

Thêm import:

```tsx
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { tourServiceId } from "@/lib/journey/ids"
```

Thêm `planDestination?: { slug: string; name: string }` vào `TourListProps`. Đổi `TourItem` thành `function TourItem({ tour, plan }: { tour: Tour; plan?: { slug: string; name: string } })` và chèn ngay sau `<span aria-hidden className="absolute inset-0 -z-10 …" />`:

```tsx
      {plan && (
        <AddToPlanButton
          destinationSlug={plan.slug}
          destinationName={plan.name}
          serviceId={tourServiceId(tour.code)}
          label="Thêm vào kế hoạch"
          className="absolute top-4 left-4 h-9 px-3 text-xs"
        />
      )}
```

Trong `TourList`, nhận `planDestination` và render `<TourItem key={tour.code} tour={tour} plan={planDestination} />`.

- [ ] **Step 6: Truyền `planDestination` ở Home và trang điểm đến**

`src/app/page.tsx`:

```tsx
          <TourList tours={tours} limit={3} hotline={company.hotline} planDestination={{ slug: phuQuoc.slug, name: phuQuoc.name }} />
```

`src/app/diem-den/[slug]/page.tsx`:

```tsx
          <TourList tours={tours} hotline={company.hotline} planDestination={{ slug: guide.slug, name: guide.name }} />
```

- [ ] **Step 7: Type check, lint, chạy lại test dữ liệu**

Run: `pnpm exec tsc --noEmit && pnpm lint && npx tsx src/data/destinations/destinations.test.ts`
Expected: không có lỗi mới; `destinations.test OK`.

- [ ] **Step 8: Kiểm tra tay**

Chạy `pnpm dev --port 3100` ở nền, đăng nhập, xóa localStorage của trang (DevTools → Application → Local Storage → xóa `explorer-journeys`).
1. `/diem-den/phu-quoc`, khối Vui chơi: bấm "Thêm vào kế hoạch" ở "Vinpearl Safari" → hộp thoại tạo kế hoạch hiện đúng giữa màn hình (không lệch dù đang trong khối có hiệu ứng hiện dần), màu đúng theme. Tạo → chuyển sang trang kế hoạch, "Vinpearl Safari" nằm trong "Đang cân nhắc".
2. Quay lại, bấm "Thêm vào kế hoạch" ở một tour → không hỏi lại, toast "Đã thêm vào …" có nút "Xem kế hoạch".
3. Khối Lưu trú: "Chọn khách sạn cho kế hoạch" → mở trang kế hoạch với bảng chọn ở tab Khách sạn.
4. Tạo kế hoạch thứ hai ở `/hanh-trinh`, quay lại bấm nút ở một hoạt động → hộp thoại liệt kê 2 kế hoạch để chọn.
5. Home `/`: thẻ tour có nút "Thêm vào kế hoạch" ở góc trên trái, không đè nhãn giảm giá (góc phải).
6. Đổi theme sáng/tối: hộp thoại và menu ⋯ đọc rõ ở cả hai.
7. 390px: nút trên thẻ tour không tràn, trang không cuộn ngang.

Dừng dev server, xóa `.data/journeys`.

- [ ] **Step 9: Commit**

```bash
git add src/components/journey/add-to-plan-button.tsx src/components/explorer/place-grid.tsx src/components/explorer/play-block.tsx src/components/explorer/stay-block.tsx src/components/explorer/tour-list.tsx src/app/page.tsx "src/app/diem-den/[slug]/page.tsx"
git commit -m "feat: nút Thêm vào kế hoạch trên trang Phú Quốc và Home

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Kiểm tra toàn bộ và cập nhật tài liệu

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: toàn bộ các task trước.
- Produces: tài liệu kiến trúc cập nhật; xác nhận test, type check, lint, build đều qua.

- [ ] **Step 1: Chạy toàn bộ test**

Run:

```bash
for f in src/lib/tour-matching.test.ts src/lib/format.test.ts src/lib/weather.test.ts src/data/destinations/destinations.test.ts src/lib/journey/catalog.test.ts src/lib/journey/cost.test.ts src/lib/journey/operations.test.ts src/lib/journey/store.test.ts src/lib/journey/local.test.ts src/lib/journey/labels.test.ts; do echo "== $f"; npx tsx "$f" || exit 1; done
```

Expected: mỗi file in dòng `… OK` (riêng `tour-matching.test.ts` không in gì nhưng thoát mã 0), không có lỗi.

- [ ] **Step 2: Type check, lint, build**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: không lỗi; lint chỉ còn 3 cảnh báo cũ (`AnchorNav`, `videoB`, `second`); build liệt kê route `/hanh-trinh`, `/hanh-trinh/[token]`, `/api/journeys`, `/api/journeys/by-token/[token]`, `/api/journeys/[id]/ops`.

- [ ] **Step 3: Cập nhật `CLAUDE.md`**

Thêm vào mục `## Architecture`, sau dòng `**Tour data**`:

```markdown
- **Kế hoạch chuyến đi (Journey)**: `/hanh-trinh` (danh sách trong localStorage + tạo mới) và `/hanh-trinh/[token]` (token quyết định quyền sửa/xem). Logic thuần trong [src/lib/journey/](src/lib/journey/): `catalog.ts` (dịch vụ: mock khách sạn/vé bay/thuê xe ở [src/data/services/](src/data/services/) + tour thật; chỗ duy nhất đổi khi có API Hub), `cost.ts`, `operations.ts` (`applyOp` dùng chung server và client để cập nhật lạc quan). Lưu file JSON ở `.data/journeys` qua `JourneyStore` (`store.ts`; hàng đợi ghi chỉ đúng với một tiến trình Node, serverless cần store khác). API ở `src/app/api/journeys/`; client hỏi lại mỗi 3 giây với `?since=<version>` ([src/hooks/use-journey.ts](src/hooks/use-journey.ts)).
```

Thêm `JOURNEY_DATA_DIR` (không bắt buộc) vào dòng Env:

```markdown
Env (`.env.local`, template in `.env.example`): `GEMINI_API_KEY`, `GEMINI_MODEL`, `VIENEU_API_KEY`, `DEMO_PASSWORD`, `JOURNEY_DATA_DIR` (tùy chọn, mặc định `.data/journeys`).
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: ghi kiến trúc tính năng kế hoạch chuyến đi

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
