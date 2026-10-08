import Image from "next/image"
import { CheckIcon, PlaneIcon, ShipIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function GettingThere({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const { airport, onIslandPhoto } = guide
  return (
    <Section id="di-chuyen" title={`Đến ${guide.name} bằng cách nào?`} intro="Thời lượng là ước tính tham khảo. Lịch bay và giá vé thay đổi theo ngày, Quý khách kiểm tra khi đặt.">
      <figure className="group relative mb-10 min-h-60 overflow-hidden rounded-[1.75rem] sm:min-h-72">
        <Image src={airport.photo.src} alt={airport.photo.alt} fill sizes="(min-width:1024px) 1100px, 100vw" className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105" />
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/85 via-shade/20 to-transparent" />
        <figcaption className="absolute inset-x-5 bottom-4 text-white sm:inset-x-8 sm:bottom-6">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {airport.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[11px] font-semibold tracking-wider text-white/70 uppercase">{fact.label}</dt>
                <dd className="font-voyage text-lg leading-snug font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <a href={airport.photo.credit.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[11px] text-white/75 underline-offset-2 hover:underline">
            Ảnh: {airport.photo.credit.author}, {airport.photo.credit.license}
          </a>
        </figcaption>
      </figure>
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <ul className="grid gap-3 sm:grid-cols-2">
          {guide.routes.map((route) => {
            const Icon = route.mode === "Tàu cao tốc" ? ShipIcon : PlaneIcon
            return (
              <li key={route.from} className="flex flex-col glass-card">
                <div className="flex items-center gap-4 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                    <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                  </span>
                  <div>
                    <p className="font-voyage text-lg font-semibold tracking-tight text-title">{route.from}</p>
                    <p className="text-sm text-muted-foreground">
                      {route.mode} · {route.duration}
                    </p>
                  </div>
                </div>
                {/* Đường đứt nét như cuống vé, ghi chú nằm phần dưới. */}
                <div className="mx-5 border-t border-dashed border-tint/10" />
                <p className="p-5 text-sm text-body">{route.note}</p>
              </li>
            )
          })}
        </ul>
        <div>
          <figure className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[1.5rem]">
            <Image src={onIslandPhoto.src} alt={onIslandPhoto.alt} fill sizes="(min-width:1024px) 440px, 100vw" className="object-cover" />
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/70 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-4 bottom-3 text-white">
              <p className="text-xs font-semibold">{onIslandPhoto.caption}</p>
              <a href={onIslandPhoto.credit.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/75 underline-offset-2 hover:underline">
                Ảnh: {onIslandPhoto.credit.author}, {onIslandPhoto.credit.license}
              </a>
            </figcaption>
          </figure>
          <h3 className="font-voyage text-2xl font-semibold tracking-tight text-title">Di chuyển trên đảo</h3>
          <ul className="mt-5 space-y-5">
            {guide.onIsland.map((item) => (
              <li key={item.name}>
                <p className="font-bold text-title">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <CtaLink href={guide.links.flights}>Xem vé máy bay tại Vietravel</CtaLink>
          </div>
        </div>
      </div>
      <div className="mt-10 glass-card p-6">
        <h3 className="font-voyage text-xl font-semibold tracking-tight text-title">Lưu ý trước khi đi</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {guide.travelTips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-body">
              <CheckIcon aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-gold" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
