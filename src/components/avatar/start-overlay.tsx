import { CameraIcon, KeyboardIcon, Loader2Icon, MicIcon, RotateCwIcon } from "lucide-react"
import { motion } from "motion/react"

interface StartOverlayProps {
  assistantName: string
  ready: boolean
  progress: number
  error: string | null
  onStart: () => void
}

const CAPABILITIES = [
  { icon: MicIcon, label: "Nói chuyện" },
  { icon: KeyboardIcon, label: "Gõ chữ" },
  { icon: CameraIcon, label: "Gửi ảnh" },
]

/**
 * Nằm ngay trên sân khấu để khách thấy Tripi đã sẵn sàng phía sau.
 * Trình duyệt chặn tự phát âm thanh nên vẫn cần một cú bấm để mở khóa và chào.
 */
export function StartOverlay({ assistantName, ready, progress, error, onStart }: StartOverlayProps): React.JSX.Element {
  return (
    <motion.div
      role="group"
      aria-labelledby="start-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
      transition={{ duration: 0.6 }}
      className="absolute inset-x-0 top-7 bottom-0 z-20 flex items-center justify-center rounded-[1.5rem] bg-ink/30 p-4 backdrop-blur-[3px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.1 }}
        className="flex w-full max-w-md flex-col items-center gap-3 rounded-[1.75rem] bg-white/85 p-5 text-center shadow-[0_30px_70px_-30px_rgba(0,70,193,0.6)] ring-1 ring-white backdrop-blur-xl lg:gap-4 lg:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 id="start-title" className="text-xl leading-tight font-extrabold tracking-[-0.02em] text-ink lg:text-2xl">
            Xin chào, mình là <span className="text-ocean">{assistantName}</span>
          </h2>
          <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">
            Trợ lý du lịch của Vietravel. Bấm bắt đầu để bật âm thanh, rồi nói hoặc gõ chuyến đi Quý khách đang nghĩ tới.
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-2">
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-ocean/[0.07] px-3 py-1 text-xs font-semibold text-ocean"
            >
              <Icon aria-hidden strokeWidth={1.75} className="size-3.5" />
              {label}
            </li>
          ))}
        </ul>

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
            className="animate-thinking-pulse inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-ocean to-sunset px-6 text-[0.95rem] font-bold text-white shadow-[0_14px_30px_-12px_rgba(0,70,193,0.8)] transition-all duration-300 ease-soft outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 enabled:hover:brightness-110 active:scale-[0.97] disabled:opacity-70"
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
      </motion.div>
    </motion.div>
  )
}
