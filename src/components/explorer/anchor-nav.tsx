"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const ITEMS = [
  { id: "hinh-anh", label: "Hình ảnh" },
  { id: "thoi-tiet", label: "Thời tiết" },
  { id: "di-chuyen", label: "Di chuyển" },
  { id: "luu-tru", label: "Lưu trú" },
  { id: "an-uong", label: "Ăn uống" },
  { id: "vui-choi", label: "Vui chơi" },
  { id: "lich-trinh", label: "Lịch trình" },
  { id: "chi-phi", label: "Chi phí" },
  { id: "review", label: "Review" },
  { id: "tour", label: "Tour" },
  { id: "faq", label: "Hỏi đáp" },
]

export function AnchorNav(): React.JSX.Element {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: "-25% 0px -65% 0px" },
    )
    for (const { id } of ITEMS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="Mục trong trang" className="sticky top-[76px] z-20 mt-6 px-3 lg:px-5">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto rounded-full bg-void/75 p-1.5 shadow-[0_20px_44px_-24px_rgba(0,0,0,0.4)] ring-1 ring-tint/10 backdrop-blur-xl [scrollbar-width:none]">
        {ITEMS.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-500 ease-soft",
                active === item.id ? "bg-champagne text-void" : "text-body hover:bg-tint/[0.08]",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
