"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLinkIcon, GlobeIcon, Loader2Icon, SearchIcon } from "lucide-react"

import { CARD_CLASS } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { MAX_QUERY_LENGTH } from "@/lib/vietravel-search-limits"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { tourService } from "@/services/tour.service"
import type { TourSearchResponse } from "@/types/tour"

const SUGGESTIONS = ["Nhật Bản", "Hàn Quốc", "Châu Âu", "Dubai", "Mỹ", "Úc", "Thổ Nhĩ Kỳ", "Ai Cập", "Trung Quốc", "Thái Lan"]

type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; result: TourSearchResponse }
  | { status: "error"; message: string }

interface WorldTourSearchProps {
  hotline: string
}

/** Khách gõ điểm đến bất kỳ trên thế giới, tour lấy trực tiếp từ travel.com.vn; bấm thẻ mở trang chi tiết tour. */
export function WorldTourSearch({ hotline }: WorldTourSearchProps): React.JSX.Element {
  const [query, setQuery] = useState("")
  const [state, setState] = useState<SearchState>({ status: "idle" })
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  async function search(raw: string): Promise<void> {
    const text = raw.trim()
    if (!text) return
    setQuery(text)
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setState({ status: "loading", query: text })
    try {
      const result = await tourService.search(text, current.signal)
      if (!current.signal.aborted) setState({ status: "done", result })
    } catch (error) {
      if (!current.signal.aborted) {
        setState({ status: "error", message: getErrorMessage(error, "Chưa tải được tour, Quý khách thử lại nhé.") })
      }
    }
  }

  return (
    <div className="space-y-8">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          void search(query)
        }}
        className={cn(CARD_CLASS, "space-y-4")}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Điểm đến</span>
            <GlobeIcon aria-hidden className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary-ink" />
            <input
              type="search"
              value={query}
              maxLength={MAX_QUERY_LENGTH}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập điểm đến bất kỳ: Paris, Thụy Sĩ, Bắc Kinh, New Zealand..."
              className="h-13 w-full rounded-2xl border border-tint/12 bg-tint/[0.04] pr-4 pl-12 text-sm text-title shadow-inner transition-all placeholder:text-muted-foreground focus:border-primary-ink focus:ring-2 focus:ring-primary-ink/20 focus:outline-none sm:text-base"
            />
          </label>
          <button
            type="submit"
            disabled={!query.trim() || state.status === "loading"}
            className="btn-primary inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold disabled:opacity-60"
          >
            {state.status === "loading" ? (
              <Loader2Icon aria-hidden className="size-4 animate-spin" />
            ) : (
              <SearchIcon aria-hidden className="size-4" />
            )}
            Tìm tour
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs font-bold text-muted-foreground">Gợi ý:</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void search(suggestion)}
              className="rounded-full border border-tint/10 bg-tint/5 px-3 py-1 text-xs font-medium text-body transition-all hover:bg-primary-ink/15 hover:text-primary-ink"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite">
        {state.status === "loading" && (
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Loader2Icon aria-hidden className="size-4 animate-spin text-primary-ink" />
            Đang tìm tour {state.query} trên travel.com.vn...
          </p>
        )}

        {state.status === "error" && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500">{state.message}</p>
        )}

        {state.status === "done" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {state.result.tours.length > 0 ? (
                  <>
                    <span className="font-bold text-title">{state.result.tours.length} tour</span> cho “{state.result.query}”, bấm vào thẻ để xem chi tiết trên travel.com.vn.
                  </>
                ) : (
                  <>Chưa có tour sắp khởi hành cho “{state.result.query}”.</>
                )}
              </p>
              <a
                href={state.result.searchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-ink hover:underline"
              >
                Xem tất cả trên travel.com.vn
                <ExternalLinkIcon aria-hidden className="size-4" />
              </a>
            </div>
            <TourList tours={state.result.tours} hotline={hotline} />
          </div>
        )}
      </div>
    </div>
  )
}
