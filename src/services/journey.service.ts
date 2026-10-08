import { http } from "@/services/http"
import type {
  CreateJourneyRequest,
  CreateJourneyResponse,
  GetJourneyResponse,
  JourneyOpRequest,
  JourneyOpResponse,
} from "@/types/journey"

export const journeyService = {
  async create(input: CreateJourneyRequest): Promise<CreateJourneyResponse> {
    const { data } = await http.post<CreateJourneyResponse>("/journeys", input)
    return data
  },

  /** null khi kế hoạch chưa đổi so với `since` (server trả 204). */
  async get(token: string, since?: number): Promise<GetJourneyResponse | null> {
    const response = await http.get<GetJourneyResponse>(`/journeys/by-token/${encodeURIComponent(token)}`, {
      params: since === undefined ? undefined : { since },
    })
    return response.status === 204 ? null : response.data
  },

  async op(journeyId: string, request: JourneyOpRequest): Promise<JourneyOpResponse> {
    const { data } = await http.post<JourneyOpResponse>(`/journeys/${encodeURIComponent(journeyId)}/ops`, request)
    return data
  },
}
