const SAYDI_REFRESH_URL = "https://voice.saydi.ai/api/auth/refresh"

type TokenResponse = {
  access_token: string
  refresh_token?: string
}

let cachedAccessToken: string | undefined
let cachedRefreshToken: string | undefined
let refreshInFlight: Promise<TokenResponse | null> | undefined

async function refreshSaydiToken(refreshToken: string): Promise<TokenResponse | null> {
  try {
    const response = await fetch(SAYDI_REFRESH_URL, {
      method: "POST",
      headers: { Accept: "*/*", "Content-Type": "application/json", "x-omnivoice-client": "web" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    const tokens = (await response.json()) as TokenResponse
    return typeof tokens.access_token === "string" && tokens.access_token ? tokens : null
  } catch {
    return null
  }
}

export async function requestWithSaydiRefresh(
  accessToken: string,
  refreshToken: string,
  url: string,
  init: RequestInit,
): Promise<{ response: Response; accessToken: string; refreshToken: string }> {
  const activeAccessToken = cachedAccessToken ?? accessToken
  const activeRefreshToken = cachedRefreshToken ?? refreshToken
  const firstHeaders = new Headers(init.headers)
  firstHeaders.set("Authorization", `Bearer ${activeAccessToken}`)
  const response = await fetch(url, { ...init, headers: firstHeaders })
  if ((response.status !== 401 && response.status !== 403) || !activeRefreshToken) {
    return { response, accessToken: activeAccessToken, refreshToken: activeRefreshToken }
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshSaydiToken(activeRefreshToken)
  }
  const tokens = await refreshInFlight
  refreshInFlight = undefined
  if (!tokens) return { response, accessToken: activeAccessToken, refreshToken: activeRefreshToken }

  cachedAccessToken = tokens.access_token
  cachedRefreshToken = tokens.refresh_token ?? activeRefreshToken
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${cachedAccessToken}`)
  const retry = await fetch(url, { ...init, headers })
  return { response: retry, accessToken: cachedAccessToken, refreshToken: cachedRefreshToken }
}
