import { StarIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import { cn } from "@/lib/utils"
import type { DestinationGuide, Review } from "@/types/destination"

function Stars({ rating, light }: { rating: Review["rating"]; light?: boolean }): React.JSX.Element {
  return (
    <p role="img" aria-label={`${rating} trên 5 sao`} className="flex">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} aria-hidden className={cn("size-4", index < rating ? "fill-amber-400 text-amber-400" : light ? "text-white/25" : "text-gold/20")} />
      ))}
    </p>
  )
}

export function Reviews({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const [featured, ...rest] = guide.reviews

  return (
    <Section id="review" title="Người đã đi nói gì?" intro="Review mẫu cho bản demo, minh họa cách Explorer hiển thị trải nghiệm thật của khách.">
      <div className="grid gap-4 lg:grid-cols-2">
        {featured && (
          <figure className="on-dark flex flex-col justify-between gap-10 rounded-[20px] bg-dusk p-8 text-white lg:p-10">
            <blockquote className="font-voyage text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">{featured.text}</blockquote>
            <figcaption>
              <Stars rating={featured.rating} light />
              <p className="mt-3 font-bold">{featured.nick}</p>
              <p className="text-sm text-white/70">{featured.trip}</p>
              <p className="mt-4 text-[11px] font-semibold text-white/80">Review mẫu cho bản demo</p>
            </figcaption>
          </figure>
        )}
        <ul className="grid gap-4 sm:grid-cols-2">
          {rest.map((review) => (
            <li key={review.nick} className="flex flex-col glass-card p-6">
              <Stars rating={review.rating} />
              <p className="mt-3 text-sm text-body">{review.text}</p>
              <div className="mt-auto pt-5">
                <p className="font-bold">{review.nick}</p>
                <p className="text-xs text-muted-foreground">{review.trip}</p>
                <p className="mt-2 text-[11px] font-semibold text-gold">Review mẫu cho bản demo</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
