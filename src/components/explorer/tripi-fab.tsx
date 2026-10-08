import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function TripiFab(): React.JSX.Element {
  return (
    <Link
      href="/tripi"
      className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-ocean px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-12px_rgba(0,70,193,0.7)] outline-none transition-transform duration-500 ease-soft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
    >
      <SparklesIcon aria-hidden strokeWidth={1.5} className="size-4 text-white" />
      Hỏi {company.persona.name}
    </Link>
  )
}
