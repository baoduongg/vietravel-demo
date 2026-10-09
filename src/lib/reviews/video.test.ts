import assert from "node:assert/strict"

import { isShortTiktok, isValidVideo, MAX_REVIEW_VIDEOS, parseVideoUrl } from "@/lib/reviews/video"

const yt = { platform: "youtube", id: "dQw4w9WgXcQ" }
for (const url of [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
  "https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ?si=abc",
  "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "  youtu.be/dQw4w9WgXcQ  ",
]) {
  assert.deepEqual(parseVideoUrl(url), yt, url)
}

const tt = { platform: "tiktok", id: "7312345678901234567" }
for (const url of [
  "https://www.tiktok.com/@vietravel/video/7312345678901234567",
  "https://www.tiktok.com/@vietravel/video/7312345678901234567?is_from_webapp=1&lang=vi",
  "https://m.tiktok.com/v/7312345678901234567.html",
  "tiktok.com/@a.b_c/video/7312345678901234567",
]) {
  assert.deepEqual(parseVideoUrl(url), tt, url)
}

// Host giả, id sai, link lạ đều bị từ chối.
for (const url of [
  "",
  "không phải link",
  "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
  "https://evil.com/youtu.be/dQw4w9WgXcQ",
  "https://tiktok.com@evil.com/@a/video/7312345678901234567",
  "https://www.youtube.com/watch?v=short",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ<script>",
  "https://www.youtube.com/channel/UC123",
  "https://www.tiktok.com/@a/video/123",
  "https://www.tiktok.com/@vietravel",
  "javascript:alert(1)//youtu.be/dQw4w9WgXcQ",
  "ftp://youtu.be/dQw4w9WgXcQ",
  "https://vt.tiktok.com/ZSabc123/",
]) {
  assert.equal(parseVideoUrl(url), null, url)
}

// Link rút gọn TikTok cần server đọc chuyển hướng.
assert.ok(isShortTiktok("https://vt.tiktok.com/ZSabc123/"))
assert.ok(isShortTiktok("vm.tiktok.com/ZMabc123"))
assert.ok(!isShortTiktok("https://vt.tiktok.com.evil.com/ZSabc123/"))
assert.ok(!isShortTiktok("https://www.tiktok.com/@a/video/7312345678901234567"))

// Kiểm dữ liệu video gửi lên server.
assert.ok(isValidVideo(yt))
assert.ok(isValidVideo(tt))
assert.ok(!isValidVideo({ platform: "vimeo", id: "dQw4w9WgXcQ" }))
assert.ok(!isValidVideo({ platform: "youtube", id: "../../etc" }))
assert.ok(!isValidVideo({ platform: "tiktok", id: "dQw4w9WgXcQ" }))
assert.ok(!isValidVideo(null))
assert.ok(!isValidVideo("dQw4w9WgXcQ"))
assert.equal(MAX_REVIEW_VIDEOS, 3)

console.log("reviews/video: ok")
