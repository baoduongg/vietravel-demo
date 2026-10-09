import Image from "next/image"
import { CompassIcon, MapPinIcon, PlaneIcon, SparklesIcon, StarIcon, SunIcon, WavesIcon } from "lucide-react"

import { ArrowChip, CtaLink, buttonClass } from "@/components/explorer/cta-link"
import { Reveal } from "@/components/explorer/reveal"
import type { DestinationGuide } from "@/types/destination"

const REASON_ICONS = [WavesIcon, SunIcon, SparklesIcon, PlaneIcon, CompassIcon]

export function DestinationHero({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <>
      <section className="on-dark relative isolate flex min-h-[90dvh] flex-col justify-end overflow-hidden text-white">
        <Image
          src={guide.heroImageUrl}
          alt={guide.name}
          fill
          priority
          sizes="100vw"
          className="animate-drift-zoom -z-20 object-cover brightness-[0.88] contrast-[1.05]"
        />
        {/* Tropical Radial Glow Overlay */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_20%_80%,rgba(255,94,54,0.35),transparent_70%),radial-gradient(60%_50%_at_80%_20%,rgba(0,70,193,0.35),transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade/95 via-shade/30 to-shade/40" />
        <div aria-hidden className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-44" />

        <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-20 lg:px-6 lg:pb-28">
          {/* Quick Info Pill Bar */}
          <div style={{ "--reveal-delay": "40ms" } as React.CSSProperties} className="animate-reveal flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white ring-1 ring-primary-ink/30 backdrop-blur-md">
              <MapPinIcon className="size-3.5" />
              Đảo Ngọc Kiên Giang
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
              <SunIcon className="size-3.5 text-amber-400" />
              28–32°C Nắng Vàng
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              4.9/5 (1.5k+ Đánh Giá)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
              <PlaneIcon className="size-3.5 text-cyan-400" />
              55 Phút Từ TP.HCM
            </span>
          </div>

          <h1
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
            className="animate-reveal font-heading text-[3.25rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem]"
          >
            {guide.name}
          </h1>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div style={{ "--reveal-delay": "240ms" } as React.CSSProperties} className="animate-reveal max-w-xl">
              <p className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-gradient-brand">
                {guide.tagline}
              </p>
              <p className="mt-3 leading-relaxed font-normal text-body sm:text-lg">
                {guide.intro}
              </p>
            </div>

            <div style={{ "--reveal-delay": "380ms" } as React.CSSProperties} className="animate-reveal flex flex-wrap items-center gap-3">
              <a href="#tour" className={buttonClass("primary", "h-13 px-7 text-base shadow-[0_10px_30px_rgba(0,70,193,0.4)]")}>
                <span>Săn tour {guide.name}</span>
                <ArrowChip />
              </a>
              <CtaLink href={guide.links.hotels} variant="outline" className="h-13 px-6 text-base">
                Khách sạn & Resort
              </CtaLink>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons to Visit - Upgraded with Double-Bezel Cards */}
      <section className="mx-auto max-w-6xl px-4 pt-12 lg:px-6 lg:pt-20" aria-labelledby="ly-do">
        <div className="flex items-center gap-2 mb-6">
          <span className="flex size-2 rounded-full bg-accent-coral" />
          <h2 id="ly-do" className="font-heading text-2xl font-bold text-title">
            5 Trải Nghiệm Khiến Bạn Mê Mẩn {guide.name}
          </h2>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {guide.reasons.map((reason, index) => {
            const Icon = REASON_ICONS[index % REASON_ICONS.length]
            return (
              <li key={reason.title} className="h-full">
                <Reveal delay={index * 80} className="h-full">
                  <div className="double-bezel h-full group lift">
                    <div className="double-bezel-inner flex h-full flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-ink/15 text-primary-ink ring-1 ring-primary-ink/30">
                            <Icon className="size-4" />
                          </span>
                          <span className="font-heading text-2xl font-extrabold text-tint/20 group-hover:text-primary-ink/50 transition-colors">
                            0{index + 1}
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-bold leading-snug text-title group-hover:text-primary-ink transition-colors">
                          {reason.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {reason.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </section>
    </>
  )
}

