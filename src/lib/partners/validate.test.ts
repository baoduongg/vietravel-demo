import assert from "node:assert/strict"

import { parseImage, parseInfo, parsePartnerInput, parseProducts } from "@/lib/partners/validate"

const valid = {
  brand: "  Nước mắm   Hồng Phát ",
  kind: "Sản phẩm địa phương",
  destinationSlug: "phu-quoc",
  area: "Dương Đông",
  address: "  12 Hùng Vương, Dương Đông ",
  website: "",
  description: "",
  contactName: "Chị Lan",
  phone: "0912 345 678",
  email: "",
  products: [{ name: "Nước mắm 40 độ đạm", priceVnd: 120000, unit: "per_item", description: "Chai 500ml" }],
}

const ok = parsePartnerInput(valid)
assert.ok(ok.ok)
assert.equal(ok.partner.brand, "Nước mắm Hồng Phát")
assert.equal(ok.partner.address, "12 Hùng Vương, Dương Đông")
assert.equal(ok.partner.phone, "0912345678")
assert.match(ok.partner.products[0].id, /^[0-9a-f-]{36}$/)
assert.ok(parsePartnerInput({ ...valid, phone: "+84912345678" }).ok)
assert.ok(parsePartnerInput({ ...valid, website: "https://facebook.com/hongphat" }).ok)

assert.equal(parsePartnerInput(null).ok, false)
assert.equal(parsePartnerInput({ ...valid, brand: " " }).ok, false)
assert.equal(parsePartnerInput({ ...valid, kind: "Spa" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, destinationSlug: "" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, address: "" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, website: "javascript:alert(1)" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, website: "hongphat.vn" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, phone: "12345" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, email: "khong-phai-email" }).ok, false)
assert.equal(parsePartnerInput({ ...valid, products: [] }).ok, false)
assert.equal(parsePartnerInput({ ...valid, products: [null] }).ok, false)
assert.equal(parsePartnerInput({ ...valid, products: Array(21).fill(valid.products[0]) }).ok, false)

assert.equal(parsePartnerInput({ ...valid, area: "" }).ok, false)

// Khách sạn phải có phân khúc; loại khác bỏ qua phân khúc
const hotel = { ...valid, kind: "Khách sạn", products: [{ name: "Phòng Deluxe", priceVnd: 1500000, unit: "per_room_night" }] }
assert.equal(parsePartnerInput(hotel).ok, false)
assert.equal(parsePartnerInput({ ...hotel, tier: "5 sao" }).ok, false)
const hotelOk = parsePartnerInput({ ...hotel, tier: "Tầm trung" })
assert.ok(hotelOk.ok && hotelOk.partner.tier === "Tầm trung")
const noTier = parsePartnerInput({ ...valid, tier: "Tầm trung" })
assert.ok(noTier.ok && noTier.partner.tier === undefined)

// Chính sách trẻ em chỉ cho loại hình có giá theo khách
const activity = { ...valid, kind: "Vui chơi, trải nghiệm", products: [{ name: "Lặn san hô", priceVnd: 750000, unit: "per_person" }] }
const withPolicy = parsePartnerInput({ ...activity, childPolicy: { freeUnderAge: 4, childPercent: 75 } })
assert.ok(withPolicy.ok)
assert.deepEqual(withPolicy.partner.childPolicy, { freeUnderAge: 4, childPercent: 75 })
assert.ok(parsePartnerInput(activity).ok)
assert.equal(parsePartnerInput({ ...activity, childPolicy: { freeUnderAge: 13, childPercent: 75 } }).ok, false)
assert.equal(parsePartnerInput({ ...activity, childPolicy: { freeUnderAge: 4, childPercent: 101 } }).ok, false)
assert.equal(parsePartnerInput({ ...activity, childPolicy: { freeUnderAge: "4", childPercent: 75 } }).ok, false)
const souvenirPolicy = parsePartnerInput({ ...valid, childPolicy: { freeUnderAge: 4, childPercent: 75 } })
assert.ok(souvenirPolicy.ok && souvenirPolicy.partner.childPolicy === undefined)

// Thuê xe tính theo ngày hoặc theo lượt
const car = { name: "Xe máy tay ga", priceVnd: 150000, unit: "per_day", description: "" }
assert.ok(parseProducts([car], "Thuê xe, đưa đón").ok)
assert.equal(parseProducts([car], "Khách sạn").ok, false)

// Giá bắt buộc: trong kế hoạch giá 0 hiện là "Miễn phí"
const product = { name: "Phòng Deluxe", priceVnd: 1500000, unit: "per_room_night", description: "" }
assert.ok(parseProducts([product], "Khách sạn").ok)
assert.equal(parseProducts([{ ...product, priceVnd: 0 }], "Khách sạn").ok, false)
assert.equal(parseProducts([{ ...product, priceVnd: 1.5 }], "Khách sạn").ok, false)
assert.equal(parseProducts([{ ...product, description: "a".repeat(121) }], "Khách sạn").ok, false)
assert.equal(parseProducts([{ ...product, priceVnd: "100000" }], "Khách sạn").ok, false)

// Đơn vị phải hợp với loại hình
assert.equal(parseProducts([product], "Nhà hàng").ok, false)
assert.ok(parseProducts([{ ...product, unit: "per_person" }], "Nhà hàng").ok)
assert.ok(parseProducts([{ ...product, unit: "per_booking" }], "Nhà hàng").ok)

// Giữ id cũ khi sửa, cấp id mới cho id lạ hoặc trùng
const id = "583e8a4b-7aee-4e85-9f06-28716bc873d1"
const kept = parseProducts([{ ...product, id }, { ...product, id }, { ...product, id: "x" }], "Khách sạn")
assert.ok(kept.ok)
assert.equal(kept.products[0].id, id)
assert.equal(new Set(kept.products.map((p) => p.id)).size, 3)

assert.equal(parseProducts([], "Khách sạn").ok, false)
assert.equal(parseProducts("x", "Khách sạn").ok, false)

// Sửa thông tin: loại hình lấy từ bản ghi, không cần liên hệ và sản phẩm
const info = parseInfo({ brand: " Biển Xanh ", destinationSlug: "phu-quoc", area: "Dương Đông", address: "12 Trần Hưng Đạo", website: "", description: "" }, "Nhà hàng")
assert.ok(info.ok)
assert.equal(info.info.brand, "Biển Xanh")
assert.equal(parseInfo({ brand: "A", destinationSlug: "phu-quoc", area: "Dương Đông", address: "x" }, "Khách sạn").ok, false)
assert.equal(parseInfo(null, "Nhà hàng").ok, false)

// Ảnh
assert.deepEqual(parseImage(undefined), { ok: true })
assert.deepEqual(parseImage(""), { ok: true })
assert.deepEqual(parseImage("data:image/jpeg;base64,/9j/4AAQ=="), { ok: true, image: "data:image/jpeg;base64,/9j/4AAQ==" })
assert.equal(parseImage("data:image/svg+xml;base64,PHN2Zz4=").ok, false)
assert.equal(parseImage("https://example.com/a.jpg").ok, false)
assert.equal(parseImage("data:image/jpeg;base64,abc<script>").ok, false)
assert.equal(parseImage(`data:image/jpeg;base64,${"A".repeat(2_000_000)}`).ok, false)

console.log("validate.test.ts: ok")
