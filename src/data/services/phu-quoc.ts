import { phuQuoc } from "@/data/destinations/phu-quoc"
import type { ChildRate, ServiceItem } from "@/types/journey"

/** Trẻ < 2 tuổi 10%, < 12 tuổi 75%: mức phổ biến của hãng bay nội địa (mock). */
const FLIGHT_CHILD: ChildRate[] = [
  { underAge: 2, rate: 0.1 },
  { underAge: 12, rate: 0.75 },
]

/** Trẻ < 1 tuổi miễn phí, < 12 tuổi 75% (mock). */
export const ACTIVITY_CHILD: ChildRate[] = [
  { underAge: 1, rate: 0 },
  { underAge: 12, rate: 0.75 },
]

function mock(item: Omit<ServiceItem, "destinationSlug" | "bookUrl" | "mock">): ServiceItem {
  return { ...item, destinationSlug: phuQuoc.slug, bookUrl: phuQuoc.links.tours, mock: true }
}

/** Dữ liệu mẫu cho bản demo: tên khách sạn tự đặt, giá tham khảo. Thay bằng API Hub khi có. */
export const phuQuocServices: ServiceItem[] = [
  mock({ id: "hotel-pq-01", kind: "hotel", name: "Homestay Gió Biển", tag: "Tiết kiệm · Ông Lang", blurb: "Phòng gọn gàng, đi bộ 3 phút ra biển, hợp nhóm bạn trẻ.", priceVnd: 650000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-02", kind: "hotel", name: "Khách sạn Phố Đêm", tag: "Tầm trung · Dương Đông", blurb: "Gần chợ đêm và quán ăn, thuê xe máy ngay tại sảnh.", priceVnd: 1100000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-03", kind: "hotel", name: "Khách sạn Nhà Mình", tag: "Tầm trung · phòng liên thông", blurb: "Phòng liên thông cho gia đình, bữa sáng có thực đơn trẻ em.", priceVnd: 1450000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-04", kind: "hotel", name: "Resort Hoàng Hôn", tag: "Cao cấp · Bãi Trường", blurb: "Bãi biển riêng, hồ bơi lớn, phòng hướng biển ngắm hoàng hôn.", priceVnd: 2900000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-05", kind: "hotel", name: "Resort Rừng Biển", tag: "Cao cấp · Bắc đảo", blurb: "Gần VinWonders và Safari, có câu lạc bộ trẻ em và hồ bơi nông.", priceVnd: 3400000, priceUnit: "per_room_night" }),
  mock({ id: "hotel-pq-06", kind: "hotel", name: "Villa Hồ Bơi Riêng", tag: "Sang trọng · Nam đảo", blurb: "Villa riêng tư có hồ bơi, bữa sáng phục vụ tại villa.", priceVnd: 6800000, priceUnit: "per_room_night" }),
  mock({ id: "flight-sgn-pqc", kind: "flight", name: "Vé khứ hồi TP.HCM ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 1 giờ bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 2200000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-han-pqc", kind: "flight", name: "Vé khứ hồi Hà Nội ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 2 giờ 10 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 3600000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-dad-pqc", kind: "flight", name: "Vé khứ hồi Đà Nẵng ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 1 giờ 45 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 3100000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "flight-vca-pqc", kind: "flight", name: "Vé khứ hồi Cần Thơ ⇄ Phú Quốc", tag: "Khứ hồi · khoảng 50 phút bay", blurb: "Giá tham khảo hạng phổ thông, đã gồm 7kg hành lý xách tay.", priceVnd: 1700000, priceUnit: "per_person", childRates: FLIGHT_CHILD }),
  mock({ id: "vehicle-pq-01", kind: "vehicle", name: "Thuê xe máy tay ga", tag: "Tự lái · giao tại khách sạn", blurb: "Kèm 2 mũ bảo hiểm. Cần bằng lái xe máy.", priceVnd: 150000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-02", kind: "vehicle", name: "Ô tô 4 chỗ có tài xế", tag: "Có tài xế · 10 giờ/ngày", blurb: "Đi Nam đảo, Bắc đảo theo lịch trình của Quý khách.", priceVnd: 1200000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-03", kind: "vehicle", name: "Ô tô 7 chỗ có tài xế", tag: "Có tài xế · 10 giờ/ngày", blurb: "Rộng cho gia đình có trẻ nhỏ, có thể yêu cầu ghế trẻ em.", priceVnd: 1500000, priceUnit: "per_day" }),
  mock({ id: "vehicle-pq-04", kind: "vehicle", name: "Đưa đón sân bay 2 chiều", tag: "Xe 7 chỗ · sân bay ⇄ khách sạn", blurb: "Tài xế đón tại cửa ra, hỗ trợ hành lý.", priceVnd: 500000, priceUnit: "per_booking" }),
]

/** Giá vé mock cho từng mục trong phuQuoc.activities, khóa là tên mục. 0 = vào cửa miễn phí. */
export const phuQuocActivityPrices: Record<string, number> = {
  "Cáp treo vượt biển và Hòn Thơm": 650000,
  "Thị trấn Hoàng Hôn và Kiss Bridge": 0,
  "VinWonders Phú Quốc": 950000,
  "Vinpearl Safari": 650000,
  "Grand World": 0,
  "Bãi Sao": 0,
  "Lặn ngắm san hô và câu mực đêm": 750000,
  "Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc": 0,
  "Chợ đêm Phú Quốc": 0,
}
