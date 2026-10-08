import { PhoneIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { company } from "@/config/company"
import type { DestinationGuide } from "@/types/destination"

export function FinalCta({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <section className="py-10 lg:py-14">
      <div className="flex flex-col items-start gap-5 rounded-[2rem] bg-ocean p-8 text-white sm:p-12">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Sẵn sàng cho chuyến đi {guide.name}?</h2>
        <p className="max-w-xl text-white/85">Chọn tour trọn gói hoặc đặt riêng khách sạn, vé máy bay. Tư vấn viên Vietravel luôn sẵn sàng hỗ trợ.</p>
        <div className="flex flex-wrap gap-3">
          <CtaLink href={guide.links.tours} variant="light">
            Đặt tour {guide.name}
          </CtaLink>
          <a
            href={`tel:${company.hotline.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-white/50"
          >
            <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
            {company.hotline}
          </a>
        </div>
      </div>
    </section>
  )
}
