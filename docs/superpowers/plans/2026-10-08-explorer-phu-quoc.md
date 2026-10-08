# Explorer Phú Quốc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi demo từ "vào là thấy chat" sang site Explorer: Home giới thiệu điểm đến toàn cầu (chỉ Phú Quốc active), trang chi tiết Phú Quốc đầy nội dung truyền cảm hứng + link booking sang travel.com.vn, Tripi chuyển sang `/tripi` kèm nút nổi.

**Architecture:** Next.js App Router, server component mặc định. Nội dung điểm đến là object TypeScript soạn tay (`src/data/destinations/`), tour thật lọc từ `tours.json`, thời tiết lấy từ Open-Meteo phía server (cache 30 phút, lỗi thì dùng bảng khí hậu tĩnh). Chỉ 2 client component: `PlaceGrid` (lọc theo nhóm đi cùng) và `AnchorNav` (highlight mục đang xem). Component chat cũ không đụng tới.

**Tech Stack:** Next 15.5 (App Router), React 19, Tailwind 4, lucide-react, `next/image`, test bằng `node:assert` chạy qua `npx tsx`.

**Spec:** [docs/superpowers/specs/2026-10-08-explorer-phu-quoc-design.md](../specs/2026-10-08-explorer-phu-quoc-design.md)

## Global Constraints

- Mọi chữ hiển thị, nội dung, comment bằng tiếng Việt (có dấu), xưng "Quý khách" khi cần gọi người dùng.
- Nút đặt chỗ là link ngoài (`target="_blank" rel="noreferrer"`) tới host `travel.com.vn`. Explorer không xử lý booking.
- Ảnh remote chỉ từ `s3-cmc.travel.com.vn` (đã cho phép trong `next.config.ts`); dùng `next/image`.
- Giá, chi phí, thời lượng bay là **ước tính tham khảo**, ghi rõ trên UI. Review là **dữ liệu mẫu**, gắn nhãn "Review mẫu cho bản demo".
- Không SEO nâng cao: không JSON-LD, không sitemap. Chỉ `title`/`description` cơ bản.
- Không sửa `src/components/avatar/*`, `src/app/api/*`, `src/middleware.ts`. Working tree đang có thay đổi chưa commit của người dùng: mỗi commit chỉ `git add` đúng các file của task, không `git add -A`.
- Màu/thành phần theo token sẵn có: `ocean`, `sunset`, `ink`, `sale`, `cloud`, `ease-soft`, `text-muted-foreground`, `ring-ocean/10`.
- Commit message kết thúc bằng dòng: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- Chạy lệnh từ `/Users/dungnb/vietravel-demo`. Type check: `pnpm exec tsc --noEmit`.

## Review Focus

- Open-Meteo trả JSON thiếu trường / sai kiểu / lỗi mạng: `parseWeather` phải trả `null` chứ không ném lỗi, UI rơi về bảng khí hậu tháng (Task 3, Task 6).
- Slug lạ hoặc `constructor`/`__proto__` hoặc điểm chưa active: `getGuide` trả `undefined`, trang trả 404 (Task 2, Task 9).
- Hết lịch khởi hành (không còn tour sắp đi): trang vẫn hiện CTA gọi hotline, không để khối trống (Task 2 test lọc ngày, Task 5 `TourList`).
- Tour `rating: null`: không in chữ "null" (Task 2 `formatRating`).
- Ảnh từ host chưa khai báo trong `next.config.ts` làm `next/image` ném lỗi: mọi `imageUrl` trong data phải thuộc `s3-cmc.travel.com.vn`; trang không tràn ngang ở 375px (Task 2 test, Task 10).

---

## File Structure

Mới:
- `src/app/tripi/page.tsx`: route chat cũ + link quay về.
- `src/app/diem-den/[slug]/page.tsx`: trang chi tiết điểm đến.
- `src/types/destination.ts`: kiểu dữ liệu điểm đến.
- `src/data/destinations/phu-quoc.ts`: nội dung Phú Quốc.
- `src/data/destinations/index.ts`: danh sách điểm đến + `getGuide`.
- `src/data/destinations/destinations.test.ts`: test toàn vẹn dữ liệu.
- `src/lib/destination-tours.ts`: lọc tour theo điểm đến.
- `src/lib/format.ts` + `src/lib/format.test.ts`: định dạng giá/ngày/rating.
- `src/lib/weather.ts` + `src/lib/weather.test.ts`: Open-Meteo.
- `src/components/explorer/`: `section.tsx`, `cta-link.tsx`, `explorer-header.tsx`, `explorer-footer.tsx`, `tripi-fab.tsx`, `explorer-shell.tsx`, `home-hero.tsx`, `destination-grid.tsx`, `tour-list.tsx`, `destination-hero.tsx`, `anchor-nav.tsx`, `season-chart.tsx`, `weather-block.tsx`, `getting-there.tsx`, `place-grid.tsx`, `stay-block.tsx`, `play-block.tsx`, `eat-block.tsx`, `itinerary.tsx`, `cost-checklist.tsx`, `reviews.tsx`, `faq.tsx`, `final-cta.tsx`.

Sửa: `src/app/page.tsx` (Home), `src/app/layout.tsx` (metadata).

---

### Task 1: Route `/tripi`

**Files:**
- Create: `src/app/tripi/page.tsx`

**Interfaces:**
- Produces: route `/tripi` render `AvatarExperience`; link quay về `/`.

- [ ] **Step 1: Tạo `src/app/tripi/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { AvatarExperience } from "@/components/avatar/avatar-experience"
import { company } from "@/config/company"

export const metadata: Metadata = {
  title: `${company.persona.name} · Trợ lý du lịch ${company.brand}`,
  description: `Trò chuyện với ${company.persona.name}, ${company.persona.role} ảo của ${company.brand}.`,
}

export default function TripiPage(): React.JSX.Element {
  return (
    <>
      <AvatarExperience />
      <Link
        href="/"
        className="fixed bottom-4 left-4 z-50 inline-flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-semibold text-ocean shadow-[0_12px_30px_-12px_rgba(0,70,193,0.5)] ring-1 ring-ocean/15 backdrop-blur"
      >
        <ArrowLeftIcon aria-hidden strokeWidth={1.5} className="size-4" />
        Khám phá điểm đến
      </Link>
    </>
  )
}
```

- [ ] **Step 2: Type check**

Run: `pnpm exec tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 3: Commit**

```bash
git add src/app/tripi/page.tsx
git commit -m "feat: thêm route /tripi cho trải nghiệm chat" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

(Vị trí nút "Khám phá điểm đến" kiểm tra bằng mắt ở Task 10, đổi chỗ nếu đè lên giao diện chat.)

---

### Task 2: Kiểu dữ liệu, nội dung Phú Quốc, helper (TDD)

**Files:**
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`
- Create: `src/types/destination.ts`
- Create: `src/data/destinations/phu-quoc.ts`, `src/data/destinations/index.ts`
- Create: `src/lib/destination-tours.ts`
- Test: `src/data/destinations/destinations.test.ts`

**Interfaces:**
- Produces (`src/lib/format.ts`): `formatVnd(priceVnd: number): string` → `"4.990.000đ"`; `formatShortDate(isoDate: string): string` → `"13/10"`; `formatRating(rating: number | null): string | null` → `"4.7"` hoặc `null`.
- Produces (`src/types/destination.ts`): `Audience`, `AUDIENCE_LABEL`, `DestinationSummary`, `Place`, `Dish`, `Route`, `Area`, `MonthInfo`, `ItineraryDay`, `Review`, `Faq`, `CostRow`, `DestinationGuide` (định nghĩa đầy đủ ở Step 4).
- Produces (`src/data/destinations/index.ts`): `destinations: DestinationSummary[]`; `getGuide(slug: string): DestinationGuide | undefined`.
- Produces (`src/data/destinations/phu-quoc.ts`): `phuQuoc: DestinationGuide`.
- Produces (`src/lib/destination-tours.ts`): `toursForDestination(guide: Pick<DestinationGuide, "tourKeyword">, today?: string): Tour[]` (sắp xếp giá tăng dần).

- [ ] **Step 1: Viết test định dạng `src/lib/format.test.ts`**

```ts
import assert from "node:assert/strict"
import { formatRating, formatShortDate, formatVnd } from "./format"

assert.equal(formatVnd(4990000), "4.990.000đ")
assert.equal(formatShortDate("2026-10-13"), "13/10")
assert.equal(formatRating(4.7), "4.7")
assert.equal(formatRating(5), "5.0")
assert.equal(formatRating(null), null)

console.log("format.test OK")
```

- [ ] **Step 2: Viết test dữ liệu `src/data/destinations/destinations.test.ts`**

```ts
import assert from "node:assert/strict"
import { destinations, getGuide } from "./index"
import { phuQuoc } from "./phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"

const IMAGE_HOST = "https://s3-cmc.travel.com.vn/"
const today = "2026-10-08"

// Slug: điểm active có nội dung; slug lạ, chưa active, hoặc trùng thuộc tính Object đều không có.
assert.equal(getGuide("phu-quoc"), phuQuoc)
for (const slug of ["da-nang", "constructor", "__proto__", "toString", ""]) {
  assert.equal(getGuide(slug), undefined, `slug "${slug}" phải là undefined`)
}
for (const destination of destinations.filter((item) => item.active)) {
  assert.ok(getGuide(destination.slug), `${destination.slug} active nhưng thiếu nội dung`)
}

// Ảnh: next/image chỉ cho phép host S3 của Vietravel.
const images = [
  ...destinations.map((item) => item.imageUrl),
  phuQuoc.heroImageUrl,
  ...[...phuQuoc.stays, ...phuQuoc.activities].flatMap((place) => (place.imageUrl ? [place.imageUrl] : [])),
]
for (const url of images) assert.ok(url.startsWith(IMAGE_HOST), `ảnh sai host: ${url}`)

// Link đặt chỗ: luôn sang travel.com.vn.
for (const url of Object.values(phuQuoc.links)) {
  assert.equal(new URL(url).hostname, "travel.com.vn", `link sai host: ${url}`)
}

// Cấu trúc nội dung.
assert.equal(phuQuoc.months.length, 12)
assert.equal(phuQuoc.reasons.length, 5)
assert.ok(phuQuoc.itinerary.length >= 3)
for (const place of [...phuQuoc.stays, ...phuQuoc.activities]) {
  assert.ok(place.audiences.length > 0, `${place.name} thiếu audiences`)
}
for (const review of phuQuoc.reviews) assert.ok(review.rating >= 1 && review.rating <= 5)

// Tour: có tour sắp đi; hết lịch thì mảng rỗng (UI hiện CTA hotline); sắp xếp giá tăng.
const tours = toursForDestination(phuQuoc, today)
assert.ok(tours.length > 0, "phải có tour Phú Quốc sắp khởi hành")
for (const tour of tours) assert.ok(`${tour.name} ${tour.region}`.toLowerCase().includes("phú quốc"))
for (let i = 1; i < tours.length; i += 1) assert.ok(tours[i - 1].priceVnd <= tours[i].priceVnd)
assert.deepEqual(toursForDestination(phuQuoc, "2099-01-01"), [])

console.log("destinations.test OK")
```

- [ ] **Step 3: Chạy test, xác nhận fail**

Run: `npx tsx src/lib/format.test.ts`
Expected: FAIL (`Cannot find module './format'`).

- [ ] **Step 4: Tạo `src/lib/format.ts`**

```ts
export function formatVnd(priceVnd: number): string {
  return `${priceVnd.toLocaleString("vi-VN")}đ`
}

/** "2026-10-13" → "13/10". */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  return `${day}/${month}`
}

/** Tour chưa có đánh giá thì không hiện gì thay vì in "null". */
export function formatRating(rating: number | null): string | null {
  return rating === null ? null : rating.toFixed(1)
}
```

- [ ] **Step 5: Tạo `src/types/destination.ts`**

```ts
export type Audience = "family" | "couple" | "friends"

export const AUDIENCE_LABEL: Record<Audience, string> = {
  family: "Gia đình",
  couple: "Cặp đôi",
  friends: "Bạn bè",
}

/** Thông tin hiển thị ở lưới điểm đến trên Home. */
export interface DestinationSummary {
  slug: string
  name: string
  caption: string
  imageUrl: string
  /** Chỉ điểm active mới có trang chi tiết. */
  active: boolean
}

/** Một địa điểm vui chơi hoặc loại hình lưu trú, lọc được theo nhóm đi cùng. */
export interface Place {
  name: string
  /** Nhãn ngắn: hạng, khu vực. */
  tag: string
  blurb: string
  audiences: Audience[]
  imageUrl?: string
  tip?: string
}

export interface Dish {
  name: string
  blurb: string
  where: string
}

export interface Route {
  from: string
  mode: string
  duration: string
  note: string
}

export interface Area {
  name: string
  blurb: string
}

export interface MonthInfo {
  label: string
  /** 1 = kém thuận lợi, 5 = đẹp nhất. */
  score: 1 | 2 | 3 | 4 | 5
  tempC: string
  rain: string
  advice: string
}

export interface ItineraryDay {
  day: number
  title: string
  items: { time: string; text: string }[]
}

export interface Review {
  nick: string
  trip: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
}

export interface Faq {
  question: string
  answer: string
}

export interface CostRow {
  label: string
  range: string
}

export interface DestinationGuide {
  slug: string
  name: string
  tagline: string
  intro: string
  heroImageUrl: string
  coordinates: { lat: number; lon: number }
  /** Từ khóa (chữ thường) để lọc tour trong tours.json theo tên/vùng. */
  tourKeyword: string
  reasons: { title: string; text: string }[]
  /** Đúng 12 phần tử, T1 → T12. */
  months: MonthInfo[]
  routes: Route[]
  onIsland: { name: string; note: string }[]
  areas: Area[]
  stays: Place[]
  dishes: Dish[]
  activities: Place[]
  itinerary: ItineraryDay[]
  costs: CostRow[]
  packing: string[]
  reviews: Review[]
  faqs: Faq[]
  links: { hotels: string; flights: string; tours: string }
}
```

- [ ] **Step 6: Tạo `src/data/destinations/phu-quoc.ts`**

```ts
import type { DestinationGuide } from "@/types/destination"

const IMG = "https://s3-cmc.travel.com.vn/vtv-image/Images/Destination/"

/** Nội dung soạn tay cho bản demo; cần nhân viên Vietravel kiểm duyệt trước khi dùng thật. */
export const phuQuoc: DestinationGuide = {
  slug: "phu-quoc",
  name: "Phú Quốc",
  tagline: "Đảo ngọc của những hoàng hôn khiến bạn không muốn rời mắt",
  intro:
    "Cát trắng Bãi Sao, nước biển xanh ngọc, cáp treo vượt biển, chợ đêm rộn ràng và hải sản tươi rói. Chỉ khoảng một giờ bay từ TP. Hồ Chí Minh, Phú Quốc đủ để ba ngày nghỉ ngơi thật sự trọn vẹn.",
  heroImageUrl: `${IMG}tf__0_6221_bai-sao-1.webp`,
  coordinates: { lat: 10.22, lon: 103.96 },
  tourKeyword: "phú quốc",
  reasons: [
    { title: "Biển xanh, cát trắng", text: "Bãi Sao, Bãi Dài, Bãi Khem: nước trong, sóng êm vào mùa khô." },
    { title: "Hoàng hôn đẹp bậc nhất", text: "Bãi Trường, Thị trấn Hoàng Hôn và Dinh Cậu là những điểm ngắm mặt trời lặn được yêu thích." },
    { title: "Vui chơi cả ngày lẫn đêm", text: "VinWonders, Safari, Grand World, cáp treo Hòn Thơm và chợ đêm sôi động." },
    { title: "Bay rất nhanh", text: "Khoảng 1 giờ từ TP. Hồ Chí Minh, có chuyến bay thẳng từ Hà Nội, Đà Nẵng và Cần Thơ." },
    { title: "Hải sản và đặc sản", text: "Gỏi cá trích, ghẹ Hàm Ninh, nhum nướng, nước mắm và rượu sim mang về làm quà." },
  ],
  months: [
    { label: "T1", score: 5, tempC: "24–31°C", rain: "Rất ít mưa", advice: "Trời xanh, biển lặng, đúng thời điểm đẹp nhất. Mùa cao điểm nên đặt vé và phòng sớm." },
    { label: "T2", score: 5, tempC: "24–32°C", rain: "Rất ít mưa", advice: "Nắng ráo, hợp tắm biển và lặn ngắm san hô. Dịp Tết rất đông khách." },
    { label: "T3", score: 5, tempC: "25–33°C", rain: "Ít mưa", advice: "Nắng đẹp, hơi nóng buổi trưa. Nên đi biển sáng sớm và chiều muộn." },
    { label: "T4", score: 4, tempC: "26–33°C", rain: "Mưa thưa", advice: "Nóng nhất năm, cuối tháng có thể có mưa rào. Biển vẫn đẹp, giá bắt đầu mềm hơn." },
    { label: "T5", score: 3, tempC: "26–32°C", rain: "Mưa rào chiều", advice: "Vào mùa mưa: thường mưa rào ngắn buổi chiều, sáng vẫn nắng. Giá tốt." },
    { label: "T6", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa thường xuyên, biển có thể đục. Hợp người thích yên tĩnh và ưu tiên giá rẻ." },
    { label: "T7", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa nhiều, vắng khách. Nên chọn lịch trình linh hoạt, có phương án trong nhà." },
    { label: "T8", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa rào xen nắng. Phòng và vé bay thường rẻ, các điểm vui chơi ít đông." },
    { label: "T9", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa và dông thường vào chiều tối. Hoạt động trên biển có thể dời lịch." },
    { label: "T10", score: 2, tempC: "25–31°C", rain: "Mưa nhiều nhất", advice: "Mưa dông nhiều nhất năm, nhưng sáng vẫn có nắng. Giá thấp nhất; chọn tour có lịch trình linh hoạt." },
    { label: "T11", score: 4, tempC: "25–32°C", rain: "Mưa giảm dần", advice: "Mưa thưa dần, biển đẹp lên rõ rệt. Nên đặt sớm cho dịp cuối năm." },
    { label: "T12", score: 5, tempC: "24–31°C", rain: "Ít mưa", advice: "Mùa khô vào đủ, thời tiết mát. Đông khách dịp Noel và năm mới." },
  ],
  routes: [
    { from: "TP. Hồ Chí Minh", mode: "Bay thẳng", duration: "khoảng 1 giờ", note: "Nhiều chuyến mỗi ngày, lựa chọn phổ biến nhất." },
    { from: "Hà Nội", mode: "Bay thẳng", duration: "khoảng 2 giờ 10 phút", note: "Nhiều chuyến mỗi ngày." },
    { from: "Đà Nẵng", mode: "Bay thẳng", duration: "khoảng 1 giờ 45 phút", note: "Số chuyến ít hơn, nên kiểm tra lịch bay trước khi đặt." },
    { from: "Cần Thơ", mode: "Bay thẳng", duration: "khoảng 50 phút", note: "Tiện cho khách miền Tây." },
    { from: "Hà Tiên", mode: "Tàu cao tốc", duration: "khoảng 1 giờ 15 phút", note: "Chặng biển ngắn nhất ra đảo." },
    { from: "Rạch Giá", mode: "Tàu cao tốc", duration: "khoảng 2 giờ 30 phút", note: "Phù hợp khách đi từ miền Tây, có thể gửi xe. Kiểm tra lịch tàu trước khi đi." },
  ],
  onIsland: [
    { name: "Taxi, xe công nghệ", note: "Có ở sân bay và khu Dương Đông, nên hỏi giá trước khi lên xe." },
    { name: "Thuê xe 4–7 chỗ có tài xế", note: "Tiện cho gia đình, đi Bắc đảo và Nam đảo trong một ngày." },
    { name: "Thuê xe máy", note: "Linh hoạt nếu quen đường. Cần bằng lái và đội mũ bảo hiểm." },
    { name: "Xe đưa đón của resort, khu vui chơi", note: "Nhiều nơi có xe đưa đón theo giờ, nên hỏi khi đặt phòng." },
  ],
  areas: [
    { name: "Dương Đông", blurb: "Trung tâm đảo: chợ đêm, quán ăn, thuê xe thuận tiện." },
    { name: "Bãi Trường (Tây đảo)", blurb: "Dải biển dài với nhiều resort, ngắm hoàng hôn ngay trước hiên." },
    { name: "Nam đảo (An Thới, Bãi Sao)", blurb: "Thị trấn Hoàng Hôn, Bãi Sao, cáp treo Hòn Thơm và lặn san hô." },
    { name: "Bắc đảo (Bãi Dài)", blurb: "Yên tĩnh hơn, gần VinWonders, Safari và Grand World." },
  ],
  stays: [
    { name: "Resort ven biển Bãi Trường", tag: "Cao cấp · Tây đảo", blurb: "Bãi biển riêng, hồ bơi lớn, đủ tiện ích cho kỳ nghỉ chỉ ở resort.", audiences: ["family", "couple"], tip: "Chọn phòng hướng biển để ngắm hoàng hôn." },
    { name: "Resort liền kề khu vui chơi", tag: "Cao cấp · Bắc đảo", blurb: "Gần VinWonders và Safari, có câu lạc bộ trẻ em, tiện cho gia đình có con nhỏ.", audiences: ["family", "friends"] },
    { name: "Villa hồ bơi riêng", tag: "Cao cấp · Tây và Nam đảo", blurb: "Không gian riêng tư, bữa sáng tại villa, hợp kỳ nghỉ kỷ niệm.", audiences: ["couple", "friends"] },
    { name: "Khách sạn trung tâm Dương Đông", tag: "Tầm trung", blurb: "Đi bộ tới chợ đêm và quán ăn, thuê xe dễ, giá dễ chịu.", audiences: ["couple", "friends"] },
    { name: "Khách sạn gia đình, phòng liên thông", tag: "Tầm trung", blurb: "Phòng rộng, có phòng liên thông và bữa sáng cho trẻ em.", audiences: ["family"] },
    { name: "Khách sạn, homestay gần biển", tag: "Tiết kiệm", blurb: "Giá tốt, đi bộ ra biển. Hợp nhóm bạn trẻ ưu tiên đi nhiều hơn ở.", audiences: ["friends", "couple"] },
  ],
  dishes: [
    { name: "Gỏi cá trích", blurb: "Cá trích tươi trộn dừa nạo, cuốn bánh tráng cùng rau rừng, chấm mắm tương.", where: "Quán địa phương ở Dương Đông" },
    { name: "Bún quậy", blurb: "Tô bún tự pha nước chấm theo khẩu vị với tôm, cá thác lác, nước lèo thanh ngọt.", where: "Dương Đông" },
    { name: "Ghẹ Hàm Ninh", blurb: "Ghẹ thịt chắc ngọt, hấp tại làng chài ngay khi vừa lên bờ.", where: "Làng chài Hàm Ninh" },
    { name: "Nhum nướng mỡ hành", blurb: "Nhum biển nướng nóng, béo ngậy, ăn kèm bánh tráng nướng.", where: "Chợ đêm và quán hải sản ven biển" },
    { name: "Bún kèn", blurb: "Món bún nước lèo cá và nước cốt dừa đậm đà, ăn sáng rất hợp.", where: "Quán nhỏ trong khu dân cư" },
    { name: "Đặc sản mang về", blurb: "Nước mắm, rượu sim, ngọc trai, tiêu: quà biếu quen thuộc của Phú Quốc.", where: "Chợ Dương Đông, cửa hàng đặc sản" },
  ],
  activities: [
    { name: "Cáp treo vượt biển và Hòn Thơm", tag: "Nam đảo", blurb: "Ngồi cabin lướt trên biển ngắm các hòn đảo nhỏ, rồi xuống Hòn Thơm với công viên nước, bãi biển và trò chơi.", audiences: ["family", "couple", "friends"], imageUrl: `${IMG}tf__0_12482_sun-world-hon-thom-4.webp`, tip: "Đi buổi sáng để tránh nắng và hàng chờ." },
    { name: "Thị trấn Hoàng Hôn và Kiss Bridge", tag: "Nam đảo", blurb: "Khu phố ven biển kiểu châu Âu, cây cầu Kiss Bridge để đón hoàng hôn và xem show buổi tối.", audiences: ["couple", "friends", "family"], imageUrl: `${IMG}tf__0_6130_dji0785.webp`, tip: "Có mặt trước hoàng hôn khoảng một giờ để chọn chỗ đẹp." },
    { name: "VinWonders Phú Quốc", tag: "Bắc đảo", blurb: "Công viên chủ đề với trò chơi cảm giác mạnh, công viên nước và show diễn buổi tối.", audiences: ["family", "friends"], imageUrl: `${IMG}tf__2_13564_vinwonders.webp` },
    { name: "Vinpearl Safari", tag: "Bắc đảo", blurb: "Vườn thú bán hoang dã: đi xe tham quan, cho thú ăn, rất hợp trẻ nhỏ.", audiences: ["family", "couple", "friends"] },
    { name: "Grand World", tag: "Bắc đảo", blurb: "Khu phố sôi động về đêm với kênh đào, thuyền gondola, show diễn và ẩm thực.", audiences: ["couple", "friends", "family"], imageUrl: `${IMG}tf__1_13918_grand-world-1.webp` },
    { name: "Bãi Sao", tag: "Nam đảo", blurb: "Bãi cát trắng mịn, nước trong, hợp tắm biển và chụp ảnh. Có dịch vụ ghế dù và quán ăn nhẹ.", audiences: ["family", "couple", "friends"], imageUrl: `${IMG}tf__0_6221_bai-sao-1.webp` },
    { name: "Lặn ngắm san hô và câu mực đêm", tag: "Biển đảo", blurb: "Đi ca nô ra các hòn đảo nhỏ lặn ống thở ngắm san hô; buổi tối đi câu mực trên biển.", audiences: ["friends", "couple"], tip: "Mùa mưa biển có thể động, chuyến thường được dời lịch." },
    { name: "Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc", tag: "Dương Đông · Nam đảo", blurb: "Điểm tâm linh nhìn ra biển, nhẹ nhàng, phù hợp người lớn tuổi.", audiences: ["family", "couple"] },
    { name: "Chợ đêm Phú Quốc", tag: "Dương Đông", blurb: "Hải sản nướng, đặc sản và quà lưu niệm trong một buổi tối dạo phố.", audiences: ["family", "couple", "friends"], tip: "Hỏi giá hải sản trước khi gọi món." },
  ],
  itinerary: [
    {
      day: 1,
      title: "Đến đảo, hoàng hôn Bãi Trường",
      items: [
        { time: "Sáng", text: "Bay đến Phú Quốc, nhận phòng hoặc gửi hành lý." },
        { time: "Trưa", text: "Ăn bún quậy hoặc gỏi cá trích ở Dương Đông." },
        { time: "Chiều", text: "Ghé Dinh Cậu, ra Bãi Trường tắm biển và đón hoàng hôn." },
        { time: "Tối", text: "Dạo chợ đêm, thử nhum nướng và hải sản." },
      ],
    },
    {
      day: 2,
      title: "Nam đảo: biển, cáp treo, Thị trấn Hoàng Hôn",
      items: [
        { time: "Sáng", text: "Đi cáp treo vượt biển sang Hòn Thơm, tắm biển và chơi công viên nước." },
        { time: "Trưa", text: "Ăn trưa tại Hòn Thơm hoặc Bãi Sao." },
        { time: "Chiều", text: "Ghé Bãi Sao, sau đó đến Thị trấn Hoàng Hôn và Kiss Bridge." },
        { time: "Tối", text: "Ngắm hoàng hôn, xem show tại Kiss Bridge (theo lịch từng ngày)." },
      ],
    },
    {
      day: 3,
      title: "Bắc đảo và mua đặc sản",
      items: [
        { time: "Sáng", text: "Chọn một: VinWonders hoặc Vinpearl Safari (hợp gia đình có trẻ nhỏ)." },
        { time: "Trưa", text: "Ăn trưa, nghỉ ngơi." },
        { time: "Chiều", text: "Mua nước mắm, rượu sim, ngọc trai làm quà, ra sân bay." },
      ],
    },
  ],
  costs: [
    { label: "Vé máy bay khứ hồi", range: "1,5 – 3,5 triệu đồng/người" },
    { label: "Lưu trú 2 đêm", range: "1,2 – 6 triệu đồng/phòng, tùy hạng" },
    { label: "Ăn uống", range: "300 – 600 nghìn đồng/người/ngày" },
    { label: "Vé tham quan, vui chơi", range: "vài trăm nghìn đến hơn 1 triệu đồng/điểm" },
    { label: "Di chuyển trên đảo", range: "200 – 500 nghìn đồng/ngày" },
  ],
  packing: [
    "Kem chống nắng, mũ, kính râm",
    "Đồ bơi, áo choàng, dép đi biển",
    "Áo mưa gọn nhẹ (mùa mưa từ tháng 5 đến tháng 10)",
    "Túi chống nước cho điện thoại, sạc dự phòng",
    "Thuốc say sóng nếu đi tàu hoặc ca nô",
    "CCCD hoặc hộ chiếu để làm thủ tục bay",
  ],
  reviews: [
    { nick: "Minh Anh", trip: "Gia đình 4 người · Tháng 8/2026", rating: 5, text: "Con mình mê Safari và công viên nước Hòn Thơm. Đặt tour trọn gói nên không phải lo xe đưa đón, cả nhà đi rất nhẹ nhàng." },
    { nick: "Thu H.", trip: "Cặp đôi · Tháng 3/2026", rating: 5, text: "Hoàng hôn ở Kiss Bridge đẹp hơn ảnh. Nên đến sớm một tiếng để có chỗ đứng đẹp." },
    { nick: "Quân", trip: "Nhóm bạn 6 người · Tháng 6/2026", rating: 4, text: "Hôm mưa phải dời lịch lặn san hô sang hôm sau nhưng hướng dẫn viên xử lý rất linh hoạt. Hải sản chợ đêm ngon, nhớ hỏi giá trước." },
    { nick: "Cô Lan", trip: "Đi cùng ba mẹ · Tháng 1/2026", rating: 5, text: "Ba mẹ lớn tuổi đi cáp treo rất êm, không mệt. Có xe đón tận nơi nên cả nhà yên tâm." },
    { nick: "Hải Đăng", trip: "Đi một mình · Tháng 9/2026", rating: 4, text: "Mùa mưa vắng khách, vé bay và phòng đều rẻ. Sáng nắng đẹp, chiều có mưa rào ngắn. Ai không ngại thời tiết thì nên đi." },
  ],
  faqs: [
    { question: "Mùa nào đi Phú Quốc đẹp nhất?", answer: "Từ tháng 11 đến tháng 4 là mùa khô: trời xanh, biển lặng, nhưng đông khách và giá cao. Tháng 5 đến tháng 10 là mùa mưa: vắng khách, giá rẻ hơn, thường mưa rào ngắn vào chiều tối." },
    { question: "Đi Phú Quốc mấy ngày là đủ?", answer: "3 ngày 2 đêm đủ để đi Nam đảo, Bắc đảo và thưởng thức đặc sản. Nếu muốn thong thả, thêm lặn ngắm san hô hoặc nghỉ resort, nên đi 4 ngày 3 đêm." },
    { question: "Giấy tờ cần mang khi đi Phú Quốc?", answer: "Khách Việt Nam mang CCCD hoặc giấy tờ tùy thân hợp lệ khi bay nội địa; khách nước ngoài mang hộ chiếu. Quý khách nên xác nhận lại với hãng bay trước ngày đi." },
    { question: "Mang nước mắm Phú Quốc lên máy bay thế nào?", answer: "Nên đóng chai kín, bọc kỹ và ký gửi. Chất lỏng xách tay bị giới hạn dung tích, Quý khách kiểm tra quy định hành lý của hãng bay trước khi đi." },
    { question: "Người lớn tuổi đi cáp treo Hòn Thơm có phù hợp không?", answer: "Cabin di chuyển êm nên phù hợp với nhiều người lớn tuổi. Nếu có bệnh nền, Quý khách nên báo trước cho tư vấn viên để chọn lịch trình phù hợp." },
    { question: "Nên đặt tour trọn gói hay đi tự túc?", answer: "Tour trọn gói gồm vé bay, khách sạn, xe và tham quan, tiện cho gia đình và nhóm đông. Đi tự túc linh hoạt hơn. Vietravel có cả tour lẫn dịch vụ lẻ như khách sạn và vé máy bay để Quý khách tự chọn." },
  ],
  links: {
    hotels: "https://travel.com.vn/khach-san-phu-quoc",
    flights: "https://travel.com.vn/ve-may-bay",
    tours: "https://travel.com.vn/du-lich-phu-quoc",
  },
}
```

- [ ] **Step 7: Tạo `src/data/destinations/index.ts`**

```ts
import { phuQuoc } from "@/data/destinations/phu-quoc"
import type { DestinationGuide, DestinationSummary } from "@/types/destination"

const IMG = "https://s3-cmc.travel.com.vn/vtv-image/Images/Destination/"

/** Điểm đến hiển thị trên Home. Bản demo chỉ Phú Quốc active. */
export const destinations: DestinationSummary[] = [
  { slug: "phu-quoc", name: "Phú Quốc", caption: "Đảo ngọc, hoàng hôn, nghỉ dưỡng", imageUrl: `${IMG}tf__0_6221_bai-sao-1.webp`, active: true },
  { slug: "da-nang", name: "Đà Nẵng", caption: "Bà Nà, Hội An, biển Mỹ Khê", imageUrl: `${IMG}tf__2_12156_cau-rong-ban-dem.webp`, active: false },
  { slug: "ha-long", name: "Hạ Long", caption: "Kỳ quan thiên nhiên thế giới", imageUrl: `${IMG}tf__0_11106_ha-long-bay.webp`, active: false },
  { slug: "sa-pa", name: "Sa Pa", caption: "Săn mây, ruộng bậc thang", imageUrl: `${IMG}tf__2_3966_view-of-sapa-town.webp`, active: false },
  { slug: "bangkok", name: "Bangkok", caption: "Thái Lan sôi động", imageUrl: `${IMG}tf__0_2666_cung-dien-hoang-gia-thai-lan-1.webp`, active: false },
  { slug: "nhat-ban", name: "Nhật Bản", caption: "Lâu đài, lá đỏ, hoa anh đào", imageUrl: `${IMG}tf__0_4288_lau-dai-matsumoto-2.webp`, active: false },
  { slug: "han-quoc", name: "Hàn Quốc", caption: "Jeju, Seoul, K-culture", imageUrl: `${IMG}tf__0_11802_ganh-da-dia.webp`, active: false },
  { slug: "paris", name: "Paris", caption: "Tháp Eiffel, nghệ thuật, ẩm thực", imageUrl: `${IMG}tf__2_10827_thap-eiffel---paris-2.webp`, active: false },
]

// Map thay vì object thường để slug như "constructor" không trỏ vào thuộc tính của Object.
const guides = new Map<string, DestinationGuide>([[phuQuoc.slug, phuQuoc]])

export function getGuide(slug: string): DestinationGuide | undefined {
  const summary = destinations.find((destination) => destination.slug === slug)
  return summary?.active ? guides.get(slug) : undefined
}
```

- [ ] **Step 8: Tạo `src/lib/destination-tours.ts`**

```ts
import { getUpcomingTours } from "@/data/tours"
import type { DestinationGuide } from "@/types/destination"
import type { Tour } from "@/types/tour"

/** Tour còn lịch khởi hành của một điểm đến, giá thấp nhất trước. */
export function toursForDestination(guide: Pick<DestinationGuide, "tourKeyword">, today?: string): Tour[] {
  const keyword = guide.tourKeyword.toLowerCase()
  return getUpcomingTours(today)
    .filter((tour) => `${tour.name} ${tour.region}`.toLowerCase().includes(keyword))
    .sort((a, b) => a.priceVnd - b.priceVnd)
}
```

- [ ] **Step 9: Chạy test, xác nhận pass**

Run: `npx tsx src/lib/format.test.ts && npx tsx src/data/destinations/destinations.test.ts`
Expected: in `format.test OK` và `destinations.test OK`.

- [ ] **Step 10: Type check và commit**

Run: `pnpm exec tsc --noEmit`
Expected: không lỗi.

```bash
git add src/lib/format.ts src/lib/format.test.ts src/types/destination.ts src/data/destinations src/lib/destination-tours.ts
git commit -m "feat: dữ liệu điểm đến Phú Quốc và helper lọc tour" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Thời tiết Open-Meteo (TDD)

**Files:**
- Create: `src/lib/weather.ts`
- Test: `src/lib/weather.test.ts`

**Interfaces:**
- Produces: `DayForecast { date: string; code: number; maxC: number; minC: number; rainPct: number }`; `WeatherSnapshot { tempC: number; humidity: number; code: number; forecast: DayForecast[] }`; `WeatherKind = "clear" | "cloudy" | "rain" | "storm"`; `parseWeather(json: unknown): WeatherSnapshot | null`; `describeWeather(code: number): { kind: WeatherKind; label: string }`; `fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null>`.

- [ ] **Step 1: Viết test `src/lib/weather.test.ts`**

```ts
import assert from "node:assert/strict"
import { describeWeather, parseWeather } from "./weather"

// Mẫu thật từ api.open-meteo.com (rút gọn).
const sample = {
  current: { time: "2026-10-08T15:00", temperature_2m: 26.8, weather_code: 95, relative_humidity_2m: 92 },
  daily: {
    time: ["2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"],
    weather_code: [95, 80, 80, 95],
    temperature_2m_max: [29.2, 29.9, 30.1, 29.4],
    temperature_2m_min: [24.5, 25.1, 25.1, 24.0],
    precipitation_probability_max: [97, 100, 89, 92],
  },
}

const parsed = parseWeather(sample)
assert.ok(parsed)
assert.equal(parsed.tempC, 26.8)
assert.equal(parsed.humidity, 92)
assert.equal(parsed.code, 95)
assert.equal(parsed.forecast.length, 4)
assert.deepEqual(parsed.forecast[1], { date: "2026-10-09", code: 80, maxC: 29.9, minC: 25.1, rainPct: 100 })

// Dữ liệu hỏng thì trả null, không ném lỗi.
assert.equal(parseWeather(null), null)
assert.equal(parseWeather("lỗi"), null)
assert.equal(parseWeather({}), null)
assert.equal(parseWeather({ current: sample.current }), null)
assert.equal(parseWeather({ ...sample, current: { ...sample.current, temperature_2m: "26.8" } }), null)
assert.equal(parseWeather({ ...sample, daily: { ...sample.daily, time: "2026-10-08" } }), null)
assert.equal(parseWeather({ ...sample, daily: { ...sample.daily, time: [] } }), null)

// Một ngày dự báo thiếu số liệu thì bỏ ngày đó, giữ các ngày còn lại.
const partial = parseWeather({ ...sample, daily: { ...sample.daily, temperature_2m_max: [29.2, null, 30.1, 29.4] } })
assert.equal(partial?.forecast.length, 3)

assert.equal(describeWeather(0).kind, "clear")
assert.equal(describeWeather(3).kind, "cloudy")
assert.equal(describeWeather(61).kind, "rain")
assert.equal(describeWeather(80).kind, "rain")
assert.equal(describeWeather(95).kind, "storm")

console.log("weather.test OK")
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx tsx src/lib/weather.test.ts`
Expected: FAIL (`Cannot find module './weather'`).

- [ ] **Step 3: Tạo `src/lib/weather.ts`**

```ts
export interface DayForecast {
  date: string
  code: number
  maxC: number
  minC: number
  rainPct: number
}

export interface WeatherSnapshot {
  tempC: number
  humidity: number
  code: number
  forecast: DayForecast[]
}

export type WeatherKind = "clear" | "cloudy" | "rain" | "storm"

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

/** Đọc JSON Open-Meteo; dữ liệu hỏng hoặc thiếu thì trả null để UI dùng bảng khí hậu tĩnh. */
export function parseWeather(json: unknown): WeatherSnapshot | null {
  if (typeof json !== "object" || json === null) return null
  const { current, daily } = json as { current?: Record<string, unknown>; daily?: Record<string, unknown> }
  if (!current || !daily) return null

  const { temperature_2m: tempC, relative_humidity_2m: humidity, weather_code: code } = current
  if (!isNumber(tempC) || !isNumber(humidity) || !isNumber(code)) return null

  const { time, weather_code: codes, temperature_2m_max: maxes, temperature_2m_min: mins, precipitation_probability_max: rains } = daily
  if (![time, codes, maxes, mins, rains].every(Array.isArray)) return null

  const forecast: DayForecast[] = []
  for (const [index, date] of (time as unknown[]).entries()) {
    const dayCode = (codes as unknown[])[index]
    const maxC = (maxes as unknown[])[index]
    const minC = (mins as unknown[])[index]
    const rainPct = (rains as unknown[])[index]
    if (typeof date === "string" && isNumber(dayCode) && isNumber(maxC) && isNumber(minC) && isNumber(rainPct)) {
      forecast.push({ date, code: dayCode, maxC, minC, rainPct })
    }
  }
  return forecast.length > 0 ? { tempC, humidity, code, forecast } : null
}

/** Mã thời tiết WMO của Open-Meteo → nhóm và nhãn tiếng Việt. */
export function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code >= 95) return { kind: "storm", label: "Dông" }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { kind: "rain", label: code >= 80 ? "Mưa rào" : "Mưa" }
  }
  if (code <= 1) return { kind: "clear", label: "Nắng đẹp" }
  return { kind: "cloudy", label: "Có mây" }
}

/** Gọi Open-Meteo (không cần API key). Cache 30 phút, timeout 4 giây; mọi lỗi trả null. */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=Asia%2FBangkok&forecast_days=4"
  try {
    const response = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) })
    return response.ok ? parseWeather(await response.json()) : null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `npx tsx src/lib/weather.test.ts`
Expected: `weather.test OK`.

- [ ] **Step 5: Type check và commit**

Run: `pnpm exec tsc --noEmit`
Expected: không lỗi.

```bash
git add src/lib/weather.ts src/lib/weather.test.ts
git commit -m "feat: lấy thời tiết Open-Meteo có dự phòng khi lỗi" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Khung Explorer (header, footer, nút Tripi, helper chung)

**Files:**
- Create: `src/components/explorer/section.tsx`, `cta-link.tsx`, `explorer-header.tsx`, `explorer-footer.tsx`, `tripi-fab.tsx`, `explorer-shell.tsx`
- Modify: `src/app/layout.tsx` (metadata)

**Interfaces:**
- Produces: `Section({ id, eyebrow, title, intro?, children })`; `CARD_CLASS: string`; `CtaLink({ href, children, variant?, className? })` (link ngoài); `ExplorerShell({ children })` (header + main + footer + nút Tripi).

- [ ] **Step 1: Tạo `src/components/explorer/section.tsx`**

```tsx
interface SectionProps {
  id: string
  eyebrow: string
  title: string
  intro?: string
  children: React.ReactNode
}

/** Thẻ trắng bo tròn dùng chung cho các khối nội dung. */
export const CARD_CLASS =
  "rounded-3xl bg-white p-5 ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]"

export function Section({ id, eyebrow, title, intro, children }: SectionProps): React.JSX.Element {
  return (
    <section id={id} className="scroll-mt-32 py-10 lg:py-14">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-ocean uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>}
      <div className="mt-6 lg:mt-8">{children}</div>
    </section>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/cta-link.tsx`**

```tsx
import { ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CtaLinkProps {
  href: string
  children: React.ReactNode
  variant?: "primary" | "light" | "outline"
  className?: string
}

const VARIANT: Record<NonNullable<CtaLinkProps["variant"]>, string> = {
  primary: "bg-ocean text-white",
  light: "bg-white text-ocean",
  outline: "bg-white/10 text-white ring-1 ring-white/50 backdrop-blur",
}

/** Link ngoài sang travel.com.vn; Explorer không tự xử lý booking. */
export function CtaLink({ href, children, variant = "primary", className }: CtaLinkProps): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
        VARIANT[variant],
        className,
      )}
    >
      {children}
      <ArrowUpRightIcon aria-hidden strokeWidth={1.5} className="size-4" />
    </a>
  )
}
```

- [ ] **Step 3: Tạo `src/components/explorer/explorer-header.tsx`**

```tsx
import Link from "next/link"
import { PhoneIcon } from "lucide-react"

import { company } from "@/config/company"

const NAV = [
  { href: "/#diem-den", label: "Điểm đến" },
  { href: "/diem-den/phu-quoc#tour", label: "Tour và ưu đãi" },
  { href: "/tripi", label: "Hỏi Tripi" },
]

export function ExplorerHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 lg:px-5">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-full bg-white/80 py-1 pr-1.5 pl-5 shadow-[0_18px_40px_-24px_rgba(0,70,193,0.45)] ring-1 ring-ocean/10 backdrop-blur-xl">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-6 w-auto" />
          <span className="text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase">Explorer</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80 transition-colors hover:bg-cloud/60 hover:text-ocean"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${company.hotline.replace(/\s/g, "")}`}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-ocean px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          {company.hotline}
        </a>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Tạo `src/components/explorer/explorer-footer.tsx`**

```tsx
import { company } from "@/config/company"

export function ExplorerFooter(): React.JSX.Element {
  return (
    <footer className="mt-10 border-t border-ocean/10 bg-white/70 px-4 py-10 backdrop-blur lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-extrabold text-ocean">{company.brand} Explorer</p>
          <p className="mt-2 text-sm text-muted-foreground">{company.tagline}. Cảm hứng, thông tin điểm đến và liên kết đặt dịch vụ trên {company.website}.</p>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            Tổng đài: <a className="font-semibold text-ocean" href={`tel:${company.hotline.replace(/\s/g, "")}`}>{company.hotline}</a>
          </li>
          <li>
            Email: <a className="font-semibold text-ocean" href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          <li>
            Website: <a className="font-semibold text-ocean" href={`https://${company.website}`} target="_blank" rel="noreferrer">{company.website}</a>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-muted-foreground">
        Bản demo: nội dung điểm đến, chi phí và review mang tính minh họa, chưa qua kiểm duyệt chính thức.
      </p>
    </footer>
  )
}
```

- [ ] **Step 5: Tạo `src/components/explorer/tripi-fab.tsx`**

```tsx
import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function TripiFab(): React.JSX.Element {
  return (
    <Link
      href="/tripi"
      className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-ocean px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-12px_rgba(0,70,193,0.7)] outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
    >
      <SparklesIcon aria-hidden strokeWidth={1.5} className="size-4 text-white" />
      Hỏi {company.persona.name}
    </Link>
  )
}
```

- [ ] **Step 6: Tạo `src/components/explorer/explorer-shell.tsx`**

```tsx
import { ExplorerFooter } from "@/components/explorer/explorer-footer"
import { ExplorerHeader } from "@/components/explorer/explorer-header"
import { TripiFab } from "@/components/explorer/tripi-fab"

export function ExplorerShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <ExplorerHeader />
      <main>{children}</main>
      <ExplorerFooter />
      <TripiFab />
    </>
  )
}
```

- [ ] **Step 7: Sửa metadata trong `src/app/layout.tsx`**

Thay khối `metadata`:

```tsx
export const metadata: Metadata = {
  title: `${company.brand} Explorer · Cảm hứng du lịch`,
  description: `Khám phá điểm đến, thời tiết, lưu trú, ăn chơi và đặt tour cùng ${company.brand}.`,
}
```

- [ ] **Step 8: Type check và commit**

Run: `pnpm exec tsc --noEmit`
Expected: không lỗi.

```bash
git add src/components/explorer src/app/layout.tsx
git commit -m "feat: khung Explorer gồm header, footer, nút Hỏi Tripi" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Trang Home

**Files:**
- Create: `src/components/explorer/home-hero.tsx`, `destination-grid.tsx`, `tour-list.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `destinations`, `phuQuoc`, `toursForDestination`, `Section`, `CARD_CLASS`, `ExplorerShell`, `formatVnd`, `formatShortDate`, `formatRating`.
- Produces: `TourList({ tours: Tour[]; hotline: string; limit?: number })` (dùng lại ở Task 9); `DestinationGrid({ items: DestinationSummary[] })`; `HomeHero()`.

- [ ] **Step 1: Tạo `src/components/explorer/tour-list.tsx`**

```tsx
import Image from "next/image"
import { PhoneIcon, StarIcon } from "lucide-react"

import { CARD_CLASS } from "@/components/explorer/section"
import { CtaLink } from "@/components/explorer/cta-link"
import { formatRating, formatShortDate, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface TourListProps {
  tours: Tour[]
  hotline: string
  limit?: number
}

function TourItem({ tour }: { tour: Tour }): React.JSX.Element {
  const price = tour.deal?.priceVnd ?? tour.priceVnd
  const dates = (tour.deal ? [tour.deal.departureDate] : tour.departureDates).slice(0, 3).map(formatShortDate)
  const rating = formatRating(tour.rating)

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={tour.imageUrl} alt={tour.name} fill sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className="object-cover" />
        {tour.deal && (
          <span className="absolute top-3 right-3 rounded-full bg-sale px-2.5 py-0.5 text-xs font-extrabold text-white">
            -{Math.round((1 - tour.deal.priceVnd / tour.deal.originalPriceVnd) * 100)}%
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-ocean">
          {tour.days} ngày {tour.nights} đêm
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-extrabold">{tour.name}</h3>
        <p className="text-sm text-muted-foreground">
          Khởi hành từ {tour.departureCity} · {tour.transport}
          {rating && (
            <span className="ml-2 inline-flex items-center gap-1 font-semibold text-ink">
              <StarIcon aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Ngày đi: </span>
          <span className="font-semibold">{dates.join(" · ")}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p>
            <span className="block text-xs text-muted-foreground">Giá từ</span>
            <span className="text-xl font-extrabold text-sale">{formatVnd(price)}</span>
            {tour.deal && <span className="ml-2 text-sm text-muted-foreground line-through">{formatVnd(tour.deal.originalPriceVnd)}</span>}
          </p>
          <CtaLink href={tour.url} className="h-10 px-4">
            Xem và đặt
          </CtaLink>
        </div>
      </div>
    </li>
  )
}

export function TourList({ tours, hotline, limit }: TourListProps): React.JSX.Element {
  const shown = limit ? tours.slice(0, limit) : tours

  if (shown.length === 0) {
    return (
      <div className={cn(CARD_CLASS, "flex flex-col items-center gap-3 text-center")}>
        <p className="font-semibold">Hiện chưa có lịch khởi hành sắp tới trên hệ thống.</p>
        <p className="text-sm text-muted-foreground">Tư vấn viên Vietravel sẽ giúp Quý khách chọn lịch trình phù hợp.</p>
        <a
          href={`tel:${hotline.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ocean px-5 text-sm font-semibold text-white"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          Gọi {hotline}
        </a>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((tour) => (
        <TourItem key={tour.code} tour={tour} />
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/destination-grid.tsx`**

```tsx
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import type { DestinationSummary } from "@/types/destination"

function TileBody({ destination }: { destination: DestinationSummary }): React.JSX.Element {
  return (
    <>
      <Image
        src={destination.imageUrl}
        alt={destination.name}
        fill
        sizes="(min-width:1024px) 280px, 50vw"
        className={cn("object-cover transition-transform duration-700 ease-soft", destination.active && "group-hover:scale-105")}
      />
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
      {!destination.active && (
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
          Sắp ra mắt
        </span>
      )}
      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-lg font-extrabold">{destination.name}</p>
        <p className="text-xs text-white/85">{destination.caption}</p>
      </div>
    </>
  )
}

const TILE = "group relative block aspect-[4/5] overflow-hidden rounded-3xl"

export function DestinationGrid({ items }: { items: DestinationSummary[] }): React.JSX.Element {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((destination) => (
        <li key={destination.slug}>
          {destination.active ? (
            <Link href={`/diem-den/${destination.slug}`} className={cn(TILE, "shadow-[0_24px_44px_-24px_rgba(0,70,193,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
              <TileBody destination={destination} />
            </Link>
          ) : (
            <div aria-disabled="true" className={cn(TILE, "opacity-70 grayscale")}>
              <TileBody destination={destination} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 3: Tạo `src/components/explorer/home-hero.tsx`**

```tsx
import Image from "next/image"
import Link from "next/link"

import { phuQuoc } from "@/data/destinations/phu-quoc"

const MOODS = [
  { label: "Nghỉ dưỡng biển", href: "/diem-den/phu-quoc#luu-tru" },
  { label: "Vui chơi gia đình", href: "/diem-den/phu-quoc#vui-choi" },
  { label: "Ăn ngon", href: "/diem-den/phu-quoc#an-uong" },
  { label: "Tour giá tốt", href: "/diem-den/phu-quoc#tour" },
]

export function HomeHero(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
      <div className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:min-h-[36rem] lg:p-14">
        <Image src={phuQuoc.heroImageUrl} alt="Bãi Sao, Phú Quốc" fill priority sizes="(min-width:1152px) 1152px, 100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/30 to-ink/5" />
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Điểm đến tháng này</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">Chuyến đi tiếp theo của bạn bắt đầu từ đây</h1>
        <p className="mt-4 max-w-xl text-lg text-white/85">
          Biển xanh, hoàng hôn và những món ngon đang chờ ở Phú Quốc. Xem thời tiết, nơi ở, lịch trình gợi ý, rồi đặt tour ngay cùng Vietravel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/diem-den/phu-quoc"
            className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-bold text-ocean outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            Khám phá Phú Quốc
          </Link>
          <Link
            href="/#diem-den"
            className="inline-flex h-12 items-center rounded-full bg-white/10 px-6 text-sm font-bold text-white ring-1 ring-white/50 backdrop-blur"
          >
            Xem tất cả điểm đến
          </Link>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <li key={mood.label}>
            <Link
              href={mood.href}
              className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-ocean ring-1 ring-ocean/15 transition-colors hover:bg-cloud/60"
            >
              {mood.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: Thay `src/app/page.tsx`**

```tsx
import { DestinationGrid } from "@/components/explorer/destination-grid"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { HomeHero } from "@/components/explorer/home-hero"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { company } from "@/config/company"
import { destinations } from "@/data/destinations"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"

export const revalidate = 1800

const WHY = [
  { title: `Từ năm ${company.founded}`, text: "Hơn ba thập kỷ tổ chức tour trong nước và quốc tế, mạng lưới chi nhánh và hướng dẫn viên khắp nơi." },
  { title: "Tour và dịch vụ lẻ", text: "Tour trọn gói, khách sạn, vé máy bay, combo: chọn đúng thứ Quý khách cần." },
  { title: "Hỗ trợ tận tâm", text: `Tư vấn viên luôn sẵn sàng qua tổng đài ${company.hotline}.` },
]

export default function HomePage(): React.JSX.Element {
  const tours = toursForDestination(phuQuoc)

  return (
    <ExplorerShell>
      <HomeHero />
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Section id="diem-den" eyebrow="Khám phá" title="Điểm đến cho chuyến đi sắp tới" intro="Hiện bản demo mở sẵn Phú Quốc. Các điểm đến khác sẽ lần lượt ra mắt.">
          <DestinationGrid items={destinations} />
        </Section>
        <Section id="tour-noi-bat" eyebrow="Ưu đãi" title="Tour Phú Quốc đang mở bán" intro="Giá và ngày khởi hành lấy từ travel.com.vn.">
          <TourList tours={tours} limit={3} hotline={company.hotline} />
        </Section>
        <Section id="vi-sao" eyebrow={company.brand} title="Vì sao đi cùng Vietravel">
          <ul className="grid gap-4 md:grid-cols-3">
            {WHY.map((item) => (
              <li key={item.title} className={CARD_CLASS}>
                <h3 className="font-extrabold text-ocean">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </ExplorerShell>
  )
}
```

- [ ] **Step 5: Type check, lint, commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không lỗi (cảnh báo có sẵn từ trước thì bỏ qua).

```bash
git add src/components/explorer/home-hero.tsx src/components/explorer/destination-grid.tsx src/components/explorer/tour-list.tsx src/app/page.tsx
git commit -m "feat: trang Home Explorer với lưới điểm đến và tour Phú Quốc" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Trang điểm đến: route, hero, anchor nav, thời tiết

**Files:**
- Create: `src/app/diem-den/[slug]/page.tsx`
- Create: `src/components/explorer/destination-hero.tsx`, `anchor-nav.tsx`, `season-chart.tsx`, `weather-block.tsx`

**Interfaces:**
- Consumes: `getGuide`, `fetchWeather`, `describeWeather`, `Section`, `CtaLink`, `ExplorerShell`.
- Produces: `DestinationHero({ guide })`; `AnchorNav()` (mục: `thoi-tiet`, `di-chuyen`, `luu-tru`, `an-uong`, `vui-choi`, `lich-trinh`, `chi-phi`, `review`, `tour`, `faq`); `SeasonChart({ months, currentIndex })`; `WeatherBlock({ guide })` (async). Trang này sẽ được bổ sung các khối còn lại ở Task 7–9.

- [ ] **Step 1: Tạo `src/components/explorer/destination-hero.tsx`**

```tsx
import Image from "next/image"

import { CtaLink } from "@/components/explorer/cta-link"
import { CARD_CLASS } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function DestinationHero({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
        <div className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:min-h-[34rem] lg:p-14">
          <Image src={guide.heroImageUrl} alt={guide.name} fill priority sizes="(min-width:1152px) 1152px, 100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/30 to-ink/5" />
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Điểm đến</p>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-7xl">{guide.name}</h1>
          <p className="mt-3 max-w-2xl text-xl font-semibold text-white/95">{guide.tagline}</p>
          <p className="mt-3 max-w-2xl text-white/80">{guide.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#tour"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-ocean outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              Xem tour {guide.name}
            </a>
            <CtaLink href={guide.links.hotels} variant="outline">
              Khách sạn {guide.name}
            </CtaLink>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-6 lg:px-6" aria-labelledby="ly-do">
        <h2 id="ly-do" className="sr-only">
          {guide.reasons.length} lý do nên đến {guide.name}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {guide.reasons.map((reason, index) => (
            <li key={reason.title} className={`${CARD_CLASS} p-4`}>
              <span className="text-xs font-extrabold text-sunset">0{index + 1}</span>
              <h3 className="mt-1 font-extrabold">{reason.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{reason.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/anchor-nav.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const ITEMS = [
  { id: "thoi-tiet", label: "Thời tiết" },
  { id: "di-chuyen", label: "Di chuyển" },
  { id: "luu-tru", label: "Lưu trú" },
  { id: "an-uong", label: "Ăn uống" },
  { id: "vui-choi", label: "Vui chơi" },
  { id: "lich-trinh", label: "Lịch trình" },
  { id: "chi-phi", label: "Chi phí" },
  { id: "review", label: "Review" },
  { id: "tour", label: "Tour" },
  { id: "faq", label: "Hỏi đáp" },
]

export function AnchorNav(): React.JSX.Element {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: "-25% 0px -65% 0px" },
    )
    for (const { id } of ITEMS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="Mục trong trang" className="sticky top-[76px] z-20 mt-6 px-3 lg:px-5">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto rounded-full bg-white/85 p-1.5 shadow-[0_12px_30px_-20px_rgba(0,70,193,0.45)] ring-1 ring-ocean/10 backdrop-blur-xl [scrollbar-width:none]">
        {ITEMS.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3.5 text-sm font-semibold transition-colors",
                active === item.id ? "bg-ocean text-white" : "text-ink/75 hover:bg-cloud/60",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 3: Tạo `src/components/explorer/season-chart.tsx`**

```tsx
import { cn } from "@/lib/utils"
import type { MonthInfo } from "@/types/destination"

interface SeasonChartProps {
  months: MonthInfo[]
  currentIndex: number
}

export function SeasonChart({ months, currentIndex }: SeasonChartProps): React.JSX.Element {
  return (
    <div>
      <div role="img" aria-label="Mức độ thuận lợi của thời tiết theo từng tháng" className="flex h-44 items-end gap-1.5">
        {months.map((month, index) => (
          <div key={month.label} title={`${month.label}: ${month.advice}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              style={{ height: `${month.score * 17}%` }}
              className={cn(
                "w-full rounded-t-lg",
                month.score >= 4 ? "bg-sunset" : month.score === 3 ? "bg-sunset/50" : "bg-ocean/20",
                index === currentIndex && "ring-2 ring-ocean ring-offset-2",
              )}
            />
            <span className={cn("text-[11px] font-semibold", index === currentIndex ? "text-ocean" : "text-muted-foreground")}>{month.label}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sunset" />Đẹp nhất</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sunset/50" />Khá thuận lợi</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ocean/20" />Mùa mưa, giá thấp</li>
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Tạo `src/components/explorer/weather-block.tsx`**

```tsx
import { CloudIcon, CloudLightningIcon, CloudRainIcon, DropletsIcon, SunIcon } from "lucide-react"

import { SeasonChart } from "@/components/explorer/season-chart"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import { formatShortDate } from "@/lib/format"
import { describeWeather, fetchWeather, type WeatherKind } from "@/lib/weather"
import type { DestinationGuide } from "@/types/destination"

const ICON: Record<WeatherKind, typeof SunIcon> = {
  clear: SunIcon,
  cloudy: CloudIcon,
  rain: CloudRainIcon,
  storm: CloudLightningIcon,
}

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

function weekday(isoDate: string): string {
  return WEEKDAY[new Date(`${isoDate}T00:00:00`).getDay()]
}

export async function WeatherBlock({ guide }: { guide: DestinationGuide }): Promise<React.JSX.Element> {
  const weather = await fetchWeather(guide.coordinates.lat, guide.coordinates.lon)
  const monthIndex = new Date().getMonth()
  const month = guide.months[monthIndex]
  const now = weather ? describeWeather(weather.code) : null
  const NowIcon = now ? ICON[now.kind] : SunIcon

  return (
    <Section id="thoi-tiet" eyebrow="Thời tiết" title={`Khi nào đi ${guide.name} là đẹp nhất?`} intro="Xem thời tiết hiện tại và mùa đẹp trong năm để chọn đúng thời điểm.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className={CARD_CLASS}>
          {weather && now ? (
            <>
              <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Hiện tại ở {guide.name}</p>
              <div className="mt-3 flex items-center gap-4">
                <NowIcon aria-hidden strokeWidth={1.5} className="size-14 text-sunset" />
                <div>
                  <p className="text-5xl font-extrabold">{Math.round(weather.tempC)}°C</p>
                  <p className="font-semibold">{now.label}</p>
                </div>
                <p className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
                  <DropletsIcon aria-hidden strokeWidth={1.5} className="size-4" />
                  Độ ẩm {weather.humidity}%
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-4 gap-2">
                {weather.forecast.map((day) => {
                  const Icon = ICON[describeWeather(day.code).kind]
                  return (
                    <li key={day.date} className="rounded-2xl bg-cloud/40 p-2.5 text-center">
                      <p className="text-xs font-bold">{weekday(day.date)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatShortDate(day.date)}</p>
                      <Icon aria-hidden strokeWidth={1.5} className="mx-auto my-1.5 size-6 text-ocean" />
                      <p className="text-sm font-bold">{Math.round(day.maxC)}°</p>
                      <p className="text-xs text-muted-foreground">{Math.round(day.minC)}°</p>
                      <p className="mt-1 text-[11px] font-semibold text-ocean">{day.rainPct}% mưa</p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">Nguồn: Open-Meteo, cập nhật mỗi 30 phút.</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Khí hậu {month.label} ở {guide.name}</p>
              <p className="mt-3 text-4xl font-extrabold">{month.tempC}</p>
              <p className="mt-1 font-semibold">{month.rain}</p>
              <p className="mt-3 text-sm text-muted-foreground">Chưa lấy được thời tiết trực tiếp, đây là số liệu khí hậu trung bình của tháng.</p>
            </>
          )}
        </div>
        <div className={CARD_CLASS}>
          <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Mùa đẹp trong năm</p>
          <div className="mt-4">
            <SeasonChart months={guide.months} currentIndex={monthIndex} />
          </div>
          <div className="mt-5 rounded-2xl bg-cloud/50 p-4">
            <p className="text-sm font-bold">Tháng này ({month.label}) đi có hợp không?</p>
            <p className="mt-1 text-sm text-ink/80">{month.advice}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 5: Tạo `src/app/diem-den/[slug]/page.tsx` (bản đầu, bổ sung khối ở Task 7–9)**

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AnchorNav } from "@/components/explorer/anchor-nav"
import { DestinationHero } from "@/components/explorer/destination-hero"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { WeatherBlock } from "@/components/explorer/weather-block"
import { destinations, getGuide } from "@/data/destinations"

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return destinations.filter((destination) => destination.active).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getGuide((await params).slug)
  if (!guide) return {}
  return { title: `${guide.name} · Vietravel Explorer`, description: guide.intro }
}

export default async function DestinationPage({ params }: PageProps): Promise<React.JSX.Element> {
  const guide = getGuide((await params).slug)
  if (!guide) notFound()

  return (
    <ExplorerShell>
      <DestinationHero guide={guide} />
      <AnchorNav />
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <WeatherBlock guide={guide} />
      </div>
    </ExplorerShell>
  )
}
```

- [ ] **Step 6: Type check và commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không lỗi.

```bash
git add src/app/diem-den src/components/explorer/destination-hero.tsx src/components/explorer/anchor-nav.tsx src/components/explorer/season-chart.tsx src/components/explorer/weather-block.tsx
git commit -m "feat: trang điểm đến với hero, thời tiết thật và biểu đồ mùa" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Khối di chuyển, lưu trú, ăn uống, vui chơi

**Files:**
- Create: `src/components/explorer/getting-there.tsx`, `place-grid.tsx`, `stay-block.tsx`, `play-block.tsx`, `eat-block.tsx`
- Modify: `src/app/diem-den/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Section`, `CARD_CLASS`, `CtaLink`, `Place`, `AUDIENCE_LABEL`, `DestinationGuide`.
- Produces: `GettingThere({ guide })`, `StayBlock({ guide })`, `EatBlock({ guide })`, `PlayBlock({ guide })`; client `PlaceGrid({ items: Place[] })`.

- [ ] **Step 1: Tạo `src/components/explorer/place-grid.tsx` (client)**

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { LightbulbIcon } from "lucide-react"

import { AUDIENCE_LABEL, type Audience, type Place } from "@/types/destination"
import { cn } from "@/lib/utils"

type Filter = Audience | "all"

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  ...(Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => ({ value, label: AUDIENCE_LABEL[value] })),
]

export function PlaceGrid({ items }: { items: Place[] }): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>("all")
  const visible = filter === "all" ? items : items.filter((item) => item.audiences.includes(filter))

  return (
    <div>
      <div role="group" aria-label="Lọc theo nhóm đi cùng" className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-semibold ring-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === option.value ? "bg-ocean text-white ring-ocean" : "bg-white text-ocean ring-ocean/20 hover:bg-cloud/60",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((place) => (
          <li key={place.name} className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            {place.imageUrl && (
              <div className="relative aspect-[16/10]">
                <Image src={place.imageUrl} alt={place.name} fill sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <p className="text-xs font-semibold text-sunset">{place.tag}</p>
              <h3 className="font-extrabold">{place.name}</h3>
              <p className="text-sm text-muted-foreground">{place.blurb}</p>
              {place.tip && (
                <p className="flex gap-2 rounded-2xl bg-cloud/50 p-3 text-xs text-ink/80">
                  <LightbulbIcon aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-ocean" />
                  {place.tip}
                </p>
              )}
              <p className="mt-auto pt-1 text-xs text-muted-foreground">Phù hợp: {place.audiences.map((audience) => AUDIENCE_LABEL[audience]).join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/getting-there.tsx`**

```tsx
import { PlaneIcon, ShipIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function GettingThere({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="di-chuyen" eyebrow="Di chuyển" title={`Đến ${guide.name} bằng cách nào?`} intro="Thời lượng là ước tính tham khảo. Lịch bay và giá vé thay đổi theo ngày, Quý khách kiểm tra khi đặt.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guide.routes.map((route) => {
          const Icon = route.mode === "Tàu cao tốc" ? ShipIcon : PlaneIcon
          return (
            <li key={route.from} className={CARD_CLASS}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-cloud/60 text-ocean">
                  <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                </span>
                <div>
                  <p className="font-extrabold">{route.from}</p>
                  <p className="text-sm text-muted-foreground">
                    {route.mode} · {route.duration}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink/80">{route.note}</p>
            </li>
          )
        })}
      </ul>
      <h3 className="mt-8 text-lg font-extrabold">Di chuyển trên đảo</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {guide.onIsland.map((item) => (
          <li key={item.name} className="rounded-2xl bg-white/70 p-4 ring-1 ring-ocean/10">
            <p className="font-bold">{item.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <CtaLink href={guide.links.flights}>Xem vé máy bay tại Vietravel</CtaLink>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Tạo `src/components/explorer/stay-block.tsx`**

```tsx
import { CtaLink } from "@/components/explorer/cta-link"
import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function StayBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="luu-tru" eyebrow="Lưu trú" title="Ở đâu cho kỳ nghỉ của bạn?" intro="Chọn khu vực theo kiểu chuyến đi, rồi lọc loại hình lưu trú theo người đi cùng.">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {guide.areas.map((area) => (
          <li key={area.name} className="rounded-2xl bg-cloud/40 p-4">
            <p className="font-extrabold text-ocean">{area.name}</p>
            <p className="mt-1 text-sm text-ink/80">{area.blurb}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <PlaceGrid items={guide.stays} />
      </div>
      <div className="mt-6">
        <CtaLink href={guide.links.hotels}>Xem khách sạn {guide.name} tại Vietravel</CtaLink>
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: Tạo `src/components/explorer/play-block.tsx`**

```tsx
import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function PlayBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="vui-choi" eyebrow="Vui chơi" title={`Đến ${guide.name} làm gì?`} intro="Từ biển, cáp treo đến khu vui chơi và chợ đêm. Lọc theo người đi cùng để chọn đúng điểm.">
      <PlaceGrid items={guide.activities} />
    </Section>
  )
}
```

- [ ] **Step 5: Tạo `src/components/explorer/eat-block.tsx`**

```tsx
import { MapPinIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function EatBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="an-uong" eyebrow="Ăn uống" title="Những món phải thử" intro="Hải sản tươi và đặc sản địa phương, giá nên hỏi trước khi gọi món.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guide.dishes.map((dish) => (
          <li key={dish.name} className={CARD_CLASS}>
            <h3 className="font-extrabold">{dish.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{dish.blurb}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ocean">
              <MapPinIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
              {dish.where}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
```

- [ ] **Step 6: Thêm 4 khối vào `src/app/diem-den/[slug]/page.tsx`**

Thêm import và thay phần trong `<div className="mx-auto max-w-6xl ...">`:

```tsx
import { EatBlock } from "@/components/explorer/eat-block"
import { GettingThere } from "@/components/explorer/getting-there"
import { PlayBlock } from "@/components/explorer/play-block"
import { StayBlock } from "@/components/explorer/stay-block"
```

```tsx
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <WeatherBlock guide={guide} />
        <GettingThere guide={guide} />
        <StayBlock guide={guide} />
        <EatBlock guide={guide} />
        <PlayBlock guide={guide} />
      </div>
```

- [ ] **Step 7: Type check, lint, commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không lỗi.

```bash
git add src/components/explorer/getting-there.tsx src/components/explorer/place-grid.tsx src/components/explorer/stay-block.tsx src/components/explorer/play-block.tsx src/components/explorer/eat-block.tsx "src/app/diem-den/[slug]/page.tsx"
git commit -m "feat: khối di chuyển, lưu trú, ăn uống, vui chơi cho trang điểm đến" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Lịch trình, chi phí, review

**Files:**
- Create: `src/components/explorer/itinerary.tsx`, `cost-checklist.tsx`, `reviews.tsx`
- Modify: `src/app/diem-den/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Section`, `CARD_CLASS`, `formatVnd`, `Tour`.
- Produces: `Itinerary({ guide })`; `CostChecklist({ guide, minTourPriceVnd })` với `minTourPriceVnd: number | null`; `Reviews({ guide })`.

- [ ] **Step 1: Tạo `src/components/explorer/itinerary.tsx`**

```tsx
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Itinerary({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="lich-trinh" eyebrow="Lịch trình" title={`${guide.name} ${guide.itinerary.length} ngày ${guide.itinerary.length - 1} đêm`} intro="Gợi ý lịch trình để Quý khách hình dung chuyến đi. Có thể thay đổi theo thời tiết và sở thích.">
      <ol className="grid gap-4 lg:grid-cols-3">
        {guide.itinerary.map((day) => (
          <li key={day.day} className="rounded-3xl bg-white p-5 ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            <p className="text-xs font-extrabold tracking-[0.15em] text-sunset uppercase">Ngày {day.day}</p>
            <h3 className="mt-1 text-lg font-extrabold">{day.title}</h3>
            <ul className="mt-4 space-y-3 border-l-2 border-cloud pl-4">
              {day.items.map((item) => (
                <li key={`${item.time}-${item.text}`} className="relative">
                  <span aria-hidden className="absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full bg-ocean" />
                  <p className="text-xs font-bold text-ocean">{item.time}</p>
                  <p className="text-sm text-ink/85">{item.text}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/cost-checklist.tsx`**

```tsx
import { CheckIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import { formatVnd } from "@/lib/format"
import type { DestinationGuide } from "@/types/destination"

interface CostChecklistProps {
  guide: DestinationGuide
  /** Giá tour thấp nhất đang mở bán; null nếu không có tour. */
  minTourPriceVnd: number | null
}

export function CostChecklist({ guide, minTourPriceVnd }: CostChecklistProps): React.JSX.Element {
  return (
    <Section id="chi-phi" eyebrow="Chi phí và chuẩn bị" title="Ngân sách và đồ cần mang" intro="Số liệu mang tính ước tính tham khảo cho một chuyến 3 ngày 2 đêm, không phải giá thời gian thực.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={CARD_CLASS}>
          <h3 className="font-extrabold">Chi phí ước tính</h3>
          <dl className="mt-4 divide-y divide-ocean/10">
            {guide.costs.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-semibold">{row.range}</dd>
              </div>
            ))}
          </dl>
          {minTourPriceVnd !== null && (
            <p className="mt-4 rounded-2xl bg-cloud/50 p-4 text-sm">
              <span className="font-bold text-ocean">Đi tour trọn gói từ {formatVnd(minTourPriceVnd)}/khách</span>
              <span className="text-ink/80">, theo chương trình, đã gồm các hạng mục ghi trong từng tour (vé bay, lưu trú, tham quan).</span>
            </p>
          )}
        </div>
        <div className={CARD_CLASS}>
          <h3 className="font-extrabold">Checklist mang theo</h3>
          <ul className="mt-4 space-y-2.5">
            {guide.packing.map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <CheckIcon aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-sunset" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Tạo `src/components/explorer/reviews.tsx`**

```tsx
import { StarIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Reviews({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="review" eyebrow="Review" title="Người đã đi nói gì?" intro="Review mẫu cho bản demo, minh họa cách Explorer hiển thị trải nghiệm thật của khách.">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guide.reviews.map((review) => (
          <li key={review.nick} className={CARD_CLASS}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold">{review.nick}</p>
              <p role="img" aria-label={`${review.rating} trên 5 sao`} className="flex">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon key={index} aria-hidden className={index < review.rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-ocean/20"} />
                ))}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{review.trip}</p>
            <p className="mt-3 text-sm text-ink/85">{review.text}</p>
            <p className="mt-4 text-[11px] font-semibold text-sunset">Review mẫu cho bản demo</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
```

- [ ] **Step 4: Thêm vào trang `src/app/diem-den/[slug]/page.tsx`**

Thêm import:

```tsx
import { CostChecklist } from "@/components/explorer/cost-checklist"
import { Itinerary } from "@/components/explorer/itinerary"
import { Reviews } from "@/components/explorer/reviews"
import { toursForDestination } from "@/lib/destination-tours"
```

Trong `DestinationPage`, sau dòng `if (!guide) notFound()` thêm:

```tsx
  const tours = toursForDestination(guide)
```

Trong `<div className="mx-auto ...">`, sau `<PlayBlock guide={guide} />` thêm:

```tsx
        <Itinerary guide={guide} />
        <CostChecklist guide={guide} minTourPriceVnd={tours[0]?.priceVnd ?? null} />
        <Reviews guide={guide} />
```

- [ ] **Step 5: Type check, lint, commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không lỗi.

```bash
git add src/components/explorer/itinerary.tsx src/components/explorer/cost-checklist.tsx src/components/explorer/reviews.tsx "src/app/diem-den/[slug]/page.tsx"
git commit -m "feat: lịch trình, chi phí ước tính và review mẫu" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Tour, FAQ, CTA cuối trang

**Files:**
- Create: `src/components/explorer/faq.tsx`, `final-cta.tsx`
- Modify: `src/app/diem-den/[slug]/page.tsx`

**Interfaces:**
- Consumes: `TourList`, `Section`, `CtaLink`, `company`, `tours` đã tính ở Task 8.
- Produces: `Faq({ guide })`; `FinalCta({ guide })`.

- [ ] **Step 1: Tạo `src/components/explorer/faq.tsx`**

```tsx
import { ChevronDownIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Faq({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="faq" eyebrow="Hỏi đáp" title="Những câu hỏi thường gặp">
      <div className="space-y-3">
        {guide.faqs.map((item) => (
          <details key={item.question} className="group rounded-2xl bg-white p-5 ring-1 ring-ocean/10 open:shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item.question}
              <ChevronDownIcon aria-hidden strokeWidth={1.5} className="size-5 shrink-0 text-ocean transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-ink/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Tạo `src/components/explorer/final-cta.tsx`**

```tsx
import { PhoneIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { company } from "@/config/company"
import type { DestinationGuide } from "@/types/destination"

export function FinalCta({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <section className="py-10 lg:py-14">
      <div className="flex flex-col items-start gap-5 rounded-[2rem] bg-ocean p-8 text-white sm:p-12">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Sẵn sàng cho chuyến đi {guide.name}?</h2>
        <p className="max-w-xl text-white/85">Chọn tour trọn gói hoặc đặt riêng khách sạn, vé máy bay. Tư vấn viên Vietravel luôn sẵn sàng hỗ trợ.</p>
        <div className="flex flex-wrap gap-3">
          <CtaLink href={guide.links.tours} variant="light">
            Đặt tour {guide.name}
          </CtaLink>
          <a
            href={`tel:${company.hotline.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-white/50"
          >
            <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
            {company.hotline}
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Hoàn thiện trang `src/app/diem-den/[slug]/page.tsx`**

Thêm import:

```tsx
import { Faq } from "@/components/explorer/faq"
import { FinalCta } from "@/components/explorer/final-cta"
import { Section } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { company } from "@/config/company"
```

Sau `<Reviews guide={guide} />` thêm:

```tsx
        <Section id="tour" eyebrow="Đặt tour" title={`Tour ${guide.name} đang mở bán`} intro="Giá và ngày khởi hành lấy từ travel.com.vn. Bấm Xem và đặt để chuyển sang trang tour của Vietravel.">
          <TourList tours={tours} hotline={company.hotline} />
        </Section>
        <Faq guide={guide} />
        <FinalCta guide={guide} />
```

- [ ] **Step 4: Type check, lint, commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: không lỗi.

```bash
git add src/components/explorer/faq.tsx src/components/explorer/final-cta.tsx "src/app/diem-den/[slug]/page.tsx"
git commit -m "feat: danh sách tour, hỏi đáp và CTA cuối trang điểm đến" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Kiểm tra toàn bộ

**Files:** không tạo file mới; sửa lỗi phát hiện được (nếu có).

- [ ] **Step 1: Chạy toàn bộ test**

Run: `for f in src/lib/format.test.ts src/lib/weather.test.ts src/data/destinations/destinations.test.ts src/lib/tour-matching.test.ts; do npx tsx $f || break; done`
Expected: tất cả in `OK` (hoặc không lỗi), không có assertion fail.

- [ ] **Step 2: Lint và build**

Run: `pnpm lint && pnpm build`
Expected: build thành công; route list có `/`, `/diem-den/[slug]` (prerender `phu-quoc`), `/tripi`.

- [ ] **Step 3: Chạy dev server**

Run (nền): `pnpm dev`
Mở `http://localhost:3000`, đăng nhập bằng `DEMO_PASSWORD` trong `.env.local`.

- [ ] **Step 4: Kiểm tra bằng trình duyệt (desktop 1440px)**

Kiểm tra từng mục, sửa nếu sai:
1. `/`: hero Phú Quốc hiện ảnh, lưới 8 ô (Phú Quốc bấm được, 7 ô còn lại mờ, nhãn "Sắp ra mắt"), 3 tour Phú Quốc có giá, nút "Hỏi Tripi" ở góc phải dưới.
2. Bấm "Khám phá Phú Quốc" → `/diem-den/phu-quoc`: đủ khối thời tiết, di chuyển, lưu trú, ăn uống, vui chơi, lịch trình, chi phí, review, tour, hỏi đáp, CTA. Thanh anchor dính và đổi mục sáng khi cuộn.
3. Thời tiết: có nhiệt độ hiện tại + dự báo 4 ngày; biểu đồ 12 tháng đánh dấu tháng hiện tại.
4. Bộ lọc "Gia đình / Cặp đôi / Bạn bè" ở Lưu trú và Vui chơi lọc đúng, không lỗi console.
5. Mọi nút "Xem và đặt", "Khách sạn", "Vé máy bay", "Đặt tour" mở tab mới tới `travel.com.vn`.
6. `/tripi`: chat hoạt động như cũ; nút "Khám phá điểm đến" không đè lên giao diện chat (nếu đè thì đổi `bottom-4 left-4` trong `src/app/tripi/page.tsx` sang vị trí khác).
7. Console không có lỗi `next/image` (host không hợp lệ) hay hydration.

- [ ] **Step 5: Kiểm tra 404 và mobile**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -b "demo_auth=$(printf %s "$DEMO_PASSWORD" | shasum -a 256 | cut -d' ' -f1)" http://localhost:3000/diem-den/da-nang`
Expected: `404` (cũng thử `/diem-den/constructor` → `404`).

Resize trình duyệt 375px: trang `/` và `/diem-den/phu-quoc` không có thanh cuộn ngang (chạy trong console: `document.documentElement.scrollWidth <= window.innerWidth` phải là `true`); thanh anchor cuộn ngang bên trong, nút Tripi không che nội dung chính.

- [ ] **Step 6: Thử nhánh thời tiết lỗi**

Tạm đổi host trong URL của `fetchWeather` (`api.open-meteo.com` → `api.open-meteo.invalid`), tải lại `/diem-den/phu-quoc`, xác nhận khối thời tiết hiện "Khí hậu T… ở Phú Quốc" + số liệu tháng, trang không lỗi. **Hoàn lại URL ngay sau đó.**

Run: `git diff src/lib/weather.ts`
Expected: không có thay đổi.

- [ ] **Step 7: Commit sửa lỗi (nếu có)**

```bash
git add <các file đã sửa>
git commit -m "fix: chỉnh giao diện Explorer sau kiểm tra" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage:** routes (T1, T5, T6, T9), Home 6 mục (T5: header T4, hero, chip mood, lưới, why, tour+footer), 11 khối chi tiết (T6 hero+thời tiết; T7 di chuyển/lưu trú/ăn uống/vui chơi; T8 lịch trình/chi phí/review; T9 tour/FAQ/CTA), dữ liệu + ảnh + link (T2), thời tiết + dự phòng (T3, T6), SEO tối giản (T4 layout, T6 `generateMetadata`), test (T2, T3, T10). Khác spec: không tham chiếu mã tour cố định, tour lọc động theo từ khóa nên test kiểm tra lọc thay cho kiểm tra mã.
- **Placeholder scan:** không có TBD/TODO; mọi bước có code đầy đủ.
- **Type consistency:** `toursForDestination(guide, today?)`, `getGuide`, `TourList({tours, hotline, limit})`, `CostChecklist({guide, minTourPriceVnd})`, `PlaceGrid({items})`, `SeasonChart({months, currentIndex})` thống nhất giữa các task. `Section`/`CARD_CLASS` export từ `section.tsx` dùng nhất quán.
- **Review Focus:** mỗi dòng có chỗ kiểm tra (thời tiết hỏng: T3 test + T10 bước 6; slug lạ: T2 test + T10 bước 5; hết tour: T2 test + `TourList` nhánh rỗng; rating null: T2 test `formatRating`; host ảnh và tràn ngang: T2 test + T10 bước 5).
