import Image from "next/image"
import { ClockIcon, PhoneIcon, StarIcon, TagIcon } from "lucide-react"

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

  // Thẻ dọc 4:5: ảnh phủ gần hết thẻ, nội dung nằm trên lớp phủ tối ở chân ảnh.
  return (
    <li className="on-dark group lift relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[18px] ring-1 ring-tint/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
      <Image
        src={tour.imageUrl}
        alt={tour.name}
        fill
        sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw"
        className="-z-20 object-cover transition-transform duration-1000 ease-soft group-hover:scale-105"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade via-shade/75 via-45% to-transparent" />
      {plan && (
        <AddToPlanButton
          destinationSlug={plan.slug}
          destinationName={plan.name}
          serviceId={tourServiceId(tour.code)}
          label="Thêm vào kế hoạch"
          className="absolute top-4 left-4 h-9 px-3 text-xs"
        />
      )}
      {tour.deal && (
        <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
          -{Math.round((1 - tour.deal.priceVnd / tour.deal.originalPriceVnd) * 100)}%
        </span>
      )}
      <div className="flex flex-col gap-3 p-5">
        <ul className="flex flex-wrap gap-2 text-xs font-semibold text-title">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-tint/10 px-2.5 py-1 backdrop-blur-md">
            <ClockIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-gold" />
            {tour.days}N{tour.nights}Đ
          </li>
          {rating && (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-tint/10 px-2.5 py-1 backdrop-blur-md">
              <StarIcon aria-hidden className="size-3.5 fill-glow text-glow" />
              {rating}
            </li>
          )}
          <li className="inline-flex items-center gap-1.5 rounded-full bg-tint/10 px-2.5 py-1 backdrop-blur-md">
            <TagIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-gold" />
            {tour.transport}
          </li>
        </ul>
        <h3 className="font-voyage line-clamp-2 text-xl leading-snug font-semibold tracking-wide text-title uppercase">{tour.name}</h3>
        <p className="text-xs text-body">
          Từ {tour.departureCity} · Ngày đi: <span className="font-semibold text-title">{dates.join(" · ")}</span>
        </p>
        <div className="flex items-end justify-between gap-3 border-t border-tint/10 pt-3">
          <p>
            <span className="block text-xs text-body">
              Giá từ{tour.deal && <span className="ml-2 line-through">{formatVnd(tour.deal.originalPriceVnd)}</span>}
            </span>
            <span className="font-sans text-xl font-bold tracking-tight whitespace-nowrap text-champagne">{formatVnd(price)}</span>
            <span className="text-xs whitespace-nowrap text-body"> / khách</span>
          </p>
          <CtaLink href={tour.url} variant="outline" className="h-11">
            Xem và đặt
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
      <div className={cn(CARD_CLASS, "flex flex-col items-center gap-3 text-center")}>
        <p className="font-semibold">Hiện chưa có lịch khởi hành sắp tới trên hệ thống.</p>
        <p className="text-sm text-muted-foreground">Tư vấn viên Vietravel sẽ giúp Quý khách chọn lịch trình phù hợp.</p>
        <a
          href={`tel:${hotline.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 btn-primary rounded-full px-5 text-sm font-semibold"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          Gọi {hotline}
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
