# DESIGN SYSTEM SPECIFICATION: PHU QUOC VIBE
**Version:** 1.3.0  
**Concept:** Editorial Dark Luxury, Storytelling Travel & Curated Hospitality[cite: 3, 5]  
**Target:** Web Desktop & Mobile Responsive  

---

## 1. Triết lý Thiết kế (Design Philosophy)

* **Story First, Commerce Second:** Biến hành trình đặt tour thành một trải nghiệm thưởng lãm tạp chí nghệ thuật[cite: 5]. Khơi gợi cảm xúc trước, bán dịch vụ sau một cách tự nhiên và tinh tế[cite: 5].
* **Quiet Luxury & Healing Vibe:** Tránh xa các yếu tố quảng cáo giật gân, flash sale hay pop-up đếm ngược xô bồ. Không gian giao diện tập trung vào sự tĩnh lặng, sâu lắng của biển đêm và ánh hoàng hôn ấm áp[cite: 3, 5].
* **Tactile & Analog Metaphors:** Kết hợp các yếu tố tương tác kỹ thuật số hiện đại với cảm giác hoài niệm vật lý (album ảnh kẹp giấy, nhật ký du ký vẽ tay, postcard lưu niệm)[cite: 5].

---

## 2. Hệ Thống Màu Sắc (Color Palette)

Giao diện có hai theme (tối mặc định, sáng qua nút đổi theme, lưu `data-theme` trên `<html>`). Mọi màu khai báo một lần trong [src/app/globals.css](src/app/globals.css); component dùng token, không viết mã màu cứng.

### 2.1. Màu Chủ Đạo (Primary — Vietravel Blue)
* `--ocean` / `--primary`: `#0046C1` (Xanh Vietravel — màu thương hiệu, nút CTA chính, chip/tab đang chọn, nút khi rê chuột)
* `--primary-foreground`: `#FFFFFF`
* Gradient nút chính `.btn-primary`: `linear-gradient(135deg, #0046C1 0%, #1A66E0 50%, #0046C1 100%)`, bóng `rgba(0, 70, 193, 0.5)`
* Nút xanh biển `.btn-ocean`: `linear-gradient(135deg, #0046C1 0%, #00A3CC 100%)`
* `--c-primary-ink` / `primary-ink` (chữ, icon, nền mờ, viền theo primary): `#0046C1` ở theme sáng, `#6BA4FF` ở theme tối và trong khối `.on-dark` (cùng sắc độ, sáng hơn để đủ tương phản)
* `--c-champagne`: màu tương tác (tab đang chọn, chữ khi rê chuột), cùng giá trị với `primary-ink`
* `--ring` (viền focus): `#0046C1` trên trang thường, `#3B7BFF` trong khu Explorer (thấy rõ trên cả nền tối và sáng)
* Thanh tiến trình cuộn: `#0046C1 → #1A66E0 → #00C8FF`
* Chữ nhấn trong tiêu đề `.text-gradient-brand`: sáng `#071426 → #0046C1 → #1A66E0`; tối `#FFFFFF → #8AB8FF → #3B7BFF` (trong khối `.on-dark` luôn dùng bản tối)

### 2.2. Màu Nhấn Phụ (Sunset Accent)
Cam hoàng hôn không còn là màu chính. Chỉ dùng cho: giá tour và tổng chi phí, badge giảm giá/"Hot" (`from-orange-500 to-rose-500`), khối khuyến mãi giá, biểu đồ mùa (cam = tháng đẹp), chip buổi trong ngày, sao đánh giá và icon mặt trời (amber), ánh hoàng hôn trên ảnh hero, băng dính washi.
* `--sunset` / `--coral` / `accent-coral`: `#FF5E36` (Cam hoàng hôn)
* `--coral-ink`: `#C83D16` (Cam đậm cho chữ nhỏ trên nền sáng)
* `accent-sun` / `glow`: `#FFA114` (Vàng hoàng hôn)
* `accent-cyan`: `#00C8FF`, `cyan-deep`: `#1E6B8C` (Xanh ngọc biển — lặn biển, thiên nhiên, độ ẩm/mưa)
* `accent-mint`: `#00D284` (Trạng thái tốt: "Lý tưởng", "Match")
* `--sale`: `#FF334B` (Giảm giá)

### 2.3. Nền & Bề Mặt (theo theme)
| Token | Theme tối | Theme sáng | Ứng dụng |
| :--- | :--- | :--- | :--- |
| `--c-void` / `--c-page` | `#070D14` | `#FAF8F5` | Nền trang |
| `night` | `#0B1522` | — | Khối nền tối cố định |
| `shade` | `#070D14` | `#070D14` | Lớp phủ tối trên ảnh |
| `--c-card` | `rgba(13, 23, 36, 0.72)` | `rgba(255, 255, 255, 0.86)` | Thẻ kính mờ `.glass-card` |
| `--c-card-shadow` | `0 20px 40px -15px rgba(0,0,0,.65)` | `0 20px 40px -18px rgba(0,80,200,.14)` | Đổ bóng thẻ |
| Viền | `--c-tint` 10% | `--c-tint` 10% | Viền hairline 1px |

### 2.4. Màu Chữ (theo theme)
| Token | Theme tối | Theme sáng | Ứng dụng |
| :--- | :--- | :--- | :--- |
| `--c-title` | `#FFFFFF` | `#071426` | Tiêu đề, chữ nhấn |
| `--c-body` | `#D1DBE6` | `#334155` | Đoạn văn |
| `--c-mute` / `muted-foreground` | `#8292A4` / `#94A3B8` | `#64748B` | Metadata, chú thích |
| `--c-champagne` | `#6BA4FF` | `#0046C1` | Tab đang chọn, chữ khi rê chuột |
| `--c-gold` | `#FFA114` | `#C2410C` | Giá tiền, tổng chi phí |
| `--c-tint` | `#FFFFFF` | `#071426` | Màu gốc cho viền/nền mờ (`tint/5`, `tint/10`…) |

### 2.5. Quy Tắc Dùng Màu
* **Nút hành động chính** (Đặt tour, Khám phá, Hỏi Tripi, Bắt đầu lên kế hoạch) luôn là `.btn-primary` xanh `#0046C1`. Mỗi khối chỉ một nút primary; nút phụ dùng `.btn-glass`.
* **Chip/tab đang chọn**: `bg-primary text-white ring-primary`. Nút phụ khi rê chuột: `hover:bg-primary hover:text-white`.
* **Nhãn section, icon chức năng, link, viền khi rê chuột, ô icon**: `text-primary-ink`, `bg-primary-ink/10–15`, `ring-primary-ink/30`, `border-primary-ink/40`. Không dùng `orange-*` cho các vai trò này.
* **Màu bôi đen chữ** (`::selection`) và viền hover của `.glass-card`/`.double-bezel`: primary.
* **Màu báo lỗi/xoá**: `text-coral`.
* **Khối nằm trên ảnh hoặc nền tối cố định** gắn class `.on-dark`: giữ bảng màu theme tối dù trang đang ở theme sáng.
* **Theme sáng**: các màu chữ `orange/cyan-300/400`, `emerald-400`, `rose-400` tự đổi sang tông đậm (`--coral-ink`, cyan-700…) để đạt tương phản; không cần thêm class riêng. Với chữ nhỏ cần ghi đè thủ công, dùng biến thể `light:` (ví dụ `light:text-coral-ink`).
* Không dùng biến thể `dark:` của Tailwind: nó theo cài đặt hệ điều hành, không theo nút đổi theme.

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
* **Phải:** Nút bo tròn màu primary xanh Vietravel `#0046C1`: *"Bắt đầu hành trình"*[cite: 5].

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
  background: var(--c-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid color-mix(in srgb, var(--c-tint) 10%, transparent);
  border-radius: 24px;
  box-shadow: var(--c-card-shadow), inset 0 1px 1px rgba(255, 255, 255, 0.12);
}

/* Nút Bấm Chính (Primary CTA — Vietravel Blue) */
.btn-primary {
  background: linear-gradient(135deg, #0046C1 0%, #1A66E0 50%, #0046C1 100%);
  background-size: 200% auto;
  color: #FFFFFF;
  border-radius: 9999px;
  box-shadow: 0 8px 24px -4px rgba(0, 70, 193, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background-position: right center;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 32px -4px rgba(0, 70, 193, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.4);
}
```
