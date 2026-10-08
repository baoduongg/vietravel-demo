import { formatShortDate, formatVnd } from "@/lib/format"
import { PRICE_UNIT_LABEL, type JourneyInfoValues, type ServiceSnapshot, type Travelers } from "@/types/journey"

export function travelersLabel({ adults, childAges }: Travelers): string {
  const adultsText = `${adults} người lớn`
  if (childAges.length === 0) return adultsText
  return `${adultsText}, ${childAges.length} bé (${childAges.join(", ")} tuổi)`
}

export function durationLabel(nights: number): string {
  return `${nights + 1}N${nights}Đ`
}

/** "2026-10-31" + 1 → "2026-11-01"; tính theo UTC để không lệch múi giờ. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function dayLabel(startDate: string | null, day: number): string {
  return startDate ? `Ngày ${day} · ${formatShortDate(addDays(startDate, day - 1))}` : `Ngày ${day}`
}

export function priceLabel({ priceVnd, priceUnit }: Pick<ServiceSnapshot, "priceVnd" | "priceUnit">): string {
  return priceVnd === 0 ? "Miễn phí" : `${formatVnd(priceVnd)} ${PRICE_UNIT_LABEL[priceUnit]}`
}

/** 18.400.000 → "18,4tr" cho thanh tóm tắt trên điện thoại. */
export function shortVnd(vnd: number): string {
  if (vnd < 1_000_000) return formatVnd(vnd)
  return `${(vnd / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`
}

/** Giá trị mặc định của form tạo kế hoạch: tên theo tháng sau. */
export function defaultJourneyInfo(destinationName: string, now: Date = new Date()): JourneyInfoValues {
  const nextMonth = (now.getMonth() + 1) % 12 + 1
  return { title: `${destinationName} tháng ${nextMonth}`, startDate: null, nights: 2, travelers: { adults: 2, childAges: [] }, memberName: "" }
}
