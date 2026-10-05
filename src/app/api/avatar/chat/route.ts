import { NextResponse } from "next/server"

import { company, MAX_RECOMMENDED_TOURS, TOUR_TAG } from "@/config/company"
import { findToursByCode, getUpcomingTours, inferToursFromReply, scrapedAt, todayIso } from "@/data/tours"
import { selectRelevantTours } from "@/lib/tour-matching"
import { buildSystemPrompt, buildTourContext } from "@/lib/system-prompt"
import type { ApiError, ChatMessage, ChatResponse } from "@/types/chat"

export const runtime = "nodejs"

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
const GEMINI_CACHE_URL = "https://generativelanguage.googleapis.com/v1beta/cachedContents"
const DEFAULT_MODEL = "gemini-3.5-flash-lite"
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const MAX_TURNS = 10
const MAX_SENTENCES = 3
const MAX_MESSAGE_LENGTH = 1000
const SYSTEM_CACHE_TTL_SECONDS = 3600
/** Ranh giới câu, trừ dấu chấm sau chữ viết tắt như "TP." trong "TP. Hồ Chí Minh". */
const SENTENCE_BREAK = /(?<=[.!?…])(?<!(?:^|\s)(?:TP|Tp|Q|P|TX|TT)\.)\s+/

interface GeminiContent {
  role: "user" | "model"
  parts: { text: string }[]
}

interface GeminiResponse {
  candidates?: { content?: GeminiContent; finishReason?: string }[]
}

class GeminiHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Gemini API ${status}: ${body}`)
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

function toGeminiContents(messages: ChatMessage[], dynamicTourContext: string): GeminiContent[] {
  const recent = messages.slice(-MAX_TURNS * 2)
  const firstUserIndex = recent.findIndex((message) => message.role === "user")
  const contents = recent.slice(Math.max(firstUserIndex, 0)).map((message) => ({
    role: message.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: message.content }],
  }))
  const latestUserMessage = contents.pop()
  return [
    ...contents,
    { role: "user", parts: [{ text: `[DỮ LIỆU TOUR ĐƯỢC HỆ THỐNG CHỌN]\n${dynamicTourContext}` }] },
    latestUserMessage!,
  ]
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"))
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 10000)
  return 500 * 2 ** attempt + Math.random() * 250
}

async function callGemini(apiKey: string, model: string, body: Record<string, unknown>): Promise<GeminiResponse> {
  const headers: Record<string, string> = {
    "x-goog-api-key": apiKey,
    "content-type": "application/json",
  }
  const url = `${GEMINI_API_BASE}/${model}:generateContent`

  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (response.ok) return (await response.json()) as GeminiResponse
    if (attempt >= MAX_RETRIES || !isRetryable(response.status)) {
      throw new GeminiHttpError(response.status, await response.text())
    }
    const delay = retryDelayMs(response, attempt)
    await response.body?.cancel()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

interface SystemCacheEntry {
  key: string
  name: string
  expiresAt: number
}

let systemCache: SystemCacheEntry | null = null

/** System prompt (155 tour + FAQ) đổi nhiều nhất 1 lần/ngày, nên cache qua Gemini cachedContents thay vì gửi lại full mỗi lượt chat. */
async function getCachedSystemInstruction(apiKey: string, model: string, today: string): Promise<string | null> {
  const key = `${model}:${today}:${scrapedAt}`
  if (systemCache && systemCache.key === key && systemCache.expiresAt > Date.now()) {
    return systemCache.name
  }
  const response = await fetch(GEMINI_CACHE_URL, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      model: `models/${model}`,
      systemInstruction: { parts: [{ text: buildSystemPrompt(today) }] },
      ttl: `${SYSTEM_CACHE_TTL_SECONDS}s`,
    }),
    cache: "no-store",
  })
  if (!response.ok) {
    console.error("[api/avatar/chat] cache create failed", response.status, await response.text())
    return null
  }
  const data = (await response.json()) as { name: string }
  systemCache = { key, name: data.name, expiresAt: Date.now() + (SYSTEM_CACHE_TTL_SECONDS - 60) * 1000 }
  return data.name
}

function isCacheMissError(error: unknown): boolean {
  return error instanceof GeminiHttpError && error.status === 404 && error.body.includes("cachedContent")
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
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return errorResponse("Máy chủ chưa được cấu hình GEMINI_API_KEY.", 500)

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

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const today = todayIso()

  try {
    const match = selectRelevantTours(getUpcomingTours(today), messages.slice(-MAX_TURNS * 2), today)
    const dynamicTourContext = buildTourContext(match.tours, match)
    const contents = toGeminiContents(messages, dynamicTourContext)
    const generationConfig = { maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 } }
    const cacheName = await getCachedSystemInstruction(apiKey, model, today)

    const response = await (async () => {
      if (!cacheName) {
        return callGemini(apiKey, model, {
          contents,
          systemInstruction: { parts: [{ text: buildSystemPrompt(today) }] },
          generationConfig,
        })
      }
      try {
        return await callGemini(apiKey, model, { contents, cachedContent: cacheName, generationConfig })
      } catch (error) {
        if (!isCacheMissError(error)) throw error
        systemCache = null
        return callGemini(apiKey, model, {
          contents,
          systemInstruction: { parts: [{ text: buildSystemPrompt(today) }] },
          generationConfig,
        })
      }
    })()

    const candidate = response.candidates?.[0]
    if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
      return NextResponse.json({ reply: hotlineReply(), tours: [] })
    }

    const text = (candidate?.content?.parts ?? [])
      .map((part) => part.text)
      .filter((value): value is string => typeof value === "string")
      .join(" ")
    const { speech, codes } = splitTourTag(text)
    const reply = toSpokenText(speech)
    if (!reply) return NextResponse.json({ reply: hotlineReply(), tours: [] })
    const tours = codes.length > 0 ? findToursByCode(codes, today) : inferToursFromReply(reply, MAX_RECOMMENDED_TOURS, today)
    return NextResponse.json({ reply, tours })
  } catch (error: unknown) {
    console.error("[api/avatar/chat]", error)
    if (error instanceof GeminiHttpError) {
      if (error.status === 401 || error.status === 403) return errorResponse("GEMINI_API_KEY không hợp lệ.", 500)
      if (error.status === 404) return errorResponse(`Không tìm thấy model ${model}, kiểm tra lại GEMINI_MODEL.`, 500)
      if (error.status === 429) return errorResponse("Hệ thống đang quá tải, Quý khách thử lại sau ít phút nhé.", 429)
      if (error.status >= 500) return errorResponse("Dịch vụ AI đang bận, Quý khách thử lại sau giây lát nhé.", 503)
    }
    return errorResponse("Không thể kết nối tới dịch vụ AI.", 502)
  }
}
