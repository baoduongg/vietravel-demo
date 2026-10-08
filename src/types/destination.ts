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

/** Một địa điểm vui chơi hoặc loại hình lưu trú, lọc được theo nhóm đi cùng. */
export interface Place {
  name: string
  /** Nhãn ngắn: hạng, khu vực. */
  tag: string
  blurb: string
  audiences: Audience[]
  imageUrl?: string
  tip?: string
}

export interface Dish {
  name: string
  blurb: string
  where: string
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
  areas: Area[]
  stays: Place[]
  dishes: Dish[]
  activities: Place[]
  itinerary: ItineraryDay[]
  costs: CostRow[]
  packing: string[]
  reviews: Review[]
  faqs: Faq[]
  links: { hotels: string; flights: string; tours: string }
}
