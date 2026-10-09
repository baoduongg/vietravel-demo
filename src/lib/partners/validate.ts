import {
  hasPerPersonPrice,
  HOTEL_TIERS,
  PARTNER_KIND_SERVICE,
  PARTNER_KINDS,
  type ChildPolicy,
  type PartnerInfo,
  type PartnerInput,
  type PartnerKind,
  type PartnerProduct,
} from "@/types/partner"

/** Dùng chung client và server để form chặn trước cùng giới hạn với API. */
export const PARTNER_LIMITS = {
  name: 80,
  address: 160,
  url: 200,
  description: 500,
  /** Ngắn như mô tả dịch vụ mẫu: một câu hiện 2 dòng trên thẻ. */
  productDescription: 120,
  area: 60,
  maxProducts: 20,
  minPriceVnd: 1000,
  maxPriceVnd: 1_000_000_000,
  /** Data URL sau khi trình duyệt nén (~960px JPEG thường dưới 300KB). */
  imageChars: 2_000_000,
} as const

const PHONE = /^(\+84|0)\d{9,10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type ParsedPartner = { ok: true; partner: PartnerInput } | { ok: false; error: string }
export type ParsedInfo = { ok: true; info: PartnerInfo } | { ok: false; error: string }
export type ParsedProducts = { ok: true; products: PartnerProduct[] } | { ok: false; error: string }

function text(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/[ \t]+/g, " ") : ""
}

/** Chỉ nhận http(s): link này thành nút "Đặt" trong kế hoạch, không để lọt javascript:. */
function isWebUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

/**
 * Kiểm tra body form đăng ký đối tác, trả dữ liệu đã chuẩn hóa hoặc thông báo lỗi tiếng Việt.
 * Ảnh kiểm tra riêng bằng parseImage. destinationSlug và area chỉ được kiểm tra hình thức; route phải gọi destinationError.
 */
export function parsePartnerInput(body: unknown): ParsedPartner {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu đăng ký không hợp lệ." }
  const input = body as Record<string, unknown>

  const kind = PARTNER_KINDS.find((item) => item === input.kind)
  if (!kind) return { ok: false, error: "Vui lòng chọn loại hình kinh doanh." }

  const info = parseInfo(input, kind)
  if (!info.ok) return info

  const contactName = text(input.contactName)
  if (!contactName || contactName.length > PARTNER_LIMITS.name) return { ok: false, error: "Vui lòng nhập tên người liên hệ." }
  const phone = text(input.phone).replace(/[\s.-]/g, "")
  if (!PHONE.test(phone)) return { ok: false, error: "Số điện thoại không hợp lệ." }
  const email = text(input.email)
  if (email && (!EMAIL.test(email) || email.length > 120)) return { ok: false, error: "Email không hợp lệ." }

  const products = parseProducts(input.products, kind)
  if (!products.ok) return products

  return { ok: true, partner: { ...info.info, kind, products: products.products, contactName, phone, email } }
}

/** Thông tin thương hiệu, dùng cho đăng ký mới và khi chủ cửa hàng sửa lại (loại hình lấy từ bản ghi). */
export function parseInfo(body: unknown, kind: PartnerKind): ParsedInfo {
  if (!body || typeof body !== "object") return { ok: false, error: "Dữ liệu không hợp lệ." }
  const input = body as Record<string, unknown>

  const brand = text(input.brand)
  if (!brand) return { ok: false, error: "Vui lòng nhập tên thương hiệu." }
  if (brand.length > PARTNER_LIMITS.name) return { ok: false, error: `Tên thương hiệu tối đa ${PARTNER_LIMITS.name} ký tự.` }

  const destinationSlug = text(input.destinationSlug)
  if (!destinationSlug) return { ok: false, error: "Vui lòng chọn điểm đến." }

  const area = text(input.area)
  if (!area || area.length > PARTNER_LIMITS.area) return { ok: false, error: "Vui lòng chọn khu vực." }

  const tier = kind === "Khách sạn" ? HOTEL_TIERS.find((item) => item === input.tier) : undefined
  if (kind === "Khách sạn" && !tier) return { ok: false, error: "Vui lòng chọn phân khúc khách sạn." }

  let childPolicy: ChildPolicy | undefined
  if (hasPerPersonPrice(kind) && input.childPolicy !== undefined && input.childPolicy !== null) {
    const { freeUnderAge, childPercent } = input.childPolicy as Record<string, unknown>
    if (!Number.isInteger(freeUnderAge) || (freeUnderAge as number) < 0 || (freeUnderAge as number) > 12) {
      return { ok: false, error: "Tuổi miễn phí cho trẻ phải từ 0 đến 12." }
    }
    if (!Number.isInteger(childPercent) || (childPercent as number) < 0 || (childPercent as number) > 100) {
      return { ok: false, error: "Giá trẻ em phải từ 0 đến 100% giá người lớn." }
    }
    childPolicy = { freeUnderAge: freeUnderAge as number, childPercent: childPercent as number }
  }

  const address = text(input.address)
  if (!address) return { ok: false, error: "Vui lòng nhập địa chỉ." }
  if (address.length > PARTNER_LIMITS.address) return { ok: false, error: `Địa chỉ tối đa ${PARTNER_LIMITS.address} ký tự.` }

  const website = text(input.website)
  if (website && (website.length > PARTNER_LIMITS.url || !isWebUrl(website))) return { ok: false, error: "Website phải là link bắt đầu bằng https://" }

  const description = text(input.description)
  if (description.length > PARTNER_LIMITS.description) return { ok: false, error: `Giới thiệu tối đa ${PARTNER_LIMITS.description} ký tự.` }

  return { ok: true, info: { brand, destinationSlug, area, tier, childPolicy, address, website, description } }
}

const IMAGE_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/

/** Ảnh đại diện gửi kèm dạng data URL; undefined nghĩa là không gửi ảnh (giữ ảnh cũ). */
export function parseImage(value: unknown): { ok: true; image?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") return { ok: true }
  if (typeof value !== "string" || !IMAGE_DATA_URL.test(value)) return { ok: false, error: "Ảnh phải là JPEG, PNG hoặc WebP." }
  if (value.length > PARTNER_LIMITS.imageChars) return { ok: false, error: "Ảnh quá lớn, vui lòng chọn ảnh khác." }
  return { ok: true, image: value }
}

/** Danh sách sản phẩm, dùng cho cả đăng ký mới và trang chi tiết. Sản phẩm mới (chưa có id) được cấp id. */
export function parseProducts(raw: unknown, kind: PartnerKind): ParsedProducts {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: "Vui lòng thêm ít nhất một sản phẩm hoặc dịch vụ." }
  if (raw.length > PARTNER_LIMITS.maxProducts) return { ok: false, error: `Tối đa ${PARTNER_LIMITS.maxProducts} sản phẩm.` }
  const { units } = PARTNER_KIND_SERVICE[kind]
  const products: PartnerProduct[] = []
  for (const [index, value] of raw.entries()) {
    const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>
    const label = `Sản phẩm ${index + 1}`
    const name = text(item.name)
    if (!name || name.length > PARTNER_LIMITS.name) return { ok: false, error: `${label}: vui lòng nhập tên (tối đa ${PARTNER_LIMITS.name} ký tự).` }
    const priceVnd = item.priceVnd
    if (typeof priceVnd !== "number" || !Number.isInteger(priceVnd) || priceVnd < PARTNER_LIMITS.minPriceVnd || priceVnd > PARTNER_LIMITS.maxPriceVnd) {
      return { ok: false, error: `${label}: vui lòng nhập giá (từ ${PARTNER_LIMITS.minPriceVnd.toLocaleString("vi-VN")}đ).` }
    }
    const unit = units.find((option) => option === item.unit)
    if (!unit) return { ok: false, error: `${label}: đơn vị giá không hợp lệ.` }
    const description = text(item.description)
    if (description.length > PARTNER_LIMITS.productDescription) return { ok: false, error: `${label}: mô tả tối đa ${PARTNER_LIMITS.productDescription} ký tự.` }
    const id = typeof item.id === "string" && UUID.test(item.id) && !products.some((product) => product.id === item.id) ? item.id : crypto.randomUUID()
    products.push({ id, name, priceVnd, unit, description })
  }
  return { ok: true, products }
}
