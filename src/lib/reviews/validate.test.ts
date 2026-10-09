import assert from "node:assert/strict"

import { parseReviewInput } from "@/lib/reviews/validate"

const now = new Date(2026, 9, 9)
const valid = { nick: "  Minh   Anh ", companion: "Cặp đôi", month: "2026-08", rating: 5, text: "Biển đẹp, đồ ăn ngon lắm." }

const ok = parseReviewInput(valid, now)
assert.ok(ok.ok)
assert.deepEqual(ok.review, { nick: "Minh Anh", trip: "Cặp đôi · Tháng 8/2026", rating: 5, text: "Biển đẹp, đồ ăn ngon lắm." })

// Không nhập tháng thì trip chỉ có người đi cùng
const noMonth = parseReviewInput({ ...valid, month: "" }, now)
assert.ok(noMonth.ok && noMonth.review.trip === "Cặp đôi")

// Tháng hiện tại hợp lệ, tháng sau thì không
assert.ok(parseReviewInput({ ...valid, month: "2026-10" }, now).ok)
assert.equal(parseReviewInput({ ...valid, month: "2026-11" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, month: "2026-13" }, now).ok, false)

assert.equal(parseReviewInput(null, now).ok, false)
assert.equal(parseReviewInput({ ...valid, nick: "   " }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, nick: "a".repeat(41) }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, companion: "Người lạ" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: 0 }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: 4.5 }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: "5" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, text: "ngắn" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, text: "a".repeat(501) }, now).ok, false)

console.log("validate.test.ts: ok")
