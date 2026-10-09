import { isValidVideo, MAX_REVIEW_VIDEOS } from "@/lib/reviews/video"
import type { Review, ReviewVideo } from "@/types/destination"

/** Dùng chung client và server để form chặn trước cùng giới hạn với API. */
export const REVIEW_LIMITS = { nickLength: 40, textMin: 10, textMax: 500 } as const

export const COMPANIONS = ["Gia đình", "Cặp đôi", "Nhóm bạn", "Đi cùng ba mẹ", "Đi một mình", "Công tác"] as const

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/

export type ParsedReview = { ok: true; review: Review } | { ok: false; error: string }

/** Kiểm tra body form gửi lên, trả review đã chuẩn hóa hoặc thông báo lỗi tiếng Việt. */
export function parseReviewInput(body: unknown, now: Date = new Date()): ParsedReview {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu review không hợp lệ." }
  const input = body as Record<string, unknown>

  const nick = typeof input.nick === "string" ? input.nick.trim().replace(/\s+/g, " ") : ""
  if (!nick) return { ok: false, error: "Quý khách vui lòng nhập tên hiển thị." }
  if (nick.length > REVIEW_LIMITS.nickLength) return { ok: false, error: `Tên hiển thị tối đa ${REVIEW_LIMITS.nickLength} ký tự.` }

  const companion = COMPANIONS.find((item) => item === input.companion)
  if (!companion) return { ok: false, error: "Quý khách vui lòng chọn đi cùng ai." }

  let trip: string = companion
  if (input.month !== undefined && input.month !== "") {
    const match = typeof input.month === "string" ? MONTH.exec(input.month) : null
    if (!match) return { ok: false, error: "Tháng đi không hợp lệ." }
    const [, year, month] = match
    // Tháng theo giờ Việt Nam, không theo đồng hồ server (thường là UTC). Không import todayIso: file này chạy cả ở client.
    const currentMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now).slice(0, 7)
    if (`${year}-${month}` > currentMonth) return { ok: false, error: "Tháng đi không được ở tương lai." }
    trip = `${companion} · Tháng ${Number(month)}/${year}`
  }

  const rating = input.rating
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Quý khách vui lòng chọn từ 1 đến 5 sao." }
  }

  const text = typeof input.text === "string" ? input.text.trim() : ""
  if (text.length < REVIEW_LIMITS.textMin) return { ok: false, error: `Cảm nhận cần ít nhất ${REVIEW_LIMITS.textMin} ký tự.` }
  if (text.length > REVIEW_LIMITS.textMax) return { ok: false, error: `Cảm nhận tối đa ${REVIEW_LIMITS.textMax} ký tự.` }

  let videos: ReviewVideo[] = []
  if (input.videos !== undefined) {
    if (!Array.isArray(input.videos) || !input.videos.every(isValidVideo)) return { ok: false, error: "Link video không hợp lệ." }
    // Chỉ giữ platform + id (bỏ trường thừa như link gốc), bỏ video trùng.
    const unique = new Map(input.videos.map(({ platform, id }) => [`${platform}:${id}`, { platform, id }]))
    videos = [...unique.values()]
    if (videos.length > MAX_REVIEW_VIDEOS) return { ok: false, error: `Tối đa ${MAX_REVIEW_VIDEOS} video cho mỗi review.` }
  }

  const review: Review = { nick, trip, rating: rating as Review["rating"], text }
  return { ok: true, review: videos.length ? { ...review, videos } : review }
}
