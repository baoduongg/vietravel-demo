import { ChevronDownIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Faq({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="faq" eyebrow="Hỏi đáp" title="Những câu hỏi thường gặp">
      <div className="space-y-3">
        {guide.faqs.map((item) => (
          <details key={item.question} className="group rounded-2xl bg-white p-5 ring-1 ring-ocean/10 open:shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item.question}
              <ChevronDownIcon aria-hidden strokeWidth={1.5} className="size-5 shrink-0 text-ocean transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-ink/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
