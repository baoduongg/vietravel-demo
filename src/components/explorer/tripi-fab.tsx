import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function TripiFab(): React.JSX.Element {
  return (
    <aside aria-label="Trợ lý AI" className="fixed right-4 bottom-5 z-40 flex items-center gap-2.5">
      <Link
        href="/#ai-recommender"
        className="hidden md:inline-flex items-center gap-2 rounded-full bg-void/90 px-3.5 py-2 text-xs font-bold text-title shadow-xl ring-1 ring-tint/15 backdrop-blur-md transition-all duration-300 hover:border-primary-ink/50 hover:bg-primary-ink/10 hover:text-primary-ink"
      >
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>AI Gợi Ý Tour</span>
      </Link>

      <Link
        href="/tripi"
        className="group inline-flex h-12 items-center gap-2 rounded-full btn-primary px-5 text-sm font-bold shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring transition-transform active:scale-95"
      >
        <span className="relative flex size-6 items-center justify-center rounded-full bg-white/20">
          <SparklesIcon aria-hidden strokeWidth={2} className="size-3.5 text-amber-200 animate-spin-slow" />
        </span>
        <span>Hỏi {company.persona.name}</span>
      </Link>
    </aside>
  )
}

