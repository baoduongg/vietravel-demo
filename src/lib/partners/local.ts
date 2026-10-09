import { browserStorage } from "@/lib/journey/local"

const KEY = "explorer-partner-ids"

/** Id cửa hàng đã đăng ký trên trình duyệt này; mất đi thì chỉ mất danh sách tiện ích, đăng ký vẫn nằm trên server. */
export function readPartnerIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(browserStorage()?.getItem(KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

export function savePartnerId(id: string): void {
  try {
    browserStorage()?.setItem(KEY, JSON.stringify([id, ...readPartnerIds().filter((item) => item !== id)]))
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: đăng ký vẫn nằm trên server.
  }
}

const TOKEN_KEY = "explorer-partner-tokens"

function readTokens(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(browserStorage()?.getItem(TOKEN_KEY) ?? "{}")
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/** Mã sửa server cấp lúc đăng ký, chỉ có trên trình duyệt đã đăng ký; mất là không sửa được nữa. */
export function readPartnerToken(id: string): string | undefined {
  return readTokens()[id]
}

export function savePartnerToken(id: string, token: string): void {
  try {
    browserStorage()?.setItem(TOKEN_KEY, JSON.stringify({ ...readTokens(), [id]: token }))
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: đăng ký vẫn nằm trên server, chỉ mất quyền sửa.
  }
}

/** Sau khi xóa thương hiệu: bỏ id và mã sửa khỏi trình duyệt. */
export function forgetPartner(id: string): void {
  try {
    const tokens = readTokens()
    delete tokens[id]
    browserStorage()?.setItem(TOKEN_KEY, JSON.stringify(tokens))
    browserStorage()?.setItem(KEY, JSON.stringify(readPartnerIds().filter((item) => item !== id)))
  } catch {
    // Bộ nhớ bị chặn: id thừa chỉ khiến server trả rỗng cho nó.
  }
}
