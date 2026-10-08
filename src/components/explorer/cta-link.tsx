import { ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Variant = "primary" | "outline"

interface CtaLinkProps {
  href: string
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary",
  outline: "btn-glass",
}

/** Kiểu nút viên thuốc dùng chung cho link nội bộ và link ngoài. */
export function buttonClass(variant: Variant = "primary", className?: string): string {
  return cn(
    "group inline-flex h-12 items-center gap-3 rounded-full pr-1.5 pl-6 text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring",
    VARIANT[variant],
    className,
  )
}

/** Vòng tròn chứa mũi tên nằm sát mép phải nút; mũi tên nhích chéo khi rê chuột. */
export function ArrowChip(): React.JSX.Element {
  return (
    <span className="grid size-9 place-items-center rounded-full bg-current/10 transition-transform duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
      <ArrowUpRightIcon aria-hidden strokeWidth={1.5} className="size-4" />
    </span>
  )
}

/** Link ngoài sang travel.com.vn; Explorer không tự xử lý booking. */
export function CtaLink({ href, children, variant = "primary", className }: CtaLinkProps): React.JSX.Element {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={buttonClass(variant, className)}>
      {children}
      <ArrowChip />
    </a>
  )
}
