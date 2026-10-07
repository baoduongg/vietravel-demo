import { Loader2Icon, RotateCwIcon, Volume2Icon } from "lucide-react"

interface StartOverlayProps {
  assistantName: string
  ready: boolean
  progress: number
  error: string | null
  onStart: () => void
}

/** Trình duyệt chặn tự phát âm thanh; cần một cú click của người dùng để mở khóa và chào. */
export function StartOverlay({ assistantName, ready, progress, error, onStart }: StartOverlayProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-md duration-500"
    >
      <div className="animate-in zoom-in-95 slide-in-from-bottom-3 flex w-full max-w-sm flex-col items-center gap-5 rounded-[1.75rem] bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,70,193,0.55)] ring-1 ring-cloud duration-500 ease-soft">
        <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-sunset to-ocean text-white shadow-[0_10px_24px_-8px_rgba(0,70,193,0.6)]">
          <Volume2Icon aria-hidden strokeWidth={1.75} className="size-7" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h2 id="start-title" className="text-2xl leading-tight font-extrabold tracking-[-0.02em] text-ink">
            Gặp {assistantName} nhé
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {assistantName} sẽ chào bằng giọng nói. Bấm bắt đầu để bật âm thanh và trò chuyện.
          </p>
        </div>

        {error ? (
          <>
            <p role="alert" className="text-sm text-ink">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ocean bg-white px-6 text-sm font-bold text-ocean transition-transform duration-300 ease-soft outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            >
              <RotateCwIcon aria-hidden strokeWidth={1.75} className="size-4" />
              Tải lại trang
            </button>
          </>
        ) : (
          <button
            type="button"
            autoFocus
            disabled={!ready}
            onClick={onStart}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean px-6 text-[0.95rem] font-bold text-white transition-all duration-300 ease-soft outline-none hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-70"
          >
            {ready ? (
              "Bắt đầu trò chuyện"
            ) : (
              <>
                <Loader2Icon aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                <span aria-live="polite" className="tabular-nums">
                  Đang chuẩn bị… {progress}%
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
