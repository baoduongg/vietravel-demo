import Link from "next/link"
import { MessageCircleQuestionIcon, PhoneIcon, PlusIcon, SparklesIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import { company } from "@/config/company"
import type { DestinationGuide, Faq as FaqItem } from "@/types/destination"

export function Faq({
  guide,
  faqs = guide.faqs,
  title = "Giải đáp thắc mắc trước chuyến đi",
}: {
  guide: DestinationGuide
  faqs?: FaqItem[]
  title?: string
}): React.JSX.Element {
  return (
    <Section id="faq" title={title}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* <summary> phải là con trực tiếp của <details>, nếu không trình duyệt hiện chữ "Details" mặc định và ẩn câu hỏi. */}
        <div className="space-y-3">
          {faqs.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group glass-card overflow-hidden !rounded-2xl open:border-primary-ink/30"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3.5 p-4 sm:p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-ink/10 text-xs font-black text-primary-ink tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[0.95rem] font-bold leading-snug text-title transition-colors duration-300 group-hover:text-primary-ink sm:text-base">
                  {item.question}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint/[0.06] text-title transition-all duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-white">
                  <PlusIcon aria-hidden strokeWidth={2.25} className="size-4" />
                </span>
              </summary>
              <p className="mx-4 border-t border-tint/10 pt-3 pb-5 text-sm leading-relaxed text-body sm:mx-5 sm:pl-[2.875rem] sm:text-[0.95rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <aside className="glass-card p-6 lg:sticky lg:top-24">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-ink/10 text-primary-ink">
            <MessageCircleQuestionIcon aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <p className="mt-4 font-heading text-lg font-bold text-title">Chưa thấy câu trả lời?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-body">
            Hỏi Tripi về lịch trình, giá tour hay thời tiết {guide.name}, hoặc gọi tư vấn viên Vietravel.
          </p>
          <div className="mt-5 grid gap-2.5">
            <Link
              href="/tripi"
              className="btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold"
            >
              <SparklesIcon aria-hidden className="size-4" />
              Hỏi Tripi AI
            </Link>
            <a
              href={`tel:${company.hotline.replace(/\s/g, "")}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-title ring-1 ring-tint/15 transition-colors duration-300 hover:bg-tint/[0.06]"
            >
              <PhoneIcon aria-hidden className="size-4 text-primary-ink" />
              {company.hotline}
            </a>
          </div>
        </aside>
      </div>
    </Section>
  )
}
