import { normalize } from "@/lib/tour-matching"
import { VIBE_CATEGORIES } from "@/lib/vibe-taxonomy"
import type { Tour } from "@/types/tour"

const TOP_K = 5

/** Điểm của một tour: khớp vibe khách nhắc tới, địa danh tiêu biểu của vibe, và từng từ trong câu hỏi. */
function vibeScore(normQuery: string, tour: Tour): number {
  const tourText = normalize(`${tour.name} ${tour.highlight} ${tour.region} ${tour.tourLine} ${tour.departureCity}`)
  const tourName = normalize(tour.name)
  let score = 0

  for (const category of VIBE_CATEGORIES) {
    if (!category.keywords.some((keyword) => normQuery.includes(normalize(keyword)))) continue
    const tourHasVibe =
      category.destinations.some((place) => tourText.includes(normalize(place))) ||
      category.keywords.some((keyword) => tourText.includes(normalize(keyword)))
    if (tourHasVibe) score += 2.5
    if (category.destinations.some((place) => tourName.includes(normalize(place)))) score += 2.0
  }

  const searchable = normalize(`${tour.name} ${tour.highlight} ${tour.region}`)
  for (const token of normQuery.split(/\s+/)) {
    if (token.length >= 2 && searchable.includes(token)) score += 0.5
  }
  return score
}

/** Dự phòng khi selectRelevantTours không nhận ra tiêu chí: xếp tour theo vibe và từ khóa trong câu hỏi. */
export function searchToursByVibe(query: string, tours: Tour[]): { criteriaRecognized: boolean; hasExactMatches: boolean; tours: Tour[] } {
  const normQuery = normalize(query)
  const ranked = tours
    .map((tour, index) => ({ tour, index, score: vibeScore(normQuery, tour) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, TOP_K)
    .map(({ tour }) => tour)
  return { criteriaRecognized: query.trim().length > 0, hasExactMatches: ranked.length > 0, tours: ranked }
}
