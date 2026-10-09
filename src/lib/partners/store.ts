import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { Redis } from "@upstash/redis"

import { keyedQueue, writeJsonAtomic } from "@/lib/file-queue"
import { partnerServices } from "@/lib/partners/services"
import { redisFromEnv } from "@/lib/redis"
import type { ServiceItem } from "@/types/journey"
import type { Partner, PartnerInfo, PartnerInput, PartnerProduct, PartnerStatus, PartnerWithContact } from "@/types/partner"

export const MAX_STORED_PARTNERS = 500

/** editToken chỉ trả cho người đăng ký lúc tạo; không lộ ra ở list/listAll vì id thì ai cũng thấy được. */
type StoredPartner = PartnerWithContact & { editToken?: string }

export interface PartnerStore {
  /** Mới nhất trước, đã bỏ thông tin liên hệ. */
  list(): Promise<Partner[]>
  /** Gồm cả liên hệ, chỉ cho tab xét duyệt. */
  listAll(): Promise<PartnerWithContact[]>
  add(input: PartnerInput): Promise<{ partner: Partner; editToken: string }>
  /** Bản ghi nếu token đúng của chủ cửa hàng; null nếu không có id hoặc sai token. */
  findOwned(id: string, editToken: unknown): Promise<Partner | null>
  /** null nếu không có id này. */
  setStatus(id: string, status: PartnerStatus): Promise<PartnerWithContact | null>
  /** Đối tác sửa danh sách sản phẩm trên trang chi tiết; null nếu không có id này. */
  setProducts(id: string, products: PartnerProduct[]): Promise<Partner | null>
  /** Chủ cửa hàng sửa thông tin thương hiệu; null nếu không có id này. */
  setInfo(id: string, info: PartnerInfo): Promise<Partner | null>
  /** Ảnh đại diện (data URL) lưu tách khỏi bản ghi để danh sách không nặng; null nếu không có id này. */
  setImage(id: string, dataUrl: string): Promise<Partner | null>
  getImage(id: string): Promise<string | null>
}

function create(input: PartnerInput): StoredPartner & { editToken: string } {
  return { ...input, id: randomUUID(), status: "pending", createdAt: new Date().toISOString(), editToken: randomUUID() }
}

function withoutToken(stored: StoredPartner): PartnerWithContact {
  const partner = { ...stored }
  delete partner.editToken
  return partner
}

function owned(all: StoredPartner[], id: string, editToken: unknown): Partner | null {
  const partner = all.find((item) => item.id === id)
  return partner?.editToken && partner.editToken === editToken ? toPublic(partner) : null
}

function toPublic(partner: StoredPartner): Partner {
  const { id, status, createdAt, reviewedAt, imageVersion, brand, kind, destinationSlug, area, tier, childPolicy, address, website, description, products } = partner
  return { id, status, createdAt, reviewedAt, imageVersion, brand, kind, destinationSlug, area, tier, childPolicy, address, website, description, products }
}

function withStatus(partner: StoredPartner, status: PartnerStatus): StoredPartner {
  return { ...partner, status, reviewedAt: new Date().toISOString() }
}

/** Một file `partners.json`. Giống FileReviewStore: hàng đợi ghi chỉ đúng khi chạy MỘT server Node. */
export class FilePartnerStore implements PartnerStore {
  private readonly serialize = keyedQueue()

  constructor(private readonly file: string) {}

  private async readAll(): Promise<StoredPartner[]> {
    try {
      return JSON.parse(await readFile(this.file, "utf8")) as StoredPartner[]
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
      throw error
    }
  }

  async list(): Promise<Partner[]> {
    return (await this.readAll()).map(toPublic)
  }

  async listAll(): Promise<PartnerWithContact[]> {
    return (await this.readAll()).map(withoutToken)
  }

  async findOwned(id: string, editToken: unknown): Promise<Partner | null> {
    return owned(await this.readAll(), id, editToken)
  }

  add(input: PartnerInput): Promise<{ partner: Partner; editToken: string }> {
    return this.serialize("partners", async () => {
      const created = create(input)
      await writeJsonAtomic(this.file, [created, ...(await this.readAll())].slice(0, MAX_STORED_PARTNERS))
      return { partner: toPublic(created), editToken: created.editToken }
    })
  }

  private update(id: string, change: (partner: StoredPartner) => StoredPartner): Promise<StoredPartner | null> {
    return this.serialize("partners", async () => {
      const all = await this.readAll()
      const index = all.findIndex((partner) => partner.id === id)
      if (index < 0) return null
      all[index] = change(all[index])
      await writeJsonAtomic(this.file, all)
      return all[index]
    })
  }

  async setStatus(id: string, status: PartnerStatus): Promise<PartnerWithContact | null> {
    const updated = await this.update(id, (partner) => withStatus(partner, status))
    return updated && withoutToken(updated)
  }

  async setProducts(id: string, products: PartnerProduct[]): Promise<Partner | null> {
    const updated = await this.update(id, (partner) => ({ ...partner, products }))
    return updated && toPublic(updated)
  }

  async setInfo(id: string, info: PartnerInfo): Promise<Partner | null> {
    const updated = await this.update(id, (partner) => ({ ...partner, ...info }))
    return updated && toPublic(updated)
  }

  private imageFile(id: string): string {
    return path.join(path.dirname(this.file), "partner-images", `${id}.txt`)
  }

  async setImage(id: string, dataUrl: string): Promise<Partner | null> {
    if (!(await this.readAll()).some((partner) => partner.id === id)) return null
    await mkdir(path.dirname(this.imageFile(id)), { recursive: true })
    await writeFile(this.imageFile(id), dataUrl)
    const updated = await this.update(id, (partner) => ({ ...partner, imageVersion: Date.now() }))
    return updated && toPublic(updated)
  }

  async getImage(id: string): Promise<string | null> {
    try {
      return await readFile(this.imageFile(id), "utf8")
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
      throw error
    }
  }
}

/** Cho serverless (Vercel): list Redis `partners`, LPUSH + LTRIM nên mới nhất trước. */
export class RedisPartnerStore implements PartnerStore {
  constructor(private readonly redis: Redis) {}

  private readAll(): Promise<StoredPartner[]> {
    return this.redis.lrange<StoredPartner>("partners", 0, MAX_STORED_PARTNERS - 1)
  }

  async list(): Promise<Partner[]> {
    return (await this.readAll()).map(toPublic)
  }

  async listAll(): Promise<PartnerWithContact[]> {
    return (await this.readAll()).map(withoutToken)
  }

  async findOwned(id: string, editToken: unknown): Promise<Partner | null> {
    return owned(await this.readAll(), id, editToken)
  }

  // shortcut: đọc rồi LSET theo vị trí, đăng ký mới chen vào giữa chừng sẽ ghi nhầm phần tử; đủ cho demo, chuyển sang hash `partner:<id>` nếu dùng thật.
  private async update(id: string, change: (partner: StoredPartner) => StoredPartner): Promise<StoredPartner | null> {
    const all = await this.readAll()
    const index = all.findIndex((partner) => partner.id === id)
    if (index < 0) return null
    const updated = change(all[index])
    await this.redis.lset("partners", index, updated)
    return updated
  }

  async setStatus(id: string, status: PartnerStatus): Promise<PartnerWithContact | null> {
    const updated = await this.update(id, (partner) => withStatus(partner, status))
    return updated && withoutToken(updated)
  }

  async setProducts(id: string, products: PartnerProduct[]): Promise<Partner | null> {
    const updated = await this.update(id, (partner) => ({ ...partner, products }))
    return updated && toPublic(updated)
  }

  async setInfo(id: string, info: PartnerInfo): Promise<Partner | null> {
    const updated = await this.update(id, (partner) => ({ ...partner, ...info }))
    return updated && toPublic(updated)
  }

  async setImage(id: string, dataUrl: string): Promise<Partner | null> {
    if (!(await this.readAll()).some((partner) => partner.id === id)) return null
    await this.redis.set(`partner-image:${id}`, dataUrl)
    const updated = await this.update(id, (partner) => ({ ...partner, imageVersion: Date.now() }))
    return updated && toPublic(updated)
  }

  getImage(id: string): Promise<string | null> {
    return this.redis.get<string>(`partner-image:${id}`)
  }

  async add(input: PartnerInput): Promise<{ partner: Partner; editToken: string }> {
    const created = create(input)
    await this.redis.multi().lpush("partners", created).ltrim("partners", 0, MAX_STORED_PARTNERS - 1).exec()
    return { partner: toPublic(created), editToken: created.editToken }
  }
}

const globalStore = globalThis as typeof globalThis & { partnerStore?: PartnerStore }

export function getPartnerStore(): PartnerStore {
  if (!globalStore.partnerStore) {
    const redis = redisFromEnv()
    globalStore.partnerStore = redis
      ? new RedisPartnerStore(redis)
      : new FilePartnerStore(process.env.PARTNER_DATA_FILE ?? path.join(process.cwd(), ".data", "partners.json"))
  }
  return globalStore.partnerStore
}

/** Dịch vụ của đối tác đã duyệt cho danh mục kế hoạch. */
export async function getPartnerServices(destinationSlug: string, fallbackBookUrl: string): Promise<ServiceItem[]> {
  return partnerServices(await getPartnerStore().list(), destinationSlug, fallbackBookUrl)
}
