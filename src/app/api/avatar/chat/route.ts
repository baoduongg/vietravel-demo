import { NextResponse } from "next/server"

import { company, MAX_RECOMMENDED_TOURS } from "@/config/company"
import { findToursByCode, getUpcomingTours, inferToursFromReply, todayIso } from "@/data/tours"
import { splitTourTag, toSpokenText } from "@/lib/reply-text"
import { selectRelevantTours } from "@/lib/tour-matching"
import { searchToursByVibe } from "@/lib/vibe-search"
import { buildSystemPrompt, buildTourContext } from "@/lib/system-prompt"
import type { ApiError, ChatMessage, ChatResponse } from "@/types/chat"

export const runtime = "nodejs"

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
const DEFAULT_MODEL = "gemini-3.5-flash-lite"
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const MAX_TURNS = 10
const MAX_MESSAGE_LENGTH = 1000

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } }

interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
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

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], data: match[2] }
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false
  const { role, content, image } = value as Record<string, unknown>
  const hasContent = typeof content === "string" && content.trim().length > 0
  const hasImage = typeof image === "string" && image.startsWith("data:image/")
  return (role === "user" || role === "assistant") && (hasContent || hasImage)
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null
  const { messages } = body as Record<string, unknown>
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) return null
  return messages.map((message) => ({
    role: message.role,
    content: (message.content ?? "").trim().slice(0, MAX_MESSAGE_LENGTH),
    image: typeof message.image === "string" && message.image.startsWith("data:image/") ? message.image : undefined,
  }))
}

function toGeminiContents(messages: ChatMessage[], dynamicTourContext: string): GeminiContent[] {
  const recent = messages.slice(-MAX_TURNS * 2)
  const firstUserIndex = recent.findIndex((message) => message.role === "user")
  const contents = recent.slice(Math.max(firstUserIndex, 0)).map((message) => {
    const parts: GeminiPart[] = []
    if (message.image) {
      const parsed = parseDataUrl(message.image)
      if (parsed) {
        parts.push({ inlineData: parsed })
      }
    }
    if (message.content) {
      parts.push({ text: message.content })
    }
    return {
      role: message.role === "assistant" ? ("model" as const) : ("user" as const),
      parts,
    }
  })
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

/** Tên địa danh chính trong ảnh (vài từ); rỗng nếu không nhận ra. */
async function detectPlace(apiKey: string, model: string, image: string): Promise<string> {
  const inlineData = parseDataUrl(image)
  if (!inlineData) return ""
  try {
    const response = await callGemini(apiKey, model, {
      contents: [
        {
          role: "user",
          parts: [{ inlineData }, { text: "Ảnh chụp địa danh/điểm đến du lịch nào? Chỉ trả lời tên địa danh và quốc gia hoặc tỉnh, tối đa 8 từ. Không nhận ra thì trả lời: không rõ" }],
        },
      ],
      generationConfig: { maxOutputTokens: 30, thinkingConfig: { thinkingBudget: 0 } },
    })
    const text = (response.candidates?.[0]?.content?.parts ?? []).map((part) => ("text" in part ? part.text : "")).join(" ").trim()
    return /không rõ/i.test(text) ? "" : text
  } catch {
    return ""
  }
}

function hotlineReply(): string {
  return `Dạ em chưa trả lời được câu này, Quý khách vui lòng gọi tổng đài ${company.hotline} để được hỗ trợ ạ.`
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
    const latestMessage = messages.at(-1)
    const hasImage = Boolean(latestMessage?.image)

    const upcoming = getUpcomingTours(today)
    // Ảnh: nhận diện địa danh bằng một lượt gọi ngắn, rồi lọc tour theo tên đó như chat chữ.
    let matchMessages = messages.slice(-MAX_TURNS * 2)
    if (hasImage) {
      const place = await detectPlace(apiKey, model, latestMessage!.image!)
      if (place) matchMessages = [...matchMessages, { role: "user", content: place }]
    }

    let match = selectRelevantTours(upcoming, matchMessages, today)
    if (!match.criteriaRecognized || match.tours.length === 0) {
      const userText = matchMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ")
      if (userText.trim()) {
        const vibeResult = searchToursByVibe(userText, upcoming)
        if (vibeResult.tours.length > 0) match = vibeResult
      }
    }

    const dynamicTourContext = buildTourContext(match.tours, { ...match, hasImage })
    const contents = toGeminiContents(messages, dynamicTourContext)
    const generationConfig = { maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 } }

    const response = await callGemini(apiKey, model, {
      contents,
      systemInstruction: { parts: [{ text: buildSystemPrompt(today) }] },
      generationConfig,
    })

    const candidate = response.candidates?.[0]
    if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
      return NextResponse.json({ reply: hotlineReply(), tours: [] })
    }

    const text = (candidate?.content?.parts ?? [])
      .map((part) => ("text" in part ? part.text : ""))
      .filter((value): value is string => typeof value === "string" && value.length > 0)
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
