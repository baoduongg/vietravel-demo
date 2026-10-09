import Image from "next/image"
import { CheckIcon, PlaneIcon, ShipIcon, SparklesIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function GettingThere({ guide, moreHref }: { guide: DestinationGuide; moreHref?: string }): React.JSX.Element {
  const { airport, onIslandPhoto } = guide
  return (
    <Section moreHref={moreHref}
      id="di-chuyen"
      title={`Cách Di Chuyển Đến ${guide.name}`}
      intro="Thời lượng bay và tàu cao tốc ước tính. Lịch trình linh hoạt từ các thành phố lớn."
    >
      <figure className="group relative mb-8 min-h-60 overflow-hidden rounded-[2rem] border border-white/10 sm:min-h-72 shadow-xl">
        <Image
          src={airport.photo.src}
          alt={airport.photo.alt}
          fill
          sizes="(min-width:1024px) 1100px, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.9] contrast-[1.05]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-shade/95 via-shade/40 to-transparent" />
        <figcaption className="absolute inset-x-5 bottom-4 text-white sm:inset-x-8 sm:bottom-6">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {airport.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[11px] font-bold tracking-wider text-primary-ink uppercase">{fact.label}</dt>
                <dd className="font-heading text-lg sm:text-xl leading-snug font-extrabold text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <a href={airport.photo.credit.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[10px] text-white/70 underline-offset-2 hover:underline">
            Ảnh: {airport.photo.credit.author}
          </a>
        </figcaption>
      </figure>

      <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <ul className="grid gap-3 sm:grid-cols-2">
          {guide.routes.map((route) => {
            const Icon = route.mode === "Tàu cao tốc" ? ShipIcon : PlaneIcon
            const isFlight = route.mode !== "Tàu cao tốc"
            return (
              <li key={route.from} className="flex flex-col glass-card lift p-5">
                <div className="flex items-center gap-3.5 pb-3 border-b border-dashed border-tint/10">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${isFlight ? "bg-primary-ink/15 text-primary-ink ring-primary-ink/30" : "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30"}`}>
                    <Icon aria-hidden strokeWidth={2} className="size-4" />
                  </span>
                  <div>
                    <p className="font-heading text-base font-bold text-title">{route.from}</p>
                    <p className="text-xs text-primary-ink font-semibold">
                      {route.mode} · {route.duration}
                    </p>
                  </div>
                </div>
                <p className="pt-3 text-xs leading-relaxed text-muted-foreground">{route.note}</p>
              </li>
            )
          })}
        </ul>

        <div className="glass-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <figure className="relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
              <Image src={onIslandPhoto.src} alt={onIslandPhoto.alt} fill sizes="(min-width:1024px) 440px, 100vw" className="object-cover" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-shade/80 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-3.5 bottom-2.5 text-white">
                <p className="text-xs font-bold text-white">{onIslandPhoto.caption}</p>
              </figcaption>
            </figure>

            <h3 className="font-heading text-lg font-bold text-title">Di chuyển linh hoạt trên đảo</h3>
            <ul className="mt-3.5 space-y-3">
              {guide.onIsland.map((item) => (
                <li key={item.name} className="text-xs">
                  <p className="font-bold text-title">{item.name}</p>
                  <p className="text-muted-foreground mt-0.5">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-tint/8">
            <CtaLink href={guide.links.flights} className="w-full justify-center h-11 text-xs font-bold">
              Xem vé máy bay tại Vietravel
            </CtaLink>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card p-6 sm:p-7">
        <h3 className="font-heading text-lg font-bold text-title flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary-ink" />
          Lưu ý quan trọng cho chuyến đi hoàn hảo
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {guide.travelTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-xs sm:text-sm text-body leading-relaxed">
              <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary-ink/15 text-primary-ink mt-0.5">
                <CheckIcon aria-hidden strokeWidth={2.5} className="size-3" />
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

