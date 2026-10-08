import Image from "next/image"
import { BanknoteIcon, CheckIcon, ClockIcon, MapPinIcon, SoupIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide, Dish } from "@/types/destination"

function DishCard({ dish }: { dish: Dish }): React.JSX.Element {
  return (
    <li className="group flex flex-col overflow-hidden glass-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 90vw"
            className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105"
          />
        ) : (
          // Chưa có ảnh được cấp phép: ô màu + biểu tượng để thẻ vẫn đều chiều cao.
          <div className="grid size-full place-items-center bg-gold/10 text-gold">
            <SoupIcon aria-hidden strokeWidth={1.25} className="size-14" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-voyage text-2xl leading-tight font-semibold tracking-tight text-title transition-colors duration-500 ease-soft group-hover:text-champagne">{dish.name}</h3>
        <p className="mt-2 text-muted-foreground">{dish.blurb}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gold">
          <MapPinIcon aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
          {dish.where}
        </p>
        <div className="mt-4 space-y-2 border-t border-dashed border-tint/10 pt-4 text-sm text-body">
          <p className="flex items-start gap-2">
            <BanknoteIcon aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-gold" />
            {dish.price}
          </p>
          <p className="flex items-start gap-2">
            <ClockIcon aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-gold" />
            {dish.bestTime}
          </p>
        </div>
        {dish.credit && (
          <a href={dish.credit.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 text-[11px] text-muted-foreground underline-offset-2 hover:underline">
            Ảnh minh họa: {dish.credit.author}, {dish.credit.license}
          </a>
        )}
      </div>
    </li>
  )
}

export function EatBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const { foodPhoto } = guide
  return (
    <Section id="an-uong" title="Những món phải thử" intro="Hải sản tươi và đặc sản địa phương. Giá dưới đây chỉ để tham khảo, thay đổi theo quán và mùa.">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <figure className="group relative min-h-64 overflow-hidden rounded-[1.75rem] sm:min-h-80">
          <Image src={foodPhoto.src} alt={foodPhoto.alt} fill sizes="(min-width:1024px) 660px, 100vw" className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105" />
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/75 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-5 bottom-4 text-white">
            <p className="text-sm font-semibold">{foodPhoto.caption}</p>
            <a href={foodPhoto.credit.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/75 underline-offset-2 hover:underline">
              Ảnh: {foodPhoto.credit.author}, {foodPhoto.credit.license}
            </a>
          </figcaption>
        </figure>
        <div className="glass-card p-6">
          <h3 className="font-voyage text-2xl font-semibold tracking-tight text-title">Mẹo gọi món</h3>
          <ul className="mt-5 space-y-4">
            {guide.eatTips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-sm text-body">
                <CheckIcon aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-gold" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guide.dishes.map((dish) => (
          <DishCard key={dish.name} dish={dish} />
        ))}
      </ul>
    </Section>
  )
}
