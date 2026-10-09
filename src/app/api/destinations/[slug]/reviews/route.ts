import { NextResponse } from "next/server"

import { getGuide } from "@/data/destinations"
import { getReviewStore } from "@/lib/reviews/store"
import { parseReviewInput } from "@/lib/reviews/validate"
import type { ApiError } from "@/types/chat"
import type { UserReview } from "@/types/destination"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }

interface RouteContext {
  params: Promise<{ slug: string }>
}

function notFound(): NextResponse<ApiError> {
  return NextResponse.json({ error: "Không tìm thấy điểm đến." }, { status: 404, headers: NO_STORE })
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse<{ reviews: UserReview[] } | ApiError>> {
  const { slug } = await params
  if (!getGuide(slug)) return notFound()
  try {
    return NextResponse.json({ reviews: await getReviewStore().list(slug) }, { headers: NO_STORE })
  } catch (error) {
    console.error("[reviews]", error)
    return NextResponse.json({ error: "Không tải được review." }, { status: 500, headers: NO_STORE })
  }
}

export async function POST(request: Request, { params }: RouteContext): Promise<NextResponse<{ review: UserReview } | ApiError>> {
  const { slug } = await params
  if (!getGuide(slug)) return notFound()
  const parsed = parseReviewInput(await request.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400, headers: NO_STORE })
  try {
    return NextResponse.json({ review: await getReviewStore().add(slug, parsed.review) }, { status: 201, headers: NO_STORE })
  } catch (error) {
    console.error("[reviews]", error)
    return NextResponse.json({ error: "Chưa gửi được review, Quý khách thử lại nhé." }, { status: 500, headers: NO_STORE })
  }
}
