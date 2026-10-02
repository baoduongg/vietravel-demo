import { MicIcon, MicOffIcon, SquareIcon } from "lucide-react"

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
    <Button
      type="button"
      size="icon-lg"
      onClick={onToggle}
      disabled={disabled || !supported}
      aria-pressed={listening}
      aria-label={label}
      title={label}
      className={cn(
        "size-12 shrink-0 rounded-full [&_svg]:size-5!",
        listening && "animate-listening-pulse bg-ink hover:bg-ink/90",
        className,
      )}
    >
      <Icon className={cn(listening && "fill-current")} aria-hidden />
    </Button>
  )
}
