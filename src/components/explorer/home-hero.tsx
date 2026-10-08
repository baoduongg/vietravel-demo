import Image from "next/image"
import Link from "next/link"

import { phuQuoc } from "@/data/destinations/phu-quoc"

const MOODS = [
  { label: "Nghỉ dưỡng biển", href: "/diem-den/phu-quoc#luu-tru" },
  { label: "Vui chơi gia đình", href: "/diem-den/phu-quoc#vui-choi" },
  { label: "Ăn ngon", href: "/diem-den/phu-quoc#an-uong" },
  { label: "Tour giá tốt", href: "/diem-den/phu-quoc#tour" },
]

export function HomeHero(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
      <div className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-white sm:p-10 lg:min-h-[36rem] lg:p-14">
        <Image src={phuQuoc.heroImageUrl} alt="Bãi Sao, Phú Quốc" fill priority sizes="(min-width:1152px) 1152px, 100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/30 to-ink/5" />
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Điểm đến tháng này</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">Chuyến đi tiếp theo của bạn bắt đầu từ đây</h1>
        <p className="mt-4 max-w-xl text-lg text-white/85">
          Biển xanh, hoàng hôn và những món ngon đang chờ ở Phú Quốc. Xem thời tiết, nơi ở, lịch trình gợi ý, rồi đặt tour ngay cùng Vietravel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/diem-den/phu-quoc"
            className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-bold text-ocean outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            Khám phá Phú Quốc
          </Link>
          <Link
            href="/#diem-den"
            className="inline-flex h-12 items-center rounded-full bg-white/10 px-6 text-sm font-bold text-white ring-1 ring-white/50 backdrop-blur"
          >
            Xem tất cả điểm đến
          </Link>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <li key={mood.label}>
            <Link
              href={mood.href}
              className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-ocean ring-1 ring-ocean/15 transition-colors hover:bg-cloud/60"
            >
              {mood.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
