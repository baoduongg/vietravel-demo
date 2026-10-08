import { randomBytes, randomUUID } from "node:crypto"

import { getGuide } from "@/data/destinations"
import { JourneyError } from "@/lib/journey/errors"
import { parseNewJourney } from "@/lib/journey/operations"
import type { Journey } from "@/types/journey"

/** 16 byte ngẫu nhiên: đủ khó đoán để link mời thay cho tài khoản. */
export function newToken(): string {
  return randomBytes(16).toString("base64url")
}

export function createJourney(body: unknown, now: Date = new Date()): { journey: Journey; memberId: string } {
  const input = parseNewJourney(body)
  if (!getGuide(input.destinationSlug)) throw new JourneyError(400, "Điểm đến này chưa mở lập kế hoạch.")
  const memberId = randomUUID()
  const at = now.toISOString()
  return {
    memberId,
    journey: {
      id: randomUUID(),
      version: 1,
      title: input.title,
      destinationSlug: input.destinationSlug,
      startDate: input.startDate,
      nights: input.nights,
      travelers: input.travelers,
      editToken: newToken(),
      viewToken: newToken(),
      members: [{ id: memberId, name: input.memberName, joinedAt: at }],
      items: [],
      createdAt: at,
      updatedAt: at,
    },
  }
}
