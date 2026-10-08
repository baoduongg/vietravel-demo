import { Fragment } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/** Câu trả lời dài hơn mức này dùng cỡ chữ nhỏ hơn để không tràn khỏi khung avatar. */
const LONG_SUBTITLE_CHARS = 160
/** Tổng thời gian hiện hết các từ không vượt quá mức này, dù câu dài đến đâu. */
const MAX_REVEAL_SECONDS = 1.4
const WORD_STEP_SECONDS = 0.045

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
  const words = content.split(" ")
  const step = Math.min(WORD_STEP_SECONDS, MAX_REVEAL_SECONDS / words.length)

  return (
    <p
      key={content}
      aria-live="polite"
      aria-label={isInterim ? undefined : content}
      className={cn(
        "mx-auto max-w-2xl text-center leading-snug font-bold text-balance text-ink",
        isLong ? "text-sm sm:text-base lg:text-[1.05rem]" : "text-base sm:text-lg lg:text-xl",
        isInterim && "animate-in fade-in font-semibold italic text-ink/70 duration-200",
        className,
      )}
    >
      {isInterim
        ? `“${content}…”`
        : words.map((word, index) => (
            <Fragment key={index}>
              <motion.span
                aria-hidden
                className="inline-block"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: index * step, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                {word}
              </motion.span>{" "}
            </Fragment>
          ))}
    </p>
  )
}
