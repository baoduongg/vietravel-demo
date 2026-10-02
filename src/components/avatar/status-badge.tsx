import { AudioLinesIcon, EarIcon, PlaneIcon, LoaderCircleIcon, type LucideIcon } from "lucide-react"

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
    className: "bg-white text-ocean",
  },
  listening: {
    label: "Đang nghe",
    icon: EarIcon,
    className: "bg-sale text-white animate-listening-pulse",
  },
  thinking: {
    label: "Đang suy nghĩ",
    icon: LoaderCircleIcon,
    className: "bg-cloud text-ocean",
    iconClassName: "animate-spin motion-reduce:animate-none",
  },
  speaking: {
    label: "Đang nói",
    icon: AudioLinesIcon,
    className: "bg-ocean text-white animate-speaking-glow",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.JSX.Element {
  const { label, icon: Icon, className: tone, iconClassName } = APPEARANCE[status]

  return (
    <Badge
      role="status"
      aria-live="polite"
      className={cn("h-8 gap-1.5 px-3.5 text-[0.8rem] font-bold shadow-[0_6px_20px_-10px_rgba(0,70,193,0.5)]", tone, className)}
    >
      <Icon className={cn("size-3.5!", iconClassName)} aria-hidden />
      {label}
    </Badge>
  )
}
