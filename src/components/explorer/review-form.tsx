"use client"

import { StarIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ReviewVideoPlayer } from "@/components/explorer/review-video"
import { GHOST_BUTTON, INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { COMPANIONS, REVIEW_LIMITS } from "@/lib/reviews/validate"
import { isShortTiktok, MAX_REVIEW_VIDEOS, parseVideoUrl } from "@/lib/reviews/video"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { reviewService } from "@/services/review.service"
import type { ReviewVideo, UserReview } from "@/types/destination"

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
  const [videos, setVideos] = useState<ReviewVideo[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [adding, setAdding] = useState(false)

  const shown = hover || rating

  async function addVideo(): Promise<void> {
    if (!videoUrl.trim()) return
    setAdding(true)
    try {
      // Link rút gọn TikTok cần server đọc chuyển hướng; link đầy đủ parse ngay.
      const video = parseVideoUrl(videoUrl) ?? (isShortTiktok(videoUrl) ? await reviewService.resolveVideo(videoUrl) : null)
      if (!video) {
        toast.error("Link chưa đúng, Quý khách dán link video YouTube hoặc TikTok nhé.")
        return
      }
      if (videos.some((item) => item.platform === video.platform && item.id === video.id)) {
        toast.error("Video này đã được thêm.")
        return
      }
      setVideos((current) => [...current, video])
      setVideoUrl("")
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa đọc được link, Quý khách thử lại nhé."))
    } finally {
      setAdding(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!rating) {
      toast.error("Quý khách vui lòng chọn số sao.")
      return
    }
    setBusy(true)
    try {
      const review = await reviewService.create(slug, { nick, companion, month, rating, text, videos })
      onCreated(review)
      setNick("")
      setCompanion("")
      setMonth("")
      setRating(0)
      setText("")
      setVideos([])
      setVideoUrl("")
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

      <fieldset>
        <legend className="text-sm font-semibold text-title">
          Video (YouTube, TikTok) <span className="font-normal text-muted-foreground">không bắt buộc, tối đa {MAX_REVIEW_VIDEOS}</span>
        </legend>
        {videos.length < MAX_REVIEW_VIDEOS && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="url"
              inputMode="url"
              aria-label="Link video YouTube hoặc TikTok"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              onKeyDown={(event) => {
                // Enter thêm video thay vì gửi cả form.
                if (event.key === "Enter") {
                  event.preventDefault()
                  void addVideo()
                }
              }}
              placeholder="Dán link, ví dụ https://youtu.be/… hoặc https://vt.tiktok.com/…"
              className={cn(INPUT_CLASS, "mt-0 flex-1")}
            />
            <button type="button" onClick={() => void addVideo()} disabled={adding || !videoUrl.trim()} className={GHOST_BUTTON}>
              {adding ? "Đang đọc…" : "Thêm"}
            </button>
          </div>
        )}
        {videos.length > 0 && (
          <ul aria-label="Xem trước video" className="mt-3 grid gap-3 sm:grid-cols-3">
            {videos.map((video) => (
              <li key={`${video.platform}:${video.id}`} className="relative">
                <ReviewVideoPlayer video={video} />
                <button
                  type="button"
                  onClick={() => setVideos((current) => current.filter((item) => item !== video))}
                  aria-label="Bỏ video này"
                  className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-shade/70 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <button type="submit" disabled={busy} className={cn(PRIMARY_BUTTON, "self-start")}>
        {busy ? "Đang gửi…" : "Gửi review"}
      </button>
    </form>
  )
}
