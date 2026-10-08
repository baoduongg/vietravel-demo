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
                month.score >= 4 ? "bg-sunset" : month.score === 3 ? "bg-sunset/50" : "bg-ocean/20",
                index === currentIndex && "ring-2 ring-ocean ring-offset-2",
              )}
            />
            <span className={cn("text-[11px] font-semibold", index === currentIndex ? "text-ocean" : "text-muted-foreground")}>{month.label}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sunset" />Đẹp nhất</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sunset/50" />Khá thuận lợi</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ocean/20" />Mùa mưa, giá thấp</li>
      </ul>
    </div>
  )
}
