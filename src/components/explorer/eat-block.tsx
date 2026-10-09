import Image from "next/image"
import { BanknoteIcon, CheckIcon, ClockIcon, MapPinIcon, SoupIcon, SparklesIcon, UtensilsIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide, Dish } from "@/types/destination"

function DishCard({ dish }: { dish: Dish }): React.JSX.Element {
  return (
    <li className="group flex flex-col overflow-hidden glass-card lift transition-all duration-500 hover:border-primary-ink/40">
      <div className="relative aspect-[4/3] overflow-hidden">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-[0.92] contrast-[1.05]"
          />
        ) : (
          <div className="grid size-full place-items-center bg-primary-ink/10 text-primary-ink">
            <SoupIcon aria-hidden strokeWidth={1.5} className="size-14" />
          </div>
        )}
        <span className="on-dark absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-extrabold text-primary-ink backdrop-blur-md ring-1 ring-white/15">
          ⭐ Must-Try
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-heading text-xl leading-tight font-extrabold tracking-tight text-title transition-colors duration-300 group-hover:text-primary-ink">
          {dish.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{dish.blurb}</p>
        
        <p className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-primary-ink">
          <MapPinIcon aria-hidden strokeWidth={2} className="size-3.5 shrink-0" />
          {dish.where}
        </p>

        <div className="mt-4 space-y-2 border-t border-dashed border-tint/10 pt-4 text-xs text-body font-medium">
          <p className="flex items-start gap-2">
            <BanknoteIcon aria-hidden strokeWidth={2} className="mt-0.5 size-3.5 shrink-0 text-primary-ink" />
            <span>{dish.price}</span>
          </p>
          <p className="flex items-start gap-2">
            <ClockIcon aria-hidden strokeWidth={2} className="mt-0.5 size-3.5 shrink-0 text-primary-ink" />
            <span>{dish.bestTime}</span>
          </p>
        </div>

        {dish.credit && (
          <a href={dish.credit.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 text-[10px] text-muted-foreground underline-offset-2 hover:underline">
            Ảnh: {dish.credit.author}
          </a>
        )}
      </div>
    </li>
  )
}

export function EatBlock({ guide, moreHref }: { guide: DestinationGuide; moreHref?: string }): React.JSX.Element {
  const { foodPhoto } = guide
  return (
    <Section moreHref={moreHref}
      id="an-uong"
      title="Food Tour Hải Sản & Đặc Sản Bản Địa"
      intro="Từ gỏi cá trích tươi rói, ghẹ Hàm Ninh chắc ngọt đến bún quậy trứ danh bạn nhất định phải thử."
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <figure className="group relative min-h-64 overflow-hidden rounded-[2rem] border border-white/10 sm:min-h-80 shadow-xl">
          <Image
            src={foodPhoto.src}
            alt={foodPhoto.alt}
            fill
            sizes="(min-width:1024px) 660px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.9] contrast-[1.05]"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-shade/90 via-shade/20 to-transparent" />
          <figcaption className="absolute inset-x-5 bottom-4 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-ink/20 px-2.5 py-0.5 text-[10px] font-bold text-primary-ink ring-1 ring-primary-ink/30 backdrop-blur-sm mb-1.5">
              <SparklesIcon className="size-3" />
              Chợ Đêm Sôi Động
            </span>
            <p className="text-sm font-bold text-white">{foodPhoto.caption}</p>
          </figcaption>
        </figure>

        <div className="glass-card p-6 sm:p-7 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsIcon className="size-5 text-primary-ink" />
            <h3 className="font-heading text-xl font-bold tracking-tight text-title">Bí Kíp Ăn Ngon Đúng Điệu</h3>
          </div>
          <ul className="mt-4 space-y-3.5">
            {guide.eatTips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-xs sm:text-sm text-body leading-relaxed">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-ink/15 text-primary-ink mt-0.5">
                  <CheckIcon aria-hidden strokeWidth={2.5} className="size-3" />
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guide.dishes.map((dish) => (
          <DishCard key={dish.name} dish={dish} />
        ))}
      </ul>
    </Section>
  )
}

