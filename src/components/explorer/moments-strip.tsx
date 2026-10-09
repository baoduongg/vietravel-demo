import Image from "next/image"
import { HeartIcon, MapPinIcon, PlayIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

const LIKES = ["2.4k", "1.9k", "3.2k", "1.5k", "2.8k", "3.6k"]

export function MomentsStrip({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section
      id="khoanh-khac"
      title={`Check-in Triệu View Tại ${guide.name}`}
      intro="Những khoảnh khắc sống ảo đỉnh chóp được du khách trẻ check-in nhiều nhất."
    >
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 sm:gap-5 overflow-x-auto px-4 pb-10 [scrollbar-width:none] lg:-mx-6 lg:scroll-px-6 lg:px-6">
        {guide.gallery.map((photo, index) => (
          <li key={photo.src} className={index % 2 ? "mt-6 sm:mt-10 shrink-0 snap-start" : "shrink-0 snap-start"}>
            <figure className="group lift relative aspect-[9/16] w-[14rem] sm:w-[16.5rem] overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_25px_50px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-primary-ink/50 hover:shadow-[0_25px_50px_-15px_rgba(0,70,193,0.35)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="288px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-[0.9] contrast-[1.05]"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-shade/95 via-shade/20 via-50% to-shade/30" />

              {/* Story Header */}
              <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md ring-1 ring-white/15">
                  <MapPinIcon className="size-3 text-primary-ink" />
                  Phú Quốc
                </span>
                <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                  <PlayIcon className="size-3 fill-white translate-x-0.5" />
                </span>
              </div>

              {/* Story Footer */}
              <figcaption className="absolute inset-x-4 bottom-4 text-white">
                <p className="font-heading text-base font-bold leading-snug text-white group-hover:text-primary-ink transition-colors">
                  {photo.caption}
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                    <HeartIcon className="size-3.5 fill-rose-500" />
                    {LIKES[index % LIKES.length]}
                  </span>
                  <span className="text-[10px] font-medium text-white/60">
                    #CheckIn
                  </span>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}

