import { NextResponse } from "next/server"

import { resolveVideoUrl } from "@/lib/reviews/resolve-video"
import type { ApiError } from "@/types/chat"
import type { ReviewVideo } from "@/types/destination"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }

/** Đổi link YouTube/TikTok (kể cả link rút gọn TikTok) thành video để form xem trước. */
export async function GET(request: Request): Promise<NextResponse<{ video: ReviewVideo } | ApiError>> {
  const url = new URL(request.url).searchParams.get("url") ?? ""
  const video = url.length <= 500 ? await resolveVideoUrl(url) : null
  if (!video) {
    return NextResponse.json({ error: "Link chưa đúng, Quý khách dán link video YouTube hoặc TikTok nhé." }, { status: 400, headers: NO_STORE })
  }
  return NextResponse.json({ video }, { headers: NO_STORE })
}
