import { CtaLink } from "@/components/explorer/cta-link"
import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import type { DestinationGuide } from "@/types/destination"

export function StayBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="luu-tru" title="Ở đâu cho kỳ nghỉ của bạn?" intro="Chọn khu vực theo kiểu chuyến đi, rồi lọc loại hình lưu trú theo người đi cùng.">
      <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {guide.areas.map((area) => (
          <li key={area.name} className="border-l-2 border-primary-ink pl-4">
            <p className="font-voyage text-lg font-semibold tracking-tight text-title">{area.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{area.blurb}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <PlaceGrid items={guide.stays} variant="rail" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CtaLink href={guide.links.hotels}>Xem khách sạn {guide.name} tại Vietravel</CtaLink>
        <AddToPlanButton destinationSlug={guide.slug} destinationName={guide.name} pickerKind="hotel" label="Chọn khách sạn cho kế hoạch" className="h-12" />
      </div>
    </Section>
  )
}
