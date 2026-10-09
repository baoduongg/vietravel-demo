"use client"

import { StarIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { COMPANIONS, REVIEW_LIMITS } from "@/lib/reviews/validate"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { reviewService } from "@/services/review.service"
import type { UserReview } from "@/types/destination"

const RATING_LABELS = ["Rất tệ", "Chưa ổn", "Tạm được", "Hài lòng", "Tuyệt vời"]

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

interface ReviewFormProps {
  slug: string
  destinationName: string
  onCreated: (review: UserReview) => void
}

export function ReviewForm({ slug, destinationName, onCreated }: ReviewFormProps): React.JSX.Element {
  const [nick, setNick] = useState("")
  const [companion, setCompanion] = useState("")
  const [month, setMonth] = useState("")
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  const shown = hover || rating

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!rating) {
      toast.error("Quý khách vui lòng chọn số sao.")
      return
    }
    setBusy(true)
    try {
      const review = await reviewService.create(slug, { nick, companion, month, rating, text })
      onCreated(review)
      setNick("")
      setCompanion("")
      setMonth("")
      setRating(0)
      setText("")
      toast.success("Cảm ơn Quý khách đã chia sẻ cảm nhận!")
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa gửi được review, Quý khách thử lại nhé."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mt-5 flex flex-col gap-5 p-6 sm:p-7">
      <div>
        <h3 className="font-heading text-lg font-bold text-title">Viết review của Quý khách</h3>
        <p className="mt-1 text-sm text-muted-foreground">Đã đi {destinationName}? Chia sẻ để người đi sau chuẩn bị tốt hơn.</p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-title">Đánh giá chung</legend>
        <div className="mt-2 flex items-center gap-3" onMouseLeave={() => setHover(0)}>
          <div role="radiogroup" aria-label="Số sao" className="flex gap-1">
            {RATING_LABELS.map((label, index) => {
              const value = index + 1
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} sao, ${label}`}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHover(value)}
                  className="rounded-md p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StarIcon aria-hidden className={cn("size-7 transition-colors", value <= shown ? "fill-amber-400 text-amber-400" : "text-tint/25")} />
                </button>
              )
            })}
          </div>
          <span className="text-sm font-medium text-body">{shown ? RATING_LABELS[shown - 1] : ""}</span>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col text-sm font-semibold text-title">
          Tên hiển thị
          <input
            required
            maxLength={REVIEW_LIMITS.nickLength}
            value={nick}
            onChange={(event) => setNick(event.target.value)}
            placeholder="Ví dụ: Minh Anh"
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-title">
          Đi cùng
          <select required value={companion} onChange={(event) => setCompanion(event.target.value)} className={INPUT_CLASS}>
            <option value="" disabled>
              Chọn…
            </option>
            {COMPANIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm font-semibold text-title">
          Tháng đi <span className="sr-only">(không bắt buộc)</span>
          <input type="month" max={currentMonth()} value={month} onChange={(event) => setMonth(event.target.value)} className={INPUT_CLASS} />
        </label>
      </div>

      <label className="flex flex-col text-sm font-semibold text-title">
        Cảm nhận
        <textarea
          required
          minLength={REVIEW_LIMITS.textMin}
          maxLength={REVIEW_LIMITS.textMax}
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Điều Quý khách thích nhất, mẹo cho người đi sau…"
          className={cn(INPUT_CLASS, "h-auto resize-y py-3 leading-relaxed")}
        />
        <span className="mt-1 self-end text-xs font-normal text-muted-foreground">
          {text.trim().length}/{REVIEW_LIMITS.textMax}
        </span>
      </label>

      <button type="submit" disabled={busy} className={cn(PRIMARY_BUTTON, "self-start")}>
        {busy ? "Đang gửi…" : "Gửi review"}
      </button>
    </form>
  )
}
