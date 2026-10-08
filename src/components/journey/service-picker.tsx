"use client"

import { Tabs } from "radix-ui"

import { Modal } from "@/components/journey/modal"
import { priceLabel } from "@/lib/journey/labels"
import { isServiceKind, SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

interface ServicePickerProps {
  services: ServiceItem[]
  kind: ServiceKind | null
  onKindChange: (kind: ServiceKind | null) => void
  onAdd: (service: ServiceItem) => void
  /** serviceId đã có trong kế hoạch, để đổi nhãn nút. */
  addedIds: Set<string>
}

export function ServicePicker({ services, kind, onKindChange, onAdd, addedIds }: ServicePickerProps): React.JSX.Element {
  return (
    <Modal
      open={kind !== null}
      onOpenChange={(open) => !open && onKindChange(null)}
      title="Thêm dịch vụ"
      description="Mục mới vào nhóm Đang cân nhắc để cả nhóm bình chọn."
      wide
    >
      <Tabs.Root value={kind ?? "hotel"} onValueChange={(value) => isServiceKind(value) && onKindChange(value)}>
        <Tabs.List aria-label="Loại dịch vụ" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {SERVICE_KINDS.map((option) => (
            <Tabs.Trigger
              key={option}
              value={option}
              className="h-10 shrink-0 rounded-full bg-tint/5 px-4 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-champagne data-[state=active]:text-void"
            >
              {SERVICE_KIND_LABEL[option]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {SERVICE_KINDS.map((option) => {
          const items = services.filter((service) => service.kind === option)
          return (
            <Tabs.Content key={option} value={option} className="mt-4 outline-none">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hiện chưa có dịch vụ loại này.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {items.map((service) => (
                    <li key={service.id} className="glass-card flex flex-col gap-1.5 p-4">
                      <p className="text-xs font-semibold text-gold">{service.tag}</p>
                      <h3 className="font-semibold text-title">{service.name}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{service.blurb}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <p className="text-sm font-semibold text-champagne">{priceLabel(service)}</p>
                        <button type="button" onClick={() => onAdd(service)} className="btn-primary h-9 shrink-0 rounded-full px-4 text-sm font-semibold">
                          {addedIds.has(service.id) ? "Thêm lần nữa" : "Thêm"}
                        </button>
                      </div>
                      {service.mock && <p className="text-[11px] text-muted-foreground">Giá tham khảo (demo)</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          )
        })}
      </Tabs.Root>
    </Modal>
  )
}
