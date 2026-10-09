import type { PriceUnit, ServiceKind } from "@/types/journey"

/** Vé máy bay và tour là sản phẩm của Vietravel nên không mở cho đối tác. */
export const PARTNER_KINDS = ["Khách sạn", "Nhà hàng", "Vui chơi, trải nghiệm", "Thuê xe, đưa đón", "Sản phẩm địa phương"] as const
export type PartnerKind = (typeof PARTNER_KINDS)[number]

/** Đối tác đã duyệt hiện trong danh mục kế hoạch: loại dịch vụ và đơn vị giá được chọn theo loại hình. */
export const PARTNER_KIND_SERVICE: Record<PartnerKind, { kind: ServiceKind; units: PriceUnit[] }> = {
  "Khách sạn": { kind: "hotel", units: ["per_room_night"] },
  "Nhà hàng": { kind: "dining", units: ["per_person", "per_booking"] },
  "Vui chơi, trải nghiệm": { kind: "activity", units: ["per_person", "per_booking"] },
  "Thuê xe, đưa đón": { kind: "vehicle", units: ["per_day", "per_booking"] },
  "Sản phẩm địa phương": { kind: "souvenir", units: ["per_item"] },
}

/** Cùng thang với khách sạn mẫu trong kế hoạch ("Tầm trung · Dương Đông"). */
export const HOTEL_TIERS = ["Tiết kiệm", "Tầm trung", "Cao cấp", "Sang trọng"] as const
export type HotelTier = (typeof HOTEL_TIERS)[number]

/** Loại hình có giá theo khách thì hỏi chính sách trẻ em, để chi phí kế hoạch không tính trẻ như người lớn. */
export function hasPerPersonPrice(kind: PartnerKind): boolean {
  return PARTNER_KIND_SERVICE[kind].units.includes("per_person")
}

/** Trẻ dưới freeUnderAge tuổi miễn phí; từ đó tới dưới 12 tuổi trả childPercent% giá người lớn. */
export interface ChildPolicy {
  freeUnderAge: number
  childPercent: number
}

export interface PartnerProduct {
  /** Cố định khi sửa danh sách: id dịch vụ trong kế hoạch dựa vào nó. */
  id: string
  name: string
  priceVnd: number
  unit: PriceUnit
  description: string
}

/** Phần hiển thị công khai. */
export interface PartnerBrand {
  brand: string
  kind: PartnerKind
  /** Điểm đến đang mở (getGuide), quyết định kế hoạch nào thấy đối tác. */
  destinationSlug: string
  /** Tên một khu vực trong guide.areas, hiện trên thẻ dịch vụ như dịch vụ mẫu. */
  area: string
  /** Chỉ khách sạn. */
  tier?: HotelTier
  /** Chỉ loại hình có giá theo khách; thiếu thì trẻ em trả như người lớn. */
  childPolicy?: ChildPolicy
  address: string
  /** Link đặt chỗ/fanpage cho nút "Đặt" trong kế hoạch; rỗng thì dùng trang tour của điểm đến. */
  website: string
  description: string
  products: PartnerProduct[]
}

/** Liên hệ chỉ lưu nội bộ, không trả về ở API công khai. */
export interface PartnerContact {
  contactName: string
  phone: string
  email: string
}

export type PartnerInput = PartnerBrand & PartnerContact

/** Phần chủ cửa hàng tự sửa được sau khi gửi; loại hình cố định, liên hệ đổi qua Vietravel. */
export type PartnerInfo = Pick<PartnerBrand, "brand" | "destinationSlug" | "area" | "tier" | "childPolicy" | "address" | "website" | "description">

export const PARTNER_STATUSES = ["pending", "approved", "rejected"] as const
export type PartnerStatus = (typeof PARTNER_STATUSES)[number]

export interface Partner extends PartnerBrand {
  id: string
  status: PartnerStatus
  createdAt: string
  /** Lúc Vietravel duyệt hoặc từ chối. */
  reviewedAt?: string
  /** Có ảnh đại diện; nằm trong đường dẫn ảnh để đổi ảnh là cache mới. */
  imageVersion?: number
}

/** Bản đầy đủ cho tab xét duyệt của Vietravel. */
export type PartnerWithContact = Partner & PartnerContact
