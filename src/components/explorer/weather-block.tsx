import { CloudIcon, CloudLightningIcon, CloudRainIcon, DropletsIcon, SparklesIcon, SunIcon } from "lucide-react"

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
    <Section
      id="thoi-tiet"
      title={`Khi nào đi ${guide.name} là đẹp nhất?`}
      intro="Cập nhật thời tiết trực tiếp và biểu đồ mùa du lịch lý tưởng trong năm."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr]">
        <div className="bg-weather rounded-[1.75rem] p-6 sm:p-7 text-title border border-tint/10 shadow-xl">
          {weather && now ? (
            <>
              <div className="flex items-center justify-between border-b border-tint/10 pb-3">
                <p className="text-xs font-bold tracking-wider text-primary-ink uppercase flex items-center gap-1.5">
                  <SunIcon className="size-3.5 text-amber-400" />
                  Thời tiết trực tiếp tại {guide.name}
                </p>
                <span className="rounded-full bg-tint/10 px-2 py-0.5 text-[10px] font-bold text-title/90">
                  Live Update
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <NowIcon aria-hidden strokeWidth={1.75} className="size-16 text-amber-400 animate-pulse" />
                <div>
                  <p className="font-heading text-5xl sm:text-6xl leading-none font-extrabold tracking-tight text-title">
                    {Math.round(weather.tempC)}°C
                  </p>
                  <p className="font-bold text-base text-primary-ink mt-1">{now.label}</p>
                </div>
                <p className="ml-auto flex items-center gap-1.5 rounded-full bg-tint/10 px-3 py-1.5 text-xs font-semibold text-body ring-1 ring-tint/15">
                  <DropletsIcon aria-hidden strokeWidth={2} className="size-3.5 text-cyan-400" />
                  Độ ẩm {weather.humidity}%
                </p>
              </div>

              <ul className="mt-6 grid grid-cols-4 gap-2">
                {weather.forecast.map((day) => {
                  const Icon = ICON[describeWeather(day.code).kind]
                  return (
                    <li key={day.date} className="rounded-2xl bg-tint/[0.08] p-3 text-center ring-1 ring-tint/12 transition-transform duration-300 hover:scale-105">
                      <p className="text-xs font-extrabold text-primary-ink">{weekday(day.date)}</p>
                      <p className="text-[10px] text-body">{formatShortDate(day.date)}</p>
                      <Icon aria-hidden strokeWidth={1.75} className="mx-auto my-2 size-6 text-amber-400" />
                      <p className="text-sm font-extrabold text-title">{Math.round(day.maxC)}°</p>
                      <p className="text-[11px] text-body">{Math.round(day.minC)}°</p>
                      <p className="mt-1 text-[10px] font-bold text-cyan-400">{day.rainPct}% mưa</p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 text-[10px] text-body">Nguồn: Open-Meteo, cập nhật tự động mỗi 30 phút.</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-primary-ink uppercase">Khí hậu {month.label} ở {guide.name}</p>
              <p className="mt-3 font-heading text-5xl font-extrabold tracking-tight text-title">{month.tempC}</p>
              <p className="mt-1 font-bold text-primary-ink">{month.rain}</p>
              <p className="mt-3 text-sm text-body">Số liệu khí hậu trung bình tháng {month.label}.</p>
            </>
          )}
        </div>

        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading text-xl font-bold text-title">Biểu đồ mùa đẹp trong năm</p>
            <span className="rounded-full bg-primary-ink/15 px-2.5 py-0.5 text-xs font-bold text-primary-ink">
              Khuyến nghị
            </span>
          </div>
          <div className="mt-4">
            <SeasonChart months={guide.months} currentIndex={monthIndex} />
          </div>
          <div className="mt-5 rounded-2xl bg-tint/[0.06] p-4 border border-tint/8">
            <p className="text-xs font-extrabold uppercase tracking-wider text-primary-ink flex items-center gap-1.5">
              <SparklesIcon className="size-3.5" />
              Tháng này ({month.label}) đi có hợp không?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-body">{month.advice}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

