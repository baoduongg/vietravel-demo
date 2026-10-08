import { NextResponse } from "next/server"

import { createJourney } from "@/lib/journey/create"
import { journeyErrorResponse, NO_STORE } from "@/lib/journey/http"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import type { CreateJourneyResponse } from "@/types/journey"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null)
    const { journey, memberId } = createJourney(body)
    await getJourneyStore().create(journey)
    return NextResponse.json<CreateJourneyResponse>({ journey: forRole(journey, "edit"), memberId }, { status: 201, headers: NO_STORE })
  } catch (error) {
    return journeyErrorResponse(error)
  }
}
