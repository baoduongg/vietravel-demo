import Image from "next/image"
import { ClockIcon, FlameIcon, PhoneIcon, PlaneIcon, StarIcon } from "lucide-react"

import { CARD_CLASS } from "@/components/explorer/section"
import { CtaLink } from "@/components/explorer/cta-link"
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { tourServiceId } from "@/lib/journey/ids"
import { formatRating, formatShortDate, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface TourListProps {
  tours: Tour[]
  hotline: string
  limit?: number
  /** Có giá trị thì mỗi thẻ có nút "Thêm vào kế hoạch". */
  planDestination?: { slug: string; name: string }
}

function TourItem({ tour, plan }: { tour: Tour; plan?: { slug: string; name: string } }): React.JSX.Element {
  const price = tour.deal?.priceVnd ?? tour.priceVnd
  const dates = (tour.deal ? [tour.deal.departureDate] : tour.departureDates).slice(0, 3).map(formatShortDate)
  const rating = formatRating(tour.rating)

  return (
    <li className="on-dark group lift relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 hover:border-primary-ink/50 hover:shadow-[0_25px_50px_-15px_rgba(0,70,193,0.35)]">
      <Image
        src={tour.imageUrl}
        alt={tour.name}
        fill
        sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw"
        className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-[0.88] contrast-[1.05]"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-shade/95 via-shade/80 via-45% to-transparent" />
      {/* Link phủ cả thẻ: bấm chỗ nào cũng mở trang tour; nút trên cùng và nút "Xem tour" có z-10 nên vẫn nằm trên. */}
      <a href={tour.url} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden className="absolute inset-0" />

      {/* Top action row */}
      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
        {plan && (
          <AddToPlanButton
            destinationSlug={plan.slug}
            destinationName={plan.name}
            serviceId={tourServiceId(tour.code)}
            label="Thêm vào kế hoạch"
            className="h-8 px-3 text-xs bg-black/40 backdrop-blur-md ring-1 ring-white/20 text-white hover:bg-primary"
          />
        )}
        {tour.deal && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg ring-1 ring-white/20">
            <FlameIcon className="size-3 fill-white" />
            -{Math.round((1 - tour.deal.priceVnd / tour.deal.originalPriceVnd) * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-5">
        <ul className="flex flex-wrap gap-1.5 text-xs font-bold text-title">
          <li className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 backdrop-blur-md ring-1 ring-white/15 text-white">
            <ClockIcon aria-hidden strokeWidth={2} className="size-3 text-primary-ink" />
            {tour.days}N{tour.nights}Đ
          </li>
          {rating && (
            <li className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 backdrop-blur-md ring-1 ring-amber-500/30 text-amber-300 font-extrabold">
              <StarIcon aria-hidden className="size-3 fill-amber-400 text-amber-400" />
              {rating}
            </li>
          )}
          <li className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-0.5 backdrop-blur-md ring-1 ring-cyan-500/30 text-cyan-300">
            <PlaneIcon aria-hidden strokeWidth={2} className="size-3" />
            {tour.transport}
          </li>
        </ul>

        <h3 className="font-heading font-extrabold line-clamp-2 text-lg sm:text-xl leading-snug tracking-tight text-white group-hover:text-primary-ink transition-colors">
          {tour.name}
        </h3>

        <p className="text-xs text-body font-medium">
          Khởi hành: <span className="text-white font-bold">{tour.departureCity}</span> · Lịch đi: <span className="font-semibold text-primary-ink">{dates.join(" · ")}</span>
        </p>

        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-white/10 pt-3">
          <div>
            <span className="block text-[11px] text-muted-foreground font-medium">
              Giá trọn gói từ{tour.deal && <span className="ml-1.5 line-through text-white/50">{formatVnd(tour.deal.originalPriceVnd)}</span>}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-xl font-extrabold tracking-tight whitespace-nowrap text-orange-400 sm:text-2xl">
                {formatVnd(price)}
              </span>
              <span className="text-[11px] whitespace-nowrap text-body">/người</span>
            </div>
          </div>
          <CtaLink href={tour.url} variant="outline" className="relative z-10 h-10 shrink-0 pl-4 text-xs font-bold">
            Xem tour
          </CtaLink>
        </div>
      </div>
    </li>
  )
}

export function TourList({ tours, hotline, limit, planDestination }: TourListProps): React.JSX.Element {
  const shown = limit ? tours.slice(0, limit) : tours

  if (shown.length === 0) {
    return (
      <div className={cn(CARD_CLASS, "flex flex-col items-center gap-3 text-center p-8")}>
        <p className="font-heading text-lg font-bold text-title">Hiện chưa có lịch khởi hành sắp tới trên hệ thống.</p>
        <p className="text-sm text-muted-foreground">Tư vấn viên Vietravel luôn sẵn sàng thiết kế tour riêng cho bạn.</p>
        <a
          href={`tel:${hotline.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 btn-primary rounded-full px-6 text-sm font-bold"
        >
          <PhoneIcon aria-hidden strokeWidth={2} className="size-4" />
          Gọi hotline {hotline}
        </a>
      </div>
    )
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((tour) => (
        <TourItem key={tour.code} tour={tour} plan={planDestination} />
      ))}
    </ul>
  )
}

