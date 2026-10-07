import type { Tour } from "@/types/tour"

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
  image?: string // Base64 data URL (e.g. data:image/jpeg;base64,...)
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  reply: string
  tours: Tour[]
}

export interface TtsRequest {
  text: string
}

export interface ApiError {
  error: string
}
