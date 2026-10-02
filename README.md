# Tripi: Trợ lý du lịch AI cho Vietravel

Bản demo trợ lý du lịch nói tiếng Việt: linh vật Tripi 3D trả lời bằng giọng nói, gợi ý tour thật từ travel.com.vn kèm thẻ tour, giá, ngày khởi hành và ưu đãi giờ chót.

Tài liệu giới thiệu sản phẩm: [docs/gioi-thieu-san-pham.md](docs/gioi-thieu-san-pham.md) (bản trình bày: `docs/gioi-thieu-san-pham.pdf`).

## Chạy thử

Cần Node.js 20+, pnpm và Python 3.

```bash
pnpm install
cp .env.example .env.local   # rồi điền khóa
pnpm dev
```

Mở http://localhost:3000 bằng Chrome hoặc Edge, bật loa rồi bấm “Trò chuyện với Tripi”.

| Biến môi trường | Ý nghĩa |
| --- | --- |
| `ANTHROPIC_API_KEY` | Khóa Claude cho phần hội thoại |
| `ANTHROPIC_MODEL` | Model Claude, mặc định `claude-opus-5-5` |
| `SAYDI_API_KEY` | Khóa Saydi TTS cho giọng nói tiếng Việt |

## Chọn nhân vật

`avatarModel` trong `src/config/company.ts`:

| Giá trị | Nhân vật |
| --- | --- |
| `"mascot"` | Tripi từ file `public/avatars/vietravel-robot.glb` (mặc định) |
| `"mascot-procedural"` | Tripi dựng bằng code, không cần file 3D |
| `"human"` | Avatar người 3D (`public/avatars/brunette.glb`, dùng TalkingHead) |

Thay file Tripi bằng bản mới: chép đè `vietravel-robot.glb`. File cần giữ các phần tên `torso`, `head`, `arm-l`, `arm-r`, `mitten-l`, `mitten-r` và màn hình `face-display` có UV phẳng; tay phải trong file ở tư thế vẫy.

## Cập nhật dữ liệu tour

```bash
python3 scripts/scrape-tours.py
```

Script đọc khoảng 20 trang danh mục trên travel.com.vn và ghi vào `src/data/tours.json`. Chạy lại trước mỗi buổi demo để có giá và lịch mới nhất. Tour đã qua ngày khởi hành tự bị ẩn khi trò chuyện.

## Cấu trúc chính

| Đường dẫn | Nội dung |
| --- | --- |
| `src/config/company.ts` | Thương hiệu, nhân vật Tripi, giọng nói, dịch vụ, ưu đãi, FAQ, câu hỏi nhanh, loại avatar (`avatarModel`) |
| `public/avatars/vietravel-robot.glb` | Model 3D của Tripi |
| `src/lib/system-prompt.ts` | Prompt cho Claude: thông tin công ty, danh sách tour, quy tắc tư vấn |
| `src/app/api/avatar/chat/route.ts` | API hội thoại: gọi Claude, tách mã tour thành thẻ tour, làm sạch câu trả lời để đọc |
| `src/app/api/avatar/tts/route.ts` | API giọng nói: gọi Saydi, đọc số tiền thành chữ |
| `src/lib/mascot/tripi-glb.ts` | Tải model 3D, phủ mặt LED lên màn hình `face-display`, quy đổi tư thế cho model |
| `src/lib/mascot/tripi-face.ts` | Vẽ mặt LED: mắt, lông mày, miệng, vạch má; bố cục riêng cho từng model |
| `src/lib/mascot/tripi-model.ts` | Tripi dựng bằng code, dự phòng khi không có file 3D |
| `src/lib/mascot-engine.ts` | Chuyển động của Tripi: chớp mắt, vẫy tay, nháy mắt, miệng theo giọng nói |
| `src/lib/avatar-engine.ts` | Avatar người 3D (TalkingHead), dùng khi `avatarModel: "human"` |
| `src/components/avatar/` | Giao diện: thanh trên cùng, khung Tripi, câu hỏi nhanh, thẻ tour, khung chat |
| `scripts/scrape-tours.py` | Lấy dữ liệu tour từ travel.com.vn |

## Lệnh khác

```bash
pnpm lint     # ESLint
pnpm build    # build bản production
```
