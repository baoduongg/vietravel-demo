import { CheckIcon } from "lucide-react"

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
    <Section id="chi-phi" title="Ngân sách và đồ cần mang" intro="Số liệu mang tính ước tính tham khảo cho một chuyến 3 ngày 2 đêm, không phải giá thời gian thực.">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="glass-card p-7">
          <h3 className="font-voyage text-2xl font-semibold tracking-tight text-title">Chi phí ước tính</h3>
          <dl className="mt-5">
            {guide.costs.map((row, index) => (
              <div key={row.label} className={index === 0 ? "flex justify-between gap-4 py-3 text-sm" : "flex justify-between gap-4 border-t border-dashed border-tint/10 py-3 text-sm"}>
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-semibold text-title">{row.range}</dd>
              </div>
            ))}
          </dl>
          {minTourPriceVnd !== null && (
            <p className="mt-5 rounded-2xl bg-primary/10 p-4 text-sm">
              <span className="font-bold text-champagne">Đi tour trọn gói từ {formatVnd(minTourPriceVnd)}/khách</span>
              <span className="text-body">, theo chương trình, đã gồm các hạng mục ghi trong từng tour (vé bay, lưu trú, tham quan).</span>
            </p>
          )}
        </div>
        <div>
          <h3 className="font-voyage text-2xl font-semibold tracking-tight text-title">Checklist mang theo</h3>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {guide.packing.map((item) => (
              <li key={item} className="inline-flex items-center gap-2 rounded-full bg-tint/5 py-2 pr-4 pl-3 text-sm ring-1 ring-tint/10">
                <CheckIcon aria-hidden strokeWidth={2} className="size-4 shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
