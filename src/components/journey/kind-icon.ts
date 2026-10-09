import { BedDoubleIcon, CarIcon, MapIcon, PlaneIcon, ShoppingBagIcon, TicketIcon, UtensilsIcon, type LucideIcon } from "lucide-react"

import type { ServiceKind } from "@/types/journey"

/** Icon theo loại dịch vụ, dùng khi mục chưa có ảnh. */
export const KIND_ICON: Record<ServiceKind, LucideIcon> = {
  hotel: BedDoubleIcon,
  flight: PlaneIcon,
  vehicle: CarIcon,
  activity: TicketIcon,
  dining: UtensilsIcon,
  souvenir: ShoppingBagIcon,
  tour: MapIcon,
}
