import { CtaLink } from "@/components/explorer/cta-link"
import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function StayBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="luu-tru" eyebrow="Lưu trú" title="Ở đâu cho kỳ nghỉ của bạn?" intro="Chọn khu vực theo kiểu chuyến đi, rồi lọc loại hình lưu trú theo người đi cùng.">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {guide.areas.map((area) => (
          <li key={area.name} className="rounded-2xl bg-cloud/40 p-4">
            <p className="font-extrabold text-ocean">{area.name}</p>
            <p className="mt-1 text-sm text-ink/80">{area.blurb}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <PlaceGrid items={guide.stays} />
      </div>
      <div className="mt-6">
        <CtaLink href={guide.links.hotels}>Xem khách sạn {guide.name} tại Vietravel</CtaLink>
      </div>
    </Section>
  )
}
