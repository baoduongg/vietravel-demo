import { NextResponse } from "next/server"

import { company } from "@/config/company"
import { spellOutMoney } from "@/lib/vietnamese-number"
import type { ApiError } from "@/types/chat"

export const runtime = "nodejs"

const SAYDI_TTS_URL = "https://voice.saydi.ai/api/tts"
const MAX_TEXT_LENGTH = 1500
const REQUEST_TIMEOUT_MS = 60000

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Số tổng đài có thể bị viết liền hoặc cách bằng dấu cách, chấm, gạch ngang.
const HOTLINE_PATTERN = new RegExp(company.hotline.replace(/\D/g, "").split("").join("[\\s.-]*"), "g")
const WEBSITE_PATTERN = new RegExp(escapeRegExp(company.website), "gi")

/** Chữ hiển thị giữ dạng số "1800 646 888", còn giọng đọc cần cách đọc từng cụm số. */
function speakContacts(text: string): string {
  return text.replace(HOTLINE_PATTERN, company.hotlineSpoken).replace(WEBSITE_PATTERN, company.websiteSpoken)
}

function errorResponse(error: string, status: number): NextResponse<ApiError> {
  return NextResponse.json({ error }, { status })
}

function parseText(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null
  const { text } = body as Record<string, unknown>
  if (typeof text !== "string") return null
  const trimmed = text.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_TEXT_LENGTH ? trimmed : null
}

function upstreamErrorMessage(status: number): { message: string; status: number } {
  if (status === 401 || status === 403) return { message: "SAYDI_API_KEY không hợp lệ hoặc đã bị thu hồi.", status: 502 }
  if (status === 429) return { message: "Dịch vụ giọng nói đang quá tải hoặc hết hạn mức, Quý khách thử lại sau nhé.", status: 429 }
  return { message: "Dịch vụ giọng nói trả về lỗi.", status: 502 }
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.SAYDI_API_KEY || 'eyJlbWFpbCI6ImR1b25nbmJAcnVuc3lzdGVtLm5ldCIsImV4cCI6MTc5MTE4Mjk4NywiaWF0IjoxNzkxMTgxMTg3LCJpcCI6IjE3Mi4yNS4wLjE2IiwianRpIjoiWW0tZGkySkw4OXdRIiwic3ViIjoiUEFCWlNSSmw5Z1lQMVJRb2UwbmRMTUdxWmZzMiIsInR5cCI6ImFjY2VzcyJ9.forauvYaT4_V5xeZgg_jB1j1c5PsfartjceqHUHtliY'
  if (!apiKey) return errorResponse("Máy chủ chưa được cấu hình SAYDI_API_KEY.", 500)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse("Dữ liệu gửi lên không hợp lệ.", 400)
  }

  const text = parseText(body)
  if (!text) return errorResponse(`Trường text phải có từ 1 đến ${MAX_TEXT_LENGTH} ký tự.`, 400)

  const { voice } = company
  let upstream: Response
  try {
    upstream = await fetch(SAYDI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: spellOutMoney(speakContacts(text)),
        sample: voice.name,
        speed: voice.speed,
        guidance_scale: voice.guidanceScale,
        output_format: "mp3",
        breaks: {
          sentence: 450,
          comma: 250,
          semicolon: 300,
          paragraph: 600,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error: unknown) {
    console.error("[api/avatar/tts]", error)
    return errorResponse("Không thể kết nối tới dịch vụ giọng nói.", 502)
  }

  const contentType = upstream.headers.get("content-type") ?? ""
  if (!upstream.ok || contentType.includes("application/json")) {
    console.error("[api/avatar/tts]", upstream.status, await upstream.text())
    const { message, status } = upstreamErrorMessage(upstream.status)
    return errorResponse(message, status)
  }

  const audio = await upstream.arrayBuffer()
  if (audio.byteLength === 0) return errorResponse("Dịch vụ giọng nói không trả về âm thanh.", 502)

  return new Response(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.byteLength),
      "Cache-Control": "no-store",
    },
  })
}
