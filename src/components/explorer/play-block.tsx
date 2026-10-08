import { PlaceGrid } from "@/components/explorer/place-grid"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function PlayBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="vui-choi" title={`Đến ${guide.name} làm gì?`} intro="Từ biển, cáp treo đến khu vui chơi và chợ đêm. Lọc theo người đi cùng để chọn đúng điểm.">
      <PlaceGrid items={guide.activities} variant="mosaic" />
    </Section>
  )
}
