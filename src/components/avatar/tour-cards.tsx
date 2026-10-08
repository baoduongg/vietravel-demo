import Image from "next/image"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { ArrowUpRightIcon, ClockIcon, MapPinIcon, PlaneTakeoffIcon, StarIcon, TimerIcon } from "lucide-react"

import { DestinationTiles } from "@/components/avatar/destination-tiles"
import type { Destination } from "@/config/company"
import type { SceneTheme } from "@/lib/scene"
import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface TourCardsProps {
  tours: Tour[]
  thinking?: boolean
  assistantName: string
  destinations: Destination[]
  controlsDisabled: boolean
  onSelectDestination: (question: string) => void
  onPreviewScene: (scene: SceneTheme) => void
  className?: string
}

/** Màu nhãn dòng tour theo travel.com.vn: Giá tốt đỏ, Tiết kiệm tím, còn lại xanh. */
const TOUR_LINE_TONE: Record<string, string> = {
  "Tour giá tốt": "text-sale",
  "Tour tiết kiệm": "text-[#9b2fae]",
}

function formatVnd(priceVnd: number): string {
  return `${priceVnd.toLocaleString("vi-VN")}đ`
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  return `${day}/${month}`
}

/** Số ngày còn lại tới ngày khởi hành ưu đãi; null nếu đã qua hoặc không hợp lệ. */
function daysUntil(isoDate: string): number | null {
  const target = new Date(`${isoDate}T00:00:00`).getTime()
  if (Number.isNaN(target)) return null
  const days = Math.ceil((target - Date.now()) / 86_400_000)
  return days >= 0 ? days : null
}

function TourCard({ tour, index }: { tour: Tour; index: number }): React.JSX.Element {
  const { deal } = tour
  const daysLeft = deal ? daysUntil(deal.departureDate) : null
  const discountPercent = deal ? Math.round((1 - deal.priceVnd / deal.originalPriceVnd) * 100) : 0
  const dates = deal ? [deal.departureDate] : tour.departureDates.slice(0, 3)
  const shortLine = tour.tourLine.replace(/^Tour /, "")
  const lineLabel = shortLine.charAt(0).toUpperCase() + shortLine.slice(1)

  return (
    <article className="group relative h-full max-h-[24rem] w-full rounded-[1.75rem] bg-ocean/[0.04] p-1.5 ring-1 ring-ocean/10 transition-shadow duration-700 ease-soft focus-within:ring-2 focus-within:ring-ring hover:shadow-[0_28px_50px_-24px_rgba(0,70,193,0.55)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_20px_40px_-26px_rgba(0,70,193,0.45)]">
        <div className="relative min-h-24 flex-1 overflow-hidden">
          <Image
            src={tour.imageUrl}
            alt={tour.name}
            fill
            sizes="(min-width:1024px) 300px, 70vw"
            className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
          />
          {lineLabel && (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full bg-white px-2.5 py-0.5 text-[0.7rem] font-extrabold",
                TOUR_LINE_TONE[tour.tourLine] ?? "text-ocean",
              )}
            >
              {lineLabel}
            </span>
          )}
          {deal && (
            <span className="absolute top-2 right-2 animate-pulse rounded-full bg-sale px-2.5 py-0.5 text-[0.7rem] font-extrabold text-white shadow-[0_6px_14px_-4px_rgba(237,29,36,0.7)] motion-reduce:animate-none">
              -{discountPercent}%
            </span>
          )}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/55 to-transparent" />
          <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
            {index === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sunset px-2.5 py-0.5 text-[0.68rem] font-bold text-white">
                Phù hợp nhất
              </span>
            ) : (
              <span />
            )}
            {tour.rating !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.7rem] font-bold text-ink backdrop-blur">
                <StarIcon aria-hidden className="size-3 fill-[#f2b705] text-[#f2b705]" />
                {tour.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 px-3 pt-2.5 pb-3">
          <h3 className="line-clamp-2 text-[0.88rem] leading-snug font-bold text-ink" title={tour.name}>
            {tour.name}
          </h3>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <MapPinIcon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0" />
              <span className="truncate">{tour.departureCity}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {tour.transport ? (
                <PlaneTakeoffIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
              ) : (
                <ClockIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
              )}
              {tour.days}N{tour.nights}Đ
            </span>
          </div>
          {daysLeft !== null && (
            <p className="flex items-center gap-1 text-[0.7rem] font-bold text-sale">
              <TimerIcon aria-hidden strokeWidth={2} className="size-3.5" />
              {daysLeft === 0 ? "Khởi hành hôm nay" : `Ưu đãi giờ chót, còn ${daysLeft} ngày`}
            </p>
          )}
          <ul className="flex flex-wrap gap-1" aria-label="Ngày khởi hành">
            {dates.map((date) => (
              <li
                key={date}
                className="rounded border border-sale/70 px-1.5 py-px text-[0.68rem] font-semibold text-sale"
              >
                {formatShortDate(date)}
              </li>
            ))}
          </ul>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {deal ? (
                <span className="text-[0.68rem] text-muted-foreground line-through">
                  {formatVnd(deal.originalPriceVnd)}
                </span>
              ) : (
                <span className="text-[0.68rem] text-muted-foreground">Giá từ:</span>
              )}
              <span className="text-base leading-tight font-extrabold tabular-nums text-ocean">
                {formatVnd(deal?.priceVnd ?? tour.priceVnd)}
              </span>
            </div>
            <a
              href={tour.url}
              target="_blank"
              rel="noreferrer"
              className="group/cta inline-flex items-center gap-1.5 rounded-full bg-ocean py-1 pr-1 pl-3.5 text-xs font-semibold text-white outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              Chi tiết
              <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-soft group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px">
                <ArrowUpRightIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

function Shimmer({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className={cn("relative overflow-hidden bg-cloud/70", className)}>
      <div className="animate-shimmer absolute inset-0 bg-linear-to-r from-transparent via-white/80 to-transparent" />
    </div>
  )
}

function TourSkeleton({ index }: { index: number }): React.JSX.Element {
  return (
    <div
      style={{ animationDelay: `${index * 120}ms` }}
      className="animate-reveal h-full max-h-[24rem] w-full rounded-[1.75rem] bg-ocean/[0.04] p-1.5 ring-1 ring-ocean/10"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-white">
        <Shimmer className="min-h-24 flex-1" />
        <div className="flex shrink-0 flex-col gap-2 px-3 py-3">
          <Shimmer className="h-3.5 w-11/12 rounded-full" />
          <Shimmer className="h-3.5 w-2/3 rounded-full" />
          <div className="mt-2 flex items-center justify-between">
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Hàng lưới cố định bằng chiều cao vùng chứa, nên thẻ co lại theo màn hình thay vì tràn ra đè lên phần bên dưới. */
const LIST_CLASS =
  "flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto lg:grid lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)] lg:overflow-visible"

/** Các thẻ vào lần lượt từ dưới lên bằng lò xo; container điều phối độ trễ giữa các thẻ. */
const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 190, damping: 20 } },
}

/** Mỗi trạng thái (đang tìm, chưa có tour, có tour) là một khối riêng để AnimatePresence chuyển mờ giữa chúng. */
const PANEL_MOTION = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export function TourCards({
  tours,
  thinking = false,
  assistantName,
  destinations,
  controlsDisabled,
  onSelectDestination,
  onPreviewScene,
  className,
}: TourCardsProps): React.JSX.Element {
  const showSkeleton = thinking
  const panel = showSkeleton ? "thinking" : tours.length === 0 ? "empty" : tours.map((tour) => tour.code).join()

  return (
    <section aria-labelledby="tour-heading" className={cn("flex min-h-0 flex-col gap-3", className)}>
      <h2 id="tour-heading" className="shrink-0 text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase">
        {showSkeleton
          ? `${assistantName} đang tìm tour`
          : tours.length === 0
            ? `Chọn điểm đến hoặc nói với ${assistantName}`
            : `Tour ${assistantName} gợi ý`}
        {!showSkeleton && tours.length > 0 && (
          <span className="ml-1.5 font-semibold text-muted-foreground">({tours.length})</span>
        )}
      </h2>
      <AnimatePresence mode="wait" initial={false}>
        {showSkeleton ? (
          <motion.ul key={panel} aria-hidden {...PANEL_MOTION} className={LIST_CLASS}>
            {[0, 1, 2].map((key) => (
              <li key={key} className="w-[68%] shrink-0 snap-start lg:w-auto">
                <TourSkeleton index={key} />
              </li>
            ))}
          </motion.ul>
        ) : tours.length === 0 ? (
          <motion.div key={panel} {...PANEL_MOTION} className="flex min-h-0 flex-1 flex-col">
            <DestinationTiles
              destinations={destinations}
              disabled={controlsDisabled}
              onSelect={onSelectDestination}
              onPreview={onPreviewScene}
              className="flex-1"
            />
          </motion.div>
        ) : (
          <motion.ul
            key={panel}
            variants={LIST_VARIANTS}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className={LIST_CLASS}
          >
            {tours.map((tour, index) => (
              <motion.li
                key={tour.code}
                variants={ITEM_VARIANTS}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
                className="w-[68%] shrink-0 snap-start lg:w-auto"
              >
                <TourCard tour={tour} index={index} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}
