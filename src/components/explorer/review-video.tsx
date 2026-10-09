"use client"

import { useState } from "react"
import { PlayIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReviewVideo } from "@/types/destination"

const LABEL: Record<ReviewVideo["platform"], string> = { youtube: "YouTube", tiktok: "TikTok" }

function embedUrl({ platform, id }: ReviewVideo): string {
  return platform === "youtube" ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : `https://www.tiktok.com/player/v1/${id}?autoplay=1`
}

/** Video trong review: chỉ hiện ảnh bìa/khung, bấm mới tải trình phát để trang nhẹ và không theo dõi sớm. */
export function ReviewVideoPlayer({ video, className }: { video: ReviewVideo; className?: string }): React.JSX.Element {
  const [playing, setPlaying] = useState(false)
  const label = `Video ${LABEL[video.platform]}`

  return (
    <div
      className={cn(
        "on-dark relative overflow-hidden rounded-2xl bg-night ring-1 ring-tint/10",
        video.platform === "youtube" ? "aspect-video w-full" : "aspect-[9/16] w-full max-w-60",
        className,
      )}
    >
      {playing ? (
        <iframe
          src={embedUrl(video)}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Phát ${label.toLowerCase()}`}
          className="group absolute inset-0 size-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {video.platform === "youtube" ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa YouTube, giống VideoPlayer
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full scale-[1.34] object-cover" />
          ) : (
            // TikTok không có link ảnh bìa ổn định theo id: dùng nền màu thương hiệu.
            <span aria-hidden className="absolute inset-0 bg-linear-to-br from-[#25f4ee]/40 via-night to-[#fe2c55]/40" />
          )}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-12 place-items-center rounded-full btn-primary !translate-y-0 transition-transform duration-500 ease-soft group-hover:scale-110">
              <PlayIcon aria-hidden strokeWidth={1.5} className="size-5 translate-x-0.5 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/85">{LABEL[video.platform]}</span>
        </button>
      )}
    </div>
  )
}
