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
    <Section id="thoi-tiet" title={`Khi nào đi ${guide.name} là đẹp nhất?`} intro="Xem thời tiết hiện tại và mùa đẹp trong năm để chọn đúng thời điểm.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="bg-weather rounded-[20px] p-6 text-title">
          {weather && now ? (
            <>
              <p className="text-sm font-semibold text-body">Hiện tại ở {guide.name}</p>
              <div className="mt-3 flex items-center gap-4">
                <NowIcon aria-hidden strokeWidth={1.5} className="size-14 text-gold" />
                <div>
                  <p className="font-voyage text-6xl leading-none font-semibold tracking-tighter">{Math.round(weather.tempC)}°C</p>
                  <p className="font-semibold">{now.label}</p>
                </div>
                <p className="ml-auto flex items-center gap-1 text-sm text-body">
                  <DropletsIcon aria-hidden strokeWidth={1.5} className="size-4" />
                  Độ ẩm {weather.humidity}%
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-4 gap-2">
                {weather.forecast.map((day) => {
                  const Icon = ICON[describeWeather(day.code).kind]
                  return (
                    <li key={day.date} className="rounded-2xl bg-tint/10 p-2.5 text-center ring-1 ring-tint/10">
                      <p className="text-xs font-bold">{weekday(day.date)}</p>
                      <p className="text-[11px] text-body">{formatShortDate(day.date)}</p>
                      <Icon aria-hidden strokeWidth={1.5} className="mx-auto my-1.5 size-6 text-gold" />
                      <p className="text-sm font-bold">{Math.round(day.maxC)}°</p>
                      <p className="text-xs text-body">{Math.round(day.minC)}°</p>
                      <p className="mt-1 text-[11px] font-semibold text-title">{day.rainPct}% mưa</p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-[11px] text-body">Nguồn: Open-Meteo, cập nhật mỗi 30 phút.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-body">Khí hậu {month.label} ở {guide.name}</p>
              <p className="mt-3 font-voyage text-5xl font-semibold tracking-tighter">{month.tempC}</p>
              <p className="mt-1 font-semibold">{month.rain}</p>
              <p className="mt-3 text-sm text-body">Chưa lấy được thời tiết trực tiếp, đây là số liệu khí hậu trung bình của tháng.</p>
            </>
          )}
        </div>
        <div className={CARD_CLASS}>
          <p className="font-voyage text-xl font-semibold tracking-tight text-title">Mùa đẹp trong năm</p>
          <div className="mt-4">
            <SeasonChart months={guide.months} currentIndex={monthIndex} />
          </div>
          <div className="mt-5 rounded-2xl bg-tint/[0.06] p-4">
            <p className="text-sm font-bold">Tháng này ({month.label}) đi có hợp không?</p>
            <p className="mt-1 text-sm text-body">{month.advice}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
