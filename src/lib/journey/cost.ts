import { SERVICE_KINDS, type ChildRate, type Journey, type JourneyItem, type PriceUnit, type ServiceKind, type Travelers } from "@/types/journey"

export interface CostEstimate {
  totalVnd: number
  /** Tổng chia số người lớn, làm tròn nghìn đồng. */
  perAdultVnd: number
  byKind: Record<ServiceKind, number>
}

/** Hệ số giá của một bé: bậc đầu tiên có tuổi < underAge; không khớp bậc nào thì trả như người lớn. */
export function childFactor(age: number, rates: ChildRate[] = []): number {
  return rates.find((rate) => age < rate.underAge)?.rate ?? 1
}

/** Số lượng khi người dùng chưa chỉnh. null với giá theo khách (đã tính theo số người). */
export function defaultQuantity(unit: PriceUnit, travelers: Travelers): number | null {
  switch (unit) {
    case "per_person":
      return null
    case "per_room_night":
      return Math.ceil(travelers.adults / 2)
    default:
      return 1
  }
}

/** Chi phí một mục, chưa xét mục đó đã xếp ngày hay chưa. */
export function itemCost(item: Pick<JourneyItem, "snapshot" | "quantity">, nights: number, travelers: Travelers): number {
  const { priceVnd, priceUnit, childRates } = item.snapshot
  const quantity = item.quantity ?? defaultQuantity(priceUnit, travelers) ?? 1
  switch (priceUnit) {
    case "per_person": {
      const children = travelers.childAges.reduce((sum, age) => sum + childFactor(age, childRates), 0)
      return Math.round(priceVnd * (travelers.adults + children))
    }
    case "per_room_night":
      return priceVnd * Math.max(nights, 1) * quantity
    case "per_day":
      return priceVnd * (nights + 1) * quantity
    case "per_booking":
    case "per_item":
      return priceVnd * quantity
  }
}

/** Chỉ tính các mục đã xếp vào ngày; mục "Đang cân nhắc" thường là các lựa chọn đang so sánh. */
export function estimateCost(journey: Pick<Journey, "items" | "nights" | "travelers">): CostEstimate {
  const byKind = Object.fromEntries(SERVICE_KINDS.map((kind) => [kind, 0])) as Record<ServiceKind, number>
  for (const item of journey.items) {
    if (item.day === null) continue
    byKind[item.snapshot.kind] += itemCost(item, journey.nights, journey.travelers)
  }
  const totalVnd = SERVICE_KINDS.reduce((sum, kind) => sum + byKind[kind], 0)
  return { totalVnd, perAdultVnd: Math.round(totalVnd / journey.travelers.adults / 1000) * 1000, byKind }
}
