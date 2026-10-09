import { MapPinIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import type { DestinationGuide } from "@/types/destination"

export function StayBlock({ guide, moreHref }: { guide: DestinationGuide; moreHref?: string }): React.JSX.Element {
  return (
    <Section moreHref={moreHref}
      id="luu-tru"
      title="Khách Sạn & Resort View Biển Đỉnh Cao"
      intro="Từ villa riêng tư ngắm hoàng hôn, resort liền kề khu vui chơi đến khách sạn trung tâm tiện quẩy phố đêm."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guide.areas.map((area, index) => (
          <li key={area.name} className="double-bezel lift">
            <div className="double-bezel-inner p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary-ink/15 text-primary-ink">
                    <MapPinIcon className="size-3.5" />
                  </span>
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Khu vực 0{index + 1}</span>
                </div>
                <p className="font-heading text-base font-bold text-title">{area.name}</p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{area.blurb}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <PlaceGrid items={guide.stays} variant="rail" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3.5">
        <CtaLink href={guide.links.hotels} className="h-12 px-6">
          Xem tất cả khách sạn {guide.name}
        </CtaLink>
        <AddToPlanButton
          destinationSlug={guide.slug}
          destinationName={guide.name}
          pickerKind="hotel"
          label="Thêm khách sạn vào kế hoạch"
          className="h-12 px-6 text-sm font-bold bg-tint/5 ring-1 ring-tint/12 hover:bg-primary hover:text-white"
        />
      </div>
    </Section>
  )
}

