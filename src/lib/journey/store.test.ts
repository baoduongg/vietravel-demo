import assert from "node:assert/strict"
import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import type { ServiceItem } from "@/types/journey"
import { createJourney } from "./create"
import { JourneyError } from "./errors"
import { applyOp, type OpDeps } from "./operations"
import { redisFromEnv } from "@/lib/redis"
import { FileJourneyStore, RedisJourneyStore, type JourneyStore } from "./store"

const hotel: ServiceItem = {
  id: "hotel-x", kind: "hotel", destinationSlug: "phu-quoc", name: "Resort X", tag: "", blurb: "",
  priceVnd: 1, priceUnit: "per_room_night", bookUrl: "https://travel.com.vn/du-lich-phu-quoc", mock: true,
}
let counter = 0
const deps: OpDeps = { lookup: (id) => (id === hotel.id ? hotel : undefined), newId: () => `id-${++counter}`, now: () => new Date() }
const input = { title: "Thử", destinationSlug: "phu-quoc", startDate: null, nights: 2, travelers: { adults: 2, childAges: [] }, memberName: "Lan" }

async function checkStore(store: JourneyStore): Promise<void> {
  // Tạo 2 kế hoạch cùng lúc: index token không được mất mục nào.
  const a = createJourney(input)
  const b = createJourney({ ...input, title: "Thử 2" })
  await Promise.all([store.create(a.journey), store.create(b.journey)])
  assert.equal((await store.get(a.journey.id))?.title, "Thử")
  assert.deepEqual(await store.findByToken(a.journey.editToken).then((found) => found && [found.journey.id, found.role]), [a.journey.id, "edit"])
  assert.deepEqual(await store.findByToken(a.journey.viewToken).then((found) => found && [found.journey.id, found.role]), [a.journey.id, "view"])
  assert.deepEqual(await store.findByToken(b.journey.viewToken).then((found) => found && found.journey.title), "Thử 2")

  // Token/id lạ: không thấy, không đọc ra ngoài thư mục.
  for (const token of ["khong-co", "__proto__", "constructor", "toString", ""]) {
    assert.equal(await store.findByToken(token), null, `token "${token}"`)
  }
  for (const id of ["../tokens", "tokens", "khong-phai-uuid", ""]) {
    assert.equal(await store.get(id), null, `id "${id}"`)
  }

  // 20 thao tác song song: đủ 20 mục, version 1 + 20.
  const actor = { role: "edit" as const, memberId: a.memberId }
  await Promise.all(
    Array.from({ length: 20 }, () => store.update(a.journey.id, (journey) => applyOp(journey, { type: "addItem", serviceId: "hotel-x" }, actor, deps))),
  )
  const after = await store.get(a.journey.id)
  assert.equal(after?.items.length, 20)
  assert.equal(after?.version, 21)

  // Thao tác lỗi không chặn hàng đợi, không đổi version.
  await assert.rejects(
    store.update(a.journey.id, (journey) => applyOp(journey, { type: "addItem", serviceId: "khong-co" }, actor, deps)),
    (error: unknown) => error instanceof JourneyError && error.status === 400,
  )
  const next = await store.update(a.journey.id, (journey) => applyOp(journey, { type: "join", name: "Minh" }, { role: "edit" }, deps))
  assert.equal(next.version, 22)
  assert.deepEqual(next.members.map((member) => member.name), ["Lan", "Minh"])

  // Kế hoạch không tồn tại.
  await assert.rejects(
    store.update("00000000-0000-4000-8000-000000000000", (journey) => journey),
    (error: unknown) => error instanceof JourneyError && error.status === 404,
  )

}

async function main(): Promise<void> {
  const dir = await mkdtemp(path.join(tmpdir(), "journey-store-"))
  try {
    await checkStore(new FileJourneyStore(dir))
    // Không còn file tạm.
    assert.deepEqual((await readdir(dir)).filter((name) => name.endsWith(".tmp")), [])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  // Có KV_REST_API_* trong env thì chạy cùng bài kiểm tra trên Redis thật (tạo key thử, không xoá).
  const redis = redisFromEnv()
  if (redis) await checkStore(new RedisJourneyStore(redis))
  else console.log("bỏ qua RedisJourneyStore: chưa có KV_REST_API_URL/KV_REST_API_TOKEN")
}

main().then(
  () => console.log("store.test OK"),
  (error: unknown) => {
    console.error(error)
    process.exit(1)
  },
)
