"use client"

import { MoonIcon, SunIcon } from "lucide-react"

export const THEME_KEY = "explorer-theme"

/** Lưu lựa chọn sáng/tối; biểu tượng đổi bằng CSS theo data-theme nên không lệch khi hydrate. */
export function ThemeToggle(): React.JSX.Element {
  function toggle(): void {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light"
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Chế độ riêng tư chặn localStorage: vẫn đổi giao diện cho phiên này.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Đổi giao diện sáng hoặc tối"
      className="grid size-11 shrink-0 place-items-center rounded-full text-body outline-none transition-colors duration-300 hover:bg-tint/[0.08] hover:text-champagne focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SunIcon aria-hidden strokeWidth={1.5} className="theme-to-light size-[18px]" />
      <MoonIcon aria-hidden strokeWidth={1.5} className="theme-to-dark size-[18px]" />
    </button>
  )
}
