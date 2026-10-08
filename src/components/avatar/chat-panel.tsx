import { useEffect, useId, useRef, useState } from "react"
import { HistoryIcon, ImageIcon, SendHorizontalIcon, XIcon } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import { ScrollArea } from "@/components/ui/scroll-area"
import { processAndCompressImage } from "@/lib/image-utils"
import { cn } from "@/lib/utils"
import type { AvatarStatus } from "@/stores/avatar.store"
import type { ChatMessage } from "@/types/chat"

interface ChatPanelProps {
  messages: ChatMessage[]
  assistantName: string
  status?: AvatarStatus
  historyOpen: boolean
  disabled: boolean
  micButton: React.ReactNode
  notice: string | null
  onToggleHistory: () => void
  onSubmit: (text: string, image?: string) => void
  className?: string
}

export function ChatPanel({
  messages,
  assistantName,
  status = "idle",
  historyOpen,
  disabled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  micButton: _micButton,
  notice,
  onToggleHistory,
  onSubmit,
  className,
}: ChatPanelProps): React.JSX.Element {
  const [draft, setDraft] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  // Chỉ cuộn khung lịch sử; scrollIntoView sẽ cuộn cả cột cha và đẩy ô nhập ra khỏi màn hình.
  useEffect(() => {
    const viewport = historyRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (historyOpen && viewport) viewport.scrollTop = viewport.scrollHeight
  }, [historyOpen, messages.length])

  const handleImageFile = async (file: File): Promise<void> => {
    try {
      setIsProcessingImage(true)
      const dataUrl = await processAndCompressImage(file)
      setSelectedImage(dataUrl)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xử lý hình ảnh.")
    } finally {
      setIsProcessingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) void handleImageFile(file)
  }

  const handlePaste = (event: React.ClipboardEvent): void => {
    const items = event.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          void handleImageFile(file)
          break
        }
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const text = draft.trim()
    if ((!text && !selectedImage) || disabled || isProcessingImage) return
    onSubmit(text, selectedImage ?? undefined)
    setDraft("")
    setSelectedImage(null)
  }

  return (
    <div className={cn("relative rounded-[1.75rem] bg-ocean/[0.04] p-1.5 ring-1 ring-ocean/10", className)}>
      <div className="flex flex-col rounded-[calc(1.75rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
        {historyOpen && (
          <ScrollArea
            id="chat-history"
            ref={historyRef}
            className="absolute inset-x-0 bottom-full z-30 mb-2 h-[min(20rem,45dvh)] overflow-hidden rounded-[1.75rem] bg-white/95 shadow-[0_30px_60px_-24px_rgba(0,70,193,0.45)] ring-1 ring-ocean/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {messages.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Chưa có tin nhắn nào. Hãy chọn câu hỏi nhanh, nhập câu hỏi hoặc gửi ảnh địa danh bên dưới.
              </p>
            ) : (
              <ol className="flex flex-col gap-3 p-4">
                {messages.map((message, index) => (
                  <motion.li
                    key={`${index}-${message.role}`}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className={cn(
                      "flex max-w-[85%] flex-col gap-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "self-end rounded-br-md bg-ocean text-white"
                        : "self-start rounded-bl-md bg-white text-ink ring-1 ring-cloud",
                    )}
                  >
                    <span className="sr-only">{message.role === "user" ? "Quý khách: " : `${assistantName}: `}</span>
                    {message.image && (
                      <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={message.image}
                          alt="Hình ảnh gửi kèm"
                          className="max-h-48 w-auto rounded-lg object-cover"
                        />
                      </div>
                    )}
                    {message.content && <span>{message.content}</span>}
                  </motion.li>
                ))}
              </ol>
            )}
          </ScrollArea>
        )}

        {selectedImage && (
          <div className="flex items-center gap-2.5 border-b border-cloud bg-secondary px-4 py-2 text-xs">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-cloud">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedImage} alt="Xem trước" className="size-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold text-ocean">Đã chọn hình ảnh</span>
              <span className="truncate text-muted-foreground">Tripi sẽ nhận diện cảnh đẹp & địa danh trong ảnh</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="flex size-7 items-center justify-center rounded-full bg-white text-ocean shadow-sm transition-transform hover:scale-105 active:scale-95"
              aria-label="Xoá ảnh"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        )}

        {notice && (
          <p
            role="alert"
            className="mx-3 mt-3 shrink-0 rounded-xl bg-cloud px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-ink"
          >
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} onPaste={handlePaste} className="flex shrink-0 items-center gap-2 p-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={onToggleHistory}
            aria-expanded={historyOpen}
            aria-controls="chat-history"
            title={`Lịch sử trò chuyện (${messages.length})`}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border border-cloud bg-muted text-muted-foreground transition-colors duration-300 ease-soft hover:border-ocean hover:text-ocean",
              historyOpen && "border-ocean bg-ocean/10 text-ocean",
            )}
          >
            <HistoryIcon aria-hidden strokeWidth={1.5} className="size-5" />
            <span className="sr-only">Lịch sử trò chuyện ({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessingImage}
            title="Tải ảnh cảnh đẹp để tìm tour tương tự"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border border-cloud bg-muted text-muted-foreground transition-all duration-300 ease-soft hover:border-ocean hover:bg-ocean/10 hover:text-ocean active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50",
              selectedImage && "border-sunset bg-accent text-ocean",
            )}
          >
            <ImageIcon aria-hidden strokeWidth={1.5} className="size-5" />
            <span className="sr-only">Tải ảnh</span>
          </button>

          <label
            htmlFor={inputId}
            className={cn(
              "flex h-11 min-w-0 flex-1 cursor-text items-center rounded-full bg-muted px-4 transition-all duration-300 ease-soft focus-within:bg-white focus-within:ring-2 focus-within:ring-ring/60",
              status === "thinking" && "animate-thinking-pulse bg-secondary",
            )}
          >
            <input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={disabled}
              aria-label={`Câu hỏi cho ${assistantName}`}
              placeholder={
                status === "thinking"
                  ? `${assistantName} đang trả lời...`
                  : selectedImage
                    ? "Thêm ghi chú cho ảnh (tuỳ chọn)"
                    : "Ví dụ: tour Đà Lạt 3 ngày tháng 11, hoặc dán ảnh vào đây"
              }
              maxLength={500}
              className="w-full min-w-0 bg-transparent text-[0.92rem] font-semibold text-ocean outline-none placeholder:font-medium placeholder:text-[#8a8f98] disabled:cursor-not-allowed"
            />
          </label>

          <button
            type="submit"
            disabled={disabled || (draft.trim().length === 0 && !selectedImage) || isProcessingImage}
            className="group/send inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ocean py-1.5 pr-1.5 pl-5 text-[0.92rem] font-semibold text-white outline-none transition-all duration-500 ease-soft hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50"
          >
            <span className="hidden sm:inline">Gửi</span>
            <span className="sr-only sm:hidden">Gửi câu hỏi</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-soft group-hover/send:translate-x-0.5 group-hover/send:-translate-y-px group-hover/send:scale-105">
              <SendHorizontalIcon aria-hidden strokeWidth={1.5} className="size-4" />
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
