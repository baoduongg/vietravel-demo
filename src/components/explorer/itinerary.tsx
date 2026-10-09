"use client"

import { useState } from "react"
import Image from "next/image"
import { CalendarIcon, CameraIcon, MapPinIcon, SunMediumIcon, SunsetIcon, UtensilsIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { activityServiceId } from "@/lib/journey/ids"
import { cn } from "@/lib/utils"
import type { DestinationGuide } from "@/types/destination"

const TIME_ICONS: Record<string, typeof SunMediumIcon> = {
  Sáng: SunMediumIcon,
  Trưa: UtensilsIcon,
  Chiều: SunsetIcon,
  Tối: CameraIcon,
}

const TIME_COLORS: Record<string, string> = {
  Sáng: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Trưa: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Chiều: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  Tối: "bg-purple-500/15 text-purple-600 border-purple-500/30",
}

export function Itinerary({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const [selectedDay, setSelectedDay] = useState<number | "all">("all")

  const daysToShow = selectedDay === "all" ? guide.itinerary : guide.itinerary.filter((d) => d.day === selectedDay)

  return (
    <Section
      id="lich-trinh"
      title={`Hành Trình Gợi Ý ${guide.name} ${guide.itinerary.length}N${guide.itinerary.length - 1}Đ`}
      intro="Lịch trình mẫu tối ưu các cung đường đẹp nhất, dễ dàng lưu lại vào kế hoạch cá nhân của bạn."
    >
      {/* Day Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setSelectedDay("all")}
          className={cn(
            "h-10 rounded-full px-5 text-xs sm:text-sm font-bold transition-all duration-300 ring-1",
            selectedDay === "all"
              ? "bg-primary text-white ring-primary shadow-md scale-102"
              : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10",
          )}
        >
          ✨ Toàn bộ chuyến đi ({guide.itinerary.length} ngày)
        </button>
        {guide.itinerary.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setSelectedDay(day.day)}
            className={cn(
              "h-10 rounded-full px-4 text-xs sm:text-sm font-bold transition-all duration-300 ring-1",
              selectedDay === day.day
                ? "bg-primary text-white ring-primary shadow-md scale-102"
                : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10",
            )}
          >
            Ngày {day.day}: {day.title.split(":")[0]}
          </button>
        ))}
      </div>

      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 sm:p-10 lg:p-12">
          <ol className="space-y-12">
            {daysToShow.map((day, index) => {
              const photo = guide.gallery.length > 0 ? guide.gallery[index % guide.gallery.length] : null
              const flip = index % 2 === 1
              return (
                <li key={day.day} className="border-b border-tint/10 pb-10 last:border-none last:pb-0">
                  <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
                    {/* Polaroid Photo Card */}
                    <figure className={cn("mx-auto w-full max-w-xs lg:max-w-sm", flip ? "lg:order-2 lg:rotate-[1.5deg]" : "-rotate-1")}>
                      <div className="relative rounded-2xl bg-tint/[0.04] p-3.5 pb-5 shadow-xl ring-1 ring-tint/10 backdrop-blur-md">
                        <span aria-hidden className="washi absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 -rotate-2 rounded-sm shadow-md" />
                        {photo ? (
                          <>
                            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                              <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                sizes="(min-width:1024px) 384px, 90vw"
                                className="object-cover transition-transform duration-700 hover:scale-105"
                              />
                              <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md ring-1 ring-white/15">
                                Ngày {day.day}
                              </span>
                            </div>
                            <figcaption className="mt-3 font-heading text-sm font-bold text-title">
                              {photo.caption}
                            </figcaption>
                          </>
                        ) : (
                          <div className="grid aspect-[4/5] place-items-center rounded-xl bg-tint/5 font-heading text-5xl font-extrabold text-muted-foreground">
                            {day.day}
                          </div>
                        )}
                      </div>
                    </figure>

                    {/* Day Content */}
                    <div className={flip ? "lg:order-1" : ""}>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary-ink/15 px-3 py-1 text-xs font-extrabold text-primary-ink ring-1 ring-primary-ink/30">
                        <CalendarIcon className="size-3.5 text-primary-ink" />
                        NGÀY 0{day.day} · HÀNH TRÌNH
                      </div>
                      <h3 className="mt-2 font-heading text-2xl leading-snug font-extrabold text-title sm:text-3xl">
                        {day.title}
                      </h3>

                      <ul className="mt-6 space-y-4 border-l-2 border-dashed border-primary-ink/30 pl-5">
                        {day.items.map((item) => {
                          const Icon = TIME_ICONS[item.time] || MapPinIcon
                          const colorClass = TIME_COLORS[item.time] || "bg-primary-ink/15 text-primary-ink border-primary-ink/30"
                          return (
                            <li key={`${item.time}-${item.text}`} className="relative pl-2">
                              <span aria-hidden className="absolute top-2 -left-[1.78rem] size-3 rounded-full bg-primary ring-4 ring-background" />
                              <div className="flex items-start gap-2.5">
                                <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold border shrink-0", colorClass)}>
                                  <Icon className="size-3" />
                                  {item.time}
                                </span>
                                <p className="text-sm font-medium text-body leading-relaxed">
                                  {item.text}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>

                      <div className="mt-6 pt-4 border-t border-tint/10 flex items-center gap-3">
                        <AddToPlanButton
                          destinationSlug={guide.slug}
                          destinationName={guide.name}
                          serviceId={activityServiceId(`Lịch trình ngày ${day.day}`)}
                          label={`Lưu ngày ${day.day} vào kế hoạch`}
                          className="h-10 px-4 text-xs font-bold bg-tint/5 text-title ring-1 ring-tint/12 hover:bg-primary hover:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </Section>
  )
}

