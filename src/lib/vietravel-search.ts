import { todayIso } from "@/data/tours"
import { MAX_QUERY_LENGTH } from "@/lib/vietravel-search-limits"
import type { Tour } from "@/types/tour"

/**
 * Tìm tour theo điểm đến bất kỳ ngay trên travel.com.vn (trang tìm kiếm của site, cùng nguồn với
 * scripts/scrape-tours.py) thay vì chỉ trong tours.json đã scrape sẵn.
 */

const BASE_URL = "https://travel.com.vn/"
const SEARCH_PAGE = "du-lich-vietravel.aspx"
const MAX_DEPARTURE_DATES = 4
const CACHE_SECONDS = 1800
const EMOJI = /[\u{1F300}-\u{1FAFF}☀-➿]/gu
const DURATION = /^(\d+)N(\d+)Đ/
const FLIGHT_CHUNK = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g

export { MAX_QUERY_LENGTH }

interface RawTour {
  pageCode?: string
  tourCode: string
  pageTitle?: string
  destination?: string
  tourName?: string
  departureName?: string
  departureDate: string
  listDepartureDate?: { date: string }[] | null
  dayStayText?: string
  durationTime?: string
  priceFinal?: number
  discountPrice?: number
  salePrice?: number
  tourLineName?: string
  transportName?: string
  rating?: number | null
  imgUrl?: string
  imageUrl?: string
  linkShare?: string
  tourUrl?: string
  pageId?: number
}

/** Link trang kết quả tìm kiếm trên travel.com.vn, dùng cho nút "Xem tất cả". */
export function searchPageUrl(query: string): string {
  return `${BASE_URL}${SEARCH_PAGE}?${new URLSearchParams({ text: query })}`
}

/** Next.js của travel.com.vn nhúng dữ liệu trang vào các chuỗi self.__next_f.push(...). */
function flightData(html: string): string {
  let text = ""
  for (const [, chunk] of html.matchAll(FLIGHT_CHUNK)) {
    try {
      text += JSON.parse(`"${chunk}"`) as string
    } catch {
      continue
    }
  }
  return text
}

function extractRawTours(text: string): RawTour[] {
  const tours: RawTour[] = []
  let start = text.indexOf('{"tourId":"')
  while (start !== -1) {
    let depth = 0
    for (let end = start; end < text.length; end++) {
      if (text[end] === "{") depth++
      else if (text[end] === "}" && --depth === 0) {
        try {
          tours.push(JSON.parse(text.slice(start, end + 1)) as RawTour)
        } catch {
          // Bỏ qua khối không phải JSON hợp lệ.
        }
        break
      }
    }
    start = text.indexOf('{"tourId":"', start + 1)
  }
  return tours
}

function cleanTitle(raw: string): { name: string; highlight: string } {
  const title = raw
    .replace(EMOJI, "")
    .replace(/^\s*(\*+|siêu\s*sale\s*)/i, "")
    .replaceAll("–", "-")
    .replaceAll("“", "")
    .replaceAll("”", "")
    .replaceAll("||", " | ")
    .replace(/\s+/g, " ")
  const parts = title
    .trim()
    .replace(/^[\s|-]+|[\s|-]+$/g, "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
  return { name: parts[0] ?? "", highlight: parts.slice(1).join(" | ") }
}

function toTour(raw: RawTour, today: string): Tour | null {
  const code = raw.pageCode || raw.tourCode.split("-")[0]
  const { name, highlight } = cleanTitle(raw.pageTitle || raw.destination || "")
  const duration = DURATION.exec(raw.dayStayText || raw.durationTime || "")
  const dates = new Set((raw.listDepartureDate ?? []).map((item) => item.date.slice(0, 10)))
  dates.add(raw.departureDate.slice(0, 10))
  const departureDates = [...dates]
    .filter((date) => date >= today)
    .sort()
    .slice(0, MAX_DEPARTURE_DATES)
  const priceVnd = raw.priceFinal || raw.discountPrice || raw.salePrice || 0
  const imageUrl = raw.imgUrl || raw.imageUrl || ""
  const url = raw.linkShare || (raw.tourUrl && raw.pageId ? `${BASE_URL}chuong-trinh/${raw.tourUrl}-pid-${raw.pageId}` : "")
  if (!name || !url || !imageUrl || priceVnd <= 0 || departureDates.length === 0) return null

  return {
    code,
    name,
    highlight,
    region: raw.tourName?.trim() ?? "",
    scope: code.startsWith("ND") ? "domestic" : "international",
    departureCity: raw.departureName ?? "",
    departureDates,
    days: duration ? Number(duration[1]) : 1,
    nights: duration ? Number(duration[2]) : 0,
    priceVnd,
    tourLine: raw.tourLineName ?? "",
    transport: raw.transportName ?? "",
    rating: raw.rating ?? null,
    imageUrl,
    url,
  }
}

/** HTML trang tìm kiếm → tour còn lịch khởi hành, mỗi mã tour một thẻ, giữ thứ tự của travel.com.vn. */
export function parseSearchHtml(html: string, today: string = todayIso()): Tour[] {
  const byCode = new Map<string, Tour>()
  for (const raw of extractRawTours(flightData(html))) {
    if (!raw.tourCode || !raw.departureDate) continue
    const tour = toTour(raw, today)
    if (tour && !tour.code.startsWith("FM") && !byCode.has(tour.code)) byCode.set(tour.code, tour)
  }
  return [...byCode.values()]
}

export async function searchVietravelTours(query: string): Promise<Tour[]> {
  const response = await fetch(searchPageUrl(query), {
    headers: { "User-Agent": "Mozilla/5.0 Chrome/130" },
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`travel.com.vn trả về ${response.status}`)
  return parseSearchHtml(await response.text())
}
