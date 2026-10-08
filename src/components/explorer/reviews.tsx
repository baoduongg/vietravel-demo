import { StarIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Reviews({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="review" eyebrow="Review" title="Người đã đi nói gì?" intro="Review mẫu cho bản demo, minh họa cách Explorer hiển thị trải nghiệm thật của khách.">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guide.reviews.map((review) => (
          <li key={review.nick} className={CARD_CLASS}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold">{review.nick}</p>
              <p role="img" aria-label={`${review.rating} trên 5 sao`} className="flex">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon key={index} aria-hidden className={index < review.rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-ocean/20"} />
                ))}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{review.trip}</p>
            <p className="mt-3 text-sm text-ink/85">{review.text}</p>
            <p className="mt-4 text-[11px] font-semibold text-sunset">Review mẫu cho bản demo</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
