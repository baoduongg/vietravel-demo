import { NextResponse } from "next/server"

import { destinationError } from "@/lib/partners/destination"
import { getPartnerStore } from "@/lib/partners/store"
import { parseImage, parseInfo } from "@/lib/partners/validate"
import type { ApiError } from "@/types/chat"
import type { Partner } from "@/types/partner"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }

/** Chủ cửa hàng (body có editToken) sửa thông tin thương hiệu, kèm ảnh mới nếu có. Giữ nguyên loại hình, trạng thái, liên hệ và sản phẩm. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse<{ partner: Partner } | ApiError>> {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  try {
    const store = getPartnerStore()
    // Phân khúc và giá trẻ em hợp lệ tùy loại hình nên cần bản ghi hiện tại.
    const current = await store.findOwned(id, body?.editToken)
    if (!current) return NextResponse.json({ error: "Chỉ sửa được trên trình duyệt đã đăng ký thương hiệu này." }, { status: 403, headers: NO_STORE })
    const parsed = parseInfo(body, current.kind)
    const image = parseImage(body?.image)
    const error = !parsed.ok ? parsed.error : !image.ok ? image.error : destinationError(parsed.info.destinationSlug, parsed.info.area)
    if (error || !parsed.ok || !image.ok) return NextResponse.json({ error: error ?? "Dữ liệu không hợp lệ." }, { status: 400, headers: NO_STORE })
    let partner = await store.setInfo(id, parsed.info)
    if (partner && image.image) partner = await store.setImage(id, image.image)
    if (!partner) return NextResponse.json({ error: "Không tìm thấy thương hiệu." }, { status: 404, headers: NO_STORE })
    return NextResponse.json({ partner }, { headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Chưa lưu được thông tin, vui lòng thử lại." }, { status: 500, headers: NO_STORE })
  }
}
