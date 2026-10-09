# Trang dịch vụ theo loại tại điểm đến — Thiết kế

Ngày: 2026-10-09 · Nhánh: `feat/explorer-phu-quoc`

## Mục tiêu

Mỗi điểm đến có một trang tổng hợp cho từng loại dịch vụ, ví dụ `/diem-den/phu-quoc/ve-may-bay`. Trang phục vụ cùng lúc ba nhu cầu:

- **A. So sánh và chọn**: xem hết các lựa chọn, lọc, sắp xếp, thêm thẳng vào kế hoạch (`/hanh-trinh`).
- **B. Cẩm nang**: nội dung tham khảo (giá tham khảo, FAQ) đọc được và tốt cho SEO.
- **C. Tôn đối tác**: dịch vụ của đối tác đã duyệt hiện trong danh sách, có nhãn "Đối tác".

Phần này (phần 1) làm A, B và phần C ở mức hiện trong danh sách. Trang công khai riêng cho từng đối tác là **phần 2**, có spec riêng.

## Phạm vi

Có làm:
- Route `/diem-den/[slug]/[kind]` cho 7 loại dịch vụ.
- Nội dung cẩm nang theo loại, viết tay cho Phú Quốc.
- Danh sách có tìm kiếm, sắp xếp theo giá, chip lọc tự sinh.
- Nối link từ trang `/diem-den/[slug]`.

Không làm (YAGNI):
- Bộ lọc riêng cho từng loại (điểm đi, ngày, số khách…).
- Trang chi tiết từng dịch vụ, phân trang (mỗi loại khoảng 4–20 mục).
- Nội dung sinh bằng AI.
- Trang công khai cho đối tác (phần 2).

## 1. Route và cách render

- File: `src/app/diem-den/[slug]/[kind]/page.tsx`, là server component.
- `[kind]` là slug tiếng Việt, ánh xạ hai chiều với `ServiceKind`:

  | slug | ServiceKind |
  |---|---|
  | `khach-san` | `hotel` |
  | `ve-may-bay` | `flight` |
  | `thue-xe` | `vehicle` |
  | `vui-choi` | `activity` |
  | `an-uong` | `dining` |
  | `dac-san` | `souvenir` |
  | `tour` | `tour` |

- Cách render: `revalidate = 1800` (giống trang điểm đến). Khi dùng Redis, store đối tác đọc bằng fetch `no-store` nên trang (cả trang điểm đến) render động mỗi request; `destinationServices` gọi `unstable_rethrow` để không nuốt tín hiệu này. `generateStaticParams` sinh mọi cặp (điểm đến đang mở × 7 loại). Slug điểm đến hoặc slug loại không hợp lệ thì trả `notFound()`.
- Dữ liệu: `getServices(slug, kind)` nối với `getPartnerServices(slug, guide.links.tours)` rồi lọc theo `kind`, cùng cách trang `/hanh-trinh/[token]` đang gộp. Lỗi đọc store đối tác không được làm hỏng trang: bắt lỗi và hiện danh sách không có đối tác.
- Loại có 0 dịch vụ vẫn render trang (cẩm nang vẫn có ích) và hiện thông báo "Hiện chưa có dịch vụ loại này".
- `generateMetadata`: title `"{Nhãn loại} {Tên điểm đến} · Vietravel Explorer"`. Description lấy `serviceGuides[kind].intro`, nếu không có thì dùng `guide.intro`.

## 2. Bố cục trang

Bọc trong `ExplorerShell`, cùng khung `max-w-6xl` với trang điểm đến.

1. **Breadcrumb**: `{Tên điểm đến}` (link `/diem-den/[slug]`) › `{Nhãn loại}`.
2. **Tab loại**: hàng link sang 7 loại, loại đang xem được tô sáng. Ẩn loại có 0 dịch vụ, trừ loại đang xem.
3. **Hero ngắn**: tiêu đề `"{Nhãn loại} tại {Tên điểm đến}"`, intro, và 3 số tự tính:
   - số lựa chọn;
   - "Giá từ" = giá thấp nhất có `priceVnd > 0`, kèm `PRICE_UNIT_LABEL` của mục đó;
   - khoảng giá thấp nhất–cao nhất, chỉ hiện khi hai đầu khác giá và cùng đơn vị giá.

   Nếu không có giá nào > 0 thì bỏ hai số về giá.
4. **Danh sách** (`ServiceListing`, client component): xem mục 4. Đặt ngay sau hero để khách so sánh và chọn nhanh.
5. **Cẩm nang**:
   - khối guide có sẵn: `flight` → `GettingThere`, `hotel` → `StayBlock`, `dining` → `EatBlock`, `activity` → `PlayBlock`; các loại khác không có khối.
6. **FAQ theo loại**: dùng lại `Faq`, thêm prop tùy chọn `faqs` và `title`; không truyền thì giữ nguyên hành vi cũ (`guide.faqs`). Ẩn khối khi loại không có FAQ.
7. **CTA cuối**: "Lên kế hoạch {Tên điểm đến}" dẫn tới `/hanh-trinh`.

## 3. Dữ liệu mới

Thêm vào `DestinationGuide` (`src/types/destination.ts`):

```ts
export interface ServiceGuide {
  intro: string
  faqs: Faq[]
}

// trong DestinationGuide
serviceGuides?: Partial<Record<ServiceKind, ServiceGuide>>
```

- Viết nội dung cho đủ 7 loại của Phú Quốc trong `src/data/destinations/phu-quoc.ts`: intro 1–2 câu, 2–4 câu FAQ. Mọi văn bản đều bằng tiếng Việt, xưng "Quý khách".
- Mỗi loại thiếu `serviceGuides` thì trang vẫn chạy: không có intro riêng, không có FAQ.

## 4. Logic danh sách — `src/lib/service-listing.ts`

Các hàm thuần, dùng chung cho server và client:

- `KIND_SLUG: Record<ServiceKind, string>`, `kindFromSlug(slug): ServiceKind | undefined`.
- `priceStats(services): { count: number; min?: ServiceItem; max?: ServiceItem }`, chỉ xét mục có `priceVnd > 0`.
- `isPartnerService(service): boolean`: id có tiền tố của `partnerServiceId`.
- `chipOf(service): string | undefined`: tách `tag` theo `" · "`. Mục khác lấy đoạn thứ nhất. Đối tác lấy đoạn áp chót (phân khúc) khi tag có ít nhất 3 đoạn; thiếu phân khúc (đối tác không phải khách sạn) thì không ra chip.
- `chipsOf(services): string[]`: các chip khác nhau theo thứ tự xuất hiện. Trả `[]` nếu có ít hơn 2 chip, tức là ẩn hàng chip.
- `filterAndSort(services, { query, chip, partnerOnly, sort })`:
  - `query` dùng lại `matchesQuery` của `service-catalog-panel`;
  - `sort` là `"default" | "price-asc" | "price-desc"`, mục có giá 0 luôn xếp cuối.

`ServiceListing` (client, `src/components/explorer/service-listing.tsx`):
- `ServiceSearch` + select sắp xếp + chip (gồm "Tất cả", các chip, và "Đối tác" khi có dịch vụ đối tác).
- Lưới thẻ tương tự `ServiceCard` có ảnh, nhưng nút là `AddToPlanButton` với `serviceId`. Mục đối tác có badge "Đối tác". Mục `mock` giữ nhãn "Giá tham khảo (demo)".
- Không có kết quả: "Không tìm thấy dịch vụ phù hợp." kèm nút xóa bộ lọc.

## 5. Nối vào trang hiện có

- Trên `/diem-den/[slug]`, ngay sau `MediaBlock`, thêm khối "Dịch vụ tại {Tên điểm đến}" (`ServiceHub`, server). Khối có 7 ô link, mỗi ô ghi nhãn, số lựa chọn và "từ {giá}". Ẩn ô có 0 dịch vụ.
- Thêm link "Xem tất cả →" vào `GettingThere`, `StayBlock`, `EatBlock`, `PlayBlock`. Các khối này nhận prop tùy chọn `moreHref`, không truyền thì không hiện link, để tránh link tự trỏ về chính trang loại.

## 6. Kiểm thử

- `src/lib/service-listing.test.ts` (`node:assert`, chạy `npx tsx`) cần kiểm:
  - ánh xạ slug hai chiều đủ 7 loại;
  - `kindFromSlug("abc")` trả `undefined`;
  - `priceStats` bỏ giá 0;
  - `chipOf` với tag mock và tag đối tác;
  - `chipsOf` trả `[]` khi chỉ có 1 chip;
  - `filterAndSort` theo chip, `partnerOnly`, giá tăng/giảm với giá 0 xếp cuối.
- `destinations.test.ts`: mỗi `serviceGuides[kind]` của Phú Quốc có intro không rỗng và 2–4 FAQ.
- Thủ công: `pnpm build` (sinh đủ trang tĩnh), mở `/diem-den/phu-quoc/ve-may-bay` và `/khach-san`, thử lọc/sắp xếp/thêm vào kế hoạch. Thử `/diem-den/phu-quoc/xyz` ra 404. Duyệt một đối tác nhà hàng rồi kiểm nó hiện ở `/an-uong` với badge.

## Rủi ro

- `revalidate = 1800`: đối tác vừa duyệt có thể mất tới 30 phút mới hiện trên trang loại. Chấp nhận được cho demo. Nếu cần hiện ngay thì chuyển sang `dynamic` hoặc `revalidatePath` khi `PATCH` trạng thái.
- Chip dựa vào quy ước viết `tag`. Dữ liệu mock mới nên giữ dạng "Phân khúc · Khu vực".
