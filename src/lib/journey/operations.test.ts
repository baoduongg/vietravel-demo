import assert from "node:assert/strict"
import type { Journey, JourneyItem, ServiceItem } from "@/types/journey"
import { createJourney } from "./create"
import { JourneyError } from "./errors"
import { applyOp, forRole, parseOp, voteScore, type OpDeps } from "./operations"

const hotel: ServiceItem = {
  id: "hotel-x", kind: "hotel", destinationSlug: "phu-quoc", name: "Resort X", tag: "Cao cấp", blurb: "",
  priceVnd: 2000000, priceUnit: "per_room_night", bookUrl: "https://travel.com.vn/du-lich-phu-quoc", mock: true,
}
const flight: ServiceItem = {
  ...hotel, id: "flight-x", kind: "flight", name: "Vé bay X", priceUnit: "per_person",
  imageUrl: "/images/phu-quoc/san-bay-phu-quoc.webp", credit: { author: "Tác giả", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/" },
}
const otherPlace: ServiceItem = { ...hotel, id: "hotel-dn", destinationSlug: "da-nang" }
let counter = 0
const deps: OpDeps = {
  lookup: (id) => [hotel, flight, otherPlace].find((service) => service.id === id),
  newId: () => `id-${++counter}`,
  now: () => new Date("2026-10-08T00:00:00Z"),
}

function expectError(fn: () => unknown, status: number): void {
  assert.throws(fn, (error: unknown) => error instanceof JourneyError && error.status === status)
}

// createJourney: hợp lệ.
const valid = { title: " Phú Quốc tháng 11 ", destinationSlug: "phu-quoc", startDate: "2026-11-01", nights: 2, travelers: { adults: 2, childAges: [3, 7] }, memberName: " Lan " }
const { journey: created, memberId: lan } = createJourney(valid)
assert.equal(created.title, "Phú Quốc tháng 11")
assert.equal(created.version, 1)
assert.deepEqual(created.members.map((member) => [member.id, member.name]), [[lan, "Lan"]])
assert.notEqual(created.editToken, created.viewToken)
assert.ok(created.editToken.length >= 22, "token 16 byte base64url")
assert.match(created.id, /^[0-9a-f-]{36}$/)

// createJourney: dữ liệu sai đều 400.
for (const bad of [
  null,
  "chuỗi",
  { ...valid, title: "   " },
  { ...valid, title: "a".repeat(81) },
  { ...valid, nights: 15 },
  { ...valid, nights: 1.5 },
  { ...valid, travelers: { adults: 0, childAges: [] } },
  { ...valid, travelers: { adults: 2, childAges: [18] } },
  { ...valid, travelers: { adults: 2, childAges: Array(11).fill(3) } },
  { ...valid, travelers: { adults: 2 } },
  { ...valid, startDate: "01/11/2026" },
  { ...valid, memberName: "" },
  { ...valid, destinationSlug: "da-nang" },
]) {
  expectError(() => createJourney(bad), 400)
}
assert.equal(createJourney({ ...valid, startDate: null }).journey.startDate, null)

const edit = { role: "edit" as const, memberId: lan }
const find = (journey: Journey, item: JourneyItem): JourneyItem => journey.items.find((entry) => entry.id === item.id)!
const dayOrder = (journey: Journey, day: number | null): string[] =>
  journey.items.filter((entry) => entry.day === day).sort((a, b) => a.order - b.order).map((entry) => entry.id)

// addItem: vào "Đang cân nhắc", chụp snapshot, không sửa object gốc.
let j: Journey = created
j = applyOp(j, { type: "addItem", serviceId: "hotel-x" }, edit, deps)
j = applyOp(j, { type: "addItem", serviceId: "flight-x" }, edit, deps)
assert.deepEqual(j.items.map((entry) => [entry.snapshot.name, entry.day, entry.order]), [["Resort X", null, 0], ["Vé bay X", null, 1]])
assert.equal(j.items[0].addedBy, lan)
assert.equal(j.items[0].snapshot.priceVnd, 2000000)
assert.equal(created.items.length, 0, "applyOp không được sửa journey gốc")
assert.equal(j.version, created.version, "applyOp không đổi version")
expectError(() => applyOp(j, { type: "addItem", serviceId: "khong-co" }, edit, deps), 400)
expectError(() => applyOp(j, { type: "addItem", serviceId: "hotel-dn" }, edit, deps), 400)
const [hotelItem, flightItem] = j.items

// moveItem: sang ngày, đổi thứ tự, ngoài chuyến, mục không tồn tại.
j = applyOp(j, { type: "moveItem", itemId: flightItem.id, day: 1 }, edit, deps)
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [flightItem.id, hotelItem.id])
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1, order: 0 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [hotelItem.id, flightItem.id])
j = applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 1, order: 1 }, edit, deps)
assert.deepEqual(dayOrder(j, 1), [flightItem.id, hotelItem.id])
assert.deepEqual(dayOrder(j, null), [])
expectError(() => applyOp(j, { type: "moveItem", itemId: hotelItem.id, day: 4 }, edit, deps), 400)
expectError(() => applyOp(j, { type: "moveItem", itemId: "khong-co", day: 1 }, edit, deps), 404)

// vote: bấm lại để bỏ, đổi phiếu, giá trị lạ.
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, { [lan]: 1 })
assert.equal(voteScore(find(j, hotelItem)), 1)
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: -1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, { [lan]: -1 })
j = applyOp(j, { type: "vote", itemId: hotelItem.id, value: -1 }, edit, deps)
assert.deepEqual(find(j, hotelItem).votes, {})
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 2 }, edit, deps), 400)

// comment: cắt khoảng trắng, rỗng hoặc quá dài bị từ chối.
j = applyOp(j, { type: "comment", itemId: hotelItem.id, text: "  Có hồ bơi cho bé không?  " }, edit, deps)
assert.equal(find(j, hotelItem).comments[0].text, "Có hồ bơi cho bé không?")
assert.equal(find(j, hotelItem).comments[0].memberId, lan)
expectError(() => applyOp(j, { type: "comment", itemId: hotelItem.id, text: "   " }, edit, deps), 400)
expectError(() => applyOp(j, { type: "comment", itemId: hotelItem.id, text: "a".repeat(501) }, edit, deps), 400)

// setQuantity.
j = applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 2 }, edit, deps)
assert.equal(find(j, hotelItem).quantity, 2)
j = applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: null }, edit, deps)
assert.equal(find(j, hotelItem).quantity, null)
expectError(() => applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 0 }, edit, deps), 400)
expectError(() => applyOp(j, { type: "setQuantity", itemId: hotelItem.id, quantity: 21 }, edit, deps), 400)

// join: link sửa không cần memberId; sau đó người lạ hoặc chưa nhập tên đều 403.
j = applyOp(j, { type: "join", name: "Minh" }, { role: "edit" }, deps)
assert.deepEqual(j.members.map((member) => member.name), ["Lan", "Minh"])
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, { role: "edit", memberId: "nguoi-la" }, deps), 403)
expectError(() => applyOp(j, { type: "vote", itemId: hotelItem.id, value: 1 }, { role: "edit" }, deps), 403)

// Link chỉ xem: mọi thao tác 403, kể cả join.
expectError(() => applyOp(j, { type: "join", name: "Hoa" }, { role: "view" }, deps), 403)
expectError(() => applyOp(j, { type: "addItem", serviceId: "hotel-x" }, { role: "view", memberId: lan }, deps), 403)

// updateInfo: giảm số đêm đẩy mục ở ngày bị cắt về "Đang cân nhắc".
j = applyOp(j, { type: "moveItem", itemId: flightItem.id, day: 3 }, edit, deps)
j = applyOp(j, { type: "updateInfo", nights: 1, title: "Đi ngắn" }, edit, deps)
assert.equal(j.nights, 1)
assert.equal(j.title, "Đi ngắn")
assert.equal(find(j, flightItem).day, null)
assert.equal(find(j, hotelItem).day, 1)
expectError(() => applyOp(j, { type: "updateInfo", nights: -1 }, edit, deps), 400)

// addItem có day: thêm thẳng vào ngày đó, ở cuối ngày; ngày ngoài chuyến bị từ chối.
j = applyOp(j, { type: "addItem", serviceId: "hotel-x", day: 1 }, edit, deps)
const direct = j.items[j.items.length - 1]
assert.equal(direct.day, 1)
assert.deepEqual(dayOrder(j, 1), [hotelItem.id, direct.id])
expectError(() => applyOp(j, { type: "addItem", serviceId: "hotel-x", day: 3 }, edit, deps), 400) // còn 1 đêm → 2 ngày
j = applyOp(j, { type: "removeItem", itemId: direct.id }, edit, deps)

// Snapshot giữ ghi công ảnh.
const credited = applyOp(j, { type: "addItem", serviceId: "flight-x" }, edit, deps)
assert.deepEqual(credited.items[credited.items.length - 1].snapshot.credit, flight.credit)

// removeItem.
j = applyOp(j, { type: "removeItem", itemId: hotelItem.id }, edit, deps)
assert.deepEqual(j.items.map((entry) => entry.id), [flightItem.id])
expectError(() => applyOp(j, { type: "removeItem", itemId: hotelItem.id }, edit, deps), 404)

// Op lạ hoặc không phải object: 400.
expectError(() => applyOp(j, { type: "xoa-het" }, edit, deps), 400)
expectError(() => applyOp(j, null, edit, deps), 400)
expectError(() => parseOp({ type: "addItem" }), 400)

// forRole: link chỉ xem không lộ editToken.
assert.equal(forRole(j, "view").editToken, undefined)
assert.equal(forRole(j, "edit").editToken, j.editToken)

console.log("operations.test OK")
