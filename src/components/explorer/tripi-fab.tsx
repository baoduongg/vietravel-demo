import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { company } from "@/config/company"

export function TripiFab(): React.JSX.Element {
  return (
    <Link
      href="/tripi"
      className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full btn-primary px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SparklesIcon aria-hidden strokeWidth={1.5} className="size-4 text-white" />
      Hỏi {company.persona.name}
    </Link>
  )
}
