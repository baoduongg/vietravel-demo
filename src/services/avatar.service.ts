import axios from "axios"

import { http } from "@/services/http"
import type { ChatMessage, ChatRequest, ChatResponse, TtsRequest } from "@/types/chat"

async function readBlobError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    const text = await error.response.data.text()
    try {
      error.response.data = JSON.parse(text) as unknown
    } catch {
      error.response.data = { error: text }
    }
  }
  throw error
}

export const avatarService = {
  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<ChatResponse> {
    const { data } = await http.post<ChatResponse, { data: ChatResponse }, ChatRequest>(
      "/avatar/chat",
      { messages },
      { signal },
    )
    return data
  },

  async synthesize(text: string, signal?: AbortSignal): Promise<ArrayBuffer> {
    const { data } = await http
      .post<Blob, { data: Blob }, TtsRequest>("/avatar/tts", { text }, { signal, responseType: "blob" })
      .catch(readBlobError)
    return data.arrayBuffer()
  },

  /** Lời chào cố định, tạo sẵn bằng scripts/generate-greeting.ts. */
  async greeting(signal?: AbortSignal): Promise<ArrayBuffer> {
    const response = await fetch("/audio/greeting.mp3", { signal })
    if (!response.ok) throw new Error(`Không tải được lời chào (${response.status})`)
    return response.arrayBuffer()
  },
}
