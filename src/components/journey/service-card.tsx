import Image from "next/image"
import { PlusIcon } from "lucide-react"

import { KIND_ICON } from "@/components/journey/kind-icon"
import { priceLabel } from "@/lib/journey/labels"
import type { ServiceItem } from "@/types/journey"

interface ServiceCardProps {
  service: ServiceItem
  /** Ví dụ "Ngày 1" hoặc "Cân nhắc": nơi mục sẽ được thêm vào. */
  targetLabel: string
  onAdd: (service: ServiceItem) => void
}

/** Thẻ dịch vụ có ảnh, dùng chung cho cột danh mục và bảng chọn trên điện thoại. */
export function ServiceCard({ service, targetLabel, onAdd }: ServiceCardProps): React.JSX.Element {
  const Icon = KIND_ICON[service.kind]

  return (
    // shrink-0: trong cột danh mục cuộn (flex-col), thẻ không được co lại.
    <li className="glass-card flex shrink-0 flex-col overflow-hidden p-0">
      <div className="relative aspect-video">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} fill sizes="(min-width:1024px) 320px, (min-width:640px) 45vw, 90vw" className="object-cover" />
        ) : (
          // Chưa có ảnh đúng địa điểm: ô minh họa thay vì ảnh nơi khác.
          <span aria-hidden className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary-ink/25 via-tint/[0.06] to-gold/25 text-gold">
            <Icon strokeWidth={1.25} className="size-10" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {service.credit && (
          <p className="text-[11px] text-muted-foreground">
            Ảnh minh họa:{" "}
            <a href={service.credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {service.credit.author}, {service.credit.license}
            </a>
          </p>
        )}
        <p className="text-xs font-semibold text-gold">{service.tag}</p>
        <h3 className="font-semibold leading-snug text-title">{service.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{service.blurb}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-sm font-semibold text-champagne">
            {priceLabel(service)}
            {service.mock && <span className="block text-[11px] font-normal text-muted-foreground">Giá tham khảo (demo)</span>}
          </p>
          <button
            type="button"
            onClick={() => onAdd(service)}
            className="btn-primary inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
            {targetLabel}
          </button>
        </div>
      </div>
    </li>
  )
}
