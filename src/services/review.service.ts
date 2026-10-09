import { http } from "@/services/http"
import type { ReviewInput, UserReview } from "@/types/destination"

export const reviewService = {
  async list(slug: string, signal?: AbortSignal): Promise<UserReview[]> {
    const { data } = await http.get<{ reviews: UserReview[] }>(`/destinations/${encodeURIComponent(slug)}/reviews`, { signal })
    return data.reviews
  },

  async create(slug: string, input: ReviewInput): Promise<UserReview> {
    const { data } = await http.post<{ review: UserReview }>(`/destinations/${encodeURIComponent(slug)}/reviews`, input)
    return data.review
  },
}
