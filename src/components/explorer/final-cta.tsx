import Image from "next/image"
import { PhoneIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { Reveal } from "@/components/explorer/reveal"
import { company } from "@/config/company"
import type { DestinationGuide } from "@/types/destination"

export function FinalCta({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const imageUrl = guide.activities.find((place) => place.imageUrl)?.imageUrl ?? guide.heroImageUrl

  return (
    <section className="py-16 lg:py-28">
      <Reveal>
        <div className="on-dark relative isolate flex min-h-[30rem] flex-col justify-end gap-6 overflow-hidden rounded-[20px] p-8 ring-1 ring-tint/10 text-white sm:p-12 lg:p-16">
          <Image src={imageUrl} alt="" fill sizes="(min-width:1152px) 1152px, 100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade via-shade/55 to-shade/25" />
          <h2 className="max-w-2xl font-voyage text-3xl leading-[1.2] font-medium tracking-[-0.01em] text-champagne sm:text-5xl">Sẵn sàng cho chuyến đi {guide.name}?</h2>
          <p className="max-w-xl text-lg font-light text-body">Chọn tour trọn gói hoặc đặt riêng khách sạn, vé máy bay. Tư vấn viên Vietravel luôn sẵn sàng hỗ trợ.</p>
          <div className="flex flex-wrap gap-3">
            <CtaLink href={guide.links.tours} variant="primary">
              Đặt tour {guide.name}
            </CtaLink>
            <a
              href={`tel:${company.hotline.replace(/\s/g, "")}`}
              className="inline-flex h-12 items-center gap-2 btn-glass rounded-full px-6 text-sm font-semibold"
            >
              <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
              {company.hotline}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
