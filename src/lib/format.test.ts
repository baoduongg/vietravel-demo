import assert from "node:assert/strict"
import { formatRating, formatShortDate, formatVnd } from "./format"

assert.equal(formatVnd(4990000), "4.990.000đ")
assert.equal(formatShortDate("2026-10-13"), "13/10")
assert.equal(formatRating(4.7), "4.7")
assert.equal(formatRating(5), "5.0")
assert.equal(formatRating(null), null)

console.log("format.test OK")
