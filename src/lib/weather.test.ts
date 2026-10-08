import assert from "node:assert/strict"
import { describeWeather, parseWeather } from "./weather"

// Mẫu thật từ api.open-meteo.com (rút gọn).
const sample = {
  current: { time: "2026-10-08T15:00", temperature_2m: 26.8, weather_code: 95, relative_humidity_2m: 92 },
  daily: {
    time: ["2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"],
    weather_code: [95, 80, 80, 95],
    temperature_2m_max: [29.2, 29.9, 30.1, 29.4],
    temperature_2m_min: [24.5, 25.1, 25.1, 24.0],
    precipitation_probability_max: [97, 100, 89, 92],
  },
}

const parsed = parseWeather(sample)
assert.ok(parsed)
assert.equal(parsed.tempC, 26.8)
assert.equal(parsed.humidity, 92)
assert.equal(parsed.code, 95)
assert.equal(parsed.forecast.length, 4)
assert.deepEqual(parsed.forecast[1], { date: "2026-10-09", code: 80, maxC: 29.9, minC: 25.1, rainPct: 100 })

// Dữ liệu hỏng thì trả null, không ném lỗi.
assert.equal(parseWeather(null), null)
assert.equal(parseWeather("lỗi"), null)
assert.equal(parseWeather({}), null)
assert.equal(parseWeather({ current: sample.current }), null)
assert.equal(parseWeather({ ...sample, current: { ...sample.current, temperature_2m: "26.8" } }), null)
assert.equal(parseWeather({ ...sample, daily: { ...sample.daily, time: "2026-10-08" } }), null)
assert.equal(parseWeather({ ...sample, daily: { ...sample.daily, time: [] } }), null)

// Một ngày dự báo thiếu số liệu thì bỏ ngày đó, giữ các ngày còn lại.
const partial = parseWeather({ ...sample, daily: { ...sample.daily, temperature_2m_max: [29.2, null, 30.1, 29.4] } })
assert.equal(partial?.forecast.length, 3)

assert.equal(describeWeather(0).kind, "clear")
assert.equal(describeWeather(3).kind, "cloudy")
assert.equal(describeWeather(61).kind, "rain")
assert.equal(describeWeather(80).kind, "rain")
assert.equal(describeWeather(95).kind, "storm")

console.log("weather.test OK")
