"use client"

import { useState } from "react"
import { PlayIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { VideoItem } from "@/types/destination"

/** Chỉ hiện ảnh bìa; bấm mới tải trình phát YouTube để trang không nặng và không theo dõi sớm. */
export function VideoPlayer({ video, className }: { video: VideoItem; className?: string }): React.JSX.Element {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={cn("on-dark relative aspect-video overflow-hidden rounded-[1.75rem] bg-night shadow-[0_34px_60px_-34px_rgba(0,0,0,0.8)] ring-1 ring-tint/10", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Phát video: ${video.title}`}
          className="group absolute inset-0 size-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh bìa YouTube, không cần tối ưu thêm; scale 1.34 cắt hai dải đen của hqdefault 4:3 */}
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="size-full scale-[1.34] object-cover transition-transform duration-1000 ease-soft group-hover:scale-[1.4]"
          />
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/70 via-transparent to-transparent" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full btn-primary !translate-y-0 !shadow-[0_18px_40px_-12px_rgba(0,70,193,0.6)] transition-transform duration-500 ease-soft group-hover:scale-110 group-active:scale-95">
              <PlayIcon aria-hidden strokeWidth={1.5} className="size-7 translate-x-0.5 fill-current" />
            </span>
          </span>
          <span className="absolute inset-x-5 bottom-4 text-left text-white">
            <span className="block text-base font-bold">{video.title}</span>
            <span className="block text-xs text-white/75">Video của {video.channel} trên YouTube</span>
          </span>
        </button>
      )}
    </div>
  )
}
