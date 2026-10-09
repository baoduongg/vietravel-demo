import Link from "next/link"
import { CompassIcon, PhoneIcon, SparklesIcon } from "lucide-react"

import { AmbientSound } from "@/components/explorer/ambient-sound"
import { ThemeToggle } from "@/components/explorer/theme-toggle"
import { company } from "@/config/company"

const NAV = [
  { href: "/#diem-den", label: "Điểm đến" },
  { href: "/diem-den/phu-quoc#tour", label: "Tour & Ưu đãi", hot: true },
  { href: "/hanh-trinh", label: "Kế hoạch của tôi" },
  { href: "/tripi", label: "Hỏi Tripi AI" },
  { href: "/doi-tac", label: "Đối tác" },
]

export function ExplorerHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 px-2.5 pt-2.5 sm:px-4 sm:pt-3 lg:px-6">
      <div className="mx-auto flex h-13 sm:h-14 w-full max-w-6xl 2xl:max-w-7xl items-center justify-between gap-1.5 sm:gap-2.5 rounded-full bg-void/90 py-1 pr-1.5 pl-3 sm:pl-4 shadow-[0_20px_44px_-18px_rgba(0,0,0,0.6)] ring-1 ring-tint/12 backdrop-blur-[24px]">
        {/* Brand / Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap group">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-5 sm:h-6 w-auto shrink-0 logo-adapt transition-transform duration-300 group-hover:scale-105" />
          <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0">
            <span className="font-heading font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-title whitespace-nowrap">
              Explorer
            </span>
            <span className="hidden md:inline-flex items-center gap-0.5 rounded-full bg-primary-ink/15 px-1.5 py-0.2 text-[9px] font-bold text-primary-ink ring-1 ring-primary-ink/30 whitespace-nowrap shrink-0">
              <SparklesIcon className="size-2" />
              2026
            </span>
          </div>
        </Link>

        {/* Navigation - Visible on LG (1024px+) to prevent tablet overflow */}
        <nav aria-label="Điều hướng chính" className="hidden lg:flex min-w-0 flex-1 justify-center items-center gap-0.5 xl:gap-1 whitespace-nowrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative shrink-0 rounded-full px-2.5 xl:px-3.5 py-1 text-xs xl:text-sm font-semibold text-body transition-all duration-300 hover:bg-tint/[0.06] hover:text-title whitespace-nowrap inline-flex items-center"
            >
              <span>{item.label}</span>
              {item.hot && (
                <span className="ml-1 inline-block size-1.5 rounded-full bg-accent-coral animate-ping" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions Area */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap">
          {/* Ambient Beach Wave Sound Toggle */}
          <AmbientSound />

          <a
            href={`tel:${company.hotline.replace(/\s/g, "")}`}
            className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-body ring-1 ring-tint/10 transition-colors duration-300 hover:text-primary-ink hover:ring-primary-ink/30 shrink-0 whitespace-nowrap"
          >
            <PhoneIcon aria-hidden strokeWidth={2} className="size-3 text-primary-ink" />
            <span>{company.hotline}</span>
          </a>

          <ThemeToggle />

          <Link
            href="/diem-den/phu-quoc"
            className="btn-primary inline-flex h-9 sm:h-10 items-center justify-center rounded-full px-3.5 sm:px-4.5 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-md"
          >
            <CompassIcon className="size-3.5 mr-1 hidden sm:inline animate-spin-slow" />
            <span>Khám phá ngay</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

