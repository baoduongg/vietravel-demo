import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

import type { Review, UserReview } from "@/types/destination"

/** Giữ số review mới nhất mỗi điểm đến để file không phình mãi. */
export const MAX_STORED_REVIEWS = 200

export interface ReviewStore {
  /** Mới nhất trước. */
  list(slug: string): Promise<UserReview[]>
  add(slug: string, review: Review): Promise<UserReview>
}

/**
 * Mỗi điểm đến một file `<slug>.json`. slug phải được route kiểm tra là điểm đến có thật trước khi gọi.
 * Giống FileJourneyStore: hàng đợi ghi chỉ đúng khi chạy MỘT server Node.
 */
export class FileReviewStore implements ReviewStore {
  private readonly queues = new Map<string, Promise<unknown>>()

  constructor(private readonly dir: string) {}

  private file(slug: string): string {
    return path.join(this.dir, `${slug}.json`)
  }

  async list(slug: string): Promise<UserReview[]> {
    try {
      return JSON.parse(await readFile(this.file(slug), "utf8")) as UserReview[]
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
      throw error
    }
  }

  add(slug: string, review: Review): Promise<UserReview> {
    const previous = this.queues.get(slug) ?? Promise.resolve()
    const run = previous.then(async () => {
      const created: UserReview = { ...review, id: randomUUID(), createdAt: new Date().toISOString() }
      const next = [created, ...(await this.list(slug))].slice(0, MAX_STORED_REVIEWS)
      await mkdir(this.dir, { recursive: true })
      const target = this.file(slug)
      const temp = `${target}.${process.pid}.${Date.now()}.tmp`
      await writeFile(temp, JSON.stringify(next, null, 2))
      await rename(temp, target)
      return created
    })
    const settled = run.catch(() => undefined)
    this.queues.set(slug, settled)
    void settled.then(() => {
      if (this.queues.get(slug) === settled) this.queues.delete(slug)
    })
    return run
  }
}

const globalStore = globalThis as typeof globalThis & { reviewStore?: ReviewStore }

export function getReviewStore(): ReviewStore {
  globalStore.reviewStore ??= new FileReviewStore(process.env.REVIEW_DATA_DIR ?? path.join(process.cwd(), ".data", "reviews"))
  return globalStore.reviewStore
}
