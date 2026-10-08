import { CloudIcon, CloudLightningIcon, CloudRainIcon, DropletsIcon, SunIcon } from "lucide-react"

import { SeasonChart } from "@/components/explorer/season-chart"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import { formatShortDate } from "@/lib/format"
import { describeWeather, fetchWeather, type WeatherKind } from "@/lib/weather"
import type { DestinationGuide } from "@/types/destination"

const ICON: Record<WeatherKind, typeof SunIcon> = {
  clear: SunIcon,
  cloudy: CloudIcon,
  rain: CloudRainIcon,
  storm: CloudLightningIcon,
}

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

function weekday(isoDate: string): string {
  return WEEKDAY[new Date(`${isoDate}T00:00:00`).getDay()]
}

export async function WeatherBlock({ guide }: { guide: DestinationGuide }): Promise<React.JSX.Element> {
  const weather = await fetchWeather(guide.coordinates.lat, guide.coordinates.lon)
  const monthIndex = new Date().getMonth()
  const month = guide.months[monthIndex]
  const now = weather ? describeWeather(weather.code) : null
  const NowIcon = now ? ICON[now.kind] : SunIcon

  return (
    <Section id="thoi-tiet" eyebrow="Thời tiết" title={`Khi nào đi ${guide.name} là đẹp nhất?`} intro="Xem thời tiết hiện tại và mùa đẹp trong năm để chọn đúng thời điểm.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className={CARD_CLASS}>
          {weather && now ? (
            <>
              <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Hiện tại ở {guide.name}</p>
              <div className="mt-3 flex items-center gap-4">
                <NowIcon aria-hidden strokeWidth={1.5} className="size-14 text-sunset" />
                <div>
                  <p className="text-5xl font-extrabold">{Math.round(weather.tempC)}°C</p>
                  <p className="font-semibold">{now.label}</p>
                </div>
                <p className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
                  <DropletsIcon aria-hidden strokeWidth={1.5} className="size-4" />
                  Độ ẩm {weather.humidity}%
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-4 gap-2">
                {weather.forecast.map((day) => {
                  const Icon = ICON[describeWeather(day.code).kind]
                  return (
                    <li key={day.date} className="rounded-2xl bg-cloud/40 p-2.5 text-center">
                      <p className="text-xs font-bold">{weekday(day.date)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatShortDate(day.date)}</p>
                      <Icon aria-hidden strokeWidth={1.5} className="mx-auto my-1.5 size-6 text-ocean" />
                      <p className="text-sm font-bold">{Math.round(day.maxC)}°</p>
                      <p className="text-xs text-muted-foreground">{Math.round(day.minC)}°</p>
                      <p className="mt-1 text-[11px] font-semibold text-ocean">{day.rainPct}% mưa</p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">Nguồn: Open-Meteo, cập nhật mỗi 30 phút.</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Khí hậu {month.label} ở {guide.name}</p>
              <p className="mt-3 text-4xl font-extrabold">{month.tempC}</p>
              <p className="mt-1 font-semibold">{month.rain}</p>
              <p className="mt-3 text-sm text-muted-foreground">Chưa lấy được thời tiết trực tiếp, đây là số liệu khí hậu trung bình của tháng.</p>
            </>
          )}
        </div>
        <div className={CARD_CLASS}>
          <p className="text-xs font-semibold tracking-[0.15em] text-ocean uppercase">Mùa đẹp trong năm</p>
          <div className="mt-4">
            <SeasonChart months={guide.months} currentIndex={monthIndex} />
          </div>
          <div className="mt-5 rounded-2xl bg-cloud/50 p-4">
            <p className="text-sm font-bold">Tháng này ({month.label}) đi có hợp không?</p>
            <p className="mt-1 text-sm text-ink/80">{month.advice}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
