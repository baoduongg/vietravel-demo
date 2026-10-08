import Image from "next/image"
import Link from "next/link"

import { ArrowChip, buttonClass } from "@/components/explorer/cta-link"
import { phuQuoc } from "@/data/destinations/phu-quoc"

const MOODS = [
  { label: "Nghỉ dưỡng biển", href: "/diem-den/phu-quoc#luu-tru" },
  { label: "Vui chơi gia đình", href: "/diem-den/phu-quoc#vui-choi" },
  { label: "Ăn ngon", href: "/diem-den/phu-quoc#an-uong" },
  { label: "Tour giá tốt", href: "/diem-den/phu-quoc#tour" },
]

export function HomeHero(): React.JSX.Element {
  const month = phuQuoc.months[new Date().getMonth()]

  return (
    <section className="on-dark relative isolate flex min-h-[100dvh] flex-col justify-end overflow-hidden text-white">
      <Image src={phuQuoc.heroImageUrl} alt="Bãi Sao, Phú Quốc" fill priority sizes="100vw" className="animate-drift-zoom -z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_80%_85%,rgba(0,70,193,0.42),transparent),radial-gradient(50%_45%_at_88%_18%,rgba(3,145,255,0.2),transparent)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade/70 via-shade/15 to-shade/50" />
      <div aria-hidden className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-40" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-32 pb-28 lg:flex-row lg:items-end lg:justify-between lg:px-6 lg:pb-28">
        <div className="max-w-4xl">
          <h1 style={{ "--reveal-delay": "100ms" } as React.CSSProperties} className="animate-reveal font-voyage text-[3.5rem] leading-[1.15] font-normal tracking-[-0.02em] text-balance text-title sm:text-6xl lg:text-[4rem]">
            Chuyến đi tiếp theo của bạn bắt đầu từ đây
          </h1>
          <p style={{ "--reveal-delay": "260ms" } as React.CSSProperties} className="animate-reveal mt-5 max-w-lg text-base leading-[1.65] font-light text-body sm:text-lg">
            Biển xanh, hoàng hôn và những món ngon đang chờ ở Phú Quốc.
          </p>
          <div style={{ "--reveal-delay": "420ms" } as React.CSSProperties} className="animate-reveal mt-8 flex flex-wrap gap-3">
            <Link href="/diem-den/phu-quoc" className={buttonClass("primary")}>
              Khám phá Phú Quốc
              <ArrowChip />
            </Link>
            <Link href="/#diem-den" className={buttonClass("outline", "pr-6")}>
              Xem tất cả điểm đến
            </Link>
          </div>
        </div>
        <aside
          aria-label={`Phú Quốc ${month.label}`}
          style={{ "--reveal-delay": "560ms" } as React.CSSProperties}
          className="animate-reveal w-full max-w-sm glass-card p-5"
        >
          <p className="text-[11px] font-semibold tracking-[0.12em] text-gold uppercase">Phú Quốc {month.label}, khí hậu trung bình</p>
          <p className="mt-2 font-voyage text-4xl font-semibold tracking-tight text-title">{month.tempC}</p>
          <p className="text-sm text-body">{month.rain}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <li key={mood.label}>
                <Link
                  href={mood.href}
                  className="inline-flex h-9 items-center rounded-full bg-tint/5 px-3.5 text-sm font-medium text-body ring-1 ring-tint/12 transition-colors duration-300 hover:bg-champagne hover:text-void"
                >
                  {mood.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
