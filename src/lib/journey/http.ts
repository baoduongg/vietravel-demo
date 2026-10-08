import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { getService } from "@/lib/journey/catalog"
import { JourneyError } from "@/lib/journey/errors"
import type { OpDeps } from "@/lib/journey/operations"
import type { ApiError } from "@/types/chat"

export const NO_STORE = { "Cache-Control": "no-store" }

export function journeyErrorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof JourneyError) return NextResponse.json({ error: error.message }, { status: error.status, headers: NO_STORE })
  console.error("[journey]", error)
  return NextResponse.json({ error: "Không lưu được kế hoạch, Quý khách thử lại nhé." }, { status: 500, headers: NO_STORE })
}

export function notFoundResponse(): NextResponse<ApiError> {
  return NextResponse.json({ error: "Không tìm thấy kế hoạch." }, { status: 404, headers: NO_STORE })
}

export function serverDeps(destinationSlug: string): OpDeps {
  return { lookup: (id) => getService(destinationSlug, id), newId: randomUUID, now: () => new Date() }
}
