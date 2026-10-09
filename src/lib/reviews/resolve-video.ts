import { isShortTiktok, parseVideoUrl, toUrl } from "@/lib/reviews/video"
import type { ReviewVideo } from "@/types/destination"

/**
 * Link → video. Link rút gọn TikTok (vt./vm.tiktok.com) được mở một lần để đọc header Location;
 * chỉ gọi đúng hai host đó nên không thể bị lợi dụng gọi địa chỉ tùy ý.
 */
export async function resolveVideoUrl(input: string, fetchImpl: typeof fetch = fetch): Promise<ReviewVideo | null> {
  const direct = parseVideoUrl(input)
  if (direct || !isShortTiktok(input)) return direct
  const url = toUrl(input)
  if (!url) return null
  url.protocol = "https:"
  try {
    const response = await fetchImpl(url.href, { redirect: "manual", signal: AbortSignal.timeout(5000) })
    const location = response.headers.get("location")
    return location ? parseVideoUrl(location) : null
  } catch (error) {
    console.error("[reviews] không đọc được link TikTok rút gọn", error)
    return null
  }
}
