import { cn } from "@/lib/utils"

/** Câu trả lời dài hơn mức này dùng cỡ chữ nhỏ hơn để không tràn khỏi khung avatar. */
const LONG_SUBTITLE_CHARS = 160

interface SubtitleProps {
  text: string
  interim: string
  className?: string
}

export function Subtitle({ text, interim, className }: SubtitleProps): React.JSX.Element | null {
  const isInterim = interim.length > 0
  const content = isInterim ? interim : text
  if (!content) return null
  const isLong = content.length > LONG_SUBTITLE_CHARS

  return (
    <p
      key={content}
      aria-live="polite"
      className={cn(
        "animate-in fade-in slide-in-from-bottom-1 mx-auto max-w-2xl text-center leading-snug font-bold text-balance text-ink duration-500",
        isLong ? "text-sm sm:text-base lg:text-[1.05rem]" : "text-base sm:text-lg lg:text-xl",
        isInterim && "font-semibold italic text-ink/70",
        className,
      )}
    >
      {isInterim ? `“${content}…”` : content}
    </p>
  )
}
