import Image from "next/image"

import { CtaLink } from "@/components/explorer/cta-link"
import { CARD_CLASS } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function DestinationHero({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
        <div className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:min-h-[34rem] lg:p-14">
          <Image src={guide.heroImageUrl} alt={guide.name} fill priority sizes="(min-width:1152px) 1152px, 100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/30 to-ink/5" />
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Điểm đến</p>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-7xl">{guide.name}</h1>
          <p className="mt-3 max-w-2xl text-xl font-semibold text-white/95">{guide.tagline}</p>
          <p className="mt-3 max-w-2xl text-white/80">{guide.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#tour"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-ocean outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              Xem tour {guide.name}
            </a>
            <CtaLink href={guide.links.hotels} variant="outline">
              Khách sạn {guide.name}
            </CtaLink>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-6 lg:px-6" aria-labelledby="ly-do">
        <h2 id="ly-do" className="sr-only">
          {guide.reasons.length} lý do nên đến {guide.name}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {guide.reasons.map((reason, index) => (
            <li key={reason.title} className={`${CARD_CLASS} p-4`}>
              <span className="text-xs font-extrabold text-sunset">0{index + 1}</span>
              <h3 className="mt-1 font-extrabold">{reason.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{reason.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
