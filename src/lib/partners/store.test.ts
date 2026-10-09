import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { FilePartnerStore } from "@/lib/partners/store"

async function main(): Promise<void> {
  const dir = await mkdtemp(path.join(tmpdir(), "partners-"))
  const store = new FilePartnerStore(path.join(dir, "partners.json"))
  const input = { brand: "Biển Xanh", kind: "Nhà hàng", destinationSlug: "phu-quoc", area: "Dương Đông", address: "12 Trần Hưng Đạo", website: "", description: "", contactName: "Lan", phone: "0912345678", email: "", products: [] } as const

  const { partner: a, editToken } = await store.add({ ...input, products: [] })
  const { partner: b } = await store.add({ ...input, brand: "Hồng Phát", products: [] })
  assert.equal(a.status, "pending")
  assert.ok(!("phone" in a))

  // Chỉ đúng token mới sửa được; token không lộ ở danh sách nào
  assert.equal((await store.findOwned(a.id, editToken))?.id, a.id)
  assert.equal(await store.findOwned(a.id, undefined), null)
  assert.equal(await store.findOwned(b.id, editToken), null)
  assert.ok(!JSON.stringify([await store.list(), await store.listAll(), await store.setStatus(b.id, "pending")]).includes(editToken))

  // Công khai không có liên hệ, bản xét duyệt thì có; mới nhất trước
  assert.ok(!("phone" in (await store.list())[0]))
  assert.deepEqual((await store.listAll()).map((p) => [p.id, p.phone]), [[b.id, "0912345678"], [a.id, "0912345678"]])

  const approved = await store.setStatus(a.id, "approved")
  assert.equal(approved?.status, "approved")
  assert.ok(approved?.reviewedAt)
  assert.equal((await store.list()).find((p) => p.id === a.id)?.status, "approved")
  assert.equal((await store.list()).find((p) => p.id === b.id)?.status, "pending")
  assert.equal(await store.setStatus("khong-co", "rejected"), null)

  // Sửa sản phẩm giữ nguyên trạng thái và liên hệ
  const edited = await store.setProducts(a.id, [{ id: "a", name: "Gỏi cá", priceVnd: 90000, unit: "per_person", description: "" }])
  assert.deepEqual(edited?.products.map((p) => p.name), ["Gỏi cá"])
  assert.ok(!("phone" in (edited ?? {})))
  const stored = (await store.listAll()).find((p) => p.id === a.id)
  assert.equal(stored?.status, "approved")
  assert.equal(stored?.phone, "0912345678")
  assert.equal(await store.setProducts("khong-co", []), null)

  // Sửa thông tin giữ trạng thái, liên hệ và sản phẩm
  const renamed = await store.setInfo(a.id, { brand: "Biển Xanh 2", destinationSlug: "phu-quoc", area: "Bắc đảo (Bãi Dài)", address: "Gành Dầu", website: "", description: "" })
  assert.equal(renamed?.brand, "Biển Xanh 2")
  assert.equal(renamed?.status, "approved")
  assert.deepEqual(renamed?.products.map((p) => p.name), ["Gỏi cá"])
  assert.equal((await store.listAll()).find((p) => p.id === a.id)?.phone, "0912345678")
  assert.equal(await store.setInfo("khong-co", { brand: "x", destinationSlug: "x", area: "x", address: "x", website: "", description: "" }), null)

  // Ảnh lưu riêng, bản ghi chỉ giữ version
  assert.equal(await store.getImage(a.id), null)
  const withImage = await store.setImage(a.id, "data:image/jpeg;base64,AAAA")
  assert.ok(withImage?.imageVersion)
  assert.equal(await store.getImage(a.id), "data:image/jpeg;base64,AAAA")
  assert.ok(!JSON.stringify(await store.list()).includes("base64"))
  assert.equal(await store.setImage("khong-co", "data:image/jpeg;base64,AAAA"), null)

  // Xóa bỏ cả bản ghi lẫn ảnh, không đụng đối tác khác
  assert.equal(await store.remove(a.id), true)
  assert.deepEqual((await store.list()).map((p) => p.id), [b.id])
  assert.equal(await store.getImage(a.id), null)
  assert.equal(await store.remove(a.id), false)

  await rm(dir, { recursive: true })
}

main().then(
  () => console.log("store.test.ts: ok"),
  (error: unknown) => {
    console.error(error)
    process.exit(1)
  },
)
