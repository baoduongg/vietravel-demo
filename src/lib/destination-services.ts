import { unstable_rethrow } from "next/navigation"

import { getServices } from "@/lib/journey/catalog"
import { getPartnerServices } from "@/lib/partners/store"
import type { DestinationGuide } from "@/types/destination"
import type { ServiceItem } from "@/types/journey"

/** Mọi dịch vụ của điểm đến: catalog (mock + hoạt động + tour) và đối tác đã duyệt. */
export async function destinationServices(
  guide: DestinationGuide,
  loadPartners: (slug: string, bookUrl: string) => Promise<ServiceItem[]> = getPartnerServices,
): Promise<ServiceItem[]> {
  let partners: ServiceItem[] = []
  try {
    partners = await loadPartners(guide.slug, guide.links.tours)
  } catch (error) {
    // Lỗi điều khiển của Next (vd đọc Redis no-store → render động) phải ném tiếp.
    unstable_rethrow(error)
    // Store đối tác lỗi không được làm hỏng trang công khai: hiện catalog, ghi log.
    console.error("Không đọc được dịch vụ đối tác", error)
  }
  return [...getServices(guide.slug), ...partners]
}
