# Danh sách tính năng — Vietravel Explorer & Tripi

Danh sách xếp theo thứ tự người dùng đi qua. Tổng hợp từ code và lần chạy thử ngày 09/10/2026.

## 0. Đăng nhập (`/login`)

- Nhập mật khẩu demo. Cookie lưu bản băm của `DEMO_PASSWORD`, và [middleware.ts](src/middleware.ts) chặn mọi trang nếu chưa đăng nhập.
- Sau khi đăng nhập, người dùng được đưa về đúng trang đang mở dở (`?from=`).

## 1. Trang chủ (`/`)

- **Hero**: khẩu hiệu Phú Quốc, nút "Khám phá Phú Quốc ngay" và "Tất cả điểm đến".
- **Chọn vibe nhanh**: Chill biển & sunset, Lặn san hô, Quẩy VinWonders, Food tour chợ đêm, Tour hot giá tốt.
- **Thẻ thời tiết tháng hiện tại** ở Phú Quốc: nhiệt độ, mô tả, thời gian bay, mẹo đi, link tới dự báo chi tiết cả năm.
- **Dải xu hướng chạy ngang** (#PhuQuocVibe2026, cano 4 đảo, ưu đãi đặt sớm…).
- **Lưới điểm đến**: Phú Quốc đã mở. Đà Nẵng, Hạ Long, Sa Pa, Bangkok, Nhật, Hàn, Paris đang gắn nhãn "Sắp mở bán".
- **Tìm tour toàn thế giới**: gõ quốc gia hoặc thành phố, có sẵn các gợi ý. Dữ liệu lấy trực tiếp từ travel.com.vn và được lưu đệm 30 phút ([vietravel-search.ts](src/lib/vietravel-search.ts)).
- **AI gợi ý chuyến đi**:
  - Lọc theo 3 tiêu chí: vibe, ngân sách và nơi khởi hành. Có thêm ô "Tâm sự cùng Tripi AI" và các câu tìm nhanh.
  - Kết quả là 6 tour, mỗi tour có % match, mức giảm giá, nút đặt tour và nút "Thêm vào kế hoạch".
- **Check-in triệu view**: ảnh Phú Quốc kèm lượt thích.
- **Tour Phú Quốc ưu đãi**: giá và lịch khởi hành thật.
- **Vì sao chọn Vietravel**: 4 thẻ lợi ích.
- **Chung cho các trang Explorer**: nút chuyển sáng/tối, âm thanh nền, nút nổi "Hỏi Tripi", header và footer.

## 2. Trang điểm đến (`/diem-den/phu-quoc`)

- Hero với chỉ số nhanh (nhiệt độ, đánh giá, thời gian bay), menu neo tới từng mục, 5 trải nghiệm nổi bật.
- **Ảnh và video**: video flycam YouTube, ảnh có ghi công tác giả và giấy phép.
- **Thời tiết trực tiếp** từ Open-Meteo: hiện tại và dự báo 4 ngày. Nếu không lấy được thì hiện bảng khí hậu tĩnh ([weather.ts](src/lib/weather.ts)).
- **Biểu đồ mùa đẹp 12 tháng**, kèm nhận xét "Tháng này đi có hợp không?".
- **Cách di chuyển**: bay hoặc tàu cao tốc từ 6 nơi, phương tiện trên đảo, lưu ý giấy tờ.
- **Khách sạn và resort**: 4 khu vực, lọc theo người đi cùng (gia đình, cặp đôi, bạn bè), có nút thêm khách sạn vào kế hoạch.
- **Ẩm thực**: bí kíp ăn uống, 6 món nên thử kèm nơi ăn, giá và giờ ăn phù hợp.
- **Chơi gì**: 9 điểm, lọc theo người đi cùng, mỗi điểm có nút "Thêm vào kế hoạch".
- **Lịch trình mẫu 3N2Đ**: chia tab theo ngày, mỗi ngày có nút "Lưu ngày vào kế hoạch".
- **Dự toán chi phí tự túc** và **checklist hành trang**.
- **Review**:
  - Hiện điểm trung bình, trộn review soạn sẵn với review khách gửi.
  - Form gửi review gồm số sao, tên, người đi cùng, tháng đi và nội dung tối đa 500 ký tự.
  - Server kiểm tra hợp lệ rồi lưu file JSON ([validate.ts](src/lib/reviews/validate.ts)).
- **Tour Phú Quốc đang mở bán**: 9 tour thật, có nút "Xem tour" và "Thêm vào kế hoạch".
- **FAQ** 6 câu, kèm CTA cuối trang: đặt tour, hỏi Tripi, gọi hotline.

## 3. Kế hoạch chuyến đi (`/hanh-trinh`)

- **Danh sách kế hoạch** lưu trong localStorage, có nút xóa khỏi danh sách.
- **Tạo kế hoạch**: tên chuyến, ngày đi, số đêm (0–14), người lớn (1–20), trẻ em (0–10), tên người tạo.
- **Trang kế hoạch (`/hanh-trinh/[token]`)**:
  - Phân quyền theo link: link sửa (`edit`) hoặc link chỉ xem (`view`). Có hộp mời và form nhập tên để tham gia.
  - Các thao tác: sửa thông tin chuyến; thêm, xóa, chuyển dịch vụ sang ngày khác; đổi số lượng; **bình chọn** và **bình luận** từng dịch vụ.
  - Kho dịch vụ gồm khách sạn, vé bay, thuê xe, hoạt động (dữ liệu mẫu) và tour thật. Có ảnh, ghi công và bộ lọc.
  - Lịch trình chia tab theo từng ngày, bảng chi phí tính tự động.
  - **AI tư vấn kế hoạch**: chọn phong cách chuyến đi rồi nhận gợi ý dịch vụ để thêm vào.
  - Cộng tác gần thời gian thực: trang hỏi lại server mỗi 3 giây và cập nhật ngay trên giao diện trước khi server xác nhận. Nếu lỗi thì quay về bản mới nhất trên server.
- **Nút "Thêm vào kế hoạch"** có ở lịch trình mẫu, khách sạn, điểm chơi, danh sách tour và AI gợi ý chuyến đi.

## 4. Trợ lý ảo Tripi (`/tripi`)

- Màn "Bắt đầu trò chuyện" với 3 cách: nói, gõ chữ, gửi ảnh.
- **Nhân vật 3D** đổi được Robot/Người, lip-sync và đổi biểu cảm. Phông cảnh động theo chủ đề: biển, vịnh, núi, di sản, thế giới.
- Lưới điểm đến để chọn nhanh, câu hỏi gợi ý, hotline.
- **Nhận dạng giọng nói** (Chrome/Edge) hoặc gõ chữ. Ảnh đính kèm được nén trước khi gửi.
- **Chat Gemini**:
  - Lọc tour theo tiêu chí; nếu không nhận ra tiêu chí nào thì tìm theo vibe. Tour đã qua ngày khởi hành bị loại.
  - Câu trả lời rút gọn còn tối đa 3 câu, kèm thẻ tour.
- **Đọc câu trả lời bằng VieNeu TTS**: số tiền được đọc thành chữ, markdown được bỏ đi. Có phụ đề và huy hiệu trạng thái kèm các bước "đang suy nghĩ".

## 5. Công cụ và dữ liệu

- `scripts/scrape-tours.py`: cập nhật `tours.json` từ travel.com.vn.
- Test chạy bằng `node:assert`: tour-matching, reply-text, weather, destinations, journey operations, review validate.

## Kết quả lần chạy thử (09/10/2026)

- ✅ Chạy được: 4 trang, tìm tour thế giới, thời tiết trực tiếp, API review.
- ❌ Chat và giọng nói của Tripi chưa chạy vì `.env.local` đang để trống `GEMINI_API_KEY` và `VIENEU_API_KEY`.
- ⚠️ Cả 6 tour trong AI gợi ý đều hiện "90% Match", có vẻ đang viết cứng.
- ⚠️ Review của "Thu H." chỉ có tên, không có nội dung.
- Chưa tự tay thử: tạo kế hoạch, bình chọn, gửi review, nói chuyện bằng giọng. Các phần này mới được xác nhận qua code.
