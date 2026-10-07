"use client"

import { useEffect, useState } from "react"
import { SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface ThinkingIndicatorProps {
  assistantName: string
  className?: string
}

const THINKING_MESSAGES = [
  "đang tìm kiếm thông tin tour...",
  "đang tra cứu lịch trình & giá vé...",
  "đang tổng hợp thông tin & chuẩn bị giọng nói...",
  "đang hoàn thiện gợi ý tốt nhất cho bạn...",
]

export function ThinkingIndicator({ assistantName, className }: ThinkingIndicatorProps): React.JSX.Element {
  const [messageIndex, setMessageIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in-95 flex flex-col items-center gap-2 duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-cloud bg-white/95 px-4 py-2 shadow-[0_10px_30px_-12px_rgba(0,70,193,0.35)] backdrop-blur-md">
        <div className="flex size-6 items-center justify-center rounded-full bg-linear-to-br from-sunset to-ocean text-white shadow-xs">
          <SparklesIcon className="size-3.5 animate-spin motion-reduce:animate-none" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-ink sm:text-sm">
          <span className="text-ocean font-extrabold">{assistantName}</span>
          <span className="text-ocean font-semibold transition-all duration-300">
            {THINKING_MESSAGES[messageIndex]}
          </span>
        </div>

        <div className="flex items-center gap-1 pl-1">
          <span className="size-1.5 rounded-full bg-sunset animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-sunset animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-sunset animate-bounce" />
        </div>
      </div>
    </div>
  )
}
