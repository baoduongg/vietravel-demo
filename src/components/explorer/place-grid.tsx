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

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  ...(Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => ({ value, label: AUDIENCE_LABEL[value] })),
]

/** Tỉ lệ ảnh xoay vòng để dạng mosaic có nhịp cao thấp. */
const MOSAIC_RATIO = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square"]

function PlaceCard({ place, ratio, plan }: { place: Place; ratio: string; plan?: PlanDestination }): React.JSX.Element {
  return (
    // Không có ảnh thì đặt nội dung trong thẻ trắng để khối vẫn có hình khối.
    <div className={cn(!place.imageUrl && "h-full glass-card p-5")}>
      {place.imageUrl && (
        <div className={cn("group lift relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-38px_rgba(0,0,0,0.7)]", ratio)}>
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 85vw"
            className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105"
          />
        </div>
      )}
      {place.credit && (
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          Ảnh minh họa:{" "}
          <a href={place.credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {place.credit.author}, {place.credit.license}
          </a>
        </p>
      )}
      <div className={cn("flex flex-col gap-1.5", place.imageUrl ? "mt-4 px-1" : "")}>
        <p className="text-sm font-semibold text-gold">{place.tag}</p>
        <h3 className="font-voyage text-xl leading-snug font-semibold tracking-tight text-title">{place.name}</h3>
        <p className="text-sm text-muted-foreground">{place.blurb}</p>
        {place.tip && (
          <p className="mt-1 flex gap-2 rounded-2xl bg-tint/[0.06] p-3 text-xs text-body">
            <LightbulbIcon aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-gold" />
            {place.tip}
          </p>
        )}
        <p className="pt-1 text-xs text-muted-foreground">Phù hợp: {place.audiences.map((audience) => AUDIENCE_LABEL[audience]).join(", ")}</p>
        {plan && (
          <AddToPlanButton destinationSlug={plan.slug} destinationName={plan.name} serviceId={activityServiceId(place.name)} className="mt-3 self-start" />
        )}
      </div>
    </div>
  )
}

/** rail: cuộn ngang từng thẻ; mosaic: nhiều cột xếp so le, không bao giờ có ô trống dù lọc còn ít thẻ. */
export function PlaceGrid({ items, variant, planDestination }: { items: Place[]; variant: "rail" | "mosaic"; planDestination?: PlanDestination }): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>("all")
  const visible = filter === "all" ? items : items.filter((item) => item.audiences.includes(filter))

  return (
    <div>
      <div role="group" aria-label="Lọc theo nhóm đi cùng" className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "h-10 rounded-full px-5 text-sm font-semibold ring-1 transition-[background-color,color,transform] duration-500 ease-soft outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              filter === option.value ? "bg-champagne text-void ring-champagne" : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {variant === "rail" ? (
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:-mx-6 lg:scroll-px-6 lg:px-6">
          {visible.map((place) => (
            <li key={place.name} className="w-[17rem] shrink-0 snap-start sm:w-[20rem]">
              <PlaceCard place={place} ratio="aspect-[4/5]" plan={planDestination} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 gap-x-5 sm:columns-2 lg:columns-3">
          {visible.map((place, index) => (
            <li key={place.name} className="mb-10 break-inside-avoid">
              <PlaceCard place={place} ratio={MOSAIC_RATIO[index % MOSAIC_RATIO.length]} plan={planDestination} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
