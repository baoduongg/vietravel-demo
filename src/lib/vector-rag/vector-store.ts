import type { Tour } from "@/types/tour"
import { enrichTourSemantic, type EnrichedTourSemantic } from "@/lib/vector-rag/tour-semantic"
import { VIBE_CATEGORIES } from "@/lib/vector-rag/semantic-taxonomy"

const GEMINI_EMBED_BASE = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
}

/**
 * Tính Cosine Similarity giữa 2 vector.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dot / denominator
}

/**
 * Gọi Google Gemini API để tạo vector embedding cho đoạn văn bản.
 */
export async function getGeminiEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${GEMINI_EMBED_BASE}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text.slice(0, 1000) }] },
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn("[vector-store] Gemini embedding API error:", response.status)
      return null
    }

    const data = (await response.json()) as { embedding?: { values?: number[] } }
    return data.embedding?.values ?? null
  } catch (err) {
    console.error("[vector-store] Failed to fetch embedding:", err)
    return null
  }
}

interface TourEmbeddingEntry {
  semantic: EnrichedTourSemantic
  vector: number[] | null
}

const embeddingCache = new Map<string, TourEmbeddingEntry>()

/**
 * Chuẩn bị và lưu trữ vector nhúng cho danh sách tour.
 */
export async function initializeTourEmbeddings(tours: Tour[], apiKey?: string): Promise<void> {
  for (const tour of tours) {
    if (!embeddingCache.has(tour.code)) {
      const semantic = enrichTourSemantic(tour)
      let vector: number[] | null = null
      if (apiKey) {
        vector = await getGeminiEmbedding(semantic.semanticText, apiKey)
      }
      embeddingCache.set(tour.code, { semantic, vector })
    }
  }
}

/**
 * Tìm kiếm theo từ khóa cảm xúc/vibe dựa trên taxonomy khi không có API embedding.
 */
function calculateLexicalVibeScore(query: string, semantic: EnrichedTourSemantic): number {
  const normQuery = normalize(query)
  let score = 0

  // 1. So khớp với các danh mục Vibe
  for (const cat of VIBE_CATEGORIES) {
    const isCatMentionedInQuery = cat.keywords.some((kw) => normQuery.includes(normalize(kw)))
    if (isCatMentionedInQuery) {
      // Nếu tour này thuộc danh mục cảm xúc đó
      const hasVibe = semantic.vibes.some((v) => v.id === cat.id)
      if (hasVibe) score += 2.5

      // Nếu tour đi qua địa danh tiêu biểu của vibe đó
      const normTourName = normalize(semantic.tour.name)
      const hasDest = cat.destinations.some((d) => normTourName.includes(normalize(d)))
      if (hasDest) score += 2.0
    }
  }

  // 2. So khớp từ khóa trực tiếp trong tên và điểm nhấn tour
  const normTourText = normalize(`${semantic.tour.name} ${semantic.tour.highlight} ${semantic.tour.region}`)
  const queryTokens = normQuery.split(/\s+/).filter((token) => token.length >= 2)
  for (const token of queryTokens) {
    if (normTourText.includes(token)) {
      score += 0.5
    }
  }

  return score
}

export interface HybridSearchParams {
  query: string
  tours: Tour[]
  apiKey?: string
  budget?: number
  date?: string
  departureCity?: string
  topK?: number
}

export interface HybridSearchResult {
  criteriaRecognized: boolean
  hasExactMatches: boolean
  tours: Tour[]
}

/**
 * Tìm kiếm tour kết hợp (Hybrid Vector RAG + Hard Constraints).
 */
export async function searchToursHybrid({
  query,
  tours,
  apiKey,
  budget,
  date,
  departureCity,
  topK = 5,
}: HybridSearchParams): Promise<HybridSearchResult> {
  // 1. Tạo embedding cho câu truy vấn của người dùng nếu có apiKey
  let queryVector: number[] | null = null
  if (apiKey && query.trim()) {
    queryVector = await getGeminiEmbedding(query, apiKey)
  }

  // 2. Tính điểm xếp hạng từng Tour
  const scoredTours = tours.map((tour, index) => {
    let entry = embeddingCache.get(tour.code)
    if (!entry) {
      entry = { semantic: enrichTourSemantic(tour), vector: null }
      embeddingCache.set(tour.code, entry)
    }

    let semanticScore = 0

    // a. Điểm Vector Similarity nếu có vector
    if (queryVector && entry.vector) {
      const sim = cosineSimilarity(queryVector, entry.vector)
      semanticScore += Math.max(0, sim) * 4.0
    }

    // b. Điểm Vibe taxonomy & Lexical matching
    const lexicalScore = calculateLexicalVibeScore(query, entry.semantic)
    semanticScore += lexicalScore

    // c. Điểm Hard Constraints (Bộ lọc cứng)
    const normCity = departureCity ? normalize(departureCity.replace(/^TP\.\s*/i, "")) : undefined
    const normTourCity = normalize(tour.departureCity.replace(/^TP\.\s*/i, ""))
    const cityMatch = Boolean(normCity && normTourCity.includes(normCity))

    const dateMatch = Boolean(
      date && (tour.departureDates.includes(date) || tour.deal?.departureDate === date),
    )

    const price = tour.deal?.priceVnd ?? tour.priceVnd
    const budgetMatch = Boolean(budget && price <= budget)
    const budgetScore = budget ? Math.min(1.5, budget / Math.max(price, 1000)) : 0

    // Tổng điểm
    const totalScore = semanticScore + (cityMatch ? 2.5 : 0) + (dateMatch ? 2.0 : 0) + budgetScore

    // Điều kiện khớp
    const isMatched =
      (!normCity || cityMatch) &&
      (!date || dateMatch) &&
      (!budget || budgetMatch) &&
      (semanticScore > 0.3 || cityMatch || dateMatch || budgetMatch)

    return {
      tour,
      index,
      semanticScore,
      totalScore,
      isMatched,
    }
  })

  // 3. Lọc và sắp xếp theo điểm tổng hợp
  const exact = scoredTours.filter((item) => item.isMatched && item.totalScore > 0)
  const ranked = (exact.length > 0 ? exact : scoredTours.filter((item) => item.totalScore > 0))
    .sort((a, b) => b.totalScore - a.totalScore || a.index - b.index)
    .slice(0, topK)
    .map((item) => item.tour)

  const criteriaRecognized = Boolean(budget || date || departureCity || query.trim().length > 0)

  return {
    criteriaRecognized,
    hasExactMatches: exact.length > 0,
    tours: ranked,
  }
}
