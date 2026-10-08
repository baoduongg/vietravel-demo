import Image from "next/image"

import { ArrowChip, CtaLink, buttonClass } from "@/components/explorer/cta-link"
import { Reveal } from "@/components/explorer/reveal"
import type { DestinationGuide } from "@/types/destination"

export function DestinationHero({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <>
      <section className="on-dark relative isolate flex min-h-[88dvh] flex-col justify-end overflow-hidden text-white">
        <Image src={guide.heroImageUrl} alt={guide.name} fill priority sizes="100vw" className="animate-drift-zoom -z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_20%_85%,rgba(0,70,193,0.42),transparent),radial-gradient(50%_45%_at_12%_18%,rgba(3,145,255,0.2),transparent)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade/70 via-shade/20 to-shade/50" />
        <div aria-hidden className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-40" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-20 lg:px-6 lg:pb-32">
          <h1 style={{ "--reveal-delay": "80ms" } as React.CSSProperties} className="animate-reveal font-voyage text-[3.5rem] leading-[1.15] font-normal tracking-[-0.02em] text-title sm:text-7xl lg:text-[6rem]">
            {guide.name}
          </h1>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div style={{ "--reveal-delay": "260ms" } as React.CSSProperties} className="animate-reveal max-w-xl">
              <p className="font-voyage text-2xl font-medium tracking-tight text-champagne italic">{guide.tagline}</p>
              <p className="mt-3 leading-[1.65] font-light text-body sm:text-lg">{guide.intro}</p>
            </div>
            <div style={{ "--reveal-delay": "420ms" } as React.CSSProperties} className="animate-reveal flex flex-wrap gap-3">
              <a href="#tour" className={buttonClass("primary")}>
                Xem tour {guide.name}
                <ArrowChip />
              </a>
              <CtaLink href={guide.links.hotels} variant="outline">
                Khách sạn {guide.name}
              </CtaLink>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-16 lg:px-6 lg:pt-24" aria-labelledby="ly-do">
        <h2 id="ly-do" className="sr-only">
          {guide.reasons.length} lý do nên đến {guide.name}
        </h2>
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {guide.reasons.map((reason, index) => (
            <li key={reason.title}>
              <Reveal delay={index * 90}>
                <span aria-hidden className="font-voyage text-6xl leading-none font-semibold text-transparent [-webkit-text-stroke:1.5px_var(--c-primary-ink)]">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-voyage text-xl leading-snug font-semibold text-title">{reason.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{reason.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
