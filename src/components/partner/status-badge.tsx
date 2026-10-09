import { cn } from "@/lib/utils"
import type { PartnerStatus } from "@/types/partner"

export const STATUS_LABEL: Record<PartnerStatus, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }

/** Lời nhắn cho đối tác theo trạng thái. */
export const STATUS_NOTE: Record<PartnerStatus, string> = {
  pending: "Vietravel sẽ liên hệ xác minh trong 1–2 ngày làm việc.",
  approved: "Sản phẩm đang hiện trong phần lên kế hoạch của du khách Vietravel.",
  rejected: "Chưa đạt yêu cầu. Vui lòng liên hệ hotline để được hỗ trợ.",
}

const STATUS_CLASS: Record<PartnerStatus, string> = {
  pending: "bg-amber-400/15 text-amber-600 ring-amber-400/30 dark:text-amber-300",
  approved: "bg-emerald-400/15 text-emerald-600 ring-emerald-400/30 dark:text-emerald-300",
  rejected: "bg-rose-400/15 text-rose-600 ring-rose-400/30 dark:text-rose-300",
}

export function PartnerStatusBadge({ status }: { status: PartnerStatus }): React.JSX.Element {
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1", STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>
}
