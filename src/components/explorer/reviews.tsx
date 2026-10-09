"use client"

import { CheckCircle2Icon, QuoteIcon, StarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { ReviewForm } from "@/components/explorer/review-form"
import { Section } from "@/components/explorer/section"
import { cn } from "@/lib/utils"
import { reviewService } from "@/services/review.service"
import type { Review, UserReview } from "@/types/destination"

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }): React.JSX.Element {
  return (
    <p role="img" aria-label={`${rating} trên 5 sao`} className="flex shrink-0 gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn(size, index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-tint/20")}
        />
      ))}
    </p>
  )
}

const AVATAR_COLORS = [
  "from-orange-400 to-rose-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
]

interface ReviewsProps {
  slug: string
  destinationName: string
  /** Review soạn sẵn trong guide; review đầu tiên luôn là thẻ nổi bật. */
  reviews: Review[]
}

function isUserReview(review: Review): review is UserReview {
  return "id" in review
}

export function Reviews({ slug, destinationName, reviews }: ReviewsProps): React.JSX.Element {
  const [userReviews, setUserReviews] = useState<UserReview[]>([])

  useEffect(() => {
    const controller = new AbortController()
    // Lỗi tải chỉ làm mất review của khách, review soạn sẵn vẫn hiện nên không cần báo.
    reviewService.list(slug, controller.signal).then(setUserReviews, () => undefined)
    return () => controller.abort()
  }, [slug])

  const [featured, ...curated] = reviews
  // Review khách mới gửi đứng đầu cột bên phải
  const rest: Review[] = [...userReviews, ...curated]
  const all = [...userReviews, ...reviews]
  const average = all.reduce((sum, review) => sum + review.rating, 0) / Math.max(all.length, 1)

  return (
    <Section
      id="review"
      title="Cảm Nhận Từ Những Người Trẻ Đã Đi"
      intro="Những review chân thực từ các bạn trẻ, cặp đôi và gia đình đã trải nghiệm tour cùng Vietravel."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {featured && (
          <figure className="relative flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-dusk p-7 sm:p-9 text-title shadow-2xl lift">
            {/* Điểm trung bình lấp phần đầu thẻ thay cho khoảng trống */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold tracking-tight">{average.toFixed(1).replace(".", ",")}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <div className="text-right">
                <Stars rating={average} />
                <p className="mt-1 text-xs text-muted-foreground">Từ {all.length} đánh giá</p>
              </div>
            </div>

            <blockquote className="my-auto">
              <QuoteIcon aria-hidden className="mb-3 size-8 text-primary-ink/50" />
              <p className="font-heading text-xl leading-relaxed font-bold tracking-tight text-title sm:text-[1.6rem] sm:leading-snug">
                “{featured.text}”
              </p>
            </blockquote>

            <figcaption className="flex flex-wrap items-center gap-3.5 border-t border-tint/10 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-500 font-heading text-base font-extrabold text-white shadow-md">
                {featured.nick.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-heading text-base font-bold text-title">{featured.nick}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-ink/15 px-2 py-0.5 text-[10px] font-bold text-primary-ink">
                    <CheckCircle2Icon aria-hidden className="size-3" />
                    Đã đi tour
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{featured.trip}</p>
              </div>
              <div className="ml-auto">
                <Stars rating={featured.rating} />
              </div>
            </figcaption>
          </figure>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 3).map((review, index) => (
            <li key={isUserReview(review) ? review.id : review.nick} className="flex flex-col gap-3 glass-card p-5 sm:p-6 lift">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr text-sm font-bold text-white shadow-sm", AVATAR_COLORS[(index + 1) % AVATAR_COLORS.length])}>
                    {review.nick.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-heading text-sm font-bold text-title">{review.nick}</p>
                      {isUserReview(review) && (
                        <span className="shrink-0 rounded-full bg-primary-ink/15 px-2 py-0.5 text-[10px] font-bold text-primary-ink">Mới</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{review.trip}</p>
                  </div>
                </div>
                <Stars rating={review.rating} size="size-3.5" />
              </div>
              <p className="text-sm leading-relaxed text-body">“{review.text}”</p>
            </li>
          ))}
        </ul>
      </div>

      <ReviewForm slug={slug} destinationName={destinationName} onCreated={(review) => setUserReviews((current) => [review, ...current])} />
    </Section>
  )
}
