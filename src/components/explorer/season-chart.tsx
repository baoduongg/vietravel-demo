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
        {months.map((month, index) => {
          const isCurrent = index === currentIndex
          return (
            <div key={month.label} title={`${month.label}: ${month.advice}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                style={{ height: `${month.score * 18}%` }}
                className={cn(
                  "w-full rounded-t-lg transition-all duration-300",
                  month.score >= 4
                    ? "bg-gradient-to-t from-orange-500 to-amber-400 shadow-sm"
                    : month.score === 3
                      ? "bg-orange-500/40"
                      : "bg-tint/10",
                  isCurrent && "ring-2 ring-orange-500 ring-offset-2 ring-offset-background scale-105",
                )}
              />
              <span className={cn("text-[11px] font-bold transition-colors", isCurrent ? "text-orange-500" : "text-muted-foreground")}>
                {month.label}
              </span>
            </div>
          )
        })}
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-gradient-to-t from-orange-500 to-amber-400 shadow-xs" />
          <span className="font-medium">Đẹp nhất</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-orange-500/40" />
          <span className="font-medium">Khá thuận lợi</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-tint/10" />
          <span className="font-medium">Mùa mưa, giá thấp</span>
        </li>
      </ul>
    </div>
  )
}

