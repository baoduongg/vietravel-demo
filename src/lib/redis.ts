import { Redis } from "@upstash/redis"

/**
 * Upstash Redis nếu có cấu hình (Vercel Marketplace đặt KV_REST_API_*, Upstash trực tiếp đặt UPSTASH_REDIS_REST_*).
 * Không có thì null: các store quay về lưu file, chỉ dùng được khi chạy một server Node (local).
 */
export function redisFromEnv(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? new Redis({ url, token }) : null
}
