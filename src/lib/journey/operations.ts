import { JourneyError } from "@/lib/journey/errors"
import type {
  CreateJourneyRequest,
  Journey,
  JourneyItem,
  JourneyOp,
  JourneyRole,
  PublicJourney,
  ServiceItem,
  Travelers,
} from "@/types/journey"

// File này không import gì của Node: client dùng lại applyOp để cập nhật lạc quan.

export const LIMITS = {
  titleLength: 80,
  maxNights: 14,
  maxAdults: 20,
  maxChildren: 10,
  maxChildAge: 17,
  nameLength: 40,
  maxMembers: 30,
  maxItems: 100,
  commentLength: 500,
  maxComments: 50,
  maxQuantity: 20,
} as const

export interface OpActor {
  role: JourneyRole
  memberId?: string
}

export interface OpDeps {
  lookup: (serviceId: string) => ServiceItem | undefined
  newId: () => string
  now: () => Date
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function bad(message: string): never {
  throw new JourneyError(400, message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function int(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) bad(`${label} phải từ ${min} đến ${max}.`)
  return value
}

function text(value: unknown, max: number, label: string): string {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (trimmed.length === 0 || trimmed.length > max) bad(`${label} cần từ 1 đến ${max} ký tự.`)
  return trimmed
}

function isoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) bad("Ngày đi không hợp lệ.")
  return value
}

export function parseTravelers(value: unknown): Travelers {
  const ages = isRecord(value) ? value.childAges : undefined
  if (!isRecord(value) || !Array.isArray(ages)) bad("Số người đi không hợp lệ.")
  if (ages.length > LIMITS.maxChildren) bad(`Tối đa ${LIMITS.maxChildren} bé.`)
  return {
    adults: int(value.adults, 1, LIMITS.maxAdults, "Số người lớn"),
    childAges: ages.map((age: unknown) => int(age, 0, LIMITS.maxChildAge, "Tuổi của bé")),
  }
}

export function parseNewJourney(value: unknown): CreateJourneyRequest {
  if (!isRecord(value)) bad("Dữ liệu kế hoạch không hợp lệ.")
  return {
    title: text(value.title, LIMITS.titleLength, "Tên kế hoạch"),
    destinationSlug: text(value.destinationSlug, 60, "Điểm đến"),
    startDate: isoDate(value.startDate),
    nights: int(value.nights, 0, LIMITS.maxNights, "Số đêm"),
    travelers: parseTravelers(value.travelers),
    memberName: text(value.memberName, LIMITS.nameLength, "Tên của Quý khách"),
  }
}

export function parseOp(value: unknown): JourneyOp {
  if (!isRecord(value)) bad("Thao tác không hợp lệ.")
  const itemId = (): string => text(value.itemId, 100, "Mã mục")
  switch (value.type) {
    case "join":
      return { type: "join", name: text(value.name, LIMITS.nameLength, "Tên của Quý khách") }
    case "updateInfo": {
      const op: Extract<JourneyOp, { type: "updateInfo" }> = { type: "updateInfo" }
      if (value.title !== undefined) op.title = text(value.title, LIMITS.titleLength, "Tên kế hoạch")
      if (value.startDate !== undefined) op.startDate = isoDate(value.startDate)
      if (value.nights !== undefined) op.nights = int(value.nights, 0, LIMITS.maxNights, "Số đêm")
      if (value.travelers !== undefined) op.travelers = parseTravelers(value.travelers)
      return op
    }
    case "addItem":
      return { type: "addItem", serviceId: text(value.serviceId, 100, "Mã dịch vụ") }
    case "removeItem":
      return { type: "removeItem", itemId: itemId() }
    case "moveItem": {
      const day = value.day === null ? null : int(value.day, 1, LIMITS.maxNights + 1, "Ngày")
      const order = value.order === undefined ? undefined : int(value.order, 0, LIMITS.maxItems, "Vị trí")
      return { type: "moveItem", itemId: itemId(), day, order }
    }
    case "setQuantity": {
      const quantity = value.quantity === null ? null : int(value.quantity, 1, LIMITS.maxQuantity, "Số lượng")
      return { type: "setQuantity", itemId: itemId(), quantity }
    }
    case "vote": {
      const vote = value.value
      if (vote !== 1 && vote !== -1) bad("Phiếu bầu không hợp lệ.")
      return { type: "vote", itemId: itemId(), value: vote }
    }
    case "comment":
      return { type: "comment", itemId: itemId(), text: text(value.text, LIMITS.commentLength, "Bình luận") }
    default:
      bad("Thao tác không hợp lệ.")
  }
}

function findItem(journey: PublicJourney, itemId: string): JourneyItem {
  const item = journey.items.find((entry) => entry.id === itemId)
  if (!item) throw new JourneyError(404, "Mục này không còn trong kế hoạch.")
  return item
}

/** Các mục của một ngày (hoặc "Đang cân nhắc" khi day = null), theo thứ tự. */
function groupOf(journey: PublicJourney, day: number | null): JourneyItem[] {
  return journey.items.filter((item) => item.day === day).sort((a, b) => a.order - b.order)
}

/** Chuyển mục sang nhóm đích tại vị trí order (mặc định cuối nhóm), đánh lại order cả hai nhóm. */
function moveItem(journey: PublicJourney, item: JourneyItem, day: number | null, order?: number): void {
  if (day !== null && day > journey.nights + 1) bad("Ngày này nằm ngoài chuyến đi.")
  const source = item.day
  const target = groupOf(journey, day).filter((entry) => entry !== item)
  target.splice(Math.min(order ?? target.length, target.length), 0, item)
  item.day = day
  target.forEach((entry, position) => {
    entry.order = position
  })
  if (source !== day) {
    groupOf(journey, source).forEach((entry, position) => {
      entry.order = position
    })
  }
}

function addItem(journey: PublicJourney, serviceId: string, memberId: string, deps: OpDeps): void {
  if (journey.items.length >= LIMITS.maxItems) bad(`Kế hoạch đã đủ ${LIMITS.maxItems} mục.`)
  const service = deps.lookup(serviceId)
  if (!service || service.destinationSlug !== journey.destinationSlug) bad("Dịch vụ không có trong danh mục.")
  const { name, kind, tag, priceVnd, priceUnit, childRates, imageUrl, bookUrl, mock } = service
  journey.items.push({
    id: deps.newId(),
    serviceId,
    snapshot: { name, kind, tag, priceVnd, priceUnit, childRates, imageUrl, bookUrl, mock },
    day: null,
    order: groupOf(journey, null).length,
    quantity: null,
    addedBy: memberId,
    votes: {},
    comments: [],
  })
}

function updateInfo(journey: PublicJourney, op: Extract<JourneyOp, { type: "updateInfo" }>): void {
  if (op.title !== undefined) journey.title = op.title
  if (op.startDate !== undefined) journey.startDate = op.startDate
  if (op.travelers !== undefined) journey.travelers = op.travelers
  if (op.nights !== undefined) {
    journey.nights = op.nights
    const cut = journey.items.filter((item) => item.day !== null && item.day > journey.nights + 1).sort((a, b) => a.order - b.order)
    for (const item of cut) moveItem(journey, item, null)
  }
}

/** Áp một thao tác lên bản sao của kế hoạch. Ném JourneyError nếu dữ liệu sai hoặc không có quyền. */
export function applyOp<T extends PublicJourney>(journey: T, rawOp: unknown, actor: OpActor, deps: OpDeps): T {
  if (actor.role !== "edit") throw new JourneyError(403, "Link chỉ xem không sửa được kế hoạch.")
  const op = parseOp(rawOp)
  const next = structuredClone(journey)

  if (op.type === "join") {
    if (next.members.length >= LIMITS.maxMembers) bad(`Kế hoạch đã đủ ${LIMITS.maxMembers} thành viên.`)
    next.members.push({ id: deps.newId(), name: op.name, joinedAt: deps.now().toISOString() })
    return next
  }

  const { memberId } = actor
  if (!memberId || !next.members.some((member) => member.id === memberId)) {
    throw new JourneyError(403, "Quý khách cần nhập tên trước khi sửa kế hoạch.")
  }

  switch (op.type) {
    case "updateInfo":
      updateInfo(next, op)
      break
    case "addItem":
      addItem(next, op.serviceId, memberId, deps)
      break
    case "removeItem": {
      const item = findItem(next, op.itemId)
      next.items = next.items.filter((entry) => entry !== item)
      groupOf(next, item.day).forEach((entry, position) => {
        entry.order = position
      })
      break
    }
    case "moveItem":
      moveItem(next, findItem(next, op.itemId), op.day, op.order)
      break
    case "setQuantity":
      findItem(next, op.itemId).quantity = op.quantity
      break
    case "vote": {
      const item = findItem(next, op.itemId)
      if (item.votes[memberId] === op.value) delete item.votes[memberId]
      else item.votes[memberId] = op.value
      break
    }
    case "comment": {
      const item = findItem(next, op.itemId)
      if (item.comments.length >= LIMITS.maxComments) bad(`Mỗi mục tối đa ${LIMITS.maxComments} bình luận.`)
      item.comments.push({ id: deps.newId(), memberId, text: op.text, at: deps.now().toISOString() })
      break
    }
  }
  return next
}

/** Người có link chỉ xem không được nhận editToken. */
export function forRole(journey: Journey, role: JourneyRole): PublicJourney {
  return role === "edit" ? journey : { ...journey, editToken: undefined }
}

export function voteScore(item: Pick<JourneyItem, "votes">): number {
  return Object.values(item.votes).reduce<number>((sum, value) => sum + value, 0)
}
