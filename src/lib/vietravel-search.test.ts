import assert from "node:assert/strict"
import { parseSearchHtml, searchPageUrl } from "./vietravel-search"

function rawTour(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    tourId: "c01eab7c",
    pageCode: "NNHAN822",
    tourCode: "NNHAN822-008-040227EY-V",
    pageTitle: "🔥 Dubai – Abu Dhabi | Bay thẳng Emirates",
    tourName: "Tây Á ",
    departureName: "Hà Nội",
    departureDate: "2027-02-25T07:40:00",
    listDepartureDate: [{ date: "2026-10-01T00:00:00" }, { date: "2027-02-04T00:00:00" }],
    dayStayText: "5N4Đ",
    priceFinal: 29990000,
    tourLineName: "Tour tiêu chuẩn",
    transportName: "Máy bay",
    rating: 4.7,
    imgUrl: "https://s3-cmc.travel.com.vn/dubai.webp",
    linkShare: "https://travel.com.vn/chuong-trinh/dubai-pid-4832",
    ...overrides,
  }
}

/** Giả lập cách Next.js nhúng dữ liệu: JSON bị escape thành chuỗi trong self.__next_f.push. */
function page(...tours: Record<string, unknown>[]): string {
  const payload = JSON.stringify(`3:{"items":${JSON.stringify(tours)}}`)
  return `<script>self.__next_f.push([1,${payload}])</script>`
}

const today = "2026-10-09"
const [dubai, ...rest] = parseSearchHtml(
  page(
    rawTour(),
    rawTour({ tourCode: "NNHAN822-009-080227EY-V" }),
    rawTour({ pageCode: "NDSGN1", tourCode: "NDSGN1-001", linkShare: undefined, tourUrl: "da-lat", pageId: 7 }),
    rawTour({ pageCode: "NNPAST", departureDate: "2026-01-01T00:00:00", listDepartureDate: [] }),
    rawTour({ pageCode: "NNFREE", priceFinal: 0 }),
    rawTour({ pageCode: "FMCOMBO" }),
  ),
  today,
)

assert.equal(dubai.code, "NNHAN822")
assert.equal(dubai.name, "Dubai - Abu Dhabi")
assert.equal(dubai.highlight, "Bay thẳng Emirates")
assert.equal(dubai.region, "Tây Á")
assert.equal(dubai.scope, "international")
assert.deepEqual(dubai.departureDates, ["2027-02-04", "2027-02-25"])
assert.equal(dubai.days, 5)
assert.equal(dubai.nights, 4)
assert.equal(dubai.priceVnd, 29990000)
assert.equal(dubai.url, "https://travel.com.vn/chuong-trinh/dubai-pid-4832")

// Trùng mã bị gộp; tour hết lịch, chưa có giá hoặc là combo FM bị loại.
assert.equal(rest.length, 1)
assert.equal(rest[0].scope, "domestic")
assert.equal(rest[0].url, "https://travel.com.vn/chuong-trinh/da-lat-pid-7")

assert.deepEqual(parseSearchHtml("<html></html>", today), [])
assert.equal(searchPageUrl("Nhật Bản"), "https://travel.com.vn/du-lich-vietravel.aspx?text=Nh%E1%BA%ADt+B%E1%BA%A3n")

console.log("vietravel-search: ok")
