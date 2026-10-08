export interface DayForecast {
  date: string
  code: number
  maxC: number
  minC: number
  rainPct: number
}

export interface WeatherSnapshot {
  tempC: number
  humidity: number
  code: number
  forecast: DayForecast[]
}

export type WeatherKind = "clear" | "cloudy" | "rain" | "storm"

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

/** Đọc JSON Open-Meteo; dữ liệu hỏng hoặc thiếu thì trả null để UI dùng bảng khí hậu tĩnh. */
export function parseWeather(json: unknown): WeatherSnapshot | null {
  if (typeof json !== "object" || json === null) return null
  const { current, daily } = json as { current?: Record<string, unknown>; daily?: Record<string, unknown> }
  if (!current || !daily) return null

  const { temperature_2m: tempC, relative_humidity_2m: humidity, weather_code: code } = current
  if (!isNumber(tempC) || !isNumber(humidity) || !isNumber(code)) return null

  const { time, weather_code: codes, temperature_2m_max: maxes, temperature_2m_min: mins, precipitation_probability_max: rains } = daily
  if (![time, codes, maxes, mins, rains].every(Array.isArray)) return null

  const forecast: DayForecast[] = []
  for (const [index, date] of (time as unknown[]).entries()) {
    const dayCode = (codes as unknown[])[index]
    const maxC = (maxes as unknown[])[index]
    const minC = (mins as unknown[])[index]
    const rainPct = (rains as unknown[])[index]
    if (typeof date === "string" && isNumber(dayCode) && isNumber(maxC) && isNumber(minC) && isNumber(rainPct)) {
      forecast.push({ date, code: dayCode, maxC, minC, rainPct })
    }
  }
  return forecast.length > 0 ? { tempC, humidity, code, forecast } : null
}

/** Mã thời tiết WMO của Open-Meteo → nhóm và nhãn tiếng Việt. */
export function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code >= 95) return { kind: "storm", label: "Dông" }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { kind: "rain", label: code >= 80 ? "Mưa rào" : "Mưa" }
  }
  if (code <= 1) return { kind: "clear", label: "Nắng đẹp" }
  return { kind: "cloudy", label: "Có mây" }
}

/** Gọi Open-Meteo (không cần API key). Cache 30 phút, timeout 4 giây; mọi lỗi trả null. */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=Asia%2FBangkok&forecast_days=4"
  try {
    const response = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) })
    return response.ok ? parseWeather(await response.json()) : null
  } catch {
    return null
  }
}
