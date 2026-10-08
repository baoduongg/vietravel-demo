import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { AvatarExperience } from "@/components/avatar/avatar-experience"
import { company } from "@/config/company"

export const metadata: Metadata = {
  title: `${company.persona.name} · Trợ lý du lịch ${company.brand}`,
  description: `Trò chuyện với ${company.persona.name}, ${company.persona.role} ảo của ${company.brand}.`,
}

export default function TripiPage(): React.JSX.Element {
  return (
    <>
      <AvatarExperience />
      <Link
        href="/"
        className="fixed bottom-4 left-4 z-50 hidden h-10 lg:inline-flex items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-semibold text-ocean shadow-[0_12px_30px_-12px_rgba(0,70,193,0.5)] ring-1 ring-ocean/15 backdrop-blur"
      >
        <ArrowLeftIcon aria-hidden strokeWidth={1.5} className="size-4" />
        Khám phá điểm đến
      </Link>
    </>
  )
}
