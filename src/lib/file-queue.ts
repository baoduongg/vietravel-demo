import { mkdir, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/** Ghi file tạm rồi rename: tắt server giữa chừng cũng không để lại file hỏng. */
export async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  await writeFile(temp, JSON.stringify(value, null, 2))
  await rename(temp, file)
}

/**
 * Các tác vụ cùng key chạy lần lượt; tác vụ lỗi không chặn tác vụ sau.
 * Hàng đợi chỉ nằm trong bộ nhớ tiến trình này, nên chỉ đúng khi chạy MỘT server Node.
 */
export function keyedQueue(): <T>(key: string, task: () => Promise<T>) => Promise<T> {
  const queues = new Map<string, Promise<unknown>>()
  return (key, task) => {
    const run = (queues.get(key) ?? Promise.resolve()).then(task)
    const settled = run.catch(() => undefined)
    queues.set(key, settled)
    void settled.then(() => {
      if (queues.get(key) === settled) queues.delete(key)
    })
    return run
  }
}
