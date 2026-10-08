import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import type { DestinationSummary } from "@/types/destination"

function TileBody({ destination }: { destination: DestinationSummary }): React.JSX.Element {
  return (
    <>
      <Image
        src={destination.imageUrl}
        alt={destination.name}
        fill
        sizes="(min-width:1024px) 280px, 50vw"
        className={cn("object-cover transition-transform duration-700 ease-soft", destination.active && "group-hover:scale-105")}
      />
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
      {!destination.active && (
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
          Sắp ra mắt
        </span>
      )}
      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-lg font-extrabold">{destination.name}</p>
        <p className="text-xs text-white/85">{destination.caption}</p>
      </div>
    </>
  )
}

const TILE = "group relative block aspect-[4/5] overflow-hidden rounded-3xl"

export function DestinationGrid({ items }: { items: DestinationSummary[] }): React.JSX.Element {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((destination) => (
        <li key={destination.slug}>
          {destination.active ? (
            <Link href={`/diem-den/${destination.slug}`} className={cn(TILE, "shadow-[0_24px_44px_-24px_rgba(0,70,193,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
              <TileBody destination={destination} />
            </Link>
          ) : (
            <div aria-disabled="true" className={cn(TILE, "opacity-70 grayscale")}>
              <TileBody destination={destination} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
