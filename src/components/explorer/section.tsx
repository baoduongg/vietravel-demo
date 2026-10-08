import { Reveal } from "@/components/explorer/reveal"

interface SectionProps {
  id: string
  title: string
  intro?: string
  children: React.ReactNode
}

/** Thẻ trắng bo tròn dùng chung cho các khối nội dung. */
export const CARD_CLASS =
  "glass-card p-6"

export function Section({ id, title, intro, children }: SectionProps): React.JSX.Element {
  return (
    <section id={id} className="scroll-mt-32 py-12 lg:py-20">
      <Reveal>
        <h2 className="max-w-3xl font-voyage text-[2rem] leading-[1.25] font-medium tracking-[-0.01em] text-champagne sm:text-4xl lg:text-[2.375rem]">{title}</h2>
        {intro && <p className="mt-4 max-w-xl text-base leading-relaxed font-light text-muted-foreground sm:text-lg">{intro}</p>}
      </Reveal>
      <Reveal className="mt-10 lg:mt-14" delay={120}>
        {children}
      </Reveal>
    </section>
  )
}
