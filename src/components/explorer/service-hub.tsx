import Link from "next/link"

import { KIND_ICON } from "@/components/journey/kind-icon"
import { formatVnd } from "@/lib/format"
import { KIND_SLUG, priceStats } from "@/lib/service-listing"
import { cn } from "@/lib/utils"
import type { DestinationGuide } from "@/types/destination"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

interface ServiceHubProps {
  guide: DestinationGuide
  services: ServiceItem[]
  /** Loại đang xem: luôn hiện và được tô sáng, kể cả khi chưa có dịch vụ. */
  current?: ServiceKind
}

/** Ô link sang trang từng loại dịch vụ. Ẩn loại chưa có dịch vụ. */
export function ServiceHub({ guide, services, current }: ServiceHubProps): React.JSX.Element {
  const tiles = SERVICE_KINDS.map((kind) => ({ kind, ...priceStats(services.filter((service) => service.kind === kind)) })).filter(
    (tile) => tile.count > 0 || tile.kind === current,
  )

  return (
    <nav aria-label={`Dịch vụ tại ${guide.name}`}>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap">
        {tiles.map(({ kind, count, min }) => {
          const Icon = KIND_ICON[kind]
          return (
            <li key={kind} className="shrink-0">
              <Link
                href={`/diem-den/${guide.slug}/${KIND_SLUG[kind]}`}
                aria-current={kind === current ? "page" : undefined}
                className={cn(
                  "glass-card flex items-center gap-3 !rounded-2xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  kind === current && "bg-champagne text-void",
                )}
              >
                <Icon aria-hidden strokeWidth={1.5} className="size-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{SERVICE_KIND_LABEL[kind]}</span>
                  <span className="block text-xs opacity-75">
                    {count} lựa chọn{min && ` · từ ${formatVnd(min.priceVnd)}`}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
