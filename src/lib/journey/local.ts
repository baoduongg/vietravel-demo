import type { JourneyRole } from "@/types/journey"

/** Kế hoạch đã mở trên trình duyệt này: danh sách tiện ích, mất đi cũng không mất dữ liệu kế hoạch. */
export interface SavedJourney {
  id: string
  token: string
  title: string
  role: JourneyRole
  /** Có khi đã nhập tên trên link sửa. */
  memberId?: string
  savedAt: string
}

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">

const KEY = "explorer-journeys"

/** localStorage có thể ném lỗi (chế độ riêng tư, chặn dữ liệu trang); khi đó coi như không có. */
export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function isSaved(value: unknown): value is SavedJourney {
  if (typeof value !== "object" || value === null) return false
  const { id, token, title, role, memberId } = value as Record<string, unknown>
  return (
    typeof id === "string" &&
    typeof token === "string" &&
    typeof title === "string" &&
    (role === "edit" || role === "view") &&
    (memberId === undefined || typeof memberId === "string")
  )
}

export function readSaved(storage: KeyValueStorage | null = browserStorage()): SavedJourney[] {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(KEY) ?? "[]")
    return Array.isArray(parsed) && parsed.every(isSaved) ? parsed : []
  } catch {
    return []
  }
}

/** Ghi hoặc cập nhật theo id, đưa lên đầu. Đã có link sửa thì không hạ xuống link xem; giữ memberId cũ nếu bản mới không có. */
export function saveJourney(
  entry: Omit<SavedJourney, "savedAt">,
  storage: KeyValueStorage | null = browserStorage(),
  now: Date = new Date(),
): SavedJourney[] {
  const list = readSaved(storage)
  const existing = list.find((item) => item.id === entry.id)
  const keepEdit = existing !== undefined && existing.role === "edit" && entry.role === "view"
  const merged: SavedJourney = {
    id: entry.id,
    title: entry.title,
    token: keepEdit ? existing.token : entry.token,
    role: keepEdit ? "edit" : entry.role,
    memberId: entry.memberId ?? existing?.memberId,
    savedAt: now.toISOString(),
  }
  const next = [merged, ...list.filter((item) => item.id !== entry.id)]
  try {
    storage?.setItem(KEY, JSON.stringify(next))
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: chỉ mất danh sách tiện ích, kế hoạch vẫn nằm trên server.
  }
  return next
}
