import Link from "next/link"
import { PhoneIcon } from "lucide-react"

import { company } from "@/config/company"

const NAV = [
  { href: "/#diem-den", label: "Điểm đến" },
  { href: "/diem-den/phu-quoc#tour", label: "Tour và ưu đãi" },
  { href: "/tripi", label: "Hỏi Tripi" },
]

export function ExplorerHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 lg:px-5">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-full bg-white/80 py-1 pr-1.5 pl-5 shadow-[0_18px_40px_-24px_rgba(0,70,193,0.45)] ring-1 ring-ocean/10 backdrop-blur-xl">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo nhỏ, giữ nguyên tỉ lệ gốc */}
          <img src={company.logoUrl} alt={company.brand} className="h-6 w-auto" />
          <span className="text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase">Explorer</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80 transition-colors hover:bg-cloud/60 hover:text-ocean"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${company.hotline.replace(/\s/g, "")}`}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-ocean px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
        >
          <PhoneIcon aria-hidden strokeWidth={1.5} className="size-4" />
          {company.hotline}
        </a>
      </div>
    </header>
  )
}
