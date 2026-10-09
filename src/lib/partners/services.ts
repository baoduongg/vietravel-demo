import type { ChildRate, ServiceItem } from "@/types/journey"
import { PARTNER_KIND_SERVICE, type ChildPolicy, type Partner } from "@/types/partner"

export function partnerServiceId(partnerId: string, productId: string): string {
  return `partner-${partnerId}-${productId}`
}

/** Ảnh phục vụ qua /api/partners/[id]/image/[version]; version đổi khi đổi ảnh để cache không giữ ảnh cũ. */
export function partnerImageUrl(partner: Pick<Partner, "id" | "imageVersion">): string | undefined {
  return partner.imageVersion ? `/api/partners/${partner.id}/image/${partner.imageVersion}` : undefined
}

/** Cùng dạng bậc giá với vé bay, vui chơi, tour: bậc miễn phí (nếu có) rồi bậc dưới 12 tuổi. */
export function childRates(policy: ChildPolicy | undefined): ChildRate[] | undefined {
  if (!policy) return undefined
  const rates: ChildRate[] = [{ underAge: 12, rate: policy.childPercent / 100 }]
  return policy.freeUnderAge > 0 ? [{ underAge: policy.freeUnderAge, rate: 0 }, ...rates] : rates
}

/** Mỗi sản phẩm của đối tác đã duyệt ở điểm đến này thành một dịch vụ trong danh mục kế hoạch. */
export function partnerServices(partners: Partner[], destinationSlug: string, fallbackBookUrl: string): ServiceItem[] {
  return partners
    .filter((partner) => partner.status === "approved" && partner.destinationSlug === destinationSlug)
    .flatMap((partner) =>
      partner.products.map((product) => ({
        id: partnerServiceId(partner.id, product.id),
        kind: PARTNER_KIND_SERVICE[partner.kind].kind,
        destinationSlug,
        name: product.name,
        // Dạng "Phân khúc · Khu vực" như dịch vụ mẫu, thêm tên thương hiệu vì tên sản phẩm thường là tên phòng/món.
        tag: [partner.brand, partner.tier, partner.area].filter(Boolean).join(" · "),
        blurb: product.description || partner.description,
        imageUrl: partnerImageUrl(partner),
        priceVnd: product.priceVnd,
        priceUnit: product.unit,
        childRates: product.unit === "per_person" ? childRates(partner.childPolicy) : undefined,
        bookUrl: partner.website || fallbackBookUrl,
        mock: false,
      })),
    )
}
