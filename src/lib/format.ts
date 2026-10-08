export function formatVnd(priceVnd: number): string {
  return `${priceVnd.toLocaleString("vi-VN")}đ`
}

/** "2026-10-13" → "13/10". */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  return `${day}/${month}`
}

/** Tour chưa có đánh giá thì không hiện gì thay vì in "null". */
export function formatRating(rating: number | null): string | null {
  return rating === null ? null : rating.toFixed(1)
}
