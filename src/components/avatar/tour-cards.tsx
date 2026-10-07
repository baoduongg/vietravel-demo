import Image from "next/image"
import { ClockIcon, MapPinIcon, PlaneTakeoffIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface TourCardsProps {
  tours: Tour[]
  assistantName: string
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

function TourCard({ tour, index }: { tour: Tour; index: number }): React.JSX.Element {
  const { deal } = tour
  const discountPercent = deal ? Math.round((1 - deal.priceVnd / deal.originalPriceVnd) * 100) : 0
  const dates = deal ? [deal.departureDate] : tour.departureDates.slice(0, 4)
  const shortLine = tour.tourLine.replace(/^Tour /, "")
  const lineLabel = shortLine.charAt(0).toUpperCase() + shortLine.slice(1)

  return (
    <article
      style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
      className="group animate-reveal relative flex h-full w-[17rem] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-18px_rgba(0,70,193,0.35)] ring-1 ring-cloud transition-[transform,box-shadow] duration-500 ease-soft focus-within:ring-2 focus-within:ring-ring hover:-translate-y-1 hover:shadow-[0_22px_40px_-20px_rgba(0,70,193,0.45)]"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={tour.imageUrl}
          alt={tour.name}
          fill
          sizes="272px"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
        />
        {lineLabel && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold",
              TOUR_LINE_TONE[tour.tourLine] ?? "text-ocean",
            )}
          >
            {lineLabel}
          </span>
        )}
        {deal && (
          <span className="absolute top-3 right-3 rounded-full bg-sale px-3 py-1 text-xs font-extrabold text-white">
            Giờ chót -{discountPercent}%
          </span>
        )}
      </div>

      <div className="relative mx-2 -mt-8 flex flex-1 flex-col gap-2 rounded-t-xl bg-white px-3 pt-3 pb-16">
        <h3 className="line-clamp-2 text-[0.92rem] leading-snug font-bold text-ink" title={tour.name}>
          {tour.name}
        </h3>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPinIcon aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
            <span className="truncate">{tour.departureCity}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {tour.transport ? (
              <PlaneTakeoffIcon aria-hidden strokeWidth={1.75} className="size-3.5" />
            ) : (
              <ClockIcon aria-hidden strokeWidth={1.75} className="size-3.5" />
            )}
            {tour.days}N{tour.nights}Đ
          </span>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Ngày khởi hành">
          {dates.map((date) => (
            <li key={date} className="rounded border border-sale/70 px-1.5 py-px text-[0.7rem] font-semibold text-sale">
              {formatShortDate(date)}
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between pl-5">
        <div className="flex flex-col pb-3">
          {deal ? (
            <span className="text-[0.72rem] text-muted-foreground line-through">{formatVnd(deal.originalPriceVnd)}</span>
          ) : (
            <span className="text-[0.72rem] text-muted-foreground">Giá từ:</span>
          )}
          <span className="text-lg leading-tight font-extrabold tabular-nums text-ocean">{formatVnd(deal?.priceVnd ?? tour.priceVnd)}</span>
        </div>
        <a
          href={tour.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-tl-[1.75rem] bg-ocean py-3 pr-4 pl-6 text-sm font-bold text-white outline-none transition-colors duration-300 ease-soft hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Xem chi tiết
        </a>
      </div>
    </article>
  )
}

export function TourCards({ tours, assistantName, className }: TourCardsProps): React.JSX.Element {
  return (
    <section aria-labelledby="tour-heading" className={cn("flex flex-col gap-3", className)}>
      <h2 id="tour-heading" className="text-lg font-extrabold text-ink">
        Tour {assistantName} gợi ý
        {tours.length > 0 && <span className="ml-1.5 font-semibold text-muted-foreground">({tours.length})</span>}
      </h2>
      {tours.length === 0 ? (
        <div className="flex items-center gap-4 rounded-2xl bg-secondary px-5 py-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ocean shadow-sm">
            <SparklesIcon aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cho {assistantName} biết điểm đến, nơi khởi hành và thời gian Quý khách muốn đi. Tour phù hợp sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <ul
          key={tours.map((tour) => tour.code).join()}
          className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:thin] lg:-mx-1 lg:scroll-px-1 lg:px-1"
        >
          {tours.map((tour, index) => (
            <li key={tour.code} className="shrink-0 snap-start">
              <TourCard tour={tour} index={index} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
