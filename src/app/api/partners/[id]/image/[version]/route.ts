import { getPartnerStore } from "@/lib/partners/store"

export const runtime = "nodejs"

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/

/** Ảnh đại diện đối tác. Công khai (middleware bỏ qua) để next/image tối ưu được; version trong đường dẫn nên cache lâu. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params
  try {
    const match = DATA_URL.exec((await getPartnerStore().getImage(id)) ?? "")
    if (!match) return new Response("Không có ảnh", { status: 404 })
    return new Response(Buffer.from(match[2], "base64"), {
      headers: { "Content-Type": match[1], "Cache-Control": "public, max-age=31536000, immutable" },
    })
  } catch (error) {
    console.error("[partners]", error)
    return new Response("Lỗi tải ảnh", { status: 500 })
  }
}
