import assert from "node:assert/strict"

import { resolveVideoUrl } from "@/lib/reviews/resolve-video"

const FULL = "https://www.tiktok.com/@vietravel/video/7312345678901234567?_r=1"
const tt = { platform: "tiktok", id: "7312345678901234567" }

function fakeFetch(location: string | null, calls: string[] = []): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push(String(input))
    assert.equal(init?.redirect, "manual")
    return new Response(null, { status: location ? 301 : 200, headers: location ? { location } : {} })
  }) as typeof fetch
}

async function main(): Promise<void> {
  // Link đầy đủ: không gọi mạng.
  const calls: string[] = []
  assert.deepEqual(await resolveVideoUrl("https://youtu.be/dQw4w9WgXcQ", fakeFetch(null, calls)), { platform: "youtube", id: "dQw4w9WgXcQ" })
  assert.equal(calls.length, 0)

  // Link rút gọn: đọc Location, chỉ gọi đúng host rút gọn.
  const shortCalls: string[] = []
  assert.deepEqual(await resolveVideoUrl(" vt.tiktok.com/ZSabc123/ ", fakeFetch(FULL, shortCalls)), tt)
  assert.deepEqual(shortCalls, ["https://vt.tiktok.com/ZSabc123/"])

  // Chuyển hướng về link không phải video, không có Location, hoặc lỗi mạng: null.
  assert.equal(await resolveVideoUrl("https://vt.tiktok.com/ZSabc123/", fakeFetch("https://www.tiktok.com/")), null)
  assert.equal(await resolveVideoUrl("https://vt.tiktok.com/ZSabc123/", fakeFetch(null)), null)
  const failing = (async () => {
    throw new Error("timeout")
  }) as typeof fetch
  assert.equal(await resolveVideoUrl("https://vt.tiktok.com/ZSabc123/", failing), null)

  // Host khác không bao giờ bị gọi.
  const evilCalls: string[] = []
  assert.equal(await resolveVideoUrl("https://evil.com/ZSabc123", fakeFetch(FULL, evilCalls)), null)
  assert.equal(evilCalls.length, 0)

  console.log("resolve-video: ok")
}

void main()
