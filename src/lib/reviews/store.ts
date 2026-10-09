import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Redis } from "@upstash/redis"

import { keyedQueue, writeJsonAtomic } from "@/lib/file-queue"
import { redisFromEnv } from "@/lib/redis"
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
  private readonly serialize = keyedQueue()

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
    return this.serialize(slug, async () => {
      const created: UserReview = { ...review, id: randomUUID(), createdAt: new Date().toISOString() }
      await writeJsonAtomic(this.file(slug), [created, ...(await this.list(slug))].slice(0, MAX_STORED_REVIEWS))
      return created
    })
  }
}

/** Cho serverless (Vercel): mỗi điểm đến một list Redis `reviews:<slug>`, LPUSH + LTRIM nên mới nhất trước. */
export class RedisReviewStore implements ReviewStore {
  constructor(private readonly redis: Redis) {}

  list(slug: string): Promise<UserReview[]> {
    return this.redis.lrange<UserReview>(`reviews:${slug}`, 0, MAX_STORED_REVIEWS - 1)
  }

  async add(slug: string, review: Review): Promise<UserReview> {
    const created: UserReview = { ...review, id: randomUUID(), createdAt: new Date().toISOString() }
    await this.redis.multi().lpush(`reviews:${slug}`, created).ltrim(`reviews:${slug}`, 0, MAX_STORED_REVIEWS - 1).exec()
    return created
  }
}

const globalStore = globalThis as typeof globalThis & { reviewStore?: ReviewStore }

export function getReviewStore(): ReviewStore {
  if (!globalStore.reviewStore) {
    const redis = redisFromEnv()
    globalStore.reviewStore = redis ? new RedisReviewStore(redis) : new FileReviewStore(process.env.REVIEW_DATA_DIR ?? path.join(process.cwd(), ".data", "reviews"))
  }
  return globalStore.reviewStore
}
