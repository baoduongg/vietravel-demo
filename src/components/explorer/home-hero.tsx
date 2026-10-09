import Image from "next/image"
import Link from "next/link"
import { SparklesIcon, SunIcon, WavesIcon } from "lucide-react"

import { ArrowChip, buttonClass } from "@/components/explorer/cta-link"
import { phuQuoc } from "@/data/destinations/phu-quoc"

const MOODS = [
  { emoji: "🏖️", label: "Chill Biển & Sunset", href: "/diem-den/phu-quoc#luu-tru" },
  { emoji: "🤿", label: "Lặn San Hô Đảo Hoang", href: "/diem-den/phu-quoc#vui-choi" },
  { emoji: "🎢", label: "Quẩy VinWonders", href: "/diem-den/phu-quoc#vui-choi" },
  { emoji: "🍤", label: "Food Tour Chợ Đêm", href: "/diem-den/phu-quoc#an-uong" },
  { emoji: "🔥", label: "Tour Hot Giá Tốt", href: "/diem-den/phu-quoc#tour" },
]

export function HomeHero(): React.JSX.Element {
  const month = phuQuoc.months[new Date().getMonth()]

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col justify-end overflow-hidden text-title">
      <Image
        src={phuQuoc.heroImageUrl}
        alt="Bãi Sao, Phú Quốc"
        fill
        priority
        sizes="100vw"
        className="animate-drift-zoom -z-20 object-cover brightness-[0.88] contrast-[1.05] light:brightness-105"
      />
      {/* Radiant Tropical Gradient Mesh Overlay */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_80%_80%,rgba(255,94,54,0.35),transparent_70%),radial-gradient(60%_50%_at_20%_20%,rgba(0,70,193,0.35),transparent_70%)] light:opacity-40" />
      <div aria-hidden className="hero-scrim absolute inset-0 -z-10" />
      <div aria-hidden className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-44" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-32 pb-20 lg:flex-row lg:items-end lg:justify-between lg:px-6 lg:pb-24">
        <div className="max-w-3xl">
          {/* Eyebrow Badge */}
          <div style={{ "--reveal-delay": "50ms" } as React.CSSProperties} className="animate-reveal inline-flex items-center gap-2 rounded-full bg-tint/10 px-3.5 py-1.5 ring-1 ring-tint/20 backdrop-blur-md mb-4 light:bg-white/70 light:ring-tint/10 whitespace-nowrap">
            <span className="flex size-2 rounded-full bg-accent-coral animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 light:text-coral-ink whitespace-nowrap">
              Điểm Đến Hot Nhất 2026
            </span>
            <span className="text-tint/40">·</span>
            <span className="text-xs font-medium text-title/90 flex items-center gap-1 whitespace-nowrap">
              <SunIcon className="size-3 text-amber-400 light:text-amber-600" />
              Phú Quốc Vẫy Gọi
            </span>
          </div>

          <h1
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="animate-reveal font-heading text-[2.75rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-title sm:text-6xl lg:text-[4.25rem]"
          >
            Bật mood phiêu lưu, <br />
            <span className="text-gradient-brand">
              chạm vào thiên đường biển
            </span>
          </h1>

          <p
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
            className="animate-reveal mt-5 max-w-xl text-base leading-relaxed font-normal text-body sm:text-lg"
          >
            Biển ngọc trong vắt, hoàng hôn triệu view và những chuyến cano lướt sóng qua đảo hoang đang chờ bạn tại Phú Quốc cùng Vietravel.
          </p>

          <div style={{ "--reveal-delay": "380ms" } as React.CSSProperties} className="animate-reveal mt-8 flex flex-wrap items-center gap-3.5">
            <Link href="/diem-den/phu-quoc" className={buttonClass("primary", "h-13 px-7 text-base shadow-[0_10px_30px_rgba(0,70,193,0.4)]")}>
              <span>Khám phá Phú Quốc ngay</span>
              <ArrowChip />
            </Link>
            <Link href="/#diem-den" className={buttonClass("outline", "h-13 px-6 text-base")}>
              <span>Tất cả điểm đến</span>
            </Link>
          </div>

          {/* Quick Mood Pills */}
          <div style={{ "--reveal-delay": "480ms" } as React.CSSProperties} className="animate-reveal mt-8 pt-6 border-t border-tint/10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-ink/90 mb-3 flex items-center gap-1.5">
              <SparklesIcon className="size-3.5" />
              Chọn vibe chuyến đi bạn thích:
            </p>
            <ul className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <li key={mood.label}>
                  <Link
                    href={mood.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-tint/8 px-3.5 py-1.5 text-xs font-semibold text-title/90 ring-1 ring-tint/15 backdrop-blur-md light:bg-white/75 light:ring-tint/10 light:shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:ring-primary hover:scale-105"
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Double Bezel Weather & Quick Stats Widget */}
        <aside
          aria-label={`Thông tin Phú Quốc ${month.label}`}
          style={{ "--reveal-delay": "560ms" } as React.CSSProperties}
          className="animate-reveal w-full max-w-sm double-bezel shrink-0"
        >
          <div className="double-bezel-inner p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-tint/10 pb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-primary-ink uppercase">
                <SunIcon className="size-3.5 text-amber-400 animate-spin-slow" />
                Thời tiết {month.label} Phú Quốc
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 light:bg-emerald-500/12 light:text-emerald-700 ring-1 ring-emerald-500/30">
                LÝ TƯỞNG
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="font-heading text-4xl font-extrabold tracking-tight text-title">{month.tempC}</p>
                <p className="text-sm font-medium text-body mt-0.5 flex items-center gap-1">
                  <WavesIcon className="size-3.5 text-cyan-400 light:text-cyan-600" />
                  {month.rain} · Biển êm
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Bay từ TP.HCM</span>
                <span className="text-sm font-bold text-title">~55 phút ✈️</span>
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-tint/[0.06] p-3 text-xs leading-relaxed text-body ring-1 ring-tint/8">
              💡 <span className="font-semibold text-title">Mẹo:</span> {month.advice}
            </p>

            <Link
              href="/diem-den/phu-quoc#thoi-tiet"
              className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-primary-ink/15 py-2.5 text-xs font-bold text-primary-ink ring-1 ring-primary-ink/30 transition-all hover:bg-primary hover:text-white"
            >
              <span>Xem dự báo chi tiết cả năm</span>
              <span>→</span>
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

