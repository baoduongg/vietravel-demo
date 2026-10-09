import { NextResponse } from "next/server"

import { getPartnerStore } from "@/lib/partners/store"
import type { ApiError } from "@/types/chat"
import type { PartnerWithContact } from "@/types/partner"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }

/** Danh sách đầy đủ kèm liên hệ cho tab xét duyệt. Chỉ được chặn bởi mật khẩu demo ở middleware. */
export async function GET(): Promise<NextResponse<{ partners: PartnerWithContact[] } | ApiError>> {
  try {
    return NextResponse.json({ partners: await getPartnerStore().listAll() }, { headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Không tải được danh sách chờ duyệt." }, { status: 500, headers: NO_STORE })
  }
}
