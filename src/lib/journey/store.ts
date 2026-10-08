import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

import { JourneyError } from "@/lib/journey/errors"
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
 * Triển khai nhiều instance hoặc serverless (Vercel) thì thay bằng store Postgres/KV cài cùng interface.
 */
export class FileJourneyStore implements JourneyStore {
  private readonly queues = new Map<string, Promise<unknown>>()

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

  /** Ghi file tạm rồi rename: tắt server giữa chừng cũng không để lại file hỏng. */
  private async writeJson(name: string, value: unknown): Promise<void> {
    await mkdir(this.dir, { recursive: true })
    const target = this.file(name)
    const temp = `${target}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    await writeFile(temp, JSON.stringify(value, null, 2))
    await rename(temp, target)
  }

  /** Các tác vụ cùng key chạy lần lượt; tác vụ lỗi không chặn tác vụ sau. */
  private serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve()
    const run = previous.then(task)
    const settled = run.catch(() => undefined)
    this.queues.set(key, settled)
    void settled.then(() => {
      if (this.queues.get(key) === settled) this.queues.delete(key)
    })
    return run
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

const globalStore = globalThis as typeof globalThis & { journeyStore?: JourneyStore }

/** Một store cho cả tiến trình; giữ qua hot reload để hàng đợi ghi không bị tách đôi. */
export function getJourneyStore(): JourneyStore {
  globalStore.journeyStore ??= new FileJourneyStore(process.env.JOURNEY_DATA_DIR ?? path.join(process.cwd(), ".data", "journeys"))
  return globalStore.journeyStore
}
