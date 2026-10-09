import { CheckIcon, SparklesIcon, WalletIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import { formatVnd } from "@/lib/format"
import type { DestinationGuide } from "@/types/destination"

interface CostChecklistProps {
  guide: DestinationGuide
  /** Giá tour thấp nhất đang mở bán; null nếu không có tour. */
  minTourPriceVnd: number | null
}

export function CostChecklist({ guide, minTourPriceVnd }: CostChecklistProps): React.JSX.Element {
  return (
    <Section
      id="chi-phi"
      title="Dự Toán Chi Phí & Checklist Hành Trang"
      intro="Ước tính ngân sách tự túc 3N2Đ và những vật dụng không thể thiếu cho chuyến đi biển hoàn hảo."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="glass-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WalletIcon className="size-5 text-primary-ink" />
              <h3 className="font-heading text-xl font-bold tracking-tight text-title">Chi phí tự túc ước tính</h3>
            </div>
            <dl className="space-y-1">
              {guide.costs.map((row, index) => (
                <div key={row.label} className={index === 0 ? "flex justify-between gap-4 py-2.5 text-xs sm:text-sm" : "flex justify-between gap-4 border-t border-dashed border-tint/10 py-2.5 text-xs sm:text-sm"}>
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right font-bold text-title">{row.range}</dd>
                </div>
              ))}
            </dl>
          </div>

          {minTourPriceVnd !== null && (
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent p-4 border border-orange-500/30">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="size-3.5" />
                Giải pháp tiết kiệm nhất:
              </p>
              <p className="mt-1 text-sm text-title leading-relaxed">
                Tour trọn gói chỉ từ <strong className="text-orange-500 text-base">{formatVnd(minTourPriceVnd)}</strong>/người đã gồm vé máy bay khứ hồi, khách sạn chuẩn và xe đưa đón.
              </p>
            </div>
          )}
        </div>

        <div className="glass-card p-6 sm:p-7">
          <h3 className="font-heading text-xl font-bold tracking-tight text-title mb-2">Checklist cần mang theo</h3>
          <p className="text-xs text-muted-foreground mb-5">Đừng quên chuẩn bị đủ trước ngày lên đường:</p>
          <ul className="flex flex-wrap gap-2.5">
            {guide.packing.map((item) => (
              <li key={item} className="inline-flex items-center gap-2 rounded-full bg-primary-ink/10 py-2 pr-4 pl-3 text-xs sm:text-sm font-semibold text-body ring-1 ring-primary-ink/25 transition-all duration-300 hover:bg-primary-ink/20 hover:scale-105">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-white">
                  <CheckIcon aria-hidden strokeWidth={3} className="size-2.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

