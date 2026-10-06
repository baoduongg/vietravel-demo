import assert from "node:assert/strict"
import { requestWithSaydiRefresh } from "./saydi-auth.ts"

const calls: Array<{ url: string; init?: RequestInit }> = []
const originalFetch = globalThis.fetch
let responses: Response[] = []
globalThis.fetch = async (input, init) => {
  calls.push({ url: String(input), init })
  return responses.shift()!
}

try {
  responses = [new Response(null, { status: 401 })]
  const withoutRefresh = await requestWithSaydiRefresh("old-access", "", "https://voice.saydi.ai/api/tts", { method: "POST" })
  assert.equal(withoutRefresh.response.status, 401)
  assert.equal(calls.length, 1)

  calls.length = 0
  responses = [
    new Response(null, { status: 401 }),
    Response.json({ access_token: "fresh-access", refresh_token: "fresh-refresh" }),
    new Response("audio", { status: 200, headers: { "content-type": "audio/mpeg" } }),
  ]
  const result = await requestWithSaydiRefresh("old-access", "old-refresh", "https://voice.saydi.ai/api/tts", {
    method: "POST",
    headers: { Authorization: "Bearer old-access" },
    body: "tts-payload",
  })
  assert.equal(result.response.status, 200)
  assert.equal(result.accessToken, "fresh-access")
  assert.equal(result.refreshToken, "fresh-refresh")
  assert.equal(calls.length, 3)
  assert.equal(calls[1].url, "https://voice.saydi.ai/api/auth/refresh")
  assert.equal(JSON.parse(String(calls[1].init?.body)).refresh_token, "old-refresh")
  assert.equal(new Headers(calls[2].init?.headers).get("Authorization"), "Bearer fresh-access")

  calls.length = 0
  responses = [new Response("ok", { status: 200 })]
  const afterRefresh = await requestWithSaydiRefresh("old-access", "old-refresh", "https://voice.saydi.ai/api/tts", { method: "POST" })
  assert.equal(afterRefresh.response.status, 200)
  assert.equal(new Headers(calls[0].init?.headers).get("Authorization"), "Bearer fresh-access")
} finally {
  globalThis.fetch = originalFetch
}
