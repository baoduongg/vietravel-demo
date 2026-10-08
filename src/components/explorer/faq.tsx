import { PlusIcon } from "lucide-react"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

export function Faq({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="faq" title="Những câu hỏi thường gặp">
      <div className="max-w-3xl">
        {guide.faqs.map((item) => (
          <details key={item.question} className="group border-b border-tint/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold text-title outline-none transition-colors duration-500 ease-soft hover:text-champagne focus-visible:ring-2 focus-visible:ring-ring">
              {item.question}
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint/[0.06] text-gold transition-transform duration-500 ease-soft group-open:rotate-45">
                <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
              </span>
            </summary>
            <p className="max-w-2xl pb-6 text-body">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
