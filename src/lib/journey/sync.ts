/** Bản server có version cao hơn; kết quả poll hay phản hồi đến muộn không được ghi đè bản mới hơn. */
export function newerJourney<T extends { version: number }>(current: T, incoming: T): T {
  return incoming.version > current.version ? incoming : current
}
