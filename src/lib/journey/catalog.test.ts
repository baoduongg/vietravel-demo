import assert from "node:assert/strict"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { phuQuocActivityPrices } from "@/data/services/phu-quoc"
import { SERVICE_KINDS } from "@/types/journey"
import { getService, getServices } from "./catalog"
import { activityServiceId, slugify, tourServiceId } from "./ids"

const today = "2026-10-08"
const all = getServices("phu-quoc", undefined, today)

// slugify bỏ dấu tiếng Việt, kể cả đ/Đ.
assert.equal(slugify("Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc"), "dinh-cau-va-thien-vien-truc-lam-ho-quoc")
assert.equal(slugify("Đường Đi  "), "duong-di")
assert.equal(tourServiceId("NDSGN8701"), "tour-NDSGN8701")

// Đủ 5 loại; đúng 6 khách sạn mock.
for (const kind of SERVICE_KINDS) assert.ok(getServices("phu-quoc", kind, today).length > 0, `thiếu loại ${kind}`)
assert.equal(getServices("phu-quoc", "hotel", today).length, 6)

// id không trùng.
assert.equal(new Set(all.map((service) => service.id)).size, all.length, "id dịch vụ bị trùng")

for (const service of all) {
  assert.ok(service.bookUrl.startsWith("https://travel.com.vn/"), `${service.id}: bookUrl phải về travel.com.vn`)
  assert.ok(!service.bookUrl.includes("khach-san-phu-quoc") && !service.bookUrl.includes("ve-may-bay"), `${service.id}: link đang lỗi`)
  assert.ok(Number.isInteger(service.priceVnd) && service.priceVnd >= 0, `${service.id}: giá không hợp lệ`)
  assert.equal(service.mock, service.kind !== "tour", `${service.id}: cờ mock sai`)
  // Chỉ tour có ảnh (ảnh của Vietravel); ảnh CC khác bắt buộc ghi công nên không dùng ở đây.
  assert.equal(service.imageUrl === undefined, service.kind !== "tour", `${service.id}: ảnh sai quy ước`)
  assert.equal(service.destinationSlug, "phu-quoc")
}

// Mọi hoạt động trong cẩm nang có giá mock.
for (const place of phuQuoc.activities) {
  assert.ok(Object.hasOwn(phuQuocActivityPrices, place.name), `thiếu giá cho "${place.name}"`)
}

// Tra cứu.
assert.equal(getService("phu-quoc", activityServiceId("Vinpearl Safari"), today)?.name, "Vinpearl Safari")
assert.equal(getService("phu-quoc", "khong-co", today), undefined)
assert.deepEqual(getServices("da-nang", undefined, today), [])
assert.deepEqual(getServices("khong-co", undefined, today), [])

console.log("catalog.test OK")
