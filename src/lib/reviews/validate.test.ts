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
// 23:00 UTC ngày 31/10 đã là 6 giờ sáng 1/11 ở Việt Nam
assert.ok(parseReviewInput({ ...valid, month: "2026-11" }, new Date("2026-10-31T23:00:00Z")).ok)

assert.equal(parseReviewInput(null, now).ok, false)
assert.equal(parseReviewInput({ ...valid, nick: "   " }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, nick: "a".repeat(41) }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, companion: "Người lạ" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: 0 }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: 4.5 }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, rating: "5" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, text: "ngắn" }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, text: "a".repeat(501) }, now).ok, false)

// Video: tùy chọn; chỉ giữ platform + id hợp lệ, tối đa 3, bỏ trùng; mảng rỗng thì không lưu trường videos.
const yt = { platform: "youtube", id: "dQw4w9WgXcQ" }
const tt = { platform: "tiktok", id: "7312345678901234567" }
const withVideos = parseReviewInput({ ...valid, videos: [yt, { ...tt, url: "https://evil.com" }] }, now)
assert.ok(withVideos.ok)
assert.deepEqual(withVideos.review.videos, [yt, tt])
const noVideos = parseReviewInput({ ...valid, videos: [] }, now)
assert.ok(noVideos.ok && !("videos" in noVideos.review))
const dedup = parseReviewInput({ ...valid, videos: [yt, yt] }, now)
assert.ok(dedup.ok && dedup.review.videos?.length === 1)
assert.equal(parseReviewInput({ ...valid, videos: [yt, tt, { platform: "youtube", id: "aaaaaaaaaaa" }, { platform: "youtube", id: "bbbbbbbbbbb" }] }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, videos: [{ platform: "vimeo", id: "123" }] }, now).ok, false)
assert.equal(parseReviewInput({ ...valid, videos: "https://youtu.be/dQw4w9WgXcQ" }, now).ok, false)

console.log("validate.test.ts: ok")
