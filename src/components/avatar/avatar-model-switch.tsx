import { BotIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAvatarStore } from "@/stores/avatar.store"

export function AvatarModelSwitch({ className }: { className?: string }): React.JSX.Element {
  const avatarModel = useAvatarStore((state) => state.avatarModel)
  const setAvatarModel = useAvatarStore((state) => state.setAvatarModel)
  const isHuman = avatarModel === "human"

  return (
    <div
      role="group"
      aria-label="Chọn kiểu avatar"
      className={cn("flex h-8 items-center gap-0.5 rounded-full bg-white p-0.5 shadow-[0_6px_20px_-10px_rgba(0,70,193,0.5)]", className)}
    >
      <button
        type="button"
        aria-pressed={!isHuman}
        onClick={() => setAvatarModel("mascot")}
        className={cn(
          "flex h-7 items-center gap-1 rounded-full px-2.5 text-[0.75rem] font-bold transition-colors",
          !isHuman ? "bg-ocean text-white" : "text-muted-foreground",
        )}
      >
        <BotIcon aria-hidden strokeWidth={1.75} className="size-3.5" />
        Robot
      </button>
      <button
        type="button"
        aria-pressed={isHuman}
        onClick={() => setAvatarModel("human")}
        className={cn(
          "flex h-7 items-center gap-1 rounded-full px-2.5 text-[0.75rem] font-bold transition-colors",
          isHuman ? "bg-ocean text-white" : "text-muted-foreground",
        )}
      >
        <UserIcon aria-hidden strokeWidth={1.75} className="size-3.5" />
        Người
      </button>
    </div>
  )
}
