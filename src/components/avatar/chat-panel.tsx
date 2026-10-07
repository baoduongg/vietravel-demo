import { useEffect, useId, useRef, useState } from "react"
import { ChevronDownIcon, ImageIcon, MessageCircleIcon, SendHorizontalIcon, SparklesIcon, XIcon } from "lucide-react"
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
              Chưa có tin nhắn nào. Hãy chọn câu hỏi nhanh, nhập câu hỏi hoặc gửi ảnh địa danh bên dưới.
            </p>
          ) : (
            <ol className="flex flex-col gap-3 p-4">
              {messages.map((message, index) => (
                <li
                  key={`${index}-${message.role}`}
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
                </li>
              ))}

              {status === "thinking" && (
                <li
                  role="status"
                  aria-live="polite"
                  className="animate-in fade-in slide-in-from-bottom-2 flex max-w-[85%] items-center gap-2.5 self-start rounded-2xl rounded-bl-md border border-cloud bg-secondary px-3.5 py-2.5 text-sm text-ink shadow-xs"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sunset text-white">
                    <SparklesIcon className="size-3.5 animate-spin motion-reduce:animate-none" />
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-ocean">
                    <span className="font-bold text-ocean">{assistantName}</span>
                    <span>đang suy nghĩ</span>
                    <span className="flex items-center gap-1 pl-1">
                      <span className="size-1.5 rounded-full bg-sunset animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 rounded-full bg-sunset animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 rounded-full bg-sunset animate-bounce" />
                    </span>
                  </div>
                </li>
              )}
            </ol>
          )}
        </ScrollArea>
      )}

      {selectedImage && (
        <div className="flex items-center gap-2.5 border-t border-cloud bg-secondary px-4 py-2 text-xs">
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
        <p role="alert" className="mx-3 mt-3 shrink-0 rounded-xl bg-cloud px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-ink">
          {notice}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        onPaste={handlePaste}
        className="flex shrink-0 items-center gap-2 border-t border-cloud p-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessingImage}
          title="Tải ảnh cảnh đẹp để tìm tour tương tự"
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full border border-cloud bg-muted text-muted-foreground transition-all duration-300 ease-soft hover:border-ocean hover:bg-ocean/10 hover:text-ocean active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50",
            selectedImage && "border-sunset bg-accent text-ocean",
          )}
        >
          <ImageIcon aria-hidden strokeWidth={1.75} className="size-5" />
          <span className="sr-only">Tải ảnh</span>
        </button>

        <label
          htmlFor={inputId}
          className={cn(
            "flex h-14 min-w-0 flex-1 cursor-text items-center gap-3 rounded-full bg-muted px-4 transition-all duration-300 ease-soft focus-within:bg-white focus-within:ring-2 focus-within:ring-ring/60",
            status === "thinking" && "bg-secondary ring-1 ring-cloud",
          )}
        >
          <MessageCircleIcon
            aria-hidden
            strokeWidth={1.75}
            className={cn("size-5 shrink-0 text-muted-foreground", status === "thinking" && "text-sunset animate-pulse")}
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[0.72rem] font-semibold text-muted-foreground">
              {status === "thinking"
                ? `${assistantName} đang trả lời...`
                : selectedImage
                  ? "Thêm ghi chú cho ảnh (tuỳ chọn)"
                  : `Câu hỏi cho ${assistantName}`}
            </span>
            <input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={disabled}
              placeholder={
                status === "thinking"
                  ? `${assistantName} đang xử lý và chuẩn bị câu trả lời...`
                  : selectedImage
                    ? "Ví dụ: Tìm tour có cảnh này khởi hành từ Hà Nội..."
                    : "Ví dụ: tour Đà Lạt 3 ngày tháng 11, hoặc dán ảnh vào đây"
              }
              maxLength={500}
              className="w-full min-w-0 bg-transparent text-[0.95rem] font-bold text-ocean outline-none placeholder:font-medium placeholder:text-[#8a8f98] disabled:cursor-not-allowed"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={disabled || (draft.trim().length === 0 && !selectedImage) || isProcessingImage}
          className={cn(
            "inline-flex h-14 shrink-0 items-center gap-2 rounded-xl bg-ocean px-5 text-[0.95rem] font-bold text-white transition-all duration-300 ease-soft outline-none hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50",
            status === "thinking" && "bg-linear-to-r from-ocean to-sunset text-white opacity-90 shadow-sm",
          )}
        >
          {status === "thinking" ? (
            <>
              <SparklesIcon aria-hidden className="size-5 animate-spin motion-reduce:animate-none" />
              <span className="hidden sm:inline">Đang nghĩ</span>
            </>
          ) : (
            <>
              <SendHorizontalIcon aria-hidden strokeWidth={1.75} className="size-5" />
              <span className="hidden sm:inline">Gửi</span>
              <span className="sr-only sm:hidden">Gửi câu hỏi</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
