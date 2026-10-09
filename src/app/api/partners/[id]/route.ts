import { NextResponse } from "next/server"

import { getPartnerStore } from "@/lib/partners/store"
import { parseProducts } from "@/lib/partners/validate"
import type { ApiError } from "@/types/chat"
import { PARTNER_STATUSES, type Partner, type PartnerWithContact } from "@/types/partner"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }
const FORBIDDEN = "Chỉ sửa được trên trình duyệt đã đăng ký thương hiệu này."

interface RouteContext {
  params: Promise<{ id: string }>
}

/** Vietravel đổi trạng thái: body `{ status: "approved" | "rejected" | "pending" }`. */
export async function PATCH(request: Request, { params }: RouteContext): Promise<NextResponse<{ partner: PartnerWithContact } | ApiError>> {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  const status = PARTNER_STATUSES.find((item) => item === body?.status)
  if (!status) return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400, headers: NO_STORE })
  try {
    const partner = await getPartnerStore().setStatus(id, status)
    if (!partner) return NextResponse.json({ error: "Không tìm thấy đối tác." }, { status: 404, headers: NO_STORE })
    return NextResponse.json({ partner }, { headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Chưa cập nhật được trạng thái, vui lòng thử lại." }, { status: 500, headers: NO_STORE })
  }
}

/** Đối tác sửa sản phẩm trên trang chi tiết: body `{ products, editToken }`, thay toàn bộ danh sách. */
export async function PUT(request: Request, { params }: RouteContext): Promise<NextResponse<{ partner: Partner } | ApiError>> {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as { products?: unknown; editToken?: unknown } | null
  try {
    const store = getPartnerStore()
    // Đơn vị giá hợp lệ tùy loại hình nên cần bản ghi hiện tại trước khi kiểm tra.
    const current = await store.findOwned(id, body?.editToken)
    if (!current) return NextResponse.json({ error: FORBIDDEN }, { status: 403, headers: NO_STORE })
    const parsed = parseProducts(body?.products, current.kind)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400, headers: NO_STORE })
    const partner = await store.setProducts(id, parsed.products)
    if (!partner) return NextResponse.json({ error: "Không tìm thấy thương hiệu." }, { status: 404, headers: NO_STORE })
    return NextResponse.json({ partner }, { headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Chưa lưu được sản phẩm, vui lòng thử lại." }, { status: 500, headers: NO_STORE })
  }
}
