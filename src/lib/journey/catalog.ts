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
