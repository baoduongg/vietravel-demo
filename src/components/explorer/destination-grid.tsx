import Image from "next/image"
import Link from "next/link"

import { ArrowChip } from "@/components/explorer/cta-link"
import { cn } from "@/lib/utils"
import type { DestinationSummary } from "@/types/destination"

/** Ô đầu to gấp đôi, ô thứ sáu rộng ngang; 8 điểm đến lấp kín lưới 4 cột không chừa ô trống. */
const SPAN = ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "", ""]

function TileBody({ destination, featured }: { destination: DestinationSummary; featured: boolean }): React.JSX.Element {
  return (
    <>
      <Image
        src={destination.imageUrl}
        alt={destination.name}
        fill
        sizes={featured ? "(min-width:1024px) 576px, 100vw" : "(min-width:1024px) 288px, 50vw"}
        className={cn("object-cover transition-transform duration-1000 ease-soft", destination.active && "group-hover:scale-105")}
      />
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/80 via-shade/10 to-transparent" />
      {destination.active && (
        <span className="absolute top-4 right-4 text-white [&>span]:bg-tint/25">
          <ArrowChip />
        </span>
      )}
      <div className="absolute inset-x-5 bottom-5 text-white">
        <p className={cn("font-voyage font-semibold tracking-tight", featured ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl")}>{destination.name}</p>
        <p className={cn("mt-1 text-white/85", featured ? "text-base" : "text-xs sm:text-sm")}>{destination.caption}</p>
        {!destination.active && <p className="mt-2 text-xs font-semibold text-white/70">Sắp ra mắt</p>}
      </div>
    </>
  )
}

const TILE = "on-dark group relative block overflow-hidden rounded-[1.75rem]"

export function DestinationGrid({ items }: { items: DestinationSummary[] }): React.JSX.Element {
  return (
    <ul className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-4">
      {items.map((destination, index) => (
        <li key={destination.slug} className={SPAN[index] ?? ""}>
          {destination.active ? (
            <Link
              href={`/diem-den/${destination.slug}`}
              className={cn(TILE, "size-full shadow-[0_34px_60px_-34px_rgba(0,0,0,0.7)] outline-none focus-visible:ring-2 focus-visible:ring-ring")}
            >
              <TileBody destination={destination} featured={index === 0} />
            </Link>
          ) : (
            <div aria-disabled="true" className={cn(TILE, "size-full cursor-default saturate-50")}>
              <TileBody destination={destination} featured={false} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
