import assert from "node:assert/strict"

import { childRates, partnerServiceId, partnerServices } from "@/lib/partners/services"
import type { Partner } from "@/types/partner"

const base: Partner = {
  id: "p1",
  status: "approved",
  createdAt: "2026-10-09T00:00:00Z",
  brand: "Biển Xanh",
  kind: "Nhà hàng",
  destinationSlug: "phu-quoc",
  area: "Dương Đông",
  address: "12 Trần Hưng Đạo",
  website: "",
  description: "Hải sản tươi",
  products: [
    { id: "a", name: "Gỏi cá trích", priceVnd: 90000, unit: "per_person", description: "" },
    { id: "b", name: "Set hải sản", priceVnd: 1200000, unit: "per_booking", description: "4 người" },
  ],
}

const services = partnerServices(
  [base, { ...base, id: "p2", status: "pending" }, { ...base, id: "p3", status: "rejected" }, { ...base, id: "p4", destinationSlug: "da-nang" }],
  "phu-quoc",
  "https://travel.com.vn/",
)

// Chỉ đối tác đã duyệt, đúng điểm đến
assert.deepEqual(services.map((s) => s.id), [partnerServiceId("p1", "a"), partnerServiceId("p1", "b")])
assert.equal(services[0].kind, "dining")
assert.equal(services[0].tag, "Biển Xanh · Dương Đông")
assert.equal(services[0].blurb, "Hải sản tươi")
assert.equal(services[1].blurb, "4 người")
assert.equal(services[1].priceUnit, "per_booking")
assert.equal(services[0].bookUrl, "https://travel.com.vn/")
assert.equal(services[0].mock, false)

assert.equal(partnerServices([{ ...base, website: "https://bienxanh.vn" }], "phu-quoc", "x")[0].bookUrl, "https://bienxanh.vn")
assert.equal(partnerServices([{ ...base, kind: "Khách sạn" }], "phu-quoc", "x")[0].kind, "hotel")
assert.equal(partnerServices([{ ...base, kind: "Sản phẩm địa phương" }], "phu-quoc", "x")[0].kind, "souvenir")

assert.equal(partnerServices([{ ...base, kind: "Khách sạn", tier: "Tầm trung", area: "Bắc đảo (Bãi Dài)" }], "phu-quoc", "x")[0].tag, "Biển Xanh · Tầm trung · Bắc đảo (Bãi Dài)")
assert.equal(partnerServices([{ ...base, kind: "Thuê xe, đưa đón" }], "phu-quoc", "x")[0].kind, "vehicle")
assert.equal(partnerServices([{ ...base, kind: "Vui chơi, trải nghiệm" }], "phu-quoc", "x")[0].kind, "activity")

// Giá trẻ em chỉ áp cho sản phẩm tính theo khách
assert.deepEqual(childRates({ freeUnderAge: 4, childPercent: 75 }), [{ underAge: 4, rate: 0 }, { underAge: 12, rate: 0.75 }])
assert.deepEqual(childRates({ freeUnderAge: 0, childPercent: 50 }), [{ underAge: 12, rate: 0.5 }])
assert.equal(childRates(undefined), undefined)
const withKids = partnerServices([{ ...base, childPolicy: { freeUnderAge: 4, childPercent: 75 } }], "phu-quoc", "x")
assert.deepEqual(withKids[0].childRates, [{ underAge: 4, rate: 0 }, { underAge: 12, rate: 0.75 }])
assert.equal(withKids[1].childRates, undefined)

console.log("services.test.ts: ok")
