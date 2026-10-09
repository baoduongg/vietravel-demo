import { http } from "@/services/http"
import type { TourSearchResponse } from "@/types/tour"

export const tourService = {
  async search(query: string, signal?: AbortSignal): Promise<TourSearchResponse> {
    const { data } = await http.get<TourSearchResponse>("/tours/search", { params: { q: query }, signal })
    return data
  },
}
