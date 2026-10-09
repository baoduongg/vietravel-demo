import Image from "next/image"
import Link from "next/link"

import { ArrowChip } from "@/components/explorer/cta-link"
import { cn } from "@/lib/utils"
import type { DestinationSummary } from "@/types/destination"

/** Ô đầu to gấp đôi, ô thứ sáu rộng ngang; 8 điểm đến lấp kín lưới 4 cột không chừa ô trống. */
const SPAN = ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "", ""]

const TAGS: Record<string, { tag: string; color: string }> = {
  "phu-quoc": { tag: "🔥 Top 1 Trending", color: "bg-orange-500/80 text-white" },
  "da-nang": { tag: "🌊 Biển & Cầu Rồng", color: "bg-blue-500/80 text-white" },
  "ha-long": { tag: "🌄 Kỳ Quan", color: "bg-emerald-500/80 text-white" },
  "sa-pa": { tag: "☁️ Săn Mây", color: "bg-purple-500/80 text-white" },
  "bangkok": { tag: "🛍️ Quẩy Phố Đêm", color: "bg-rose-500/80 text-white" },
  "nhat-ban": { tag: "🌸 Mùa Hoa Đẹp", color: "bg-pink-500/80 text-white" },
  "han-quoc": { tag: "✨ K-Wave Vibe", color: "bg-indigo-500/80 text-white" },
  "paris": { tag: "🗼 Kinh Đô Ánh Sáng", color: "bg-amber-500/80 text-white" },
}

function TileBody({ destination, featured }: { destination: DestinationSummary; featured: boolean }): React.JSX.Element {
  const badge = TAGS[destination.slug]

  return (
    <>
      <Image
        src={destination.imageUrl}
        alt={destination.name}
        fill
        sizes={featured ? "(min-width:1024px) 576px, 100vw" : "(min-width:1024px) 288px, 50vw"}
        className={cn(
          "object-cover transition-transform duration-700 ease-out",
          destination.active ? "group-hover:scale-108 brightness-[0.92] contrast-[1.05]" : "saturate-60 opacity-75"
        )}
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-shade/95 via-shade/25 to-transparent" />
      
      {/* Top Badges */}
      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
        {badge && (
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-md ring-1 ring-white/20", badge.color)}>
            {badge.tag}
          </span>
        )}
        {destination.active && (
          <span className="ml-auto text-white [&>span]:bg-white/25 [&>span]:hover:bg-primary">
            <ArrowChip />
          </span>
        )}
      </div>

      <div className="absolute inset-x-4 sm:inset-x-5 bottom-4 sm:bottom-5 text-white">
        <p className={cn("font-heading font-extrabold tracking-tight", featured ? "text-3xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl")}>
          {destination.name}
        </p>
        <p className={cn("mt-1 text-white/90 font-medium", featured ? "text-sm sm:text-base max-w-md" : "text-xs sm:text-sm line-clamp-1")}>
          {destination.caption}
        </p>
        {!destination.active && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
            🚀 Sắp mở bán tour
          </span>
        )}
      </div>
    </>
  )
}

const TILE = "on-dark group relative block overflow-hidden rounded-[1.75rem] border border-white/10 transition-all duration-500 hover:border-primary-ink/50 hover:shadow-[0_20px_40px_-15px_rgba(0,70,193,0.35)]"

export function DestinationGrid({ items }: { items: DestinationSummary[] }): React.JSX.Element {
  return (
    <ul className="grid auto-rows-[12rem] grid-cols-2 gap-3.5 sm:auto-rows-[14rem] sm:gap-5 lg:auto-rows-[16.5rem] lg:grid-cols-4">
      {items.map((destination, index) => (
        <li key={destination.slug} className={SPAN[index] ?? ""}>
          {destination.active ? (
            <Link
              href={`/diem-den/${destination.slug}`}
              className={cn(TILE, "size-full shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] outline-none focus-visible:ring-2 focus-visible:ring-ring")}
            >
              <TileBody destination={destination} featured={index === 0} />
            </Link>
          ) : (
            <div aria-disabled="true" className={cn(TILE, "size-full cursor-default")}>
              <TileBody destination={destination} featured={false} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

