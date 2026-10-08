export type ServiceKind = "hotel" | "flight" | "vehicle" | "activity" | "tour"
export type PriceUnit = "per_person" | "per_room_night" | "per_day" | "per_booking"
export type JourneyRole = "edit" | "view"

export const SERVICE_KINDS: ServiceKind[] = ["hotel", "flight", "vehicle", "activity", "tour"]

export const SERVICE_KIND_LABEL: Record<ServiceKind, string> = {
  hotel: "Khách sạn",
  flight: "Vé máy bay",
  vehicle: "Thuê xe",
  activity: "Vui chơi",
  tour: "Tour",
}

export const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  per_person: "/ khách",
  per_room_night: "/ phòng / đêm",
  per_day: "/ ngày",
  per_booking: "/ lượt",
}

export const QUANTITY_LABEL: Record<PriceUnit, string> = {
  per_person: "Số khách",
  per_room_night: "Số phòng",
  per_day: "Số xe",
  per_booking: "Số lượt",
}

export function isServiceKind(value: unknown): value is ServiceKind {
  return typeof value === "string" && (SERVICE_KINDS as string[]).includes(value)
}

export interface ChildRate {
  /** Áp dụng cho trẻ có tuổi < underAge. Bậc đầu tiên khớp được dùng. */
  underAge: number
  /** 0 = miễn phí, 0.75 = 75% giá người lớn. */
  rate: number
}

export interface ServiceItem {
  id: string
  kind: ServiceKind
  destinationSlug: string
  name: string
  tag: string
  blurb: string
  /** Chỉ tour có ảnh (ảnh S3 của Vietravel). */
  imageUrl?: string
  priceVnd: number
  priceUnit: PriceUnit
  /** Sắp tăng dần theo underAge. Thiếu thì trẻ em trả như người lớn. */
  childRates?: ChildRate[]
  bookUrl: string
  /** true: dữ liệu mockup, giao diện hiện nhãn "Giá tham khảo (demo)". */
  mock: boolean
}

export type ServiceSnapshot = Pick<
  ServiceItem,
  "name" | "kind" | "tag" | "priceVnd" | "priceUnit" | "childRates" | "imageUrl" | "bookUrl" | "mock"
>

export interface Travelers {
  adults: number
  childAges: number[]
}

export interface JourneyMember {
  id: string
  name: string
  joinedAt: string
}

export interface JourneyComment {
  id: string
  memberId: string
  text: string
  at: string
}

export interface JourneyItem {
  id: string
  serviceId: string
  /** Chụp lại lúc thêm; danh mục đổi sau đó không làm sai kế hoạch cũ. */
  snapshot: ServiceSnapshot
  /** null = "Đang cân nhắc"; 1..nights+1 = ngày trong chuyến. */
  day: number | null
  order: number
  /** null = tự tính theo số người (xem defaultQuantity). */
  quantity: number | null
  addedBy: string
  votes: Record<string, 1 | -1>
  comments: JourneyComment[]
}

export interface Journey {
  id: string
  version: number
  title: string
  destinationSlug: string
  startDate: string | null
  nights: number
  travelers: Travelers
  editToken: string
  viewToken: string
  members: JourneyMember[]
  items: JourneyItem[]
  createdAt: string
  updatedAt: string
}

/** Bản gửi xuống trình duyệt: người có link chỉ xem không nhận editToken. */
export type PublicJourney = Omit<Journey, "editToken"> & { editToken?: string }

export type JourneyOp =
  | { type: "join"; name: string }
  | { type: "updateInfo"; title?: string; startDate?: string | null; nights?: number; travelers?: Travelers }
  | { type: "addItem"; serviceId: string }
  | { type: "removeItem"; itemId: string }
  | { type: "moveItem"; itemId: string; day: number | null; order?: number }
  | { type: "setQuantity"; itemId: string; quantity: number | null }
  | { type: "vote"; itemId: string; value: 1 | -1 }
  | { type: "comment"; itemId: string; text: string }

export interface CreateJourneyRequest {
  title: string
  destinationSlug: string
  startDate: string | null
  nights: number
  travelers: Travelers
  memberName: string
}

export type JourneyInfoValues = Omit<CreateJourneyRequest, "destinationSlug">

export interface CreateJourneyResponse {
  journey: PublicJourney
  memberId: string
}

export interface GetJourneyResponse {
  journey: PublicJourney
  role: JourneyRole
}

export interface JourneyOpRequest {
  token: string
  memberId?: string
  op: JourneyOp
}

export interface JourneyOpResponse {
  journey: PublicJourney
  /** Chỉ có khi op là join: id thành viên vừa tạo. */
  memberId?: string
}
