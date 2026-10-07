import { ArrowUpRightIcon, PhoneIcon, SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-20 border-b border-ocean/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-4 px-4 lg:px-6">
        <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-8 w-auto lg:h-9" />
        </a>

        <span aria-hidden className="hidden h-6 w-px bg-black/10 sm:block" />

        <p className="hidden items-center gap-1.5 text-[0.95rem] font-bold text-ocean sm:flex">
          AI Trợ lý du lịch
          <SparklesIcon aria-hidden strokeWidth={1.75} className="size-4 text-sunset" />
        </p>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${company.hotline.replace(/\s/g, "")}`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-cloud px-4 text-sm font-bold text-ocean transition-transform duration-300 ease-soft outline-none hover:bg-[#cbe6ff] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            <PhoneIcon aria-hidden strokeWidth={1.75} className="size-4" />
            <span className="hidden sm:inline">{company.hotline}</span>
            <span className="sm:hidden">Gọi</span>
          </a>
          <a
            href={`https://${company.website}`}
            target="_blank"
            rel="noreferrer"
            className="group hidden h-10 items-center gap-2 rounded-full border border-ocean pr-1 pl-4 text-sm font-bold text-ocean transition-transform duration-300 ease-soft outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] md:inline-flex"
          >
            {company.website}
            <span className="flex size-8 items-center justify-center rounded-full bg-ocean text-white transition-transform duration-300 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <ArrowUpRightIcon aria-hidden strokeWidth={1.75} className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </header>
  )
}
