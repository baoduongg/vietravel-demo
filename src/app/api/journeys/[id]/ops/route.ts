import { NextResponse } from "next/server"

import { journeyErrorResponse, NO_STORE, notFoundResponse, serverDeps } from "@/lib/journey/http"
import { applyOp, forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { JourneyOpResponse } from "@/types/journey"

export const runtime = "nodejs"

function isJoin(op: unknown): boolean {
  return typeof op === "object" && op !== null && (op as Record<string, unknown>).type === "join"
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params
    const body: unknown = await request.json().catch(() => null)
    const { token, memberId, op } = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
    const store = getJourneyStore()
    const found = typeof token === "string" ? await store.findByToken(token) : null
    if (!found || found.journey.id !== id) return notFoundResponse()

    // Quyền lấy từ token, không tin role do client gửi lên.
    const actor = { role: found.role, memberId: typeof memberId === "string" ? memberId : undefined }
    const journey = await store.update(id, (current) => applyOp(current, op, actor, serverDeps(current.destinationSlug)))
    // Hàng đợi ghi tuần tự nên thành viên cuối chính là người vừa join.
    const joinedId = isJoin(op) ? journey.members.at(-1)?.id : undefined
    return NextResponse.json<JourneyOpResponse>({ journey: forRole(journey, found.role), memberId: joinedId }, { headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
