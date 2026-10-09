"use client"

import { useState } from "react"

import { ServiceCard } from "@/components/journey/service-card"
import { INPUT_CLASS } from "@/components/journey/styles"
import { normalize } from "@/lib/tour-matching"
import { cn } from "@/lib/utils"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

export type CatalogFilter = ServiceKind | "all"

interface ServiceCatalogPanelProps {
  services: ServiceItem[]
  filter: CatalogFilter
  onFilterChange: (filter: CatalogFilter) => void
  targetLabel: string
  onAdd: (service: ServiceItem) => void
  className?: string
}

const FILTERS: { value: CatalogFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  ...SERVICE_KINDS.map((kind) => ({ value: kind, label: SERVICE_KIND_LABEL[kind] })),
]

/** Khớp không dấu theo tên, tag, mô tả: "vinpearl" hay "an sang" đều được. */
export function matchesQuery(service: ServiceItem, query: string): boolean {
  const needle = normalize(query.trim())
  return !needle || normalize(`${service.name} ${service.tag} ${service.blurb}`).includes(needle)
}

export function ServiceSearch({ value, onChange }: { value: string; onChange: (value: string) => void }): React.JSX.Element {
  return (
    <input
      type="search"
      aria-label="Tìm dịch vụ"
      placeholder="Tìm khách sạn, nhà hàng, tour…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={INPUT_CLASS}
    />
  )
}

/** Cột trái trên máy tính: dịch vụ có sẵn, thêm thẳng vào tab đang mở. */
export function ServiceCatalogPanel({ services, filter, onFilterChange, targetLabel, onAdd, className }: ServiceCatalogPanelProps): React.JSX.Element {
  const [query, setQuery] = useState("")
  const visible = services.filter((service) => (filter === "all" || service.kind === filter) && matchesQuery(service, query))

  return (
    <aside aria-label="Dịch vụ có sẵn" className={cn("sticky top-24 flex h-[calc(100dvh-7rem)] flex-col self-start", className)}>
      <h2 className="font-voyage text-xl font-semibold tracking-tight text-title">Dịch vụ có sẵn</h2>
      <ServiceSearch value={query} onChange={setQuery} />
      <div role="group" aria-label="Lọc theo loại dịch vụ" className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => onFilterChange(option.value)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-semibold ring-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === option.value ? "bg-champagne text-void ring-champagne" : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="mt-4 -mr-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2 pb-2 [scrollbar-width:thin]">
        {visible.map((service) => (
          <ServiceCard key={service.id} service={service} targetLabel={targetLabel} onAdd={onAdd} />
        ))}
        {visible.length === 0 && <li className="text-sm text-muted-foreground">Không tìm thấy dịch vụ phù hợp.</li>}
      </ul>
    </aside>
  )
}
