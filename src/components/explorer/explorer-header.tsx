import Link from "next/link"
import { PhoneIcon } from "lucide-react"

import { ThemeToggle } from "@/components/explorer/theme-toggle"
import { company } from "@/config/company"

const NAV = [
  { href: "/#diem-den", label: "Điểm đến" },
  { href: "/diem-den/phu-quoc#tour", label: "Tour và ưu đãi" },
  { href: "/hanh-trinh", label: "Kế hoạch của tôi" },
  { href: "/tripi", label: "Hỏi Tripi" },
]

export function ExplorerHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 lg:px-5">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 rounded-full sm:gap-4 bg-void/75 py-1 pr-1.5 pl-4 sm:pl-5 shadow-[0_20px_44px_-22px_rgba(0,0,0,0.45)] ring-1 ring-tint/10 backdrop-blur-[20px]">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-6 w-auto logo-adapt" />
          <span className="font-voyage text-base font-normal tracking-tight text-champagne italic">Explorer</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-body transition-colors duration-300 hover:bg-tint/[0.08] hover:text-champagne"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${company.hotline.replace(/\s/g, "")}`}
          className="ml-auto hidden items-center gap-2 text-sm font-medium text-body transition-colors duration-300 hover:text-champagne lg:inline-flex"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          {company.hotline}
        </a>
        <span className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          <Link
            href="/diem-den/phu-quoc"
            className="btn-primary inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap sm:px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sm:hidden">Bắt đầu</span>
            <span className="hidden sm:inline">Bắt đầu hành trình</span>
          </Link>
        </span>
      </div>
    </header>
  )
}
