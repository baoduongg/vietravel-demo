import { phuQuoc } from "@/data/destinations/phu-quoc"
import type { DestinationGuide, DestinationSummary } from "@/types/destination"

const IMG = "https://s3-cmc.travel.com.vn/vtv-image/Images/Destination/"

/** Điểm đến hiển thị trên Home. Bản demo chỉ Phú Quốc active. */
export const destinations: DestinationSummary[] = [
  { slug: "phu-quoc", name: "Phú Quốc", caption: "Đảo ngọc, hoàng hôn, nghỉ dưỡng", imageUrl: `${IMG}tf__0_6221_bai-sao-1.webp`, active: true },
  { slug: "da-nang", name: "Đà Nẵng", caption: "Bà Nà, Hội An, biển Mỹ Khê", imageUrl: `${IMG}tf__2_12156_cau-rong-ban-dem.webp`, active: false },
  { slug: "ha-long", name: "Hạ Long", caption: "Kỳ quan thiên nhiên thế giới", imageUrl: `${IMG}tf__0_11106_ha-long-bay.webp`, active: false },
  { slug: "sa-pa", name: "Sa Pa", caption: "Săn mây, ruộng bậc thang", imageUrl: `${IMG}tf__2_3966_view-of-sapa-town.webp`, active: false },
  { slug: "bangkok", name: "Bangkok", caption: "Thái Lan sôi động", imageUrl: `${IMG}tf__0_2666_cung-dien-hoang-gia-thai-lan-1.webp`, active: false },
  { slug: "nhat-ban", name: "Nhật Bản", caption: "Lâu đài, lá đỏ, hoa anh đào", imageUrl: `${IMG}tf__0_4288_lau-dai-matsumoto-2.webp`, active: false },
  { slug: "han-quoc", name: "Hàn Quốc", caption: "Jeju, Seoul, K-culture", imageUrl: `${IMG}tf__0_11802_ganh-da-dia.webp`, active: false },
  { slug: "paris", name: "Paris", caption: "Tháp Eiffel, nghệ thuật, ẩm thực", imageUrl: `${IMG}tf__2_10827_thap-eiffel---paris-2.webp`, active: false },
]

// Map thay vì object thường để slug như "constructor" không trỏ vào thuộc tính của Object.
const guides = new Map<string, DestinationGuide>([[phuQuoc.slug, phuQuoc]])

export function getGuide(slug: string): DestinationGuide | undefined {
  const summary = destinations.find((destination) => destination.slug === slug)
  return summary?.active ? guides.get(slug) : undefined
}
