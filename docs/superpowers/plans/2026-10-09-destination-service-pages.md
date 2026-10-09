# Trang dịch vụ theo loại tại điểm đến — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm trang `/diem-den/[slug]/[kind]` (vd `/diem-den/phu-quoc/ve-may-bay`) gồm cẩm nang + danh sách dịch vụ có lọc/sắp xếp/thêm vào kế hoạch, và khối "Dịch vụ tại …" trên trang điểm đến.

**Architecture:** Logic thuần (ánh xạ slug, thống kê giá, chip, lọc/sắp xếp) ở `src/lib/service-listing.ts`, có test `node:assert`. Dữ liệu dịch vụ = `getServices` (mock + hoạt động + tour) nối `getPartnerServices` (đối tác đã duyệt), gom ở `src/lib/destination-services.ts`. Trang server component tái dùng khối guide có sẵn; phần danh sách là một client component.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind 4, TypeScript, `npx tsx` + `node:assert` cho test.

**Spec:** [docs/superpowers/specs/2026-10-09-destination-service-pages-design.md](../specs/2026-10-09-destination-service-pages-design.md)

## Global Constraints

- Mọi chữ hiển thị, comment, nội dung bằng tiếng Việt; xưng khách là "Quý khách".
- Slug loại: `khach-san, ve-may-bay, thue-xe, vui-choi, an-uong, dac-san, tour` ⇄ `hotel, flight, vehicle, activity, dining, souvenir, tour`.
- Trang loại: `revalidate = 1800`, `generateStaticParams` cho mọi điểm đến active × 7 loại, slug sai → `notFound()`.
- Không thêm dependency. Dùng lại `AddToPlanButton`, `ServiceSearch`, `priceLabel`, `formatVnd`, `Section`, `Faq`, `KIND_ICON`, `SERVICE_KIND_LABEL`.
- Không đụng các file đang sửa dở chưa commit trong nhánh (`src/lib/partners/*`, `src/components/partner/*`, `src/services/partner.service.ts`, `src/app/api/partners/[id]/route.ts`) ngoài phần được ghi trong task. Khi commit chỉ `git add` đúng file của task.

## Review Focus

1. Store đối tác lỗi (file hỏng, Redis không kết nối) → trang loại và trang điểm đến vẫn hiện, chỉ thiếu dịch vụ đối tác. Test: Task 2 kiểm `destinationServices` với loader ném lỗi.
2. Loại không có dịch vụ (vd `dac-san` khi chưa có đối tác đặc sản) → trang vẫn render cẩm nang + thông báo trống, không 404. Test: Task 1 `priceStats([])`; Task 5 kiểm thủ công `/diem-den/phu-quoc/dac-san`.
3. Mục giá 0 (hoạt động miễn phí như bãi biển) → không làm "Giá từ" thành 0đ, luôn xếp cuối khi sắp theo giá. Test: Task 1.
4. Slug loại lạ hoặc trùng thuộc tính Object (`constructor`, `__proto__`) → 404, không crash. Test: Task 1 `kindFromSlug`.
5. Tag không có " · " hoặc đối tác thiếu đoạn phân khúc → `chipOf` trả về giá trị hợp lệ hoặc `undefined`, không ra chip rỗng. Test: Task 1.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| Create `src/lib/service-listing.ts` | Ánh xạ slug⇄kind, `matchesQuery` (chuyển từ panel), `priceStats`, `isPartnerService`, `chipOf`, `chipsOf`, `filterAndSort` |
| Create `src/lib/service-listing.test.ts` | Test các hàm trên |
| Create `src/lib/destination-services.ts` | `destinationServices(guide, loadPartners?)`: gộp catalog + đối tác, nuốt lỗi store đối tác |
| Create `src/lib/destination-services.test.ts` | Test gộp + lỗi store |
| Modify `src/components/journey/service-catalog-panel.tsx` | Bỏ định nghĩa `matchesQuery`, import từ lib |
| Modify `src/components/journey/service-picker.tsx` | Đổi import `matchesQuery` |
| Modify `src/types/destination.ts` | Thêm `ServiceGuide`, `DestinationGuide.serviceGuides?` |
| Modify `src/data/destinations/phu-quoc.ts` | Nội dung `serviceGuides` 7 loại |
| Modify `src/data/destinations/destinations.test.ts` | Kiểm nội dung `serviceGuides` |
| Modify `src/components/explorer/section.tsx` | Prop tùy chọn `moreHref` |
| Modify `src/components/explorer/{getting-there,stay-block,eat-block,play-block}.tsx` | Prop tùy chọn `moreHref` truyền vào `Section` |
| Modify `src/components/explorer/faq.tsx` | Prop tùy chọn `faqs`, `title` |
| Create `src/components/explorer/service-listing.tsx` | Client: tìm/sắp xếp/chip/lưới thẻ + `AddToPlanButton` |
| Create `src/components/explorer/service-hub.tsx` | Server: 7 ô link loại dịch vụ kèm số lượng, giá từ; dùng cả trên trang điểm đến và làm tab trên trang loại |
| Create `src/app/diem-den/[slug]/[kind]/page.tsx` | Trang loại |
| Modify `src/app/diem-den/[slug]/page.tsx` | Chèn `ServiceHub`, truyền `moreHref` |
| Modify `CLAUDE.md` | Một dòng Architecture cho trang loại |

---

### Task 1: Logic danh sách `service-listing.ts`

**Files:**
- Create: `src/lib/service-listing.ts`
- Create: `src/lib/service-listing.test.ts`
- Modify: `src/components/journey/service-catalog-panel.tsx` (xóa hàm `matchesQuery` dòng 28-31 và import `normalize`, thêm import từ lib)
- Modify: `src/components/journey/service-picker.tsx:8`

**Interfaces:**
- Consumes: `ServiceItem`, `ServiceKind`, `SERVICE_KINDS` từ `@/types/journey`; `normalize` từ `@/lib/tour-matching`. Id dịch vụ đối tác có dạng `partner-<partnerId>-<productId>` (`partnerServiceId` ở `src/lib/partners/services.ts`).
- Produces:
  - `KIND_SLUG: Record<ServiceKind, string>`
  - `kindFromSlug(slug: string): ServiceKind | undefined`
  - `matchesQuery(service: ServiceItem, query: string): boolean`
  - `priceStats(services: ServiceItem[]): { count: number; min?: ServiceItem; max?: ServiceItem }`
  - `isPartnerService(service: Pick<ServiceItem, "id">): boolean`
  - `chipOf(service: ServiceItem): string | undefined`
  - `chipsOf(services: ServiceItem[]): string[]`
  - `type ListingSort = "default" | "price-asc" | "price-desc"`
  - `interface ListingFilter { query: string; chip: string | null; partnerOnly: boolean; sort: ListingSort }`
  - `filterAndSort(services: ServiceItem[], filter: ListingFilter): ServiceItem[]`

- [ ] **Step 1: Viết test (sẽ fail)**

`src/lib/service-listing.test.ts`:

```ts
import assert from "node:assert/strict"
import { chipOf, chipsOf, filterAndSort, isPartnerService, kindFromSlug, KIND_SLUG, matchesQuery, priceStats } from "./service-listing"
import { SERVICE_KINDS, type ServiceItem } from "@/types/journey"

function item(over: Partial<ServiceItem>): ServiceItem {
  return {
    id: "x", kind: "hotel", destinationSlug: "phu-quoc", name: "Tên", tag: "Tầm trung · Dương Đông", blurb: "",
    priceVnd: 100, priceUnit: "per_room_night", bookUrl: "https://example.com", mock: true, ...over,
  }
}

// Slug ⇄ kind: đủ 7 loại, hai chiều, slug lạ hoặc trùng thuộc tính Object trả undefined.
assert.equal(new Set(Object.values(KIND_SLUG)).size, SERVICE_KINDS.length)
for (const kind of SERVICE_KINDS) assert.equal(kindFromSlug(KIND_SLUG[kind]), kind)
assert.equal(KIND_SLUG.flight, "ve-may-bay")
for (const slug of ["abc", "", "constructor", "__proto__", "hotel"]) assert.equal(kindFromSlug(slug), undefined, slug)

// Tìm kiếm không dấu, như bảng chọn cũ.
assert.ok(matchesQuery(item({ name: "Khách sạn Phố Đêm" }), "pho dem"))
assert.ok(!matchesQuery(item({ name: "Khách sạn Phố Đêm" }), "resort"))
assert.ok(matchesQuery(item({}), "  "))

// priceStats bỏ mục giá 0; danh sách rỗng không có min/max.
const free = item({ id: "free", priceVnd: 0 })
const cheap = item({ id: "cheap", priceVnd: 650_000 })
const dear = item({ id: "dear", priceVnd: 6_800_000 })
assert.deepEqual(priceStats([free, dear, cheap]), { count: 3, min: cheap, max: dear })
assert.deepEqual(priceStats([]), { count: 0, min: undefined, max: undefined })
assert.deepEqual(priceStats([free]), { count: 1, min: undefined, max: undefined })

// Đối tác nhận qua tiền tố id.
const partner = item({ id: "partner-abc-p1", tag: "Nhà Gió · Cao cấp · Bãi Trường" })
assert.ok(isPartnerService(partner))
assert.ok(!isPartnerService(cheap))

// Chip: mục thường lấy đoạn 1, đối tác lấy đoạn 2; tag rỗng/thiếu đoạn ra undefined.
assert.equal(chipOf(item({ tag: "Tiết kiệm · Ông Lang" })), "Tiết kiệm")
assert.equal(chipOf(partner), "Cao cấp")
assert.equal(chipOf(item({ tag: "" })), undefined)
assert.equal(chipOf(item({ id: "partner-a-b", tag: "Chỉ tên" })), undefined)

// chipsOf: duy nhất, theo thứ tự xuất hiện; < 2 chip thì ẩn hàng chip.
assert.deepEqual(chipsOf([item({ tag: "Tiết kiệm · A" }), item({ tag: "Cao cấp · B" }), item({ tag: "Tiết kiệm · C" })]), ["Tiết kiệm", "Cao cấp"])
assert.deepEqual(chipsOf([item({ tag: "Khứ hồi · 1 giờ" }), item({ tag: "Khứ hồi · 2 giờ" })]), [])

// filterAndSort: chip, chỉ đối tác, giá tăng/giảm với giá 0 luôn cuối, mặc định giữ thứ tự.
const all = [free, dear, cheap, partner]
const base = { query: "", chip: null, partnerOnly: false, sort: "default" as const }
assert.deepEqual(filterAndSort(all, base), all)
assert.deepEqual(filterAndSort(all, { ...base, sort: "price-asc" }).map((s) => s.id), ["partner-abc-p1", "cheap", "dear", "free"])
assert.deepEqual(filterAndSort(all, { ...base, sort: "price-desc" }).map((s) => s.id), ["dear", "cheap", "partner-abc-p1", "free"])
assert.deepEqual(filterAndSort(all, { ...base, partnerOnly: true }), [partner])
assert.deepEqual(filterAndSort(all, { ...base, chip: "Cao cấp" }), [partner])
assert.deepEqual(filterAndSort(all, { ...base, query: "khong co" }), [])

console.log("service-listing: ok")
```

- [ ] **Step 2: Chạy test, phải fail**

Run: `npx tsx src/lib/service-listing.test.ts`
Expected: FAIL, lỗi không tìm thấy module `./service-listing`.

- [ ] **Step 3: Viết `src/lib/service-listing.ts`**

```ts
import { normalize } from "@/lib/tour-matching"
import type { ServiceItem, ServiceKind } from "@/types/journey"

/** Slug tiếng Việt trên URL: /diem-den/[slug]/[kind]. */
export const KIND_SLUG: Record<ServiceKind, string> = {
  hotel: "khach-san",
  flight: "ve-may-bay",
  vehicle: "thue-xe",
  activity: "vui-choi",
  dining: "an-uong",
  souvenir: "dac-san",
  tour: "tour",
}

// Map để slug như "constructor" không trỏ vào thuộc tính của Object.
const SLUG_KIND = new Map(Object.entries(KIND_SLUG).map(([kind, slug]) => [slug, kind as ServiceKind]))

export function kindFromSlug(slug: string): ServiceKind | undefined {
  return SLUG_KIND.get(slug)
}

export function matchesQuery(service: ServiceItem, query: string): boolean {
  const needle = normalize(query.trim())
  return !needle || normalize(`${service.name} ${service.tag} ${service.blurb}`).includes(needle)
}

/** Mục giá 0 (điểm tham quan miễn phí) không tính vào "Giá từ". */
export function priceStats(services: ServiceItem[]): { count: number; min?: ServiceItem; max?: ServiceItem } {
  const priced = services.filter((service) => service.priceVnd > 0).sort((a, b) => a.priceVnd - b.priceVnd)
  return { count: services.length, min: priced[0], max: priced.at(-1) }
}

// Khớp partnerServiceId ở src/lib/partners/services.ts.
const PARTNER_PREFIX = "partner-"

export function isPartnerService(service: Pick<ServiceItem, "id">): boolean {
  return service.id.startsWith(PARTNER_PREFIX)
}

/** Tag mock: "Phân khúc · Khu vực"; tag đối tác: "Thương hiệu · Phân khúc · Khu vực". */
export function chipOf(service: ServiceItem): string | undefined {
  const parts = service.tag.split(" · ").map((part) => part.trim())
  return (isPartnerService(service) ? parts[1] : parts[0]) || undefined
}

/** Ít hơn 2 chip thì lọc vô nghĩa: trả rỗng để ẩn hàng chip. */
export function chipsOf(services: ServiceItem[]): string[] {
  const chips = [...new Set(services.map(chipOf).filter((chip): chip is string => Boolean(chip)))]
  return chips.length < 2 ? [] : chips
}

export type ListingSort = "default" | "price-asc" | "price-desc"

export interface ListingFilter {
  query: string
  chip: string | null
  partnerOnly: boolean
  sort: ListingSort
}

export function filterAndSort(services: ServiceItem[], { query, chip, partnerOnly, sort }: ListingFilter): ServiceItem[] {
  const visible = services.filter(
    (service) => matchesQuery(service, query) && (!chip || chipOf(service) === chip) && (!partnerOnly || isPartnerService(service)),
  )
  if (sort === "default") return visible
  const sign = sort === "price-asc" ? 1 : -1
  // Giá 0 luôn xếp cuối dù tăng hay giảm.
  return [...visible].sort((a, b) => (a.priceVnd === 0 ? 1 : 0) - (b.priceVnd === 0 ? 1 : 0) || sign * (a.priceVnd - b.priceVnd))
}
```

- [ ] **Step 4: Chuyển `matchesQuery` khỏi panel**

Trong `src/components/journey/service-catalog-panel.tsx`: xóa hàm `matchesQuery` (dòng 28-31) và dòng `import { normalize } from "@/lib/tour-matching"`, thêm:

```ts
import { matchesQuery } from "@/lib/service-listing"
```

Trong `src/components/journey/service-picker.tsx` dòng 8 đổi thành:

```ts
import { ServiceSearch } from "@/components/journey/service-catalog-panel"
import { matchesQuery } from "@/lib/service-listing"
```

- [ ] **Step 5: Chạy test + lint**

Run: `npx tsx src/lib/service-listing.test.ts && pnpm lint`
Expected: in `service-listing: ok`, lint không lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/lib/service-listing.ts src/lib/service-listing.test.ts src/components/journey/service-catalog-panel.tsx src/components/journey/service-picker.tsx
git commit -m "feat: logic danh sách dịch vụ theo loại (slug, chip, lọc, sắp xếp)"
```

---

### Task 2: Gom dịch vụ của điểm đến `destination-services.ts`

**Files:**
- Create: `src/lib/destination-services.ts`
- Create: `src/lib/destination-services.test.ts`

**Interfaces:**
- Consumes: `getServices(slug)` từ `@/lib/journey/catalog`; `getPartnerServices(slug, fallbackBookUrl)` từ `@/lib/partners/store`; `DestinationGuide`.
- Produces: `destinationServices(guide: DestinationGuide, loadPartners?: (slug: string, bookUrl: string) => Promise<ServiceItem[]>): Promise<ServiceItem[]>`.

- [ ] **Step 1: Viết test (sẽ fail)**

`src/lib/destination-services.test.ts`:

```ts
import assert from "node:assert/strict"
import { destinationServices } from "./destination-services"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { getServices } from "@/lib/journey/catalog"
import type { ServiceItem } from "@/types/journey"

const partner: ServiceItem = { ...getServices("phu-quoc", "hotel")[0], id: "partner-a-p1", kind: "dining" }

async function main(): Promise<void> {
  // Gộp catalog + đối tác, đối tác đứng cuối.
  const merged = await destinationServices(phuQuoc, async (slug, bookUrl) => {
    assert.equal(slug, "phu-quoc")
    assert.equal(bookUrl, phuQuoc.links.tours)
    return [partner]
  })
  assert.equal(merged.length, getServices("phu-quoc").length + 1)
  assert.equal(merged.at(-1), partner)

  // Store đối tác lỗi: trang vẫn có catalog.
  const original = console.error
  console.error = () => {}
  const fallback = await destinationServices(phuQuoc, async () => {
    throw new Error("redis down")
  })
  console.error = original
  assert.equal(fallback.length, getServices("phu-quoc").length)

  console.log("destination-services: ok")
}

void main()
```

Catalog mock chưa có mục `dining` (ăn uống chỉ đến từ đối tác), nên test dựng mục đối tác từ một khách sạn rồi đổi `kind`.

- [ ] **Step 2: Chạy test, phải fail**

Run: `npx tsx src/lib/destination-services.test.ts`
Expected: FAIL, lỗi không tìm thấy module `./destination-services`.

- [ ] **Step 3: Viết `src/lib/destination-services.ts`**

```ts
import { getServices } from "@/lib/journey/catalog"
import { getPartnerServices } from "@/lib/partners/store"
import type { DestinationGuide } from "@/types/destination"
import type { ServiceItem } from "@/types/journey"

/** Mọi dịch vụ của điểm đến: catalog (mock + hoạt động + tour) và đối tác đã duyệt. */
export async function destinationServices(
  guide: DestinationGuide,
  loadPartners: (slug: string, bookUrl: string) => Promise<ServiceItem[]> = getPartnerServices,
): Promise<ServiceItem[]> {
  let partners: ServiceItem[] = []
  try {
    partners = await loadPartners(guide.slug, guide.links.tours)
  } catch (error) {
    // Store đối tác lỗi không được làm hỏng trang công khai: hiện catalog, ghi log.
    console.error("Không đọc được dịch vụ đối tác", error)
  }
  return [...getServices(guide.slug), ...partners]
}
```

- [ ] **Step 4: Chạy test**

Run: `npx tsx src/lib/destination-services.test.ts`
Expected: `destination-services: ok`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/destination-services.ts src/lib/destination-services.test.ts
git commit -m "feat: gom dịch vụ điểm đến kèm đối tác, chịu lỗi store"
```

---

### Task 3: Nội dung cẩm nang `serviceGuides`

**Files:**
- Modify: `src/types/destination.ts` (trước `export interface DestinationGuide`, và trong interface sau `faqs: Faq[]`)
- Modify: `src/data/destinations/phu-quoc.ts` (thêm khối `serviceGuides` ngay sau mảng `faqs`, trước `links`)
- Modify: `src/data/destinations/destinations.test.ts` (thêm vào cuối file)

**Interfaces:**
- Produces: `interface ServiceGuide { intro: string; tips: string[]; faqs: Faq[] }`, `DestinationGuide.serviceGuides?: Partial<Record<ServiceKind, ServiceGuide>>`.

- [ ] **Step 1: Viết test (sẽ fail)**

Thêm vào cuối `src/data/destinations/destinations.test.ts`:

```ts
// Cẩm nang theo loại dịch vụ: Phú Quốc có đủ 7 loại, mỗi loại có intro, mẹo và FAQ.
import { SERVICE_KINDS } from "@/types/journey"
for (const kind of SERVICE_KINDS) {
  const serviceGuide = phuQuoc.serviceGuides?.[kind]
  assert.ok(serviceGuide?.intro.trim(), `${kind} thiếu intro`)
  assert.ok(serviceGuide.tips.length >= 1 && serviceGuide.tips.every((tip) => tip.trim()), `${kind} thiếu mẹo`)
  assert.ok(serviceGuide.faqs.length >= 1, `${kind} thiếu FAQ`)
}
```

(Đưa dòng `import { SERVICE_KINDS }` lên khối import đầu file.)

- [ ] **Step 2: Chạy test, phải fail**

Run: `npx tsx src/data/destinations/destinations.test.ts`
Expected: FAIL, `hotel thiếu intro` (hoặc lỗi type `serviceGuides` không tồn tại).

- [ ] **Step 3: Thêm type**

Trong `src/types/destination.ts`, thêm import `import type { ServiceKind } from "@/types/journey"` ở đầu file và ngay trước `export interface DestinationGuide`:

```ts
/** Cẩm nang ngắn cho trang /diem-den/[slug]/[kind]. */
export interface ServiceGuide {
  intro: string
  tips: string[]
  faqs: Faq[]
}
```

Trong `DestinationGuide`, sau `faqs: Faq[]`:

```ts
  /** Thiếu loại nào thì trang loại đó chỉ có danh sách, không có cẩm nang riêng. */
  serviceGuides?: Partial<Record<ServiceKind, ServiceGuide>>
```

Nếu `@/types/journey` import ngược `@/types/destination` gây vòng import type: chấp nhận được vì chỉ là `import type`.

- [ ] **Step 4: Viết nội dung Phú Quốc**

Trong `src/data/destinations/phu-quoc.ts`, sau mảng `faqs: [...]`:

```ts
  serviceGuides: {
    flight: {
      intro: "Phú Quốc có sân bay quốc tế, bay thẳng từ TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ. Đặt sớm 3–4 tuần thường có giá tốt hơn.",
      tips: [
        "Mùa khô (tháng 11–4) và các dịp lễ vé tăng nhanh, nên đặt trước 1–2 tháng.",
        "Chuyến sáng sớm thường ít trễ hơn chuyến chiều tối mùa mưa.",
        "Kiểm tra quy định hành lý ký gửi nếu định mang nước mắm, hải sản khô về.",
        "Sân bay cách Dương Đông khoảng 15 phút xe, có thể đặt đưa đón trước.",
      ],
      faqs: [
        { question: "Bay từ TP.HCM đến Phú Quốc mất bao lâu?", answer: "Khoảng 1 giờ bay. Từ Hà Nội khoảng 2 giờ 10 phút." },
        { question: "Trẻ em đi máy bay tính giá thế nào?", answer: "Thường trẻ dưới 2 tuổi tính giá em bé, từ 2 đến dưới 12 tuổi tính giá trẻ em. Mức cụ thể tùy hãng bay, Quý khách xem giá khi thêm vào kế hoạch." },
      ],
    },
    hotel: {
      intro: "Từ homestay gần biển đến villa hồ bơi riêng. Chọn khu Dương Đông nếu thích phố đêm, Bãi Trường để ngắm hoàng hôn, Bắc đảo nếu đi VinWonders.",
      tips: [
        "Gia đình có trẻ nhỏ nên chọn resort có hồ bơi nông và câu lạc bộ trẻ em.",
        "Ở Nam đảo thuận đi cáp treo Hòn Thơm, ở Bắc đảo thuận Safari và VinWonders.",
        "Mùa mưa nhiều resort giảm giá sâu, đáng cân nhắc nếu không ngại mưa chiều.",
      ],
      faqs: [
        { question: "Nên ở khu nào tại Phú Quốc?", answer: "Lần đầu đến, Dương Đông hoặc Bãi Trường tiện đi lại và ăn uống. Muốn yên tĩnh, nghỉ dưỡng thì chọn Nam đảo hoặc Bắc đảo." },
        { question: "Giá phòng đã gồm bữa sáng chưa?", answer: "Tùy cơ sở. Giá trên trang là giá tham khảo mỗi phòng mỗi đêm, Quý khách xem mô tả từng nơi." },
      ],
    },
    vehicle: {
      intro: "Đảo rộng, các điểm cách nhau 20–40 km. Thuê xe máy để tự do, hoặc ô tô có tài xế cho gia đình và nhóm đông.",
      tips: [
        "Thuê xe máy cần bằng lái, luôn đội mũ bảo hiểm.",
        "Ô tô 7 chỗ hợp gia đình có trẻ nhỏ, có thể yêu cầu ghế trẻ em.",
        "Đặt đưa đón sân bay trước để không phải chờ xe khi hạ cánh.",
      ],
      faqs: [
        { question: "Có taxi hay xe công nghệ ở Phú Quốc không?", answer: "Có, chủ yếu quanh Dương Đông và sân bay. Đi Nam đảo, Bắc đảo cả ngày thì thuê xe theo ngày thường tiện và rẻ hơn." },
      ],
    },
    activity: {
      intro: "Cáp treo Hòn Thơm, Safari, VinWonders, lặn ngắm san hô, chợ đêm. Nhiều bãi biển đẹp miễn phí.",
      tips: [
        "Lặn ngắm san hô đẹp nhất mùa khô khi biển lặng.",
        "Cáp treo Hòn Thơm nên đi buổi sáng, chiều thường đông.",
        "Hoàng hôn đẹp ở Sunset Town và Bãi Trường, đến sớm 1 tiếng.",
      ],
      faqs: [
        { question: "Trẻ em có được giảm giá vé vui chơi không?", answer: "Phần lớn điểm vui chơi có giá trẻ em theo chiều cao hoặc độ tuổi. Kế hoạch tự tính theo tuổi các bé Quý khách nhập." },
      ],
    },
    dining: {
      intro: "Hải sản tươi, gỏi cá trích, bún quậy, ghẹ Hàm Ninh. Từ quán địa phương đến nhà hàng view biển.",
      tips: [
        "Ở chợ đêm, hỏi giá theo ký trước khi gọi món hải sản.",
        "Làng chài Hàm Ninh nổi tiếng ghẹ, nên đi buổi trưa.",
        "Nhà hàng view biển nên đặt bàn trước giờ hoàng hôn.",
      ],
      faqs: [
        { question: "Ăn hải sản ở Phú Quốc khoảng bao nhiêu tiền?", answer: "Quán bình dân khoảng 200–400 nghìn mỗi người, nhà hàng view biển từ 500 nghìn trở lên mỗi người." },
      ],
    },
    souvenir: {
      intro: "Nước mắm, hồ tiêu, ngọc trai, rượu sim, khô cá: đặc sản Phú Quốc từ các thương hiệu địa phương.",
      tips: [
        "Mua nước mắm loại đóng gói dành cho đi máy bay.",
        "Ngọc trai nên mua ở cơ sở có giấy kiểm định.",
        "Hồ tiêu và khô cá mua tại vườn, chợ địa phương thường tươi và rẻ hơn.",
      ],
      faqs: [
        { question: "Mang nước mắm lên máy bay được không?", answer: "Tùy hãng bay, nhiều hãng chỉ nhận loại đóng gói chuyên dụng. Quý khách kiểm tra quy định hành lý trước khi mua." },
      ],
    },
    tour: {
      intro: "Tour trọn gói Vietravel gồm vé bay, khách sạn, xe và tham quan, khởi hành từ nhiều thành phố.",
      tips: [
        "Tour trọn gói tiện cho gia đình và nhóm đông, không phải lo xe và lịch trình.",
        "So giá tour với tự túc bằng cách thêm cả hai vào một kế hoạch.",
        "Ngày khởi hành và giá lấy trực tiếp từ travel.com.vn.",
      ],
      faqs: [
        { question: "Giá tour đã gồm vé máy bay chưa?", answer: "Đa số tour Phú Quốc của Vietravel đã gồm vé máy bay khứ hồi. Quý khách xem chi tiết trên trang tour." },
      ],
    },
  },
```

- [ ] **Step 5: Chạy test + lint**

Run: `npx tsx src/data/destinations/destinations.test.ts && pnpm lint`
Expected: không lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/types/destination.ts src/data/destinations/phu-quoc.ts src/data/destinations/destinations.test.ts
git commit -m "feat: cẩm nang theo loại dịch vụ cho Phú Quốc"
```

---

### Task 4: Prop tùy chọn cho `Section`, khối guide và `Faq`

**Files:**
- Modify: `src/components/explorer/section.tsx`
- Modify: `src/components/explorer/getting-there.tsx:8`, `stay-block.tsx:9`, `eat-block.tsx:60`, `play-block.tsx:5`
- Modify: `src/components/explorer/faq.tsx:8`

**Interfaces:**
- Produces:
  - `Section` nhận `moreHref?: string` (hiện link "Xem tất cả →" dưới tiêu đề).
  - `GettingThere | StayBlock | EatBlock | PlayBlock` nhận `{ guide: DestinationGuide; moreHref?: string }`.
  - `Faq` nhận `{ guide: DestinationGuide; faqs?: Faq[]; title?: string }`.

Không có test tự động (chỉ render). Không truyền prop mới thì giao diện giữ nguyên.

- [ ] **Step 1: `Section`**

```tsx
import Link from "next/link"
// ...
interface SectionProps {
  id: string
  title: string
  intro?: string
  /** Link sang trang tổng hợp của khối, vd /diem-den/phu-quoc/khach-san. */
  moreHref?: string
  children: React.ReactNode
}

export function Section({ id, title, intro, moreHref, children }: SectionProps): React.JSX.Element {
```

Ngay sau dòng `{intro && <p …>}` trong `<Reveal>` đầu:

```tsx
        {moreHref && (
          <Link href={moreHref} className="mt-3 inline-block text-sm font-semibold text-primary-ink underline-offset-4 hover:underline">
            Xem tất cả →
          </Link>
        )}
```

- [ ] **Step 2: Bốn khối guide**

Với mỗi file, đổi chữ ký và truyền xuống `Section`. Ví dụ `play-block.tsx`:

```tsx
export function PlayBlock({ guide, moreHref }: { guide: DestinationGuide; moreHref?: string }): React.JSX.Element {
  return (
    <Section id="vui-choi" moreHref={moreHref} title={`Đến ${guide.name} làm gì?`} intro="…giữ nguyên…">
```

Làm tương tự cho `GettingThere`, `StayBlock`, `EatBlock`: thêm `moreHref` vào destructuring + kiểu, thêm `moreHref={moreHref}` vào `<Section`.

- [ ] **Step 3: `Faq`**

```tsx
import type { DestinationGuide, Faq as FaqItem } from "@/types/destination"

export function Faq({ guide, faqs = guide.faqs, title = "Giải đáp thắc mắc trước chuyến đi" }: { guide: DestinationGuide; faqs?: FaqItem[]; title?: string }): React.JSX.Element {
  return (
    <Section id="faq" title={title}>
```

Đổi `guide.faqs.map(` trong thân thành `faqs.map(`. (Type là `Faq` ở `src/types/destination.ts:118`, import với alias `FaqItem` vì trùng tên component.)

- [ ] **Step 4: Lint + build kiểu**

Run: `pnpm lint && npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 5: Commit**

```bash
git add src/components/explorer/section.tsx src/components/explorer/getting-there.tsx src/components/explorer/stay-block.tsx src/components/explorer/eat-block.tsx src/components/explorer/play-block.tsx src/components/explorer/faq.tsx
git commit -m "feat: link Xem tất cả cho khối guide, Faq nhận danh sách riêng"
```

---

### Task 5: `ServiceListing`, `ServiceHub` và trang loại

**Files:**
- Create: `src/components/explorer/service-listing.tsx`
- Create: `src/components/explorer/service-hub.tsx`
- Create: `src/app/diem-den/[slug]/[kind]/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`KIND_SLUG`, `kindFromSlug`, `priceStats`, `chipsOf`, `filterAndSort`, `isPartnerService`, `ListingSort`), Task 2 (`destinationServices`), Task 3 (`serviceGuides`), Task 4 (`Faq` props); `AddToPlanButton` (`destinationSlug`, `destinationName`, `serviceId`, `label`, `className`); `ServiceSearch`; `priceLabel`; `KIND_ICON`.
- Produces:
  - `ServiceListing({ services, destinationSlug, destinationName }: { services: ServiceItem[]; destinationSlug: string; destinationName: string })`
  - `ServiceHub({ guide, services, current }: { guide: DestinationGuide; services: ServiceItem[]; current?: ServiceKind })`

- [ ] **Step 1: `ServiceListing` (client)**

`src/components/explorer/service-listing.tsx`:

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"

import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { KIND_ICON } from "@/components/journey/kind-icon"
import { ServiceSearch } from "@/components/journey/service-catalog-panel"
import { priceLabel } from "@/lib/journey/labels"
import { chipsOf, filterAndSort, isPartnerService, type ListingSort } from "@/lib/service-listing"
import { cn } from "@/lib/utils"
import type { ServiceItem } from "@/types/journey"

interface ServiceListingProps {
  services: ServiceItem[]
  destinationSlug: string
  destinationName: string
}

const CHIP_CLASS =
  "h-9 rounded-full px-3.5 text-sm font-semibold ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-champagne aria-pressed:text-void"

export function ServiceListing({ services, destinationSlug, destinationName }: ServiceListingProps): React.JSX.Element {
  const [query, setQuery] = useState("")
  const [chip, setChip] = useState<string | null>(null)
  const [partnerOnly, setPartnerOnly] = useState(false)
  const [sort, setSort] = useState<ListingSort>("default")

  const chips = chipsOf(services)
  const hasPartners = services.some(isPartnerService)
  const visible = filterAndSort(services, { query, chip, partnerOnly, sort })

  function reset(): void {
    setQuery("")
    setChip(null)
    setPartnerOnly(false)
  }

  if (services.length === 0) return <p className="text-muted-foreground">Hiện chưa có dịch vụ loại này.</p>

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <ServiceSearch value={query} onChange={setQuery} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sắp xếp
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as ListingSort)}
            className="h-10 rounded-lg bg-tint/5 px-3 text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="default">Đề xuất</option>
            <option value="price-asc">Giá thấp → cao</option>
            <option value="price-desc">Giá cao → thấp</option>
          </select>
        </label>
      </div>

      {(chips.length > 0 || hasPartners) && (
        <div role="group" aria-label="Lọc dịch vụ" className="mt-3 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!chip && !partnerOnly} onClick={() => { setChip(null); setPartnerOnly(false) }} className={CHIP_CLASS}>
            Tất cả
          </button>
          {chips.map((option) => (
            <button key={option} type="button" aria-pressed={chip === option} onClick={() => setChip(chip === option ? null : option)} className={CHIP_CLASS}>
              {option}
            </button>
          ))}
          {hasPartners && (
            <button type="button" aria-pressed={partnerOnly} onClick={() => setPartnerOnly(!partnerOnly)} className={CHIP_CLASS}>
              Đối tác
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {visible.length} lựa chọn
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-muted-foreground">Không tìm thấy dịch vụ phù hợp.</p>
          <button type="button" onClick={reset} className="text-sm font-semibold text-primary-ink underline-offset-4 hover:underline">
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service) => (
            <ListingCard key={service.id} service={service} destinationSlug={destinationSlug} destinationName={destinationName} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ListingCard({ service, destinationSlug, destinationName }: { service: ServiceItem; destinationSlug: string; destinationName: string }): React.JSX.Element {
  const Icon = KIND_ICON[service.kind]
  const partner = isPartnerService(service)

  return (
    <li className="glass-card flex flex-col overflow-hidden p-0">
      <div className="relative aspect-video">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} fill sizes="(min-width:1024px) 360px, (min-width:640px) 45vw, 90vw" className="object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary-ink/25 via-tint/[0.06] to-gold/25 text-gold">
            <Icon strokeWidth={1.25} className="size-10" />
          </span>
        )}
        {partner && <span className="absolute top-3 left-3 rounded-full bg-champagne px-2.5 py-1 text-[11px] font-bold text-void">Đối tác</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {service.credit && (
          <p className="text-[11px] text-muted-foreground">
            Ảnh minh họa:{" "}
            <a href={service.credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {service.credit.author}, {service.credit.license}
            </a>
          </p>
        )}
        <p className="text-xs font-semibold text-gold">{service.tag}</p>
        <h3 className="font-semibold leading-snug text-title">{service.name}</h3>
        <p className="text-sm text-muted-foreground">{service.blurb}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className={cn("text-sm font-semibold text-champagne")}>
            {priceLabel(service)}
            {service.mock && <span className="block text-[11px] font-normal text-muted-foreground">Giá tham khảo (demo)</span>}
          </p>
          <AddToPlanButton destinationSlug={destinationSlug} destinationName={destinationName} serviceId={service.id} label="Thêm" />
        </div>
      </div>
    </li>
  )
}
```

(Xóa `cn` nếu lint báo không dùng.)

- [ ] **Step 2: `ServiceHub` (server)**

`src/components/explorer/service-hub.tsx`:

```tsx
import Link from "next/link"

import { KIND_ICON } from "@/components/journey/kind-icon"
import { formatVnd } from "@/lib/format"
import { KIND_SLUG, priceStats } from "@/lib/service-listing"
import { cn } from "@/lib/utils"
import type { DestinationGuide } from "@/types/destination"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

interface ServiceHubProps {
  guide: DestinationGuide
  services: ServiceItem[]
  /** Loại đang xem: luôn hiện và được tô sáng, kể cả khi chưa có dịch vụ. */
  current?: ServiceKind
}

/** Ô link sang trang từng loại dịch vụ. Ẩn loại chưa có dịch vụ. */
export function ServiceHub({ guide, services, current }: ServiceHubProps): React.JSX.Element {
  const tiles = SERVICE_KINDS.map((kind) => ({ kind, ...priceStats(services.filter((service) => service.kind === kind)) })).filter(
    (tile) => tile.count > 0 || tile.kind === current,
  )

  return (
    <nav aria-label={`Dịch vụ tại ${guide.name}`}>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap">
        {tiles.map(({ kind, count, min }) => {
          const Icon = KIND_ICON[kind]
          return (
            <li key={kind} className="shrink-0">
              <Link
                href={`/diem-den/${guide.slug}/${KIND_SLUG[kind]}`}
                aria-current={kind === current ? "page" : undefined}
                className={cn(
                  "glass-card flex items-center gap-3 !rounded-2xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  kind === current && "bg-champagne text-void",
                )}
              >
                <Icon aria-hidden strokeWidth={1.5} className="size-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{SERVICE_KIND_LABEL[kind]}</span>
                  <span className="block text-xs opacity-75">
                    {count} lựa chọn{min && ` · từ ${formatVnd(min.priceVnd)}`}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 3: Trang loại**

`src/app/diem-den/[slug]/[kind]/page.tsx`:

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { buttonClass } from "@/components/explorer/cta-link"
import { EatBlock } from "@/components/explorer/eat-block"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { Faq } from "@/components/explorer/faq"
import { GettingThere } from "@/components/explorer/getting-there"
import { PlayBlock } from "@/components/explorer/play-block"
import { Section } from "@/components/explorer/section"
import { ServiceHub } from "@/components/explorer/service-hub"
import { ServiceListing } from "@/components/explorer/service-listing"
import { StayBlock } from "@/components/explorer/stay-block"
import { destinations, getGuide } from "@/data/destinations"
import { destinationServices } from "@/lib/destination-services"
import { formatVnd } from "@/lib/format"
import { priceLabel } from "@/lib/journey/labels"
import { kindFromSlug, KIND_SLUG, priceStats } from "@/lib/service-listing"
import type { DestinationGuide } from "@/types/destination"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceKind } from "@/types/journey"

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string; kind: string }>
}

// Khối guide có sẵn cho loại tương ứng; loại khác chỉ có mẹo.
const GUIDE_BLOCK: Partial<Record<ServiceKind, (props: { guide: DestinationGuide }) => React.JSX.Element>> = {
  flight: GettingThere,
  hotel: StayBlock,
  dining: EatBlock,
  activity: PlayBlock,
}

export function generateStaticParams(): { slug: string; kind: string }[] {
  return destinations
    .filter((destination) => destination.active)
    .flatMap(({ slug }) => SERVICE_KINDS.map((kind) => ({ slug, kind: KIND_SLUG[kind] })))
}

async function resolve(params: PageProps["params"]): Promise<{ guide: DestinationGuide; kind: ServiceKind } | null> {
  const { slug, kind: kindSlug } = await params
  const guide = getGuide(slug)
  const kind = kindFromSlug(kindSlug)
  return guide && kind ? { guide, kind } : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return {}
  const { guide, kind } = found
  return {
    title: `${SERVICE_KIND_LABEL[kind]} ${guide.name} · Vietravel Explorer`,
    description: guide.serviceGuides?.[kind]?.intro ?? guide.intro,
  }
}

export default async function ServiceKindPage({ params }: PageProps): Promise<React.JSX.Element> {
  const found = await resolve(params)
  if (!found) notFound()
  const { guide, kind } = found
  const all = await destinationServices(guide)
  const services = all.filter((service) => service.kind === kind)
  const { count, min, max } = priceStats(services)
  const serviceGuide = guide.serviceGuides?.[kind]
  const GuideBlock = GUIDE_BLOCK[kind]
  const label = SERVICE_KIND_LABEL[kind]

  return (
    <ExplorerShell>
      <div className="mx-auto max-w-6xl px-4 pt-28 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href={`/diem-den/${guide.slug}`} className="underline-offset-4 hover:underline">
            {guide.name}
          </Link>
          <span aria-hidden> › </span>
          <span aria-current="page" className="text-body">{label}</span>
        </nav>

        <header className="py-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-title sm:text-4xl">
            {label} tại {guide.name}
          </h1>
          {serviceGuide && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{serviceGuide.intro}</p>}
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Số lựa chọn</dt>
              <dd className="text-xl font-bold text-title">{count}</dd>
            </div>
            {min && (
              <div>
                <dt className="text-xs text-muted-foreground">Giá từ</dt>
                <dd className="text-xl font-bold text-champagne">{priceLabel(min)}</dd>
              </div>
            )}
            {min && max && max !== min && (
              <div>
                <dt className="text-xs text-muted-foreground">Khoảng giá</dt>
                <dd className="text-xl font-bold text-title">
                  {formatVnd(min.priceVnd)} – {formatVnd(max.priceVnd)}
                </dd>
              </div>
            )}
          </dl>
        </header>

        <ServiceHub guide={guide} services={all} current={kind} />

        <Section id="danh-sach" title={`Chọn ${label.toLowerCase()} ${guide.name}`}>
          <ServiceListing services={services} destinationSlug={guide.slug} destinationName={guide.name} />
        </Section>

        {serviceGuide && serviceGuide.tips.length > 0 && (
          <Section id="meo" title="Mẹo hay">
            <ul className="grid gap-3 sm:grid-cols-2">
              {serviceGuide.tips.map((tip) => (
                <li key={tip} className="glass-card !rounded-2xl p-4 text-body">{tip}</li>
              ))}
            </ul>
          </Section>
        )}

        {GuideBlock && <GuideBlock guide={guide} />}

        {serviceGuide && serviceGuide.faqs.length > 0 && <Faq guide={guide} faqs={serviceGuide.faqs} title={`Hỏi đáp về ${label.toLowerCase()}`} />}

        <section className="py-14 text-center">
          <Link href="/hanh-trinh" className={buttonClass("primary", "h-12 px-6")}>
            Lên kế hoạch {guide.name}
          </Link>
        </section>
      </div>
    </ExplorerShell>
  )
}
```

Ghi chú thứ tự: spec để cẩm nang trước danh sách; ở đây danh sách đặt ngay sau hero để khách so sánh chọn nhanh, mẹo + khối guide + FAQ bên dưới (vẫn đủ nội dung cho SEO). `buttonClass(variant: "primary" | "outline", className?)` có sẵn ở `cta-link.tsx`. Kiểm padding trên của `ExplorerShell` (header cố định) bằng cách xem `src/app/diem-den/[slug]/page.tsx` + `destination-hero.tsx`; chỉnh `pt-28` nếu breadcrumb bị header che.

- [ ] **Step 4: Lint + kiểu + build**

Run: `pnpm lint && npx tsc --noEmit && pnpm build`
Expected: build sinh `/diem-den/phu-quoc/[kind]` cho 7 slug (thấy trong bảng route dạng ● SSG).

- [ ] **Step 5: Kiểm thủ công**

Run: `pnpm dev`, đăng nhập bằng `DEMO_PASSWORD`, mở lần lượt:
- `/diem-den/phu-quoc/ve-may-bay`: 4 chặng bay, không có hàng chip (cùng "Khứ hồi"), sắp xếp giá chạy, có khối "Cách di chuyển", FAQ riêng.
- `/diem-den/phu-quoc/khach-san`: chip Tiết kiệm/Tầm trung/Cao cấp/Sang trọng lọc đúng.
- `/diem-den/phu-quoc/vui-choi`: mục giá 0 nằm cuối khi sắp xếp, "Giá từ" không phải 0đ.
- `/diem-den/phu-quoc/dac-san`: nếu chưa có đối tác đặc sản thì hiện "Hiện chưa có dịch vụ loại này" + mẹo + FAQ, không 404.
- `/diem-den/phu-quoc/xyz` và `/diem-den/phu-quoc/constructor`: 404.
- Bấm "Thêm" trên một khách sạn: tạo/chọn kế hoạch, toast "Đã thêm vào …".
- Ở `/doi-tac`, đăng ký một nhà hàng → duyệt ở tab Xét duyệt → (trong dev trang render lại mỗi request) `/diem-den/phu-quoc/an-uong` có thẻ badge "Đối tác", chip "Đối tác" lọc đúng, thêm vào kế hoạch được.

- [ ] **Step 6: Commit**

```bash
git add src/components/explorer/service-listing.tsx src/components/explorer/service-hub.tsx "src/app/diem-den/[slug]/[kind]/page.tsx"
git commit -m "feat: trang dịch vụ theo loại tại điểm đến"
```

---

### Task 6: Nối vào trang điểm đến + tài liệu

**Files:**
- Modify: `src/app/diem-den/[slug]/page.tsx`
- Modify: `CLAUDE.md` (mục Architecture)

**Interfaces:**
- Consumes: `ServiceHub` (Task 5), `destinationServices` (Task 2), `KIND_SLUG` (Task 1), prop `moreHref` (Task 4).

- [ ] **Step 1: Sửa trang điểm đến**

Thêm import:

```tsx
import { ServiceHub } from "@/components/explorer/service-hub"
import { destinationServices } from "@/lib/destination-services"
import { KIND_SLUG } from "@/lib/service-listing"
```

Trong `DestinationPage`, sau `const tours = …`:

```tsx
  const services = await destinationServices(guide)
  const more = (kind: keyof typeof KIND_SLUG): string => `/diem-den/${guide.slug}/${KIND_SLUG[kind]}`
```

Ngay sau `<MediaBlock guide={guide} />`:

```tsx
        <Section id="dich-vu" title={`Dịch vụ tại ${guide.name}`} intro="Xem và so sánh từng loại dịch vụ, thêm thẳng vào kế hoạch chuyến đi.">
          <ServiceHub guide={guide} services={services} />
        </Section>
```

Và truyền `moreHref`:

```tsx
        <GettingThere guide={guide} moreHref={more("flight")} />
        <StayBlock guide={guide} moreHref={more("hotel")} />
        <EatBlock guide={guide} moreHref={more("dining")} />
        <PlayBlock guide={guide} moreHref={more("activity")} />
```

- [ ] **Step 2: CLAUDE.md**

Thêm một gạch đầu dòng trong Architecture, sau dòng "Review điểm đến":

```markdown
- **Trang dịch vụ theo loại** (`/diem-den/[slug]/[kind]`, slug loại ở `KIND_SLUG` trong [src/lib/service-listing.ts](src/lib/service-listing.ts)): danh sách = `destinationServices` (catalog + đối tác đã duyệt, lỗi store đối tác thì bỏ qua) lọc theo loại, lọc/sắp xếp/chip ở `filterAndSort`; cẩm nang lấy `guide.serviceGuides[kind]` + khối guide tương ứng. Trang điểm đến có khối `ServiceHub` dẫn sang 7 loại.
```

- [ ] **Step 3: Chạy lại toàn bộ test + build**

Run:
```bash
for f in src/lib/service-listing.test.ts src/lib/destination-services.test.ts src/data/destinations/destinations.test.ts src/lib/journey/catalog.test.ts src/lib/partners/services.test.ts; do npx tsx "$f" || exit 1; done
pnpm lint && pnpm build
```
Expected: mọi test in ok/không lỗi, build xanh.

- [ ] **Step 4: Kiểm thủ công trang điểm đến**

`/diem-den/phu-quoc`: khối "Dịch vụ tại Phú Quốc" hiện các ô có số lựa chọn và giá từ; bấm từng ô sang đúng trang; các khối Di chuyển/Lưu trú/Ẩm thực/Vui chơi có link "Xem tất cả →" đúng trang; trên trang loại, khối guide **không** có link tự trỏ về chính nó.

- [ ] **Step 5: Commit**

`CLAUDE.md` đang có thay đổi chưa commit của người dùng: **không** `git add CLAUDE.md`, để nguyên bản sửa trong working tree cho người dùng tự commit cùng phần của họ.

```bash
git add "src/app/diem-den/[slug]/page.tsx"
git commit -m "feat: khối Dịch vụ tại điểm đến và link Xem tất cả"
```
