"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Độ trễ ms để so le các khối cạnh nhau. */
  delay?: number
}

/** Hiện dần khi vào khung nhìn. Dùng IntersectionObserver, không nghe scroll. */
export function Reveal({ children, className, delay = 0 }: RevealProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.setAttribute("data-in", "")
        observer.disconnect()
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties} className={cn("reveal", className)}>
      {children}
    </div>
  )
}
