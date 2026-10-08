import { cn } from "@/lib/utils"
import type { MonthInfo } from "@/types/destination"

interface SeasonChartProps {
  months: MonthInfo[]
  currentIndex: number
}

export function SeasonChart({ months, currentIndex }: SeasonChartProps): React.JSX.Element {
  return (
    <div>
      <div role="img" aria-label="Mức độ thuận lợi của thời tiết theo từng tháng" className="flex h-44 items-end gap-1.5">
        {months.map((month, index) => (
          <div key={month.label} title={`${month.label}: ${month.advice}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              style={{ height: `${month.score * 17}%` }}
              className={cn(
                "w-full rounded-t-lg",
                month.score >= 4 ? "bg-primary-ink" : month.score === 3 ? "bg-primary-ink/50" : "bg-tint/15",
                index === currentIndex && "ring-2 ring-champagne ring-offset-2 ring-offset-void",
              )}
            />
            <span className={cn("text-[11px] font-semibold", index === currentIndex ? "text-gold" : "text-muted-foreground")}>{month.label}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary-ink" />Đẹp nhất</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary-ink/50" />Khá thuận lợi</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-tint/15" />Mùa mưa, giá thấp</li>
      </ul>
    </div>
  )
}
