export type Audience = "family" | "couple" | "friends"

export const AUDIENCE_LABEL: Record<Audience, string> = {
  family: "Gia đình",
  couple: "Cặp đôi",
  friends: "Bạn bè",
}

/** Thông tin hiển thị ở lưới điểm đến trên Home. */
export interface DestinationSummary {
  slug: string
  name: string
  caption: string
  imageUrl: string
  /** Chỉ điểm active mới có trang chi tiết. */
  active: boolean
}

/** Ghi công ảnh theo giấy phép Creative Commons (Wikimedia Commons). */
export interface PhotoCredit {
  author: string
  license: string
  /** Trang gốc của ảnh, nơi xem đầy đủ giấy phép. */
  url: string
}

/** Ảnh trong thư viện của trang điểm đến. */
export interface GalleryPhoto {
  src: string
  alt: string
  caption: string
  credit: PhotoCredit
}

/** Video YouTube nhúng; chỉ lưu id, người xem bấm mới tải trình phát. */
export interface VideoItem {
  id: string
  title: string
  channel: string
}

/** Một địa điểm vui chơi hoặc loại hình lưu trú, lọc được theo nhóm đi cùng. */
export interface Place {
  name: string
  /** Nhãn ngắn: hạng, khu vực. */
  tag: string
  blurb: string
  audiences: Audience[]
  imageUrl?: string
  /** Bắt buộc khi ảnh không thuộc Vietravel. */
  credit?: PhotoCredit
  tip?: string
}

export interface Dish {
  name: string
  blurb: string
  where: string
  /** Giá tham khảo, ghi rõ đơn vị tính. */
  price: string
  /** Nên ăn vào lúc nào. */
  bestTime: string
  imageUrl?: string
  /** Bắt buộc khi có ảnh. */
  credit?: PhotoCredit
}

export interface Route {
  from: string
  mode: string
  duration: string
  note: string
}

export interface Area {
  name: string
  blurb: string
}

export interface MonthInfo {
  label: string
  /** 1 = kém thuận lợi, 5 = đẹp nhất. */
  score: 1 | 2 | 3 | 4 | 5
  tempC: string
  rain: string
  advice: string
}

export interface ItineraryDay {
  day: number
  title: string
  items: { time: string; text: string }[]
}

export interface Review {
  nick: string
  trip: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
}

/** Review do khách gửi từ trang điểm đến, lưu ở server. */
export interface UserReview extends Review {
  id: string
  createdAt: string
}

/** Dữ liệu form gửi review; trip được server ghép từ companion và month. */
export interface ReviewInput {
  nick: string
  companion: string
  /** "YYYY-MM", bỏ trống nếu không nhớ. */
  month?: string
  rating: number
  text: string
}

export interface Faq {
  question: string
  answer: string
}

export interface CostRow {
  label: string
  range: string
}

export interface DestinationGuide {
  slug: string
  name: string
  tagline: string
  intro: string
  heroImageUrl: string
  coordinates: { lat: number; lon: number }
  /** Từ khóa (chữ thường) để lọc tour trong tours.json theo tên/vùng. */
  tourKeyword: string
  reasons: { title: string; text: string }[]
  /** Đúng 12 phần tử, T1 → T12. */
  months: MonthInfo[]
  routes: Route[]
  onIsland: { name: string; note: string }[]
  /** Ảnh sân bay kèm vài thông tin nhanh và lưu ý khi di chuyển. */
  airport: { photo: GalleryPhoto; facts: { label: string; value: string }[] }
  travelTips: string[]
  onIslandPhoto: GalleryPhoto
  areas: Area[]
  videos: VideoItem[]
  gallery: GalleryPhoto[]
  stays: Place[]
  dishes: Dish[]
  /** Ảnh lớn đầu khối ẩm thực và vài mẹo ăn uống. */
  foodPhoto: GalleryPhoto
  eatTips: string[]
  activities: Place[]
  itinerary: ItineraryDay[]
  costs: CostRow[]
  packing: string[]
  reviews: Review[]
  faqs: Faq[]
  links: { hotels: string; flights: string; tours: string }
}
