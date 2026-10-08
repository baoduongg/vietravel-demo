import { MicIcon, MicOffIcon, SquareIcon } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MicButtonProps {
  listening: boolean
  supported: boolean
  disabled: boolean
  onToggle: () => void
  className?: string
}

export function MicButton({ listening, supported, disabled, onToggle, className }: MicButtonProps): React.JSX.Element {
  const label = !supported ? "Trình duyệt không hỗ trợ micro" : listening ? "Dừng và gửi câu hỏi" : "Bấm để nói"
  const Icon = !supported ? MicOffIcon : listening ? SquareIcon : MicIcon

  return (
    <motion.span
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="relative inline-flex shrink-0"
    >
      {listening && (
        <>
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-sale/30 motion-reduce:hidden" />
          <span
            aria-hidden
            className="absolute -inset-1.5 animate-ping rounded-full bg-sale/15 motion-reduce:hidden"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}
      <Button
      type="button"
      size="icon-lg"
      onClick={onToggle}
      disabled={disabled || !supported}
      aria-pressed={listening}
      aria-label={label}
      title={label}
      className={cn(
        "relative size-12 shrink-0 rounded-full [&_svg]:size-5!",
        listening && "animate-listening-pulse bg-sale hover:bg-sale/90",
        className,
      )}
    >
      <Icon className={cn(listening && "fill-current")} aria-hidden />
      </Button>
    </motion.span>
  )
}
