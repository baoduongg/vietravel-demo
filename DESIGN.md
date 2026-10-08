# DESIGN SYSTEM SPECIFICATION: PHU QUOC VIBE
**Version:** 1.2.0  
**Concept:** Editorial Dark Luxury, Storytelling Travel & Curated Hospitality[cite: 3, 5]  
**Target:** Web Desktop & Mobile Responsive  

---

## 1. Triết lý Thiết kế (Design Philosophy)

* **Story First, Commerce Second:** Biến hành trình đặt tour thành một trải nghiệm thưởng lãm tạp chí nghệ thuật[cite: 5]. Khơi gợi cảm xúc trước, bán dịch vụ sau một cách tự nhiên và tinh tế[cite: 5].
* **Quiet Luxury & Healing Vibe:** Tránh xa các yếu tố quảng cáo giật gân, flash sale hay pop-up đếm ngược xô bồ. Không gian giao diện tập trung vào sự tĩnh lặng, sâu lắng của biển đêm và ánh hoàng hôn ấm áp[cite: 3, 5].
* **Tactile & Analog Metaphors:** Kết hợp các yếu tố tương tác kỹ thuật số hiện đại với cảm giác hoài niệm vật lý (album ảnh kẹp giấy, nhật ký du ký vẽ tay, postcard lưu niệm)[cite: 5].

---

## 2. Hệ Thống Màu Sắc (Color Palette)

### 2.1. Nền & Cấu trúc (Dark Canvas)
* `--color-bg-base`: `#080E14` (Đen xanh đại dương tầng sâu - Dark Void)
* `--color-bg-surface`: `#0D1620` (Xanh hải quân đêm dùng cho các khối section)[cite: 5]
* `--color-surface-card`: `rgba(18, 29, 43, 0.65)` (Kính mờ xanh khói tối)[cite: 5]
* `--color-border-subtle`: `rgba(255, 255, 255, 0.08)` (Viền hairline mảnh 1px phân tách các khối)

### 2.2. Màu Điểm Nhấn & Cảm Xúc (Sunset Accent)
* `--color-sunset-orange`: `#E26D38` (Cam rực rỡ mặt trời lặn - Primary CTA)[cite: 5]
* `--color-sunset-glow`: `#F39C12` (Vàng hoàng hôn dùng cho dải gradient hover)[cite: 5]
* `--color-golden-sand`: `#D4A373` (Vàng cát mịn màng cho các chi tiết nhãn và icon phụ)[cite: 5]
* `--color-deep-cyan`: `#1E6B8C` (Xanh ngọc biển Nam đảo dùng cho điểm nhấn lặn biển/thiên nhiên)[cite: 5]

### 2.3. Hệ Thống Màu Chữ (Typography Contrast)
* `--color-text-title`: `#FFFFFF` / `#F8F9FA` (Trắng tinh khiết với độ tương phản cao nhất)[cite: 5]
* `--color-text-editorial`: `#F4D3A1` (Màu vàng champagne dành cho tiêu đề thơ ca H1/H2)[cite: 5]
* `--color-text-body`: `#CBD5E1` (Xám tro ngả bạc, giảm mỏi mắt khi đọc dài trên nền tối)
* `--color-text-muted`: `#64748B` (Xám mờ dành cho metadata, footer, số thứ tự index)[cite: 5]

---

## 3. Hệ Thống Kiểu Chữ (Typography Scale)

* **Display / Headline Font:** `Playfair Display`, `Cormorant Garamond` hoặc `Cinzel` (Serif cổ điển, nét thanh nét đậm chuẩn ấn phẩm cao cấp)[cite: 3, 5]
* **Body / Functional UI Font:** `Plus Jakarta Sans`, `Inter` hoặc `Be Vietnam Pro` (Sans-serif hiện đại, tối ưu độ hiển thị đa ngôn ngữ tiếng Việt)[cite: 5]

### Bảng phân cấp Typography (Desktop Scale)
| Cấp bậc | Font Family | Size | Weight | Line Height | Letter Spacing | Ứng dụng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | Serif | 56px - 64px | 400 Regular | 1.15 | -0.02em | Hero headline ("Khi sóng biển...")[cite: 5] |
| **Headline H2** | Serif | 32px - 38px | 500 Medium | 1.25 | -0.01em | Tiêu đề các khối lớn[cite: 5] |
| **Section H3** | Serif | 22px - 26px | 600 SemiBold | 1.35 | 0em | Tên tour, tên gói dịch vụ[cite: 5] |
| **Body Large** | Sans | 16px - 18px | 300 Light | 1.65 | 0em | Đoạn mở đầu gợi cảm xúc[cite: 5] |
| **Body Regular**| Sans | 14px - 15px | 400 Regular | 1.6 | 0em | Mô tả chi tiết, nội dung thẻ[cite: 5] |
| **Tag & Overline**| Sans | 11px - 12px | 600 Bold | 1.4 | +0.12em | Nhãn phân loại in hoa (`NARRATIVE TIMELINE`)[cite: 5] |
| **Price Display**| Sans | 20px - 24px | 700 Bold | 1.2 | -0.01em | Giá tiền tour đặc trưng[cite: 5] |

---

## 4. Bố Cục & Cấu Trúc Khối (Section Breakdown)

### 4.1. Header & Navigation (Thanh điều hướng)
* **Visual:** Header trong suốt cố định (Sticky Header) với hiệu ứng làm mờ nền khi cuộn (`backdrop-filter: blur(20px)`).
* **Trái:** Logo chữ mảnh dạng Signature: *Phú Quốc Vibe*[cite: 5].
* **Giữa:** Thanh điều hướng mỏng: `Cảm hứng` • `Sản phẩm` • `Dịch vụ riêng` • `Nhật ký hành trình` • `Về chúng tôi`[cite: 5].
* **Phải:** Nút bo tròn viền gradient hoặc cam hoàng hôn: *"Bắt đầu hành trình"*[cite: 5].

### 4.2. Hero Section (Visual Empathy)
* **Khung cảnh:** Hình ảnh góc rộng bờ biển lúc hoàng hôn buông xuống, ánh mặt trời cam phản chiếu trên mặt nước tĩnh lặng[cite: 5].
* **Xử lý nền:** Gradient overlay từ trong suốt ở giữa chuyển dần sang đen xanh đại dương `#080E14` ở chân ảnh để kết nối mượt với section tiếp theo[cite: 5].
* **Trải nghiệm tương tác giác quan (Sensory Micro-interaction):** Nút tròn viền kính mảnh: *"Chạm để nghe tiếng sóng"* kèm biểu tượng phát âm thanh nhẹ nhàng[cite: 5].

### 4.3. Bento Grid: Gói Dịch Vụ Độc Bản (Our Core Offerings)
Bố cục lưới 3 cột hiển thị năng lực cốt lõi của công ty du lịch[cite: 5]:
1. **Thẻ 01 - Boutique Private Tour:** Ảnh cano riêng rẽ sóng qua các rạn san hô hoang sơ[cite: 5]. Chú thích: Tour riêng biệt, lịch trình cá nhân hóa theo nhịp sinh học[cite: 5].
2. **Thẻ 02 - Healing & Retreat Stays:** Ảnh hoàng hôn tĩnh lặng nhìn từ resort ven biển[cite: 5]. Chú thích: Nghỉ dưỡng riêng tư, thiền định, yoga và ẩm thực thực dưỡng[cite: 5].
3. **Thẻ 03 - Bespoke Experiences:** Ảnh bàn tiệc tối lãng mạn với ánh nến trên bờ cát[cite: 5]. Chú thích: Bữa tối riêng với đầu bếp, chụp ảnh/flycam ghi lại kỷ niệm[cite: 5].
* **Chi tiết thẩm mỹ:** Mỗi thẻ được đánh số thứ tự lớn mờ (`01`, `02`, `03`) tạo phong cách trưng bày nghệ thuật[cite: 5].

### 4.4. Tour Showcase Cards (Sản Phẩm Tour Đặc Trưng)
* **Bố cục:** Carousel ngang hoặc lưới thẻ tỷ lệ dọc 4:5[cite: 5].
* **Card Spec:**
  * Ảnh bao phủ phần lớn diện tích thẻ với góc bo `18px`[cite: 5].
  * Tên tour in hoa thanh lịch: ví dụ *HÀNH TRÌNH CHỮA LÀNH 3N2Đ*, *KHÁM PHÁ NAM ĐẢO 4N3Đ*[cite: 5].
  * Dòng giá hiển thị dạng: `Giá từ X.XXX.000đ / Khách`[cite: 5].
  * Badge tóm tắt tiện ích: `🕒 3N2Đ` • `⭐ 4.9` • `🏷️ Private / Group`[cite: 5].
  * Nút hành động phụ dạng kính: *"Khám phá chi tiết"*[cite: 5].

### 4.5. Narrative Timeline: Cuốn Sổ Du Ký 3 Chương (Story Scrapbook)
* **Ý tưởng:** Thay thế danh sách ngày 1, 2, 3 khô khan bằng hình tượng một cuốn sổ nhật ký mở phẳng[cite: 5].
* **Chi tiết hiển thị:**
  * Khung giấy ngả màu be tự nhiên (`#F5EFEB`), tạo bóng đổ nhẹ mô phỏng bề mặt sổ[cite: 5].
  * 3 bức ảnh Polaroid gắn kèm hiệu ứng băng dính trong mờ (Washi Tape) ở mép trên[cite: 5]:
    * *Chương 01: Đón gió đảo ngọc* - Hoàng hôn Bãi Ông Lang[cite: 5].
    * *Chương 02: Đi tìm biển xanh và cát ấm* - Cano lướt qua những hòn đảo hoang[cite: 5].
    * *Chương 03: Đêm bình yên giữa đại dương* - Ăn tối ngắm sao và câu mực cùng ngư dân[cite: 5].
  * Nét vẽ tay cong uốn lượn (Doodle arrow path) nối giữa các bức ảnh thể hiện dòng chảy thời gian[cite: 5].

---

## 5. Quy Chuẩn Kính Mờ & Đổ Bóng (Glassmorphism & Elevation)

```css
/* Card Kính Mờ Chuẩn (Standard Glass Card) */
.glass-card {
  background: rgba(18, 29, 43, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Nút Bấm Chính Hoàng Hôn (Sunset Glow CTA) */
.btn-sunset-primary {
  background: linear-gradient(135deg, #E26D38 0%, #F39C12 100%);
  color: #FFFFFF;
  border-radius: 9999px;
  box-shadow: 0 4px 20px rgba(226, 109, 56, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-sunset-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(226, 109, 56, 0.55);
}