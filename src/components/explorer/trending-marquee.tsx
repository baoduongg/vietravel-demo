"use client"

import Link from "next/link"

const TRENDS = [
  { tag: "🔥 #PhuQuocVibe2026", text: "Top 1 Điểm Đến Mùa Hè", href: "/diem-den/phu-quoc" },
  { tag: "🤿 Tour Cano 4 Đảo", text: "Lặn San Hô & Bay Flycam", href: "/diem-den/phu-quoc#vui-choi" },
  { tag: "🌅 Hoàng Hôn Bãi Trường", text: "Check-in Triệu View", href: "/diem-den/phu-quoc#khoanh-khac" },
  { tag: "🚠 Cáp Treo Hòn Thơm", text: "Kỷ Lục Thế Giới Vượt Biển", href: "/diem-den/phu-quoc#vui-choi" },
  { tag: "⚡ Ưu Đãi Đặt Sớm", text: "Giảm Đến 35% Tour Trọn Gói", href: "/diem-den/phu-quoc#tour" },
  { tag: "🌴 Bãi Sao Nước Trong", text: "Cát Trắng Mịn Như Bột", href: "/diem-den/phu-quoc#khoanh-khac" },
  { tag: "🍜 Food Tour Chợ Đêm", text: "Ghẹ Hàm Ninh & Nhum Nướng", href: "/diem-den/phu-quoc#an-uong" },
  { tag: "✨ Thị Trấn Hoàng Hôn", text: "Show Pháo Hoa Kiss of The Sea", href: "/diem-den/phu-quoc#vui-choi" },
]

export function TrendingMarquee(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-y border-tint/10 bg-gradient-to-r from-void via-night to-void py-3.5 light:via-[#fff1e4]" aria-label="Xu hướng du lịch thịnh hành">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
      
      <div className="flex w-max animate-marquee gap-6 items-center">
        {[...TRENDS, ...TRENDS].map((item, index) => (
          <Link
            key={`${item.tag}-${index}`}
            href={item.href}
            className="group flex shrink-0 items-center gap-2.5 rounded-full bg-tint/[0.04] px-4 py-1.5 ring-1 ring-tint/10 backdrop-blur-md light:bg-white/70 transition-all duration-300 hover:bg-primary-ink/15 hover:ring-primary-ink/40"
          >
            <span className="font-bold text-xs text-primary-ink group-hover:text-primary-ink">
              {item.tag}
            </span>
            <span className="text-tint/40">·</span>
            <span className="text-xs font-medium text-body group-hover:text-title">
              {item.text}
            </span>
            <span className="text-xs text-primary-ink/80 transition-transform duration-300 group-hover:translate-x-0.5">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
