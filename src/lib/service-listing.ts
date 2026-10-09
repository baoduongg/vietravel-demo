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

/** Khớp không dấu theo tên, tag, mô tả: "vinpearl" hay "an sang" đều được. */
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

/**
 * Tag mock: "Phân khúc · Khu vực". Tag đối tác: "Thương hiệu · Phân khúc · Khu vực", chỉ khách sạn có phân khúc;
 * thiếu phân khúc thì không ra chip để khu vực không lẫn vào hàng phân khúc. Đếm từ cuối vì tên thương hiệu có thể chứa " · ".
 */
export function chipOf(service: ServiceItem): string | undefined {
  const parts = service.tag.split(" · ").map((part) => part.trim())
  if (!isPartnerService(service)) return parts[0] || undefined
  return parts.length >= 3 ? parts.at(-2) || undefined : undefined
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
