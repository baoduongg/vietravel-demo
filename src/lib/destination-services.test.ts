import assert from "node:assert/strict"
import { destinationServices } from "./destination-services"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { getServices } from "@/lib/journey/catalog"
import type { ServiceItem } from "@/types/journey"

const partner: ServiceItem = { ...getServices("phu-quoc", "hotel")[0], id: "partner-a-p1", kind: "dining" }

async function main(): Promise<void> {
  // Gộp catalog + đối tác, đối tác đứng cuối.
  const merged = await destinationServices(phuQuoc, async (slug, bookUrl) => {
    assert.equal(slug, "phu-quoc")
    assert.equal(bookUrl, phuQuoc.links.tours)
    return [partner]
  })
  assert.equal(merged.length, getServices("phu-quoc").length + 1)
  assert.equal(merged.at(-1), partner)

  // Store đối tác lỗi: trang vẫn có catalog.
  const original = console.error
  console.error = () => {}
  const fallback = await destinationServices(phuQuoc, async () => {
    throw new Error("redis down")
  })
  console.error = original
  assert.equal(fallback.length, getServices("phu-quoc").length)

  console.log("destination-services: ok")
}

void main()
