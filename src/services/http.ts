import axios, { type AxiosInstance } from "axios"

export const http: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
})

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isCancel(error)) return fallback
  if (axios.isAxiosError<{ error?: string }>(error)) {
    const message = error.response?.data?.error
    if (typeof message === "string" && message.length > 0) return message
    if (error.code === "ECONNABORTED") return "Máy chủ phản hồi quá lâu, Quý khách thử lại nhé."
  }
  return fallback
}
