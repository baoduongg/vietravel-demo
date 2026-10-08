import assert from "node:assert/strict"
import { newerJourney } from "./sync"

const v = (version: number): { version: number; tag: string } => ({ version, tag: `v${version}` })

// Bản server mới hơn thắng; bản cũ hoặc bằng version (poll đến muộn) bị bỏ qua.
assert.equal(newerJourney(v(3), v(4)).tag, "v4")
assert.equal(newerJourney(v(4), v(3)).tag, "v4", "kết quả poll đến muộn không được ghi đè bản mới hơn")
assert.equal(newerJourney(v(4), v(4)).tag, "v4")

console.log("sync.test OK")
