import assert from "node:assert/strict"
import type { ChildRate, JourneyItem, PriceUnit, ServiceKind } from "@/types/journey"
import { childFactor, defaultQuantity, estimateCost, itemCost } from "./cost"

const FLIGHT: ChildRate[] = [{ underAge: 2, rate: 0.1 }, { underAge: 12, rate: 0.75 }]
const TOUR: ChildRate[] = [{ underAge: 5, rate: 0 }, { underAge: 12, rate: 0.75 }]

function item(kind: ServiceKind, priceVnd: number, priceUnit: PriceUnit, day: number | null, extra: Partial<JourneyItem> = {}, childRates?: ChildRate[]): JourneyItem {
  return {
    id: `${kind}-${priceVnd}`, serviceId: kind, day, order: 0, quantity: null, addedBy: "m1", votes: {}, comments: [],
    snapshot: { name: kind, kind, tag: "", priceVnd, priceUnit, childRates, bookUrl: "https://travel.com.vn/", mock: true },
    ...extra,
  }
}

// Hệ số trẻ em theo bậc tuổi.
assert.equal(childFactor(1, FLIGHT), 0.1)
assert.equal(childFactor(3, FLIGHT), 0.75)
assert.equal(childFactor(4, TOUR), 0)
assert.equal(childFactor(5, TOUR), 0.75)
assert.equal(childFactor(12, TOUR), 1, "từ 12 tuổi tính như người lớn")
assert.equal(childFactor(3), 1, "không có bậc giá trẻ em thì trả như người lớn")

// Số lượng mặc định.
const family = { adults: 2, childAges: [3, 7] }
assert.equal(defaultQuantity("per_person", family), null)
assert.equal(defaultQuantity("per_room_night", { adults: 3, childAges: [] }), 2)
assert.equal(defaultQuantity("per_day", family), 1)
assert.equal(defaultQuantity("per_booking", family), 1)

// Nhà 2 người lớn + bé 3 và 7 tuổi, 3N2Đ.
const journey = {
  nights: 2,
  travelers: family,
  items: [
    item("flight", 2200000, "per_person", 1, {}, FLIGHT), // 2.2tr × (2 + 0.75 + 0.75) = 7.700.000
    item("tour", 5000000, "per_person", 1, {}, TOUR), // 5tr × (2 + 0 + 0.75) = 13.750.000
    item("hotel", 1500000, "per_room_night", 1), // 1 phòng × 2 đêm = 3.000.000
    item("vehicle", 800000, "per_day", 2), // 3 ngày × 1 xe = 2.400.000
    item("hotel", 9999000, "per_room_night", null), // "Đang cân nhắc": không tính
  ],
}
const estimate = estimateCost(journey)
assert.equal(estimate.byKind.flight, 7700000)
assert.equal(estimate.byKind.tour, 13750000)
assert.equal(estimate.byKind.hotel, 3000000)
assert.equal(estimate.byKind.vehicle, 2400000)
assert.equal(estimate.byKind.activity, 0)
assert.equal(estimate.totalVnd, 26850000)
assert.equal(estimate.perAdultVnd, 13425000)

// Số phòng: 3 người lớn → 2 phòng; số lượng nhập tay thắng mặc định.
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1), 2, { adults: 3, childAges: [] }), 6000000)
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1, { quantity: 3 }), 2, family), 9000000)

// 0 đêm (đi trong ngày) vẫn tính 1 đêm phòng và 1 ngày xe.
assert.equal(itemCost(item("hotel", 1500000, "per_room_night", 1), 0, family), 1500000)
assert.equal(itemCost(item("vehicle", 800000, "per_day", 1), 0, family), 800000)

// Tính theo lượt.
assert.equal(itemCost(item("vehicle", 500000, "per_booking", 1, { quantity: 2 }), 2, family), 1000000)

// Làm tròn đồng: 2.2tr × 1.1 không ra số lẻ.
assert.equal(itemCost(item("flight", 2200000, "per_person", 1, {}, FLIGHT), 2, { adults: 1, childAges: [1] }), 2420000)

// Kế hoạch rỗng.
assert.deepEqual(estimateCost({ nights: 2, travelers: family, items: [] }).totalVnd, 0)
assert.deepEqual(estimateCost({ nights: 2, travelers: family, items: [] }).perAdultVnd, 0)

console.log("cost.test OK")
