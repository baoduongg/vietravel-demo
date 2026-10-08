import assert from "node:assert/strict"
import { readSaved, removeSaved, saveJourney } from "./local"

function memoryStorage(initial: Record<string, string> = {}): Pick<Storage, "getItem" | "setItem"> {
  const data = new Map(Object.entries(initial))
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) }
}
const now = new Date("2026-10-08T00:00:00Z")

// Trống, hỏng, sai kiểu, không có storage, storage ném lỗi: đều ra [].
assert.deepEqual(readSaved(memoryStorage()), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": "{hong" })), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": '{"a":1}' })), [])
assert.deepEqual(readSaved(memoryStorage({ "explorer-journeys": '[{"id":1},{"id":"x","token":"t","title":"T","role":"admin"}]' })), [])
assert.deepEqual(readSaved(null), [])
const throwing = { getItem: (): string | null => { throw new Error("bị chặn") }, setItem: (): void => { throw new Error("bị chặn") } }
assert.deepEqual(readSaved(throwing), [])
assert.doesNotThrow(() => saveJourney({ id: "a", token: "t", title: "A", role: "edit" }, throwing, now))

// Ghi mới lên đầu danh sách.
const storage = memoryStorage()
saveJourney({ id: "a", token: "edit-a", title: "A", role: "edit", memberId: "m1" }, storage, now)
saveJourney({ id: "b", token: "view-b", title: "B", role: "view" }, storage, now)
assert.deepEqual(readSaved(storage).map((item) => item.id), ["b", "a"])

// Mở link xem của kế hoạch đã có link sửa: giữ link sửa và memberId, cập nhật tên.
saveJourney({ id: "a", token: "view-a", title: "A mới", role: "view" }, storage, now)
const a = readSaved(storage).find((item) => item.id === "a")
assert.deepEqual([a?.token, a?.role, a?.memberId, a?.title], ["edit-a", "edit", "m1", "A mới"])
assert.equal(readSaved(storage).length, 2, "không nhân bản theo id")

// Có link sửa sau link xem: nâng lên quyền sửa.
saveJourney({ id: "b", token: "edit-b", title: "B", role: "edit", memberId: "m2" }, storage, now)
const b = readSaved(storage).find((item) => item.id === "b")
assert.deepEqual([b?.token, b?.role, b?.memberId], ["edit-b", "edit", "m2"])

// Xóa kế hoạch không còn trên server (theo id hoặc token), giữ các mục khác.
removeSaved((item) => item.token === "edit-b", storage)
assert.deepEqual(readSaved(storage).map((item) => item.id), ["a"])
removeSaved((item) => item.id === "a", storage)
assert.deepEqual(readSaved(storage), [])
assert.doesNotThrow(() => removeSaved(() => true, throwing))

console.log("local.test OK")
