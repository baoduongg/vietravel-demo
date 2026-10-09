import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Redis } from "@upstash/redis"

import { keyedQueue, writeJsonAtomic } from "@/lib/file-queue"
import { JourneyError } from "@/lib/journey/errors"
import { redisFromEnv } from "@/lib/redis"
import type { Journey, JourneyRole } from "@/types/journey"

export interface JourneyStore {
  create(journey: Journey): Promise<void>
  get(id: string): Promise<Journey | null>
  findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null>
  /** Chạy fn trên bản mới nhất rồi lưu; tăng version và updatedAt. */
  update(id: string, fn: (journey: Journey) => Journey): Promise<Journey>
}

type TokenIndex = Record<string, { id: string; role: JourneyRole }>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const TOKENS = "tokens"

/**
 * Mỗi kế hoạch một file `<id>.json`, thêm `tokens.json` tra token ra id và quyền.
 * Hàng đợi ghi chỉ nằm trong bộ nhớ của tiến trình này, nên chỉ đúng khi chạy MỘT server Node.
 * Triển khai nhiều instance hoặc serverless (Vercel) thì dùng RedisJourneyStore (tự chọn khi có biến Upstash).
 */
export class FileJourneyStore implements JourneyStore {
  private readonly serialize = keyedQueue()

  constructor(private readonly dir: string) {}

  private file(name: string): string {
    return path.join(this.dir, `${name}.json`)
  }

  private async readJson<T>(name: string): Promise<T | null> {
    try {
      return JSON.parse(await readFile(this.file(name), "utf8")) as T
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
      throw error
    }
  }

  private writeJson(name: string, value: unknown): Promise<void> {
    return writeJsonAtomic(this.file(name), value)
  }

  async create(journey: Journey): Promise<void> {
    await this.serialize(journey.id, () => this.writeJson(journey.id, journey))
    await this.serialize(TOKENS, async () => {
      const index = (await this.readJson<TokenIndex>(TOKENS)) ?? {}
      index[journey.editToken] = { id: journey.id, role: "edit" }
      index[journey.viewToken] = { id: journey.id, role: "view" }
      await this.writeJson(TOKENS, index)
    })
  }

  async get(id: string): Promise<Journey | null> {
    // Chỉ nhận UUID: id đến từ URL, không được trỏ ra file khác như tokens.json hay ../
    if (!UUID.test(id)) return null
    return this.readJson<Journey>(id)
  }

  async findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null> {
    const index = (await this.readJson<TokenIndex>(TOKENS)) ?? {}
    // hasOwn: token như "__proto__" không được trỏ vào thuộc tính của Object.
    const entry = Object.hasOwn(index, token) ? index[token] : undefined
    if (!entry) return null
    const journey = await this.get(entry.id)
    return journey ? { journey, role: entry.role } : null
  }

  update(id: string, fn: (journey: Journey) => Journey): Promise<Journey> {
    return this.serialize(id, async () => {
      const current = await this.get(id)
      if (!current) throw new JourneyError(404, "Không tìm thấy kế hoạch.")
      const next: Journey = { ...fn(current), version: current.version + 1, updatedAt: new Date().toISOString() }
      await this.writeJson(id, next)
      return next
    })
  }
}

/** Chỉ ghi khi version trên Redis vẫn là ARGV[1]; trả 0 nếu đã có người ghi trước. */
const SET_IF_VERSION = `
local raw = redis.call("GET", KEYS[1])
if not raw or cjson.decode(raw).version ~= tonumber(ARGV[1]) then return 0 end
redis.call("SET", KEYS[1], ARGV[2])
return 1`
const MAX_UPDATE_ATTEMPTS = 50

/**
 * Cho serverless (Vercel): mỗi kế hoạch một key `journey:<id>`, mỗi token một key `journey-token:<token>`.
 * update dùng compare-and-set theo version thay cho hàng đợi trong bộ nhớ, nên đúng với nhiều instance.
 */
export class RedisJourneyStore implements JourneyStore {
  constructor(private readonly redis: Redis) {}

  async create(journey: Journey): Promise<void> {
    await this.redis
      .multi()
      .set(`journey:${journey.id}`, journey)
      .set(`journey-token:${journey.editToken}`, { id: journey.id, role: "edit" })
      .set(`journey-token:${journey.viewToken}`, { id: journey.id, role: "view" })
      .exec()
  }

  get(id: string): Promise<Journey | null> {
    return this.redis.get<Journey>(`journey:${id}`)
  }

  async findByToken(token: string): Promise<{ journey: Journey; role: JourneyRole } | null> {
    const entry = await this.redis.get<{ id: string; role: JourneyRole }>(`journey-token:${token}`)
    if (!entry) return null
    const journey = await this.get(entry.id)
    return journey ? { journey, role: entry.role } : null
  }

  async update(id: string, fn: (journey: Journey) => Journey): Promise<Journey> {
    for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
      const current = await this.get(id)
      if (!current) throw new JourneyError(404, "Không tìm thấy kế hoạch.")
      const next: Journey = { ...fn(current), version: current.version + 1, updatedAt: new Date().toISOString() }
      const saved = await this.redis.eval(SET_IF_VERSION, [`journey:${id}`], [String(current.version), JSON.stringify(next)])
      if (saved === 1) return next
      // Có người ghi trước: đợi chút rồi chạy lại fn trên bản mới nhất.
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))
    }
    throw new JourneyError(409, "Kế hoạch đang được sửa liên tục, Quý khách thử lại nhé.")
  }
}

const globalStore = globalThis as typeof globalThis & { journeyStore?: JourneyStore }

/** Một store cho cả tiến trình; giữ qua hot reload để hàng đợi ghi không bị tách đôi. */
export function getJourneyStore(): JourneyStore {
  if (!globalStore.journeyStore) {
    const redis = redisFromEnv()
    globalStore.journeyStore = redis ? new RedisJourneyStore(redis) : new FileJourneyStore(process.env.JOURNEY_DATA_DIR ?? path.join(process.cwd(), ".data", "journeys"))
  }
  return globalStore.journeyStore
}
