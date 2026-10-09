"use client"

import { useState } from "react"
import Image from "next/image"

import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { KIND_ICON } from "@/components/journey/kind-icon"
import { ServiceSearch } from "@/components/journey/service-catalog-panel"
import { priceLabel } from "@/lib/journey/labels"
import { chipsOf, filterAndSort, isPartnerService, type ListingSort } from "@/lib/service-listing"
import type { ServiceItem } from "@/types/journey"

interface ServiceListingProps {
  services: ServiceItem[]
  destinationSlug: string
  destinationName: string
}

const CHIP_CLASS =
  "h-9 rounded-full px-3.5 text-sm font-semibold ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-champagne aria-pressed:text-void"

export function ServiceListing({ services, destinationSlug, destinationName }: ServiceListingProps): React.JSX.Element {
  const [query, setQuery] = useState("")
  const [chip, setChip] = useState<string | null>(null)
  const [partnerOnly, setPartnerOnly] = useState(false)
  const [sort, setSort] = useState<ListingSort>("default")

  const chips = chipsOf(services)
  const hasPartners = services.some(isPartnerService)
  const visible = filterAndSort(services, { query, chip, partnerOnly, sort })

  function reset(): void {
    setQuery("")
    setChip(null)
    setPartnerOnly(false)
  }

  if (services.length === 0) return <p className="text-muted-foreground">Hiện chưa có dịch vụ loại này.</p>

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <ServiceSearch value={query} onChange={setQuery} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sắp xếp
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as ListingSort)}
            className="h-10 rounded-lg bg-tint/5 px-3 text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="default">Đề xuất</option>
            <option value="price-asc">Giá thấp → cao</option>
            <option value="price-desc">Giá cao → thấp</option>
          </select>
        </label>
      </div>

      {(chips.length > 0 || hasPartners) && (
        <div role="group" aria-label="Lọc dịch vụ" className="mt-3 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!chip && !partnerOnly} onClick={() => { setChip(null); setPartnerOnly(false) }} className={CHIP_CLASS}>
            Tất cả
          </button>
          {chips.map((option) => (
            <button key={option} type="button" aria-pressed={chip === option} onClick={() => setChip(chip === option ? null : option)} className={CHIP_CLASS}>
              {option}
            </button>
          ))}
          {hasPartners && (
            <button type="button" aria-pressed={partnerOnly} onClick={() => setPartnerOnly(!partnerOnly)} className={CHIP_CLASS}>
              Đối tác
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {visible.length} lựa chọn
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-muted-foreground">Không tìm thấy dịch vụ phù hợp.</p>
          <button type="button" onClick={reset} className="text-sm font-semibold text-primary-ink underline-offset-4 hover:underline">
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service) => (
            <ListingCard key={service.id} service={service} destinationSlug={destinationSlug} destinationName={destinationName} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ListingCard({ service, destinationSlug, destinationName }: { service: ServiceItem; destinationSlug: string; destinationName: string }): React.JSX.Element {
  const Icon = KIND_ICON[service.kind]
  const partner = isPartnerService(service)

  return (
    <li className="glass-card flex flex-col overflow-hidden p-0">
      <div className="relative aspect-video">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt="" fill sizes="(min-width:1024px) 360px, (min-width:640px) 45vw, 90vw" className="object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary-ink/25 via-tint/[0.06] to-gold/25 text-gold">
            <Icon strokeWidth={1.25} className="size-10" />
          </span>
        )}
        {partner && <span className="absolute top-3 left-3 rounded-full bg-champagne px-2.5 py-1 text-[11px] font-bold text-void">Đối tác</span>}
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
        <p className="text-sm text-muted-foreground">{service.blurb}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="text-sm font-semibold text-champagne">
            {priceLabel(service)}
            {service.mock && <span className="block text-[11px] font-normal text-muted-foreground">Giá tham khảo (demo)</span>}
          </p>
          <AddToPlanButton destinationSlug={destinationSlug} destinationName={destinationName} serviceId={service.id} label="Thêm" />
        </div>
      </div>
    </li>
  )
}
