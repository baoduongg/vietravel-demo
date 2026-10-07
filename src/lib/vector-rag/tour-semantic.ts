import type { Tour } from "@/types/tour"
import { VIBE_CATEGORIES, type VibeCategory } from "@/lib/vector-rag/semantic-taxonomy"

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
}

export interface EnrichedTourSemantic {
  code: string
  tour: Tour
  vibes: VibeCategory[]
  vibeNames: string[]
  semanticText: string
}

/**
 * Phân tích và sinh hồ sơ ngữ nghĩa (Semantic Profile) cho từng Tour.
 */
export function enrichTourSemantic(tour: Tour): EnrichedTourSemantic {
  const fullText = normalize(`${tour.name} ${tour.highlight} ${tour.region} ${tour.tourLine} ${tour.departureCity}`)
  
  // Xác định các vibe phù hợp với tour dựa trên tên địa danh hoặc từ khóa trong tên tour
  const matchedVibes = VIBE_CATEGORIES.filter((category) => {
    // Khớp theo địa danh
    const destMatch = category.destinations.some((dest) => fullText.includes(normalize(dest)))
    // Khớp theo từ khóa
    const kwMatch = category.keywords.some((kw) => fullText.includes(normalize(kw)))
    return destMatch || kwMatch
  })

  // Sinh văn bản ngữ nghĩa phong phú phục vụ embedding
  const vibeDescriptions = matchedVibes.map((v) => `${v.name}: ${v.description}`).join(". ")
  const semanticText = [
    `Tour: ${tour.name}`,
    tour.highlight ? `Điểm nhấn: ${tour.highlight}` : "",
    `Khu vực: ${tour.region} (${tour.scope === "domestic" ? "Trong nước" : "Quốc tế"})`,
    `Khởi hành: ${tour.departureCity}, thời lượng ${tour.days} ngày ${tour.nights} đêm`,
    `Dòng tour: ${tour.tourLine}, di chuyển: ${tour.transport}`,
    vibeDescriptions ? `Đặc trưng và cảm xúc: ${vibeDescriptions}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return {
    code: tour.code,
    tour,
    vibes: matchedVibes,
    vibeNames: matchedVibes.map((v) => v.name),
    semanticText,
  }
}
