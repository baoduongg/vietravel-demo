# Vietravel Explorer demo: trang cảm hứng du lịch, bắt đầu từ Phú Quốc

Ngày: 2026-10-08 · Trạng thái: đã duyệt (08/10)

## Mục tiêu

Đổi demo từ "vào là thấy chat box" sang site truyền cảm hứng du lịch. Mục tiêu kinh doanh: tăng traffic và doanh số cho travel.com.vn bằng cách tạo cảm hứng, cung cấp thông tin điểm đến đủ sâu để khách tin, rồi chuyển khách sang trang booking của Vietravel.

Nguồn yêu cầu: tin nhắn của người dùng và `docs/spec` (biên bản họp 08/10/2026, Decisions, đặc tả Explorer).

Ràng buộc rút từ họp:
- Explorer không xử lý booking. Nút đặt chỉ chuyển sang hệ thống hiện có.
- Chatbot không thuộc phạm vi Explorer. Tripi giữ như tiện ích tách riêng.
- Không làm mạng xã hội. Chưa làm thành viên, đối tác, CMS (giai đoạn sau).
- SEO/AEO/GEO: thuộc giai đoạn sau, bản demo không làm (người dùng xác nhận 08/10).
- Ưu tiên nội dung và từ khóa dịch vụ lẻ, đặc biệt "khách sạn Phú Quốc".

## Phạm vi

Có:
- Home `/`: giới thiệu điểm đến toàn cầu, chỉ Phú Quốc active.
- Chi tiết `/diem-den/phu-quoc`.
- `/tripi`: chat hiện tại, nút nổi "Hỏi Tripi" ở mọi trang Explorer.

Không có: đăng nhập thành viên, lưu/chia sẻ hành trình, đối tác, video, bản đồ tương tác, booking trong app, CMS.

## Routes

| Route | Nội dung |
|---|---|
| `/` | Explorer Home |
| `/diem-den/phu-quoc` | Trang điểm đến |
| `/diem-den/[slug]` khác | `notFound()` (điểm chưa mở) |
| `/tripi` | `AvatarExperience` hiện tại, không đổi logic |

Auth gate ([src/middleware.ts](../../../src/middleware.ts)) giữ nguyên, áp dụng cho mọi route.

## Home

1. Header: logo, menu (Điểm đến, Ưu đãi, Hỏi Tripi), hotline.
2. Hero: ảnh Phú Quốc, tiêu đề truyền cảm hứng, CTA "Khám phá Phú Quốc" tới trang chi tiết.
3. Gợi ý theo mood/mùa (biển, gia đình, cặp đôi, ăn ngon): các chip, mỗi chip trỏ vào anchor tương ứng trên trang Phú Quốc.
4. Lưới điểm đến toàn cầu, khoảng 8 ô: Phú Quốc (active, link), Đà Nẵng, Hạ Long, Sa Pa, Bangkok, Tokyo, Seoul, Paris (mờ, nhãn "Sắp ra mắt", không link).
5. Block "Vì sao đi cùng Vietravel" (từ `company.ts`: thành lập 1995, dịch vụ, thanh toán).
6. Tour Phú Quốc nổi bật (3 tour đầu) + footer (hotline, website).

## Trang chi tiết Phú Quốc

Thanh anchor dính đầu trang. Các block theo thứ tự:

1. **Hero + 5 lý do nên đi.**
2. **Thời tiết**: nhiệt độ, mưa, mã thời tiết hiện tại và dự báo vài ngày (Open-Meteo, server fetch, cache 30 phút) + biểu đồ mùa đẹp theo 12 tháng (dữ liệu tĩnh) + lời khuyên "tháng này đi có hợp không".
3. **Di chuyển**: bay từ HN/SGN/ĐN/CT (thời lượng ước tính), tàu cao tốc từ Rạch Giá/Hà Tiên, di chuyển trên đảo (taxi, xe máy, VinBus, thuê xe). CTA sang trang vé máy bay Vietravel.
4. **Lưu trú theo nhu cầu**: gia đình, cặp đôi, tiết kiệm; khu vực (Dương Đông, Bãi Trường, Bãi Sao, Bắc đảo). CTA "Xem khách sạn Phú Quốc" sang travel.com.vn.
5. **Ăn uống**: món đặc sản, khu ăn, chợ đêm.
6. **Vui chơi**: VinWonders, Safari, cáp treo Hòn Thơm, Sunset Town/Kiss Bridge, lặn ngắm san hô, Grand World... Mỗi mục có "phù hợp với ai".
7. **Lịch trình gợi ý 3N2Đ**: timeline theo ngày.
8. **Chi phí ước tính + checklist mang theo.**
9. **Review người đã đi**: 4-6 thẻ, gắn nhãn "Review mẫu cho bản demo".
10. **Tour Phú Quốc thật** (từ `tours.json`, lọc theo tên/vùng): ảnh, giá, ngày đi, link tour trên travel.com.vn.
11. **FAQ** + CTA cuối trang (tour, hotline).

Điểm tạo cảm hứng thêm: "phù hợp với ai" (gia đình/cặp đôi/bạn bè) ở block 4 và 6; lời khuyên theo tháng ở block 2.

## Dữ liệu

- `src/data/destinations/phu-quoc.ts`: một object kiểu `DestinationGuide` (type ở `src/types/destination.ts`) chứa toàn bộ nội dung các block.
- `src/data/destinations/index.ts`: danh sách điểm đến, mỗi mục `{ slug, name, caption, imageUrl, active }`. Thêm điểm khác sau này = thêm file + một mục.
- Tour: tái dùng `getUpcomingTours()` ([src/data/tours.ts](../../../src/data/tours.ts)), lọc Phú Quốc.
- Ảnh: `imageUrl` của tour Phú Quốc (S3 Vietravel). Dự phòng: scene SVG sẵn có (`scenes/beach-scene.tsx`).
- Link đặt chỗ: tour dùng `tour.url`; khách sạn, vé máy bay trỏ trang tìm kiếm tương ứng trên travel.com.vn (URL đặt ở một hằng số, dễ đổi).
- Giá/chi phí/thời lượng bay là **ước tính tham khảo**, ghi rõ trên UI. Không mô phỏng giá realtime.
- Review là dữ liệu mẫu, tên ẩn danh/nickname, không ảnh người thật, nhãn rõ trên UI.

## Thời tiết

`src/lib/weather.ts`:
- `fetchPhuQuocWeather()` gọi Open-Meteo (toạ độ ~10.22, 103.96; `next: { revalidate: 1800 }`, timeout ngắn).
- `parseWeather(json)` thuần, trả về `{ tempC, code, forecast[] }`.
- Lỗi/timeout: trả `null`, UI hiện bảng khí hậu tĩnh theo tháng (không vỡ trang).

## SEO

Bản demo, không tối ưu SEO. Chỉ đặt `title`/`description` cơ bản trong `layout.tsx` và `metadata` của trang Phú Quốc. Không JSON-LD, không sitemap. Server component vẫn là mặc định vì đơn giản, không phải vì SEO.

## Cấu trúc file

Mới:
- `src/app/page.tsx` (sửa: render Home), `src/app/tripi/page.tsx`, `src/app/diem-den/[slug]/page.tsx`
- `src/components/explorer/`: `explorer-header`, `home-hero`, `destination-grid`, `destination-hero`, `weather-block`, `season-chart`, `getting-there`, `stay-block`, `eat-block`, `play-block`, `itinerary`, `cost-checklist`, `reviews`, `tour-list`, `faq`, `tripi-fab`, `anchor-nav`
- `src/data/destinations/*`, `src/types/destination.ts`, `src/lib/weather.ts`
- Component `audience-tabs` là client component duy nhất cần state (lọc theo "đi với ai") và `anchor-nav` (highlight mục đang xem). Phần còn lại là server component.

Sửa: `src/app/layout.tsx` (metadata chung). Không đụng `components/avatar/*`, API chat/TTS.

## Kiểm thử

Test `node:assert` chạy bằng `npx tsx` (theo mẫu `tour-matching.test.ts`):
- `parseWeather` với mẫu JSON Open-Meteo và JSON thiếu trường.
- Mọi mã tour tham chiếu trong data có trong `tours.json`; mọi link đặt chỗ thuộc `travel.com.vn`.
- Mọi điểm đến `active` có file nội dung.

Kiểm tra cuối: `pnpm lint`, `pnpm build`, mở trình duyệt xem `/`, `/diem-den/phu-quoc`, `/tripi` ở desktop và mobile.

## Rủi ro / giả định

- Ảnh hotlink S3 Vietravel có thể đổi/chặn; có dự phòng scene SVG.
- Nội dung điểm đến soạn tay từ kiến thức chung, cần nhân viên Vietravel kiểm duyệt trước khi dùng thật (đúng quy trình họp: AI tạo, người duyệt).
- Tên cơ sở lưu trú/vui chơi chỉ nhắc ở mức thông tin chung, không cam kết giá hay tình trạng chỗ.
