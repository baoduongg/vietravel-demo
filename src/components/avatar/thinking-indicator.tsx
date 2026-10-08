"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

interface ThinkingIndicatorProps {
  assistantName: string
  className?: string
}

export const THINKING_STEPS = [
  "Đang tìm tour phù hợp",
  "Đang tra lịch trình & giá",
  "Đang chuẩn bị giọng nói",
  "Sắp xong rồi",
]

/** Thẻ nổi trên sân khấu: tên trợ lý, bước hiện tại và thanh tiến trình theo bước. */
export function ThinkingIndicator({ assistantName, className }: ThinkingIndicatorProps): React.JSX.Element {
  const [step, setStep] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => setStep((prev) => Math.min(prev + 1, THINKING_STEPS.length - 1)), 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 mx-auto flex w-full max-w-sm flex-col gap-2 rounded-[1.5rem] bg-white/70 p-1.5 ring-1 ring-ocean/10 duration-500",
        className,
      )}
    >
      <div className="flex flex-col gap-2 rounded-[calc(1.5rem-0.375rem)] bg-white px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_14px_30px_-18px_rgba(0,70,193,0.4)]">
        <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase">
          <span className="flex gap-1" aria-hidden>
            <span className="size-1.5 animate-bounce rounded-full bg-sunset [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-sunset [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-sunset" />
          </span>
          {assistantName} đang suy nghĩ
        </p>
        <p key={step} className="animate-in fade-in slide-in-from-bottom-1 text-base font-bold text-ink duration-500">
          {THINKING_STEPS[step]}
        </p>
        <div className="flex gap-1" aria-hidden>
          {THINKING_STEPS.map((label, index) => (
            <span
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full bg-cloud transition-colors duration-500",
                index < step && "bg-ocean",
                index === step && "bg-sunset animate-pulse",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
