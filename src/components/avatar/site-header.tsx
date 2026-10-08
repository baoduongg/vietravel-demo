import { PhoneIcon, SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="z-20 shrink-0 px-3 pt-3 lg:px-5">
      <div className="mx-auto flex h-12 w-full max-w-[1480px] items-center gap-3 rounded-full bg-white/70 py-1 pr-1.5 pl-5 shadow-[0_18px_40px_-24px_rgba(0,70,193,0.45)] ring-1 ring-ocean/10 backdrop-blur-xl">
        <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-6 w-auto" />
        </a>
        <span aria-hidden className="hidden h-4 w-px bg-ocean/15 sm:block" />
        <p className="hidden items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase sm:flex">
          AI Trợ lý du lịch
          <SparklesIcon aria-hidden strokeWidth={1.5} className="size-3.5 text-sunset" />
        </p>
        <a
          href={`tel:${company.hotline.replace(/\s/g, "")}`}
          className="group ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-ocean pr-1 pl-4 text-sm font-semibold text-white outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          {company.hotline}
          <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-soft group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-px">
            <PhoneIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
          </span>
        </a>
      </div>
    </header>
  )
}
