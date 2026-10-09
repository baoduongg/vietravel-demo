"use client"

import { useState } from "react"
import Image from "next/image"
import { LightbulbIcon } from "lucide-react"

import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { AUDIENCE_LABEL, type Audience, type Place } from "@/types/destination"
import { activityServiceId } from "@/lib/journey/ids"
import { cn } from "@/lib/utils"

type Filter = Audience | "all"

/** Có giá trị thì mỗi thẻ có nút "Thêm vào kế hoạch" (chỉ dùng cho hoạt động, không cho loại hình lưu trú). */
type PlanDestination = { slug: string; name: string }

const EMOJI_MAP: Record<string, string> = {
  all: "✨",
  family: "👨‍👩‍👧",
  couple: "💑",
  friends: "🏄‍♂️",
}

const OPTIONS: { value: Filter; label: string; emoji: string }[] = [
  { value: "all", label: "Tất cả", emoji: "✨" },
  ...(Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => ({
    value,
    label: AUDIENCE_LABEL[value],
    emoji: EMOJI_MAP[value] || "🌴",
  })),
]

/** Tỉ lệ ảnh xoay vòng để dạng mosaic có nhịp cao thấp. */
const MOSAIC_RATIO = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square"]

function PlaceCard({ place, ratio, plan }: { place: Place; ratio: string; plan?: PlanDestination }): React.JSX.Element {
  return (
    <div className={cn("group lift relative overflow-hidden rounded-[1.75rem] border border-white/10 transition-all duration-500 hover:border-primary-ink/40 shadow-lg", !place.imageUrl && "h-full glass-card p-6")}>
      {place.imageUrl && (
        <div className={cn("relative overflow-hidden", ratio)}>
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 85vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-[0.92] contrast-[1.05]"
          />
          <span className="on-dark absolute top-3.5 left-3.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-extrabold text-primary-ink backdrop-blur-md ring-1 ring-white/15">
            {place.tag}
          </span>
        </div>
      )}

      <div className={cn("flex flex-col gap-2 p-5", place.imageUrl ? "bg-void/80 backdrop-blur-md" : "")}>
        <h3 className="font-heading text-lg sm:text-xl leading-snug font-extrabold tracking-tight text-title group-hover:text-primary-ink transition-colors">
          {place.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{place.blurb}</p>

        {place.tip && (
          <p className="mt-1 flex items-start gap-2 rounded-xl bg-primary-ink/10 p-3 text-xs leading-relaxed text-body border border-primary-ink/20">
            <LightbulbIcon aria-hidden strokeWidth={2} className="mt-0.5 size-3.5 shrink-0 text-primary-ink" />
            <span><strong className="text-primary-ink">Mẹo:</strong> {place.tip}</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-tint/8 pt-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Phù hợp: <span className="text-title font-bold">{place.audiences.map((audience) => AUDIENCE_LABEL[audience]).join(", ")}</span>
          </p>
          {plan && (
            <AddToPlanButton
              destinationSlug={plan.slug}
              destinationName={plan.name}
              serviceId={activityServiceId(place.name)}
              className="h-8 px-3 text-xs font-bold"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function PlaceGrid({ items, variant, planDestination }: { items: Place[]; variant: "rail" | "mosaic"; planDestination?: PlanDestination }): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>("all")
  const visible = filter === "all" ? items : items.filter((item) => item.audiences.includes(filter))

  return (
    <div>
      <div role="group" aria-label="Lọc theo nhóm đi cùng" className="flex flex-wrap items-center gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-bold ring-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              filter === option.value
                ? "bg-primary text-white ring-primary shadow-md scale-102"
                : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10 hover:text-title",
            )}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {variant === "rail" ? (
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:-mx-6 lg:scroll-px-6 lg:px-6">
          {visible.map((place) => (
            <li key={place.name} className="w-[17.5rem] shrink-0 snap-start sm:w-[21rem]">
              <PlaceCard place={place} ratio="aspect-[4/5]" plan={planDestination} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 gap-x-5 sm:columns-2 lg:columns-3">
          {visible.map((place, index) => (
            <li key={place.name} className="mb-8 break-inside-avoid">
              <PlaceCard place={place} ratio={MOSAIC_RATIO[index % MOSAIC_RATIO.length]} plan={planDestination} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

