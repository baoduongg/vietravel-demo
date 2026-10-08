"use client"

import { useState } from "react"
import Image from "next/image"
import { LightbulbIcon } from "lucide-react"

import { AUDIENCE_LABEL, type Audience, type Place } from "@/types/destination"
import { cn } from "@/lib/utils"

type Filter = Audience | "all"

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  ...(Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => ({ value, label: AUDIENCE_LABEL[value] })),
]

export function PlaceGrid({ items }: { items: Place[] }): React.JSX.Element {
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
              "h-9 rounded-full px-4 text-sm font-semibold ring-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === option.value ? "bg-ocean text-white ring-ocean" : "bg-white text-ocean ring-ocean/20 hover:bg-cloud/60",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((place) => (
          <li key={place.name} className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            {place.imageUrl && (
              <div className="relative aspect-[16/10]">
                <Image src={place.imageUrl} alt={place.name} fill sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <p className="text-xs font-semibold text-sunset">{place.tag}</p>
              <h3 className="font-extrabold">{place.name}</h3>
              <p className="text-sm text-muted-foreground">{place.blurb}</p>
              {place.tip && (
                <p className="flex gap-2 rounded-2xl bg-cloud/50 p-3 text-xs text-ink/80">
                  <LightbulbIcon aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-ocean" />
                  {place.tip}
                </p>
              )}
              <p className="mt-auto pt-1 text-xs text-muted-foreground">Phù hợp: {place.audiences.map((audience) => AUDIENCE_LABEL[audience]).join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
