import Image from "next/image"
import { motion, type Variants } from "motion/react"
import { ArrowUpRightIcon } from "lucide-react"

import type { Destination } from "@/config/company"
import type { SceneTheme } from "@/lib/scene"
import { cn } from "@/lib/utils"

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const TILE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 170, damping: 19 } },
}

interface DestinationTilesProps {
  destinations: Destination[]
  disabled: boolean
  onSelect: (question: string) => void
  /** Rê chuột vào ô thì xem trước cảnh nền của điểm đến đó. */
  onPreview: (scene: SceneTheme) => void
  className?: string
}

/** Màn hình chờ: các điểm đến có ảnh để khách chạm chọn thay vì phải nghĩ câu hỏi. */
export function DestinationTiles({
  destinations,
  disabled,
  onSelect,
  onPreview,
  className,
}: DestinationTilesProps): React.JSX.Element {
  return (
    <motion.ul
      variants={LIST_VARIANTS}
      initial="hidden"
      animate="show"
      className={cn("grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-2.5 sm:grid-cols-3 lg:auto-rows-fr", className)}
    >
      {destinations.map(({ label, caption, question, imageUrl, scene }) => (
        <motion.li
          key={label}
          variants={TILE_VARIANTS}
          whileHover={disabled ? undefined : { y: -5, scale: 1.02 }}
          whileTap={disabled ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="min-h-28"
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            onPointerEnter={() => onPreview(scene)}
            onFocus={() => onPreview(scene)}
            className="group relative isolate block size-full overflow-hidden rounded-[1.5rem] text-left shadow-[0_18px_36px_-22px_rgba(0,70,193,0.6)] ring-1 ring-ocean/10 outline-none transition-shadow duration-500 focus-visible:ring-2 focus-visible:ring-ring enabled:hover:shadow-[0_26px_44px_-20px_rgba(0,70,193,0.75)] disabled:opacity-60"
          >
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(min-width:1024px) 260px, 45vw"
              className="object-cover transition-transform duration-1000 ease-soft group-enabled:group-hover:scale-110"
            />
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/15 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[0.95rem] leading-tight font-extrabold text-white">{label}</span>
                <span className="truncate text-[0.72rem] font-medium text-white/80">{caption}</span>
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-transform duration-500 ease-soft group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:-translate-y-0.5">
                <ArrowUpRightIcon aria-hidden strokeWidth={1.75} className="size-4" />
              </span>
            </span>
          </button>
        </motion.li>
      ))}
    </motion.ul>
  )
}
