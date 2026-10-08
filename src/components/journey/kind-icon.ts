import { BedDoubleIcon, CarIcon, MapIcon, PlaneIcon, TicketIcon, type LucideIcon } from "lucide-react"

import type { ServiceKind } from "@/types/journey"

/** Icon theo loại dịch vụ, dùng khi mục chưa có ảnh. */
export const KIND_ICON: Record<ServiceKind, LucideIcon> = {
  hotel: BedDoubleIcon,
  flight: PlaneIcon,
  vehicle: CarIcon,
  activity: TicketIcon,
  tour: MapIcon,
}
