import { CheckIcon } from "lucide-react"

import { CARD_CLASS, Section } from "@/components/explorer/section"
import { formatVnd } from "@/lib/format"
import type { DestinationGuide } from "@/types/destination"

interface CostChecklistProps {
  guide: DestinationGuide
  /** Giá tour thấp nhất đang mở bán; null nếu không có tour. */
  minTourPriceVnd: number | null
}

export function CostChecklist({ guide, minTourPriceVnd }: CostChecklistProps): React.JSX.Element {
  return (
    <Section id="chi-phi" eyebrow="Chi phí và chuẩn bị" title="Ngân sách và đồ cần mang" intro="Số liệu mang tính ước tính tham khảo cho một chuyến 3 ngày 2 đêm, không phải giá thời gian thực.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={CARD_CLASS}>
          <h3 className="font-extrabold">Chi phí ước tính</h3>
          <dl className="mt-4 divide-y divide-ocean/10">
            {guide.costs.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-semibold">{row.range}</dd>
              </div>
            ))}
          </dl>
          {minTourPriceVnd !== null && (
            <p className="mt-4 rounded-2xl bg-cloud/50 p-4 text-sm">
              <span className="font-bold text-ocean">Đi tour trọn gói từ {formatVnd(minTourPriceVnd)}/khách</span>
              <span className="text-ink/80">, theo chương trình, đã gồm các hạng mục ghi trong từng tour (vé bay, lưu trú, tham quan).</span>
            </p>
          )}
        </div>
        <div className={CARD_CLASS}>
          <h3 className="font-extrabold">Checklist mang theo</h3>
          <ul className="mt-4 space-y-2.5">
            {guide.packing.map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <CheckIcon aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-sunset" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
