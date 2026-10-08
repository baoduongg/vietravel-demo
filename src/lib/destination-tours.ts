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
