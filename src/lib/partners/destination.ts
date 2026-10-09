import { destinations, getGuide } from "@/data/destinations"

/** Điểm đến đang mở kèm khu vực trong cẩm nang, cho form đối tác (chỉ gọi phía server). */
export function partnerDestinations(): { slug: string; name: string; areas: string[] }[] {
  return destinations.flatMap(({ slug, name }) => {
    const guide = getGuide(slug)
    return guide ? [{ slug, name, areas: guide.areas.map((area) => area.name) }] : []
  })
}

/** Lỗi nếu điểm đến chưa mở hoặc khu vực không thuộc điểm đến đó. */
export function destinationError(destinationSlug: string, area: string): string | null {
  const guide = getGuide(destinationSlug)
  if (!guide) return "Điểm đến này chưa mở đăng ký."
  if (!guide.areas.some((item) => item.name === area)) return "Khu vực không thuộc điểm đến đã chọn."
  return null
}
