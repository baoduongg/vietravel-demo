import assert from "node:assert/strict"
import { destinations, getGuide } from "./index"
import { phuQuoc } from "./phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"
import { SERVICE_KINDS } from "@/types/journey"

const IMAGE_HOST = "https://s3-cmc.travel.com.vn/"
const today = "2026-10-08"

// Slug: điểm active có nội dung; slug lạ, chưa active, hoặc trùng thuộc tính Object đều không có.
assert.equal(getGuide("phu-quoc"), phuQuoc)
for (const slug of ["da-nang", "constructor", "__proto__", "toString", ""]) {
  assert.equal(getGuide(slug), undefined, `slug "${slug}" phải là undefined`)
}
for (const destination of destinations.filter((item) => item.active)) {
  assert.ok(getGuide(destination.slug), `${destination.slug} active nhưng thiếu nội dung`)
}

// Ảnh: next/image chỉ cho phép host S3 của Vietravel.
const images = [
  ...destinations.map((item) => item.imageUrl),
  phuQuoc.heroImageUrl,
  ...[...phuQuoc.stays, ...phuQuoc.activities].flatMap((place) => (place.imageUrl ? [place.imageUrl] : [])),
]
for (const url of images) {
  const local = url.startsWith("/images/")
  assert.ok(local || url.startsWith(IMAGE_HOST), `ảnh sai host: ${url}`)
}

// Ảnh không của Vietravel (ảnh nội bộ trong /public) phải ghi công tác giả và giấy phép.
for (const place of [...phuQuoc.stays, ...phuQuoc.activities]) {
  if (place.imageUrl?.startsWith("/images/")) assert.ok(place.credit?.author && place.credit.license, `${place.name} thiếu ghi công ảnh`)
}
for (const photo of phuQuoc.gallery) {
  assert.ok(photo.credit.author && photo.credit.license && photo.credit.url.startsWith("https://commons.wikimedia.org/"), `${photo.src} thiếu ghi công`)
}
// Ảnh mới ở khối ẩm thực và di chuyển cũng phải ghi công; món có ảnh thì có credit.
for (const photo of [phuQuoc.foodPhoto, phuQuoc.airport.photo, phuQuoc.onIslandPhoto]) {
  assert.ok(photo.credit.author && photo.credit.license && photo.credit.url.startsWith("https://commons.wikimedia.org/"), `${photo.src} thiếu ghi công`)
}
for (const dish of phuQuoc.dishes) {
  if (dish.imageUrl) assert.ok(dish.credit?.author && dish.credit.license, `${dish.name} thiếu ghi công ảnh`)
}
for (const video of phuQuoc.videos) assert.match(video.id, /^[A-Za-z0-9_-]{11}$/, `id video sai: ${video.id}`)

// Link đặt chỗ: luôn sang travel.com.vn.
for (const url of Object.values(phuQuoc.links)) {
  assert.equal(new URL(url).hostname, "travel.com.vn", `link sai host: ${url}`)
}

// Cấu trúc nội dung.
assert.equal(phuQuoc.months.length, 12)
assert.equal(phuQuoc.reasons.length, 5)
assert.ok(phuQuoc.itinerary.length >= 3)
for (const place of [...phuQuoc.stays, ...phuQuoc.activities]) {
  assert.ok(place.audiences.length > 0, `${place.name} thiếu audiences`)
}
for (const review of phuQuoc.reviews) assert.ok(review.rating >= 1 && review.rating <= 5)

// Nội dung dễ sai thực tế (reviewer cuối): không khẳng định tháng 10 mưa nhiều nhất/giá thấp nhất,
// và không khuyên tự ký gửi nước mắm (hãng bay có quy định riêng).
assert.ok(!/nhiều nhất/i.test(phuQuoc.months[9].rain + phuQuoc.months[9].advice), "T10 không được ghi 'nhiều nhất'")
assert.ok(!/thấp nhất/i.test(phuQuoc.months[9].advice), "T10 không được ghi 'thấp nhất'")
const fishSauce = phuQuoc.faqs.find((faq) => /nước mắm/i.test(faq.question))
assert.ok(fishSauce, "phải có FAQ nước mắm")
assert.ok(!/ký gửi/i.test(fishSauce.answer) && /hãng bay/i.test(fishSauce.answer), "FAQ nước mắm phải dẫn về quy định hãng bay")

// Tour: có tour sắp đi; hết lịch thì mảng rỗng (UI hiện CTA hotline); sắp xếp giá tăng.
const tours = toursForDestination(phuQuoc, today)
assert.ok(tours.length > 0, "phải có tour Phú Quốc sắp khởi hành")
for (const tour of tours) assert.ok(`${tour.name} ${tour.region}`.toLowerCase().includes("phú quốc"))
for (let i = 1; i < tours.length; i += 1) assert.ok(tours[i - 1].priceVnd <= tours[i].priceVnd)
assert.deepEqual(toursForDestination(phuQuoc, "2099-01-01"), [])


// Cẩm nang theo loại dịch vụ: Phú Quốc có đủ 7 loại, mỗi loại có intro, mẹo và FAQ.
for (const kind of SERVICE_KINDS) {
  const serviceGuide = phuQuoc.serviceGuides?.[kind]
  assert.ok(serviceGuide, `${kind} thiếu cẩm nang`)
  assert.ok(serviceGuide.intro.trim(), `${kind} thiếu intro`)
  assert.ok(serviceGuide.tips.length >= 1 && serviceGuide.tips.every((tip) => tip.trim()), `${kind} thiếu mẹo`)
  assert.ok(serviceGuide.tips.length >= 3 && serviceGuide.tips.length <= 5, `${kind} cần 3–5 mẹo`)
  assert.ok(serviceGuide.faqs.length >= 2 && serviceGuide.faqs.length <= 4, `${kind} cần 2–4 FAQ`)
}

console.log("destinations.test OK")
