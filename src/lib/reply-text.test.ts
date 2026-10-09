import assert from "node:assert/strict"

import { splitTourTag, toSpokenText } from "@/lib/reply-text"

// Tag viết sai hoa thường, mã trùng và rác vẫn ra đúng mã, tối đa 3 mã
const tagged = splitTourTag("Dạ có tour Phú Quốc ạ. tours: NDSGN123, ndsgn123, NDHAN9 x-y NDDAD1 NDCXR2")
assert.equal(tagged.speech, "Dạ có tour Phú Quốc ạ. ")
assert.deepEqual(tagged.codes, ["NDSGN123", "NDHAN9", "NDDAD1"])

assert.deepEqual(splitTourTag("Không có tag."), { speech: "Không có tag.", codes: [] })

// "TP." không phải hết câu; markdown, emoji, gạch đầu dòng bị bỏ; chỉ giữ 3 câu
const spoken = toSpokenText("**Dạ** tour đi từ TP. Hồ Chí Minh 🌴.\n- Giá [7.990.000 đồng](https://x.vn) ạ!\n1. Câu ba?\nCâu bốn.")
assert.equal(spoken, "Dạ tour đi từ TP. Hồ Chí Minh . Giá 7.990.000 đồng ạ! Câu ba?")

assert.equal(toSpokenText("```code```"), "")

console.log("reply-text.test OK")
