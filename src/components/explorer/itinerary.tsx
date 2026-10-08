import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Itinerary({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="lich-trinh" eyebrow="Lịch trình" title={`${guide.name} ${guide.itinerary.length} ngày ${guide.itinerary.length - 1} đêm`} intro="Gợi ý lịch trình để Quý khách hình dung chuyến đi. Có thể thay đổi theo thời tiết và sở thích.">
      <ol className="grid gap-4 lg:grid-cols-3">
        {guide.itinerary.map((day) => (
          <li key={day.day} className="rounded-3xl bg-white p-5 ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            <p className="text-xs font-extrabold tracking-[0.15em] text-sunset uppercase">Ngày {day.day}</p>
            <h3 className="mt-1 text-lg font-extrabold">{day.title}</h3>
            <ul className="mt-4 space-y-3 border-l-2 border-cloud pl-4">
              {day.items.map((item) => (
                <li key={`${item.time}-${item.text}`} className="relative">
                  <span aria-hidden className="absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full bg-ocean" />
                  <p className="text-xs font-bold text-ocean">{item.time}</p>
                  <p className="text-sm text-ink/85">{item.text}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
