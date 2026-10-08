import type { Tour } from "@/types/tour"

/** Bối cảnh nền của sân khấu, đổi theo điểm đến đang được nhắc tới. */
export type SceneTheme = "bay" | "mountain" | "beach" | "heritage" | "world"

export const DEFAULT_SCENE: SceneTheme = "bay"

/** Màu nhấn dịu của từng cảnh, dùng nhuộm nền trang và quầng sáng sau mascot. */
export const SCENE_TINT: Record<SceneTheme, string> = {
  bay: "#d9eeff",
  mountain: "#e4defa",
  beach: "#ffdcbf",
  heritage: "#fbe5b0",
  world: "#d8dfff",
}

const BAY = /hạ long|ninh bình|tràng an|bái đính|cát bà|hải phòng|đồng bằng sông hồng/
const MOUNTAIN = /sapa|sa pa|fansipan|mù cang chải|mộc châu|tây bắc|hà giang|đà lạt|lâm đồng|cao bằng|yên bái/
const HERITAGE = /hội an|huế|hà nội|phố cổ|cố đô|bắc trung bộ|quảng bình|phong nha/
const BEACH = /phú quốc|nha trang|côn đảo|quy nhơn|phú yên|phan thiết|mũi né|vũng tàu|biển|đảo|nam trung bộ|tây nam bộ|đông nam bộ|đà nẵng/

export function sceneForTour(tour: Tour): SceneTheme {
  if (tour.scope === "international") return "world"
  const text = `${tour.name} ${tour.region}`.toLowerCase()
  if (BAY.test(text)) return "bay"
  if (MOUNTAIN.test(text)) return "mountain"
  if (HERITAGE.test(text)) return "heritage"
  if (BEACH.test(text)) return "beach"
  return DEFAULT_SCENE
}
