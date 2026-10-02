import catalog from "@/data/tours.json"
import type { Tour, TourCatalog } from "@/types/tour"

const { scrapedAt, tours: allTours } = catalog as TourCatalog

export { scrapedAt }

export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now)
}

function withUpcomingDates(tour: Tour, today: string): Tour | null {
  const departureDates = tour.departureDates.filter((date) => date >= today)
  if (departureDates.length === 0) return null
  const deal = tour.deal && tour.deal.departureDate >= today ? tour.deal : undefined
  return { ...tour, departureDates, deal }
}

export function getUpcomingTours(today: string = todayIso()): Tour[] {
  return allTours.map((tour) => withUpcomingDates(tour, today)).filter((tour): tour is Tour => tour !== null)
}

const PRICE_IN_TEXT = /(\d{1,3}(?:\.\d{3})+)\s*đồng/g
const MIN_PLACE_MATCHES = 2

/** "2026-10-06" → "ngày 6 tháng 10", đúng cách AI được dặn viết ngày. */
function spokenDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number)
  return `ngày ${day} tháng ${month}`
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFC")
}

/**
 * Dự phòng khi AI nhắc tour nhưng quên ghi mã: tìm tour có giá trùng với giá trong câu trả lời
 * và có ít nhất 2 điểm đến trong tên tour xuất hiện trong câu trả lời.
 */
export function inferToursFromReply(reply: string, limit: number, today: string = todayIso()): Tour[] {
  const prices = new Set([...reply.matchAll(PRICE_IN_TEXT)].map((match) => Number(match[1].replace(/\./g, ""))))
  if (prices.size === 0) return []
  const text = normalize(reply)

  const candidates = getUpcomingTours(today)
    .filter((tour) => prices.has(tour.priceVnd) || (tour.deal !== undefined && prices.has(tour.deal.priceVnd)))
    .map((tour) => {
      const places = normalize(tour.name)
        .split(/[-:,()|]/)
        .map((place) => place.trim())
        .filter((place) => place.length >= 3)
      const placeMatches = places.filter((place) => text.includes(place)).length
      const dates = tour.deal ? [tour.deal.departureDate] : tour.departureDates
      const dateMatch = dates.some((date) => text.includes(spokenDate(date))) ? 1 : 0
      const cityMatch = text.includes(normalize(tour.departureCity.replace(/^TP\. /, ""))) ? 1 : 0
      const dealMatch = tour.deal && text.includes("giờ chót") ? 1 : 0
      return { tour, placeMatches, score: placeMatches + dateMatch + cityMatch + dealMatch }
    })
    .filter(({ placeMatches }) => placeMatches >= MIN_PLACE_MATCHES)

  // Chỉ giữ các tour khớp nhiều nhất, tránh hiện cả loạt tour cùng giá nhưng khác ngày, khác nơi khởi hành.
  const best = Math.max(0, ...candidates.map(({ score }) => score))
  return candidates
    .filter(({ score }) => score === best)
    .slice(0, limit)
    .map(({ tour }) => tour)
}

export function findToursByCode(codes: string[], today: string = todayIso()): Tour[] {
  const upcoming = new Map(getUpcomingTours(today).map((tour) => [tour.code, tour]))
  return codes.map((code) => upcoming.get(code)).filter((tour): tour is Tour => tour !== undefined)
}
