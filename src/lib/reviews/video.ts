import type { ReviewVideo } from "@/types/destination"

/** Dùng chung client và server: form parse link ngay, server kiểm lại id trước khi lưu. */
export const MAX_REVIEW_VIDEOS = 3

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const TIKTOK_ID = /^\d{15,25}$/
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"])
const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com"])
const SHORT_TIKTOK_HOSTS = new Set(["vt.tiktok.com", "vm.tiktok.com"])

export function toUrl(input: string): URL | null {
  const raw = input.trim()
  // Khách hay dán thiếu "https://".
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(withScheme)
    return url.protocol === "https:" || url.protocol === "http:" ? url : null
  } catch {
    return null
  }
}

function video(platform: ReviewVideo["platform"], id: string | null | undefined): ReviewVideo | null {
  const candidate = { platform, id: id ?? "" }
  return isValidVideo(candidate) ? candidate : null
}

/** Link YouTube/TikTok đầy đủ → { platform, id }; link rút gọn TikTok trả null (xem isShortTiktok). */
export function parseVideoUrl(input: string): ReviewVideo | null {
  const url = toUrl(input)
  if (!url) return null
  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split("/").filter(Boolean)

  if (host === "youtu.be") return video("youtube", segments[0])
  if (YOUTUBE_HOSTS.has(host)) {
    if (segments[0] === "watch") return video("youtube", url.searchParams.get("v"))
    if (segments[0] === "shorts" || segments[0] === "embed") return video("youtube", segments[1])
    return null
  }
  if (TIKTOK_HOSTS.has(host)) {
    if (segments[0]?.startsWith("@") && segments[1] === "video") return video("tiktok", segments[2])
    if (segments[0] === "v") return video("tiktok", segments[1]?.replace(/\.html$/, ""))
  }
  return null
}

/** vt.tiktok.com/vm.tiktok.com không chứa id: server phải đọc chuyển hướng. */
export function isShortTiktok(input: string): boolean {
  const url = toUrl(input)
  return url !== null && SHORT_TIKTOK_HOSTS.has(url.hostname.toLowerCase())
}

export function isValidVideo(value: unknown): value is ReviewVideo {
  if (!value || typeof value !== "object") return false
  const { platform, id } = value as Record<string, unknown>
  if (typeof id !== "string") return false
  return (platform === "youtube" && YOUTUBE_ID.test(id)) || (platform === "tiktok" && TIKTOK_ID.test(id))
}
