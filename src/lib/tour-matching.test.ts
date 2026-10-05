import assert from "node:assert/strict"
import { selectRelevantTours } from "./tour-matching"
import { buildSystemPrompt, buildTourContext } from "./system-prompt"
import { company, TOUR_TAG } from "@/config/company"
import catalog from "@/data/tours.json"
import type { ChatMessage } from "@/types/chat"
import type { Tour } from "@/types/tour"

const today = "2026-10-05"
const stablePrompt = buildSystemPrompt(today)
assert.equal(stablePrompt.includes((catalog as { tours: Tour[] }).tours[0].code), false)
assert.ok(stablePrompt.includes(company.hotline))
assert.ok(stablePrompt.includes(TOUR_TAG))
assert.ok(stablePrompt.includes("tối đa 3 câu"))
assert.ok(stablePrompt.includes("Tuyệt đối không bịa"))
assert.ok(stablePrompt.includes("hỏi lại đúng 1 câu ngắn"))
const selected = [(catalog as { tours: Tour[] }).tours[0]]
const exactContext = buildTourContext(selected, { criteriaRecognized: true, hasExactMatches: true })
assert.ok(exactContext.includes(selected[0].code))
assert.ok(exactContext.includes(selected[0].name))
assert.ok(!exactContext.includes("imageUrl"))
assert.ok(buildTourContext([], { criteriaRecognized: false, hasExactMatches: false }).includes("hỏi khách đúng một câu ngắn"))
const alternatives = buildTourContext(selected, { criteriaRecognized: true, hasExactMatches: false })
assert.ok(alternatives.includes("PHƯƠNG ÁN GẦN NHẤT"))
assert.ok(alternatives.includes("NÓI RÕ ĐIỂM CHƯA KHỚP"))

function tour(overrides: Partial<Tour> = {}): Tour {
  return {
    code: "JPTYO101",
    name: "Tokyo - Kyoto - Osaka",
    highlight: "Ngắm mùa thu lá đỏ",
    region: "Đông Bắc Á",
    scope: "international",
    departureCity: "TP. Hồ Chí Minh",
    departureDates: ["2026-11-10"],
    days: 6,
    nights: 5,
    priceVnd: 25900000,
    tourLine: "Tour tiêu chuẩn",
    transport: "Máy bay",
    rating: 4.8,
    imageUrl: "",
    url: "",
    ...overrides,
  }
}

function user(content: string): ChatMessage {
  return { role: "user", content }
}

const tours = [
  tour(),
  tour({ code: "JPOSA102", name: "Osaka - Kyoto", departureCity: "Hà Nội", priceVnd: 18900000 }),
  tour({ code: "NDDNG103", name: "Đà Nẵng - Hội An", scope: "domestic", region: "Miền Trung", departureCity: "Đà Nẵng", priceVnd: 4990000 }),
]

assert.deepEqual(selectRelevantTours(tours, [user("Có tour Tokyo khởi hành từ TP Hồ Chí Minh không?" )], today).tours.map(({ code }) => code), ["JPTYO101"])
assert.deepEqual(selectRelevantTours(tours, [user("Tôi muốn đi Osaka khởi hành từ Hà Nội" )], today).tours.map(({ code }) => code), ["JPOSA102"])
assert.deepEqual(selectRelevantTours(tours, [user("Tìm tour Đà Nẵng dưới 5 triệu đồng" )], today).tours.map(({ code }) => code), ["NDDNG103"])
assert.deepEqual(selectRelevantTours(tours, [user("Tôi muốn đi Hoi An" )], today).tours.map(({ code }) => code), ["NDDNG103"])
assert.equal(selectRelevantTours(tours, [user("Tìm tour dưới 3 triệu đồng" )], today).hasExactMatches, false)
assert.deepEqual(selectRelevantTours(tours, [user("Tìm tour dưới 3 triệu đồng" )], today).tours.map(({ code }) => code), ["NDDNG103", "JPOSA102", "JPTYO101"] )
assert.deepEqual(selectRelevantTours(tours, [user("Tôi muốn đi tour khoảng 5 triệu đồng" )], today).tours.map(({ code }) => code), [])
assert.deepEqual(selectRelevantTours([tour({ departureDates: ["2026-10-04", "2026-10-06"] })], [user("Tìm tour Tokyo" )], today).tours[0]?.departureDates, ["2026-10-06"])
assert.equal(selectRelevantTours([tour({ deal: { title: "Ưu đãi giờ chót", originalPriceVnd: 30000000, priceVnd: 20000000, departureDate: "2026-10-04" } })], [user("Tìm tour Tokyo" )], today).tours[0]?.deal, undefined)
assert.equal(selectRelevantTours(tours, [user("Tôi muốn đi Tokyo từ Hồ Chí Minh, dưới 20 triệu" )], today).tours[0]?.code, "JPTYO101")
assert.deepEqual(selectRelevantTours(tours, [user("Xin chào" )], today), { criteriaRecognized: false, hasExactMatches: false, tours: [] })
assert.deepEqual(selectRelevantTours(tours, [user("Tokyo từ Đà Nẵng dưới 10 triệu" )], today).tours.map(({ code }) => code), ["NDDNG103", "JPTYO101", "JPOSA102"])
assert.equal(selectRelevantTours(Array.from({ length: 8 }, (_, index) => tour({ code: `T${index}`, name: `Tokyo hành trình ${index}` })), [user("Tìm tour Tokyo" )], today).tours.length, 5)
assert.equal(selectRelevantTours(tours, [user("Tôi muốn đi Tokyo vào tháng sau" )], today).tours[0]?.code, "JPTYO101")
assert.deepEqual(selectRelevantTours(tours, [user("Tìm tour Tokyo từ TP Hồ Chí Minh"), user("Xin sửa lại, tôi muốn đi Osaka khởi hành từ Hà Nội")], today).tours.map(({ code }) => code), ["JPOSA102"])
assert.deepEqual(selectRelevantTours(tours, [user("Tìm tour khởi hành ngày 10/11/2026" )], today).tours.map(({ code }) => code), ["JPTYO101", "JPOSA102", "NDDNG103"])
assert.deepEqual(selectRelevantTours([tour({ departureDates: ["2026-10-06"] })], [user("Tìm tour khởi hành ngày 06/10" )], today).tours.map(({ code }) => code), ["JPTYO101"])
