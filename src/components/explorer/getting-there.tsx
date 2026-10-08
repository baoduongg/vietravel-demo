import { PlaneIcon, ShipIcon } from "lucide-react"

import { CtaLink } from "@/components/explorer/cta-link"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function GettingThere({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="di-chuyen" eyebrow="Di chuyển" title={`Đến ${guide.name} bằng cách nào?`} intro="Thời lượng là ước tính tham khảo. Lịch bay và giá vé thay đổi theo ngày, Quý khách kiểm tra khi đặt.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guide.routes.map((route) => {
          const Icon = route.mode === "Tàu cao tốc" ? ShipIcon : PlaneIcon
          return (
            <li key={route.from} className={CARD_CLASS}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-cloud/60 text-ocean">
                  <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                </span>
                <div>
                  <p className="font-extrabold">{route.from}</p>
                  <p className="text-sm text-muted-foreground">
                    {route.mode} · {route.duration}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink/80">{route.note}</p>
            </li>
          )
        })}
      </ul>
      <h3 className="mt-8 text-lg font-extrabold">Di chuyển trên đảo</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {guide.onIsland.map((item) => (
          <li key={item.name} className="rounded-2xl bg-white/70 p-4 ring-1 ring-ocean/10">
            <p className="font-bold">{item.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <CtaLink href={guide.links.flights}>Xem vé máy bay tại Vietravel</CtaLink>
      </div>
    </Section>
  )
}
