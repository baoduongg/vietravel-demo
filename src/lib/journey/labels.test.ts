import assert from "node:assert/strict"
import { addDays, dayLabel, defaultJourneyInfo, durationLabel, priceLabel, shortVnd, travelersLabel } from "./labels"

assert.equal(travelersLabel({ adults: 2, childAges: [] }), "2 người lớn")
assert.equal(travelersLabel({ adults: 2, childAges: [3, 7] }), "2 người lớn, 2 bé (3, 7 tuổi)")
assert.equal(durationLabel(2), "3N2Đ")
assert.equal(durationLabel(0), "1N0Đ")
assert.equal(addDays("2026-10-31", 1), "2026-11-01")
assert.equal(addDays("2026-12-31", 1), "2027-01-01")
assert.equal(dayLabel("2026-11-01", 1), "Ngày 1 · 01/11")
assert.equal(dayLabel("2026-11-01", 3), "Ngày 3 · 03/11")
assert.equal(dayLabel(null, 2), "Ngày 2")
assert.equal(priceLabel({ priceVnd: 1500000, priceUnit: "per_room_night" }), "1.500.000đ / phòng / đêm")
assert.equal(priceLabel({ priceVnd: 0, priceUnit: "per_person" }), "Miễn phí")
assert.equal(shortVnd(18400000), "18,4tr")
assert.equal(shortVnd(3000000), "3tr")
assert.equal(shortVnd(500000), "500.000đ")

const info = defaultJourneyInfo("Phú Quốc", new Date("2026-10-08T00:00:00Z"))
assert.equal(info.title, "Phú Quốc tháng 11")
assert.deepEqual([info.nights, info.travelers, info.startDate, info.memberName], [2, { adults: 2, childAges: [] }, null, ""])
assert.equal(defaultJourneyInfo("Phú Quốc", new Date("2026-12-08T00:00:00Z")).title, "Phú Quốc tháng 1")

console.log("labels.test OK")
