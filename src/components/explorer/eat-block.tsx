import { MapPinIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function EatBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="an-uong" eyebrow="Ăn uống" title="Những món phải thử" intro="Hải sản tươi và đặc sản địa phương, giá nên hỏi trước khi gọi món.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guide.dishes.map((dish) => (
          <li key={dish.name} className={CARD_CLASS}>
            <h3 className="font-extrabold">{dish.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{dish.blurb}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ocean">
              <MapPinIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
              {dish.where}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
