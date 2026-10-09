import Image from "next/image"
import Link from "next/link"
import { PhoneIcon, SparklesIcon } from "lucide-react"

import { ArrowChip, buttonClass } from "@/components/explorer/cta-link"
import { Reveal } from "@/components/explorer/reveal"
import { company } from "@/config/company"
import type { DestinationGuide } from "@/types/destination"

export function FinalCta({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const imageUrl = guide.activities.find((place) => place.imageUrl)?.imageUrl ?? guide.heroImageUrl

  return (
    <section className="py-14 lg:py-24">
      <Reveal>
        <div className="on-dark relative isolate flex min-h-[30rem] flex-col justify-end gap-6 overflow-hidden rounded-[2.25rem] p-8 ring-1 ring-white/15 text-white sm:p-12 lg:p-16 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width:1152px) 1152px, 100vw"
            className="-z-20 object-cover brightness-[0.85] contrast-[1.05]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-shade/95 via-shade/60 to-shade/30" />

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-ink/20 px-3 py-1 text-xs font-extrabold text-primary-ink ring-1 ring-primary-ink/30 backdrop-blur-md mb-3">
              <SparklesIcon className="size-3.5" />
              LÊN KÈO DU LỊCH NGAY
            </span>
            <h2 className="font-heading text-3xl leading-[1.12] font-extrabold tracking-tight text-white sm:text-5xl">
              Sẵn sàng bật mood xê dịch tại <span className="text-gradient-brand">{guide.name}?</span>
            </h2>
            <p className="mt-4 max-w-xl text-base sm:text-lg font-normal text-body leading-relaxed">
              Chọn tour trọn gói ưu đãi trên hệ thống chính thức Vietravel hoặc trò chuyện trực tiếp cùng Tripi AI để thiết kế lịch trình riêng chuẩn gu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a href={guide.links.tours} target="_blank" rel="noreferrer" className={buttonClass("primary", "h-13 px-7 text-base shadow-[0_10px_30px_rgba(0,70,193,0.4)]")}>
              <span>Đặt tour trên Vietravel</span>
              <ArrowChip />
            </a>
            <Link
              href="/tripi"
              className="inline-flex h-13 items-center gap-2 btn-glass rounded-full px-6 text-sm sm:text-base font-bold text-white hover:border-primary-ink/50"
            >
              <SparklesIcon aria-hidden strokeWidth={2} className="size-4 text-amber-300" />
              <span>Hỏi AI tư vấn tour</span>
            </Link>
            <a
              href={`tel:${company.hotline.replace(/\s/g, "")}`}
              className="inline-flex h-13 items-center gap-2 btn-glass rounded-full px-6 text-sm sm:text-base font-bold text-white"
            >
              <PhoneIcon aria-hidden strokeWidth={2} className="size-4 text-primary-ink" />
              <span>Gọi {company.hotline}</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

