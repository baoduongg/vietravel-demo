import { NextResponse } from "next/server"

import { journeyErrorResponse, NO_STORE, notFoundResponse } from "@/lib/journey/http"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { GetJourneyResponse } from "@/types/journey"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }): Promise<NextResponse> {
  try {
    const found = await getJourneyStore().findByToken((await params).token)
    if (!found) return notFoundResponse()
    // Trình duyệt hỏi lại mỗi 3 giây: chưa đổi thì trả 204 rỗng cho nhẹ.
    const since = new URL(request.url).searchParams.get("since")
    if (since !== null && Number(since) === found.journey.version) return new NextResponse(null, { status: 204, headers: NO_STORE })
    return NextResponse.json<GetJourneyResponse>({ journey: forRole(found.journey, found.role), role: found.role }, { headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
