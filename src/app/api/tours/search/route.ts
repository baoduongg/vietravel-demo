import { NextResponse } from "next/server"

import { MAX_QUERY_LENGTH, searchPageUrl, searchVietravelTours } from "@/lib/vietravel-search"
import type { TourSearchResponse } from "@/types/tour"

export const runtime = "nodejs"

export async function GET(request: Request): Promise<NextResponse> {
  const query = new URL(request.url).searchParams.get("q")?.trim().replace(/\s+/g, " ") ?? ""
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: `Nhập điểm đến từ 1 đến ${MAX_QUERY_LENGTH} ký tự` }, { status: 400 })
  }

  try {
    const tours = await searchVietravelTours(query)
    return NextResponse.json<TourSearchResponse>({ query, tours, searchUrl: searchPageUrl(query) })
  } catch (error) {
    console.error("Tìm tour travel.com.vn lỗi:", error)
    return NextResponse.json({ error: "Chưa tải được tour từ travel.com.vn, thử lại sau ít phút" }, { status: 502 })
  }
}
