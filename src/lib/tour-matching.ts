import type { ChatMessage } from "@/types/chat"
import type { Tour } from "@/types/tour"
import { VIBE_CATEGORIES } from "@/lib/vibe-taxonomy"

const MAX_CANDIDATES = 5
const MONEY_LIMIT = /(?:dưới|tối đa|không quá|thấp hơn)\s*(\d[\d. ]*)\s*(triệu|tr|nghìn|ngàn|k)?/i
const EXPLICIT_DATE = /(?:ngày\s*)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?/i

const GENERIC_PLACE_PREFIXES = new Set([
  "chua", "den", "dinh", "vinh", "dao", "bai", "thanh", "pho", "khu", "lang", "dong", "song", "nui", "thac", "tuyen", "hanh", "trinh", "tour"
])

/** Bỏ dấu tiếng Việt và viết thường: "Phú Quốc" khớp "phu quoc". */
export function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")
}

function parseBudget(text: string): number | undefined {
  const match = text.match(MONEY_LIMIT)
  if (!match) return undefined
  const amount = Number(match[1].replace(/[. ]/g, ""))
  const unit = match[2]?.toLowerCase()
  if (!Number.isFinite(amount)) return undefined
  if (unit === "triệu" || unit === "tr") return amount * 1_000_000
  if (unit === "nghìn" || unit === "ngàn" || unit === "k") return amount * 1_000
  return amount >= 1000 ? amount : undefined
}

function parseDate(text: string, today: string): string | undefined {
  const match = text.match(EXPLICIT_DATE)
  if (!match) return undefined
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3] ?? today.slice(0, 4))
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined
  return date.toISOString().slice(0, 10)
}

function messageText(messages: ChatMessage[]): string {
  return messages.filter(({ role }) => role === "user").map(({ content }) => content).join(" ")
}

export function selectRelevantTours(
  tours: Tour[],
  messages: ChatMessage[],
  today: string,
): { criteriaRecognized: boolean; hasExactMatches: boolean; tours: Tour[] } {
  const conversation = messageText(messages)
  const correction = /(?:xin\s+)?(?:sửa lại|ý tôi là|thay vào đó|không phải)\s*[:,]?/gi
  const corrections = [...conversation.matchAll(correction)]
  const text = corrections.length ? conversation.slice(corrections.at(-1)!.index! + corrections.at(-1)![0].length) : conversation
  const normalizedText = normalize(text)
  const budget = parseBudget(text)
  const date = parseDate(text, today)
  const cities = [...new Set(tours.map(({ departureCity }) => departureCity))]
  const matchedCity = cities.find((city) => normalizedText.includes(normalize(city.replace(/^TP\.\s*/i, ""))))
  const departureCities = new Set(tours.map(({ departureCity }) => normalize(departureCity.replace(/^TP\.\s*/i, ""))))
  const destinations = [...new Set(tours.flatMap(({ name, region }) => [name, region].flatMap((value) => value.split(/[,;:|()/-]+/).flatMap((part) => {
    const trimmed = part.trim()
    const words = trimmed.split(/\s+/)
    const unigrams = words.filter((word) => word.length >= 4 && !GENERIC_PLACE_PREFIXES.has(normalize(word)))
    const bigrams = words.slice(0, -1).map((word, index) => `${word} ${words[index + 1]}`)
    return [trimmed, ...unigrams, ...bigrams]
  }).filter((part) => part.length >= 4 && !departureCities.has(normalize(part))))))].sort((a, b) => b.length - a.length)
  const matchedDestination = destinations.find((destination) => normalizedText.includes(normalize(destination)))
  const matchedVibes = VIBE_CATEGORIES.filter((cat) =>
    cat.keywords.some((kw) => normalizedText.includes(normalize(kw))),
  )
  const criteriaRecognized = Boolean(budget || date || matchedCity || matchedDestination || matchedVibes.length > 0)
  if (!criteriaRecognized) return { criteriaRecognized: false, hasExactMatches: false, tours: [] }

  const upcoming = tours.flatMap((tour, index) => {
    const departureDates = tour.departureDates.filter((departure) => departure >= today)
    if (departureDates.length === 0) return []
    const activeDeal = tour.deal && tour.deal.departureDate >= today ? tour.deal : undefined
    const destinationMatch = Boolean(matchedDestination && normalize(`${tour.name} ${tour.highlight} ${tour.region}`).includes(normalize(matchedDestination)))
    const cityMatch = Boolean(matchedCity && normalize(tour.departureCity.replace(/^TP\.\s*/i, "")).includes(normalize(matchedCity.replace(/^TP\.\s*/i, ""))))
    const dateMatch = Boolean(date && (departureDates.includes(date) || activeDeal?.departureDate === date))
    const matchingVibesCount = matchedVibes.filter(
      (vibe) =>
        vibe.destinations.some((d) => normalize(`${tour.name} ${tour.region}`).includes(normalize(d))) ||
        vibe.keywords.some((kw) => normalize(`${tour.name} ${tour.highlight}`).includes(normalize(kw))),
    ).length
    const vibeMatch = matchingVibesCount > 0
    const price = activeDeal?.priceVnd ?? tour.priceVnd
    const budgetMatch = Boolean(budget && price <= budget)
    const budgetScore = budget ? budget / Math.max(price, budget) : 0
    return [{
      tour: { ...tour, departureDates, deal: activeDeal },
      index,
      score: Number(destinationMatch) + Number(cityMatch) + Number(dateMatch) + matchingVibesCount + budgetScore,
      matched:
        (!matchedDestination || destinationMatch) &&
        (!matchedCity || cityMatch) &&
        (!date || dateMatch) &&
        (!budget || budgetMatch) &&
        (matchedVibes.length === 0 || vibeMatch) &&
        [destinationMatch, cityMatch, dateMatch, budgetMatch, vibeMatch].some(Boolean),
    }]
  })
  const exact = upcoming.filter(({ matched }) => matched)
  const ranked = (exact.length ? exact : upcoming.filter(({ score }) => score > 0))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_CANDIDATES)
    .map(({ tour }) => tour)
  return { criteriaRecognized, hasExactMatches: exact.length > 0, tours: ranked }
}
