"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ChevronDownIcon, MessageCircleIcon, SendHorizontalIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/chat"

interface ChatPanelProps {
  messages: ChatMessage[]
  assistantName: string
  historyOpen: boolean
  disabled: boolean
  micButton: React.ReactNode
  notice: string | null
  onToggleHistory: () => void
  onSubmit: (text: string) => void
  className?: string
}

export function ChatPanel({
  messages,
  assistantName,
  historyOpen,
  disabled,
  micButton,
  notice,
  onToggleHistory,
  onSubmit,
  className,
}: ChatPanelProps): React.JSX.Element {
  const [draft, setDraft] = useState<string>("")
  const historyRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  // Chỉ cuộn khung lịch sử; scrollIntoView sẽ cuộn cả cột cha và đẩy ô nhập ra khỏi màn hình.
  useEffect(() => {
    const viewport = historyRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (historyOpen && viewport) viewport.scrollTop = viewport.scrollHeight
  }, [historyOpen, messages.length])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || disabled) return
    onSubmit(text)
    setDraft("")
  }

  return (
    <div className={cn("flex min-h-[8rem] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-cloud", className)}>
      <button
        type="button"
        onClick={onToggleHistory}
        aria-expanded={historyOpen}
        aria-controls="chat-history"
        className="flex w-full shrink-0 items-center justify-between px-4 py-3 text-sm font-bold text-ink outline-none transition-colors duration-300 ease-soft hover:bg-secondary focus-visible:bg-secondary"
      >
        <span>
          Lịch sử trò chuyện <span className="font-semibold text-muted-foreground">({messages.length})</span>
        </span>
        <ChevronDownIcon
          aria-hidden
          strokeWidth={1.75}
          className={cn("size-4 transition-transform duration-300 ease-soft", historyOpen && "rotate-180")}
        />
      </button>

      {historyOpen && (
        <ScrollArea
          id="chat-history"
          ref={historyRef}
          className="h-64 min-h-0 border-t border-cloud bg-[#fafbfc] lg:h-[min(22rem,40dvh)] lg:shrink"
        >
          {messages.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Chưa có tin nhắn nào. Hãy chọn một câu hỏi nhanh hoặc nhập câu hỏi bên dưới.
            </p>
          ) : (
            <ol className="flex flex-col gap-3 p-4">
              {messages.map((message, index) => (
                <li
                  key={`${index}-${message.role}`}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "self-end rounded-br-md bg-ocean text-white"
                      : "self-start rounded-bl-md bg-white text-ink ring-1 ring-cloud",
                  )}
                >
                  <span className="sr-only">{message.role === "user" ? "Quý khách: " : `${assistantName}: `}</span>
                  {message.content}
                </li>
              ))}
            </ol>
          )}
        </ScrollArea>
      )}

      {notice && (
        <p role="alert" className="mx-3 mt-3 shrink-0 rounded-xl bg-cloud px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-ink">
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2.5 border-t border-cloud p-3">
        {/* {micButton} */}
        <label
          htmlFor={inputId}
          className="flex h-14 min-w-0 flex-1 cursor-text items-center gap-3 rounded-full bg-muted px-4 transition-shadow duration-300 ease-soft focus-within:bg-white focus-within:ring-2 focus-within:ring-ring/60"
        >
          <MessageCircleIcon aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-muted-foreground" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[0.72rem] font-semibold text-muted-foreground">Câu hỏi cho {assistantName}</span>
            <input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={disabled}
              placeholder="Ví dụ: tour Đà Lạt 3 ngày tháng 11"
              maxLength={500}
              className="w-full min-w-0 bg-transparent text-[0.95rem] font-bold text-ocean outline-none placeholder:font-medium placeholder:text-[#8a8f98] disabled:cursor-not-allowed"
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={disabled || draft.trim().length === 0}
          className="inline-flex h-14 shrink-0 items-center gap-2 rounded-xl bg-ocean px-5 text-[0.95rem] font-bold text-white transition-transform duration-300 ease-soft outline-none hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50"
        >
          <SendHorizontalIcon aria-hidden strokeWidth={1.75} className="size-5" />
          <span className="hidden sm:inline">Gửi</span>
          <span className="sr-only sm:hidden">Gửi câu hỏi</span>
        </button>
      </form>
    </div>
  )
}
