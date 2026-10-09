import assert from "node:assert/strict"
import { chipOf, chipsOf, filterAndSort, isPartnerService, kindFromSlug, KIND_SLUG, matchesQuery, priceStats } from "./service-listing"
import { SERVICE_KINDS, type ServiceItem } from "@/types/journey"

function item(over: Partial<ServiceItem>): ServiceItem {
  return {
    id: "x", kind: "hotel", destinationSlug: "phu-quoc", name: "Tên", tag: "Tầm trung · Dương Đông", blurb: "",
    priceVnd: 100, priceUnit: "per_room_night", bookUrl: "https://example.com", mock: true, ...over,
  }
}

// Slug ⇄ kind: đủ 7 loại, hai chiều, slug lạ hoặc trùng thuộc tính Object trả undefined.
assert.equal(new Set(Object.values(KIND_SLUG)).size, SERVICE_KINDS.length)
for (const kind of SERVICE_KINDS) assert.equal(kindFromSlug(KIND_SLUG[kind]), kind)
assert.equal(KIND_SLUG.flight, "ve-may-bay")
for (const slug of ["abc", "", "constructor", "__proto__", "hotel"]) assert.equal(kindFromSlug(slug), undefined, slug)

// Tìm kiếm không dấu, như bảng chọn cũ.
assert.ok(matchesQuery(item({ name: "Khách sạn Phố Đêm" }), "pho dem"))
assert.ok(!matchesQuery(item({ name: "Khách sạn Phố Đêm" }), "resort"))
assert.ok(matchesQuery(item({}), "  "))

// priceStats bỏ mục giá 0; danh sách rỗng không có min/max.
const free = item({ id: "free", priceVnd: 0 })
const cheap = item({ id: "cheap", priceVnd: 650_000 })
const dear = item({ id: "dear", priceVnd: 6_800_000 })
assert.deepEqual(priceStats([free, dear, cheap]), { count: 3, min: cheap, max: dear })
assert.deepEqual(priceStats([]), { count: 0, min: undefined, max: undefined })
assert.deepEqual(priceStats([free]), { count: 1, min: undefined, max: undefined })

// Đối tác nhận qua tiền tố id.
const partner = item({ id: "partner-abc-p1", tag: "Nhà Gió · Cao cấp · Bãi Trường" })
assert.ok(isPartnerService(partner))
assert.ok(!isPartnerService(cheap))

// Chip: mục thường lấy đoạn 1, đối tác lấy đoạn 2; tag rỗng/thiếu đoạn ra undefined.
assert.equal(chipOf(item({ tag: "Tiết kiệm · Ông Lang" })), "Tiết kiệm")
assert.equal(chipOf(partner), "Cao cấp")
assert.equal(chipOf(item({ tag: "" })), undefined)
assert.equal(chipOf(item({ id: "partner-a-b", tag: "Chỉ tên" })), undefined)
// Đối tác không phải khách sạn (không có phân khúc): tag "Thương hiệu · Khu vực" không ra chip khu vực.
assert.equal(chipOf(item({ id: "partner-a-b", tag: "Xe Gió · Dương Đông" })), undefined)
// Tên thương hiệu có " · " vẫn lấy đúng phân khúc.
assert.equal(chipOf(item({ id: "partner-a-b", tag: "Nhà · Gió · Cao cấp · Bãi Trường" })), "Cao cấp")

// chipsOf: duy nhất, theo thứ tự xuất hiện; < 2 chip thì ẩn hàng chip.
assert.deepEqual(chipsOf([item({ tag: "Tiết kiệm · A" }), item({ tag: "Cao cấp · B" }), item({ tag: "Tiết kiệm · C" })]), ["Tiết kiệm", "Cao cấp"])
assert.deepEqual(chipsOf([item({ tag: "Khứ hồi · 1 giờ" }), item({ tag: "Khứ hồi · 2 giờ" })]), [])

// filterAndSort: chip, chỉ đối tác, giá tăng/giảm với giá 0 luôn cuối, mặc định giữ thứ tự.
const all = [free, dear, cheap, partner]
const base = { query: "", chip: null, partnerOnly: false, sort: "default" as const }
assert.deepEqual(filterAndSort(all, base), all)
assert.deepEqual(filterAndSort(all, { ...base, sort: "price-asc" }).map((s) => s.id), ["partner-abc-p1", "cheap", "dear", "free"])
assert.deepEqual(filterAndSort(all, { ...base, sort: "price-desc" }).map((s) => s.id), ["dear", "cheap", "partner-abc-p1", "free"])
assert.deepEqual(filterAndSort(all, { ...base, partnerOnly: true }), [partner])
assert.deepEqual(filterAndSort(all, { ...base, chip: "Cao cấp" }), [partner])
assert.deepEqual(filterAndSort(all, { ...base, query: "khong co" }), [])

console.log("service-listing: ok")
