import { ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CtaLinkProps {
  href: string
  children: React.ReactNode
  variant?: "primary" | "light" | "outline"
  className?: string
}

const VARIANT: Record<NonNullable<CtaLinkProps["variant"]>, string> = {
  primary: "bg-ocean text-white",
  light: "bg-white text-ocean",
  outline: "bg-white/10 text-white ring-1 ring-white/50 backdrop-blur",
}

/** Link ngoài sang travel.com.vn; Explorer không tự xử lý booking. */
export function CtaLink({ href, children, variant = "primary", className }: CtaLinkProps): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
        VARIANT[variant],
        className,
      )}
    >
      {children}
      <ArrowUpRightIcon aria-hidden strokeWidth={1.5} className="size-4" />
    </a>
  )
}
