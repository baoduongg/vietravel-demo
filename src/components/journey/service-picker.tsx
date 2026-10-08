"use client"

import { Tabs } from "radix-ui"

import { Modal } from "@/components/journey/modal"
import { ServiceCard } from "@/components/journey/service-card"
import { isServiceKind, SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceItem, type ServiceKind } from "@/types/journey"

interface ServicePickerProps {
  services: ServiceItem[]
  kind: ServiceKind | null
  onKindChange: (kind: ServiceKind | null) => void
  onAdd: (service: ServiceItem) => void
  /** Nơi mục sẽ được thêm vào, ví dụ "Ngày 1". */
  targetLabel: string
}

/** Bảng chọn dịch vụ cho điện thoại; trên máy tính dùng cột danh mục bên trái. */
export function ServicePicker({ services, kind, onKindChange, onAdd, targetLabel }: ServicePickerProps): React.JSX.Element {
  return (
    <Modal
      open={kind !== null}
      onOpenChange={(open) => !open && onKindChange(null)}
      title="Thêm dịch vụ"
      description={`Bấm nút để thêm vào ${targetLabel}.`}
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
                    <ServiceCard key={service.id} service={service} targetLabel={targetLabel} onAdd={onAdd} />
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
