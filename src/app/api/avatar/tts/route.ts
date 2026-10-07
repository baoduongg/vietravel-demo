import { NextResponse } from "next/server"

import { company } from "@/config/company"
import { synthesizeVieneuTts } from "@/lib/vieneu-tts"
import { toSpeechText } from "@/lib/speech-text"
import type { ApiError } from "@/types/chat"

export const runtime = "nodejs"

const MAX_TEXT_LENGTH = 1500

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

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse("Dữ liệu gửi lên không hợp lệ.", 400)
  }

  const rawText = parseText(body)
  if (!rawText) return errorResponse(`Trường text phải có từ 1 đến ${MAX_TEXT_LENGTH} ký tự.`, 400)

  const spokenText = toSpeechText(rawText)

  try {
    const audioBuffer = await synthesizeVieneuTts(spokenText, company.voice.name)
    if (audioBuffer.byteLength === 0) {
      return errorResponse("Dịch vụ giọng nói không trả về âm thanh.", 502)
    }

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    })
  } catch (error: unknown) {
    console.error("[api/avatar/tts]", error)
    return errorResponse("Không thể kết nối tới dịch vụ giọng nói.", 502)
  }
}

