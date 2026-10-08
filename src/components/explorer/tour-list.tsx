import Image from "next/image"
import { PhoneIcon, StarIcon } from "lucide-react"

import { CARD_CLASS } from "@/components/explorer/section"
import { CtaLink } from "@/components/explorer/cta-link"
import { formatRating, formatShortDate, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface TourListProps {
  tours: Tour[]
  hotline: string
  limit?: number
}

function TourItem({ tour }: { tour: Tour }): React.JSX.Element {
  const price = tour.deal?.priceVnd ?? tour.priceVnd
  const dates = (tour.deal ? [tour.deal.departureDate] : tour.departureDates).slice(0, 3).map(formatShortDate)
  const rating = formatRating(tour.rating)

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={tour.imageUrl} alt={tour.name} fill sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className="object-cover" />
        {tour.deal && (
          <span className="absolute top-3 right-3 rounded-full bg-sale px-2.5 py-0.5 text-xs font-extrabold text-white">
            -{Math.round((1 - tour.deal.priceVnd / tour.deal.originalPriceVnd) * 100)}%
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-ocean">
          {tour.days} ngày {tour.nights} đêm
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-extrabold">{tour.name}</h3>
        <p className="text-sm text-muted-foreground">
          Khởi hành từ {tour.departureCity} · {tour.transport}
          {rating && (
            <span className="ml-2 inline-flex items-center gap-1 font-semibold text-ink">
              <StarIcon aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Ngày đi: </span>
          <span className="font-semibold">{dates.join(" · ")}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p>
            <span className="block text-xs text-muted-foreground">Giá từ</span>
            <span className="text-xl font-extrabold text-sale">{formatVnd(price)}</span>
            {tour.deal && <span className="ml-2 text-sm text-muted-foreground line-through">{formatVnd(tour.deal.originalPriceVnd)}</span>}
          </p>
          <CtaLink href={tour.url} className="h-10 px-4">
            Xem và đặt
          </CtaLink>
        </div>
      </div>
    </li>
  )
}

export function TourList({ tours, hotline, limit }: TourListProps): React.JSX.Element {
  const shown = limit ? tours.slice(0, limit) : tours

  if (shown.length === 0) {
    return (
      <div className={cn(CARD_CLASS, "flex flex-col items-center gap-3 text-center")}>
        <p className="font-semibold">Hiện chưa có lịch khởi hành sắp tới trên hệ thống.</p>
        <p className="text-sm text-muted-foreground">Tư vấn viên Vietravel sẽ giúp Quý khách chọn lịch trình phù hợp.</p>
        <a
          href={`tel:${hotline.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ocean px-5 text-sm font-semibold text-white"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          Gọi {hotline}
        </a>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((tour) => (
        <TourItem key={tour.code} tour={tour} />
      ))}
    </ul>
  )
}
