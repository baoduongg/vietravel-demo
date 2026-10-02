import type { Tour } from "@/types/tour"

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
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
