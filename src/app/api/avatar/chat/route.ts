import { NextResponse } from "next/server"

import { company, MAX_RECOMMENDED_TOURS, TOUR_TAG } from "@/config/company"
import { findToursByCode, inferToursFromReply, todayIso } from "@/data/tours"
import { buildSystemPrompt } from "@/lib/system-prompt"
import type { ApiError, ChatMessage, ChatResponse } from "@/types/chat"

export const runtime = "nodejs"

const ANTHROPIC_MESSAGES_URL = "https://code.runagent.click/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const FALLBACK_BETA = "server-side-fallback-2026-07-01"
const DEFAULT_MODEL = "claude-opus-5-5"
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const FALLBACK_MODELS = new Set(["claude-fable-5-1", "claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5"])
const MAX_TURNS = 10
const MAX_SENTENCES = 3
const MAX_MESSAGE_LENGTH = 1000
/** Ranh giới câu, trừ dấu chấm sau chữ viết tắt như "TP." trong "TP. Hồ Chí Minh". */
const SENTENCE_BREAK = /(?<=[.!?…])(?<!(?:^|\s)(?:TP|Tp|Q|P|TX|TT)\.)\s+/

interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

interface ClaudeContentBlock {
  type: string
  text?: string
}

interface ClaudeResponse {
  content: ClaudeContentBlock[]
  stop_reason: string | null
}

class ClaudeHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Anthropic API ${status}: ${body}`)
  }
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false
  const { role, content } = value as Record<string, unknown>
  return (role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null
  const { messages } = body as Record<string, unknown>
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) return null
  return messages.map((message) => ({
    role: message.role,
    content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
  }))
}

function toClaudeMessages(messages: ChatMessage[]): ClaudeMessage[] {
  const recent = messages.slice(-MAX_TURNS * 2)
  const firstUserIndex = recent.findIndex((message) => message.role === "user")
  return recent.slice(Math.max(firstUserIndex, 0)).map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"))
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 10000)
  return 500 * 2 ** attempt + Math.random() * 250
}

async function callClaude(apiKey: string, useFallbacks: boolean, body: Record<string, unknown>): Promise<ClaudeResponse> {
  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "content-type": "application/json",
  }
  if (useFallbacks) headers["anthropic-beta"] = FALLBACK_BETA

  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (response.ok) return (await response.json()) as ClaudeResponse
    if (attempt >= MAX_RETRIES || !isRetryable(response.status)) {
      throw new ClaudeHttpError(response.status, await response.text())
    }
    const delay = retryDelayMs(response, attempt)
    await response.body?.cancel()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

function hotlineReply(): string {
  return `Dạ em chưa trả lời được câu này, Quý khách vui lòng gọi tổng đài ${company.hotline} để được hỗ trợ ạ.`
}

function splitTourTag(raw: string): { speech: string; codes: string[] } {
  // Model đôi khi viết sai hoa thường (ví dụ "TOURs:"), nên tìm không phân biệt hoa thường.
  const index = raw.toUpperCase().lastIndexOf(TOUR_TAG)
  if (index === -1) return { speech: raw, codes: [] }
  const codes = raw
    .slice(index + TOUR_TAG.length)
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z0-9]+$/.test(code))
  return { speech: raw.slice(0, index), codes: [...new Set(codes)].slice(0, MAX_RECOMMENDED_TOURS) }
}

function toSpokenText(raw: string): string {
  const plain = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#`>~|[\]{}<>]/g, "")
    .replace(/^\s*[-+•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  return plain
    .split(SENTENCE_BREAK)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, MAX_SENTENCES)
    .join(" ")
}

function errorResponse(error: string, status: number): NextResponse<ApiError> {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request): Promise<NextResponse<ChatResponse | ApiError>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return errorResponse("Máy chủ chưa được cấu hình ANTHROPIC_API_KEY.", 500)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse("Dữ liệu gửi lên không hợp lệ.", 400)
  }

  const messages = parseMessages(body)
  if (!messages || messages.at(-1)?.role !== "user") {
    return errorResponse("Cần gửi danh sách messages, tin nhắn cuối phải của người dùng.", 400)
  }

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
  const useFallbacks = FALLBACK_MODELS.has(model)
  const today = todayIso()

  try {
    const response = await callClaude(apiKey, useFallbacks, {
      model,
      max_tokens: 16000,
      system: [{ type: "text", text: buildSystemPrompt(today), cache_control: { type: "ephemeral" } }],
      messages: toClaudeMessages(messages),
      ...(model.startsWith("claude-haiku") ? {} : { output_config: { effort: "low" } }),
      ...(useFallbacks ? { fallbacks: "default" } : {}),
    })

    if (response.stop_reason === "refusal") return NextResponse.json({ reply: hotlineReply(), tours: [] })

    const text = response.content
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join(" ")
    const { speech, codes } = splitTourTag(text)
    const reply = toSpokenText(speech)
    if (!reply) return NextResponse.json({ reply: hotlineReply(), tours: [] })
    const tours = codes.length > 0 ? findToursByCode(codes, today) : inferToursFromReply(reply, MAX_RECOMMENDED_TOURS, today)
    return NextResponse.json({ reply, tours })
  } catch (error: unknown) {
    console.error("[api/avatar/chat]", error)
    if (error instanceof ClaudeHttpError) {
      if (error.status === 401 || error.status === 403) return errorResponse("ANTHROPIC_API_KEY không hợp lệ.", 500)
      if (error.status === 404) return errorResponse(`Không tìm thấy model ${model}, kiểm tra lại ANTHROPIC_MODEL.`, 500)
      if (error.status === 429) return errorResponse("Hệ thống đang quá tải, Quý khách thử lại sau ít phút nhé.", 429)
      if (error.status >= 500) return errorResponse("Dịch vụ AI đang bận, Quý khách thử lại sau giây lát nhé.", 503)
    }
    return errorResponse("Không thể kết nối tới dịch vụ AI.", 502)
  }
}
