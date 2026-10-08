import { AudioLinesIcon, EarIcon, PlaneIcon, SparklesIcon, type LucideIcon } from "lucide-react"

import { AnimatePresence, motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AvatarStatus } from "@/stores/avatar.store"

interface StatusBadgeProps {
  status: AvatarStatus
  className?: string
}

interface StatusAppearance {
  label: string
  icon: LucideIcon
  className: string
  iconClassName?: string
}

const APPEARANCE: Record<AvatarStatus, StatusAppearance> = {
  idle: {
    label: "Sẵn sàng",
    icon: PlaneIcon,
    className: "bg-white text-ocean shadow-[0_6px_16px_-6px_rgba(0,70,193,0.35)] ring-1 ring-white/70 backdrop-blur",
  },
  listening: {
    label: "Đang nghe",
    icon: EarIcon,
    className: "bg-sale text-white animate-listening-pulse shadow-[0_0_16px_rgba(237,29,36,0.35)]",
  },
  thinking: {
    label: "Đang suy nghĩ",
    icon: SparklesIcon,
    className: "bg-linear-to-r from-ocean to-sunset text-white animate-thinking-pulse shadow-[0_8px_20px_-6px_rgba(3,145,255,0.6)]",
    iconClassName: "animate-spin motion-reduce:animate-none",
  },
  speaking: {
    label: "Đang nói",
    icon: AudioLinesIcon,
    className: "bg-ocean text-white animate-speaking-glow shadow-[0_0_16px_rgba(0,70,193,0.4)]",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.JSX.Element {
  const { label, icon: Icon, className: tone, iconClassName } = APPEARANCE[status]

  return (
    <Badge
      role="status"
      aria-live="polite"
      className={cn("h-8 gap-1.5 px-3.5 text-[0.8rem] font-bold transition-all duration-300", tone, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          <Icon className={cn("size-3.5!", iconClassName)} aria-hidden />
          {label}
        </motion.span>
      </AnimatePresence>
      {status === "thinking" && (
        <span className="flex items-center gap-0.5 ml-0.5">
          <span className="size-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1 rounded-full bg-white animate-bounce" />
        </span>
      )}
    </Badge>
  )
}

