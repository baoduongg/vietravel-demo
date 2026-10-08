"use client"

import { useState } from "react"
import Image from "next/image"
import { DropdownMenu } from "radix-ui"
import { EllipsisIcon, ExternalLinkIcon, MessageCircleIcon, MinusIcon, PlusIcon, SendIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { KIND_ICON } from "@/components/journey/kind-icon"
import { ICON_BUTTON, INPUT_CLASS, MENU_CLASS, MENU_ITEM_CLASS } from "@/components/journey/styles"
import { defaultQuantity } from "@/lib/journey/cost"
import { priceLabel } from "@/lib/journey/labels"
import { LIMITS } from "@/lib/journey/operations"
import { cn } from "@/lib/utils"
import { QUANTITY_LABEL, SERVICE_KIND_LABEL, type JourneyItem, type JourneyOp, type Travelers } from "@/types/journey"

interface JourneyItemCardProps {
  item: JourneyItem
  /** Vị trí trong nhóm, để bật/tắt Lên trên, Xuống dưới. */
  index: number
  groupSize: number
  dayCount: number
  travelers: Travelers
  canEdit: boolean
  memberId: string | undefined
  memberName: (id: string) => string
  onOp: (op: JourneyOp) => void
}

export function JourneyItemCard({ item, index, groupSize, dayCount, travelers, canEdit, memberId, memberName, onOp }: JourneyItemCardProps): React.JSX.Element {
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState("")
  const { snapshot, day } = item
  const Icon = KIND_ICON[snapshot.kind]
  const quantity = item.quantity ?? defaultQuantity(snapshot.priceUnit, travelers)
  const votes = Object.values(item.votes)
  const mine = memberId ? item.votes[memberId] : undefined
  const targets: (number | null)[] = [null, ...Array.from({ length: dayCount }, (_, position) => position + 1)].filter((target) => target !== day)

  function submitComment(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!draft.trim()) return
    onOp({ type: "comment", itemId: item.id, text: draft })
    setDraft("")
  }

  function voteButton(value: 1 | -1): React.JSX.Element {
    const VoteIcon = value === 1 ? ThumbsUpIcon : ThumbsDownIcon
    const count = votes.filter((vote) => vote === value).length
    const label = value === 1 ? "Thích" : "Không thích"
    return (
      <button
        type="button"
        disabled={!canEdit}
        aria-pressed={mine === value}
        aria-label={`${label}, ${count} phiếu`}
        onClick={() => onOp({ type: "vote", itemId: item.id, value })}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          mine === value ? "bg-champagne text-void" : "bg-tint/5 text-body enabled:hover:bg-tint/10",
        )}
      >
        <VoteIcon aria-hidden strokeWidth={1.5} className="size-4" />
        {count}
      </button>
    )
  }

  return (
    <li className="glass-card p-4">
      <div className="flex gap-4">
        {snapshot.imageUrl ? (
          <Image src={snapshot.imageUrl} alt="" width={96} height={72} className="h-[72px] w-24 shrink-0 rounded-xl object-cover" />
        ) : (
          <span aria-hidden className="grid h-[72px] w-24 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary-ink/25 via-tint/[0.06] to-gold/25 text-gold">
            <Icon strokeWidth={1.5} className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gold">
            {SERVICE_KIND_LABEL[snapshot.kind]} · {snapshot.tag}
          </p>
          <h3 className="font-semibold text-title">{snapshot.name}</h3>
          <p className="text-sm text-muted-foreground">
            {priceLabel(snapshot)}
            {snapshot.mock && <span className="ml-2 rounded-full bg-tint/[0.08] px-2 py-0.5 text-[11px] whitespace-nowrap">Giá tham khảo (demo)</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Thêm bởi {memberName(item.addedBy)}</p>
          {snapshot.credit && (
            <p className="text-[11px] text-muted-foreground">
              Ảnh:{" "}
              <a href={snapshot.credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                {snapshot.credit.author}, {snapshot.credit.license}
              </a>
            </p>
          )}
        </div>
        {canEdit && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger aria-label={`Thao tác với ${snapshot.name}`} className={ICON_BUTTON}>
              <EllipsisIcon aria-hidden strokeWidth={1.5} className="size-5" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <div className="explorer contents">
                <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CLASS}>
                  {day !== null && index > 0 && (
                    <DropdownMenu.Item className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day, order: index - 1 })}>
                      Lên trên
                    </DropdownMenu.Item>
                  )}
                  {day !== null && index < groupSize - 1 && (
                    <DropdownMenu.Item className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day, order: index + 1 })}>
                      Xuống dưới
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Label className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Chuyển sang</DropdownMenu.Label>
                  {targets.map((target) => (
                    <DropdownMenu.Item key={target ?? "considering"} className={MENU_ITEM_CLASS} onSelect={() => onOp({ type: "moveItem", itemId: item.id, day: target })}>
                      {target === null ? "Đang cân nhắc" : `Ngày ${target}`}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="my-1 h-px bg-tint/10" />
                  <DropdownMenu.Item className={cn(MENU_ITEM_CLASS, "text-coral")} onSelect={() => onOp({ type: "removeItem", itemId: item.id })}>
                    Xóa khỏi kế hoạch
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {quantity !== null && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{QUANTITY_LABEL[snapshot.priceUnit]}</span>
          {canEdit && (
            <button type="button" aria-label="Giảm" disabled={quantity <= 1} onClick={() => onOp({ type: "setQuantity", itemId: item.id, quantity: quantity - 1 })} className={ICON_BUTTON}>
              <MinusIcon aria-hidden strokeWidth={1.5} className="size-4" />
            </button>
          )}
          <span className="min-w-6 text-center font-semibold text-title">{quantity}</span>
          {canEdit && (
            <button type="button" aria-label="Tăng" disabled={quantity >= LIMITS.maxQuantity} onClick={() => onOp({ type: "setQuantity", itemId: item.id, quantity: quantity + 1 })} className={ICON_BUTTON}>
              <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {voteButton(1)}
        {voteButton(-1)}
        <button
          type="button"
          aria-expanded={showComments}
          onClick={() => setShowComments((shown) => !shown)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-tint/5 px-3 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircleIcon aria-hidden strokeWidth={1.5} className="size-4" />
          {item.comments.length} bình luận
        </button>
        <a
          href={snapshot.bookUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-champagne outline-none hover:bg-tint/[0.08] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Đặt
          <ExternalLinkIcon aria-hidden strokeWidth={1.5} className="size-4" />
        </a>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-tint/10 pt-3">
          {item.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bình luận.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {item.comments.map((comment) => (
                <li key={comment.id} className="text-sm">
                  <span className="font-semibold text-title">{memberName(comment.memberId)}:</span> {comment.text}
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <form onSubmit={submitComment} className="mt-3 flex items-end gap-2">
              <input
                aria-label="Viết bình luận"
                maxLength={LIMITS.commentLength}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ví dụ: Resort này có hồ bơi cho bé không?"
                className={INPUT_CLASS}
              />
              <button type="submit" aria-label="Gửi bình luận" className={cn(ICON_BUTTON, "size-11")}>
                <SendIcon aria-hidden strokeWidth={1.5} className="size-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  )
}
