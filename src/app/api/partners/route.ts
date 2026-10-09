import { NextResponse } from "next/server"

import { getPartnerStore } from "@/lib/partners/store"
import { destinationError } from "@/lib/partners/destination"
import { parseImage, parsePartnerInput } from "@/lib/partners/validate"
import type { ApiError } from "@/types/chat"
import type { Partner } from "@/types/partner"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "no-store" }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** Chỉ trả các cửa hàng có id trong `?ids=a,b` (bản công khai, không liên hệ). id không bí mật; quyền sửa nằm ở editToken. */
export async function GET(request: Request): Promise<NextResponse<{ partners: Partner[] } | ApiError>> {
  const ids = new Set((new URL(request.url).searchParams.get("ids") ?? "").split(",").filter((id) => UUID.test(id)).slice(0, 50))
  if (ids.size === 0) return NextResponse.json({ partners: [] }, { headers: NO_STORE })
  try {
    const partners = (await getPartnerStore().list()).filter((partner) => ids.has(partner.id))
    return NextResponse.json({ partners }, { headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Không tải được danh sách đối tác." }, { status: 500, headers: NO_STORE })
  }
}

export async function POST(request: Request): Promise<NextResponse<{ partner: Partner; editToken: string } | ApiError>> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const parsed = parsePartnerInput(body)
  const image = parseImage(body?.image)
  const error = !parsed.ok ? parsed.error : !image.ok ? image.error : destinationError(parsed.partner.destinationSlug, parsed.partner.area)
  if (error || !parsed.ok || !image.ok) return NextResponse.json({ error: error ?? "Dữ liệu đăng ký không hợp lệ." }, { status: 400, headers: NO_STORE })
  try {
    const store = getPartnerStore()
    const { partner: created, editToken } = await store.add(parsed.partner)
    let partner = created
    // Đăng ký đã lưu: lỗi ảnh vẫn trả id + token, chủ cửa hàng thêm ảnh sau ở trang chi tiết.
    if (image.image) partner = (await store.setImage(created.id, image.image).catch((error: unknown) => console.error("[partners] ảnh", error))) ?? created
    return NextResponse.json({ partner, editToken }, { status: 201, headers: NO_STORE })
  } catch (error) {
    console.error("[partners]", error)
    return NextResponse.json({ error: "Chưa gửi được đăng ký, vui lòng thử lại." }, { status: 500, headers: NO_STORE })
  }
}
