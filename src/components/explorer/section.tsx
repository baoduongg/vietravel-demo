import { Reveal } from "@/components/explorer/reveal"

interface SectionProps {
  id: string
  title: string
  intro?: string
  children: React.ReactNode
}

/** Thẻ trắng bo tròn dùng chung cho các khối nội dung. */
export const CARD_CLASS =
  "glass-card p-6 sm:p-7"

export function Section({ id, title, intro, children }: SectionProps): React.JSX.Element {
  return (
    <section id={id} className="scroll-mt-28 py-10 lg:py-16">
      <Reveal>
        <h2 className="max-w-3xl font-heading text-[1.85rem] leading-[1.18] font-extrabold tracking-[-0.02em] text-title sm:text-3xl lg:text-[2.35rem]">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-base leading-relaxed font-normal text-muted-foreground sm:text-lg">{intro}</p>}
      </Reveal>
      <Reveal className="mt-8 lg:mt-12" delay={120}>
        {children}
      </Reveal>
    </section>
  )
}

