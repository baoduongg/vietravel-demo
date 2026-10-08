interface SectionProps {
  id: string
  eyebrow: string
  title: string
  intro?: string
  children: React.ReactNode
}

/** Thẻ trắng bo tròn dùng chung cho các khối nội dung. */
export const CARD_CLASS =
  "rounded-3xl bg-white p-5 ring-1 ring-ocean/10 shadow-[0_20px_40px_-30px_rgba(0,70,193,0.45)]"

export function Section({ id, eyebrow, title, intro, children }: SectionProps): React.JSX.Element {
  return (
    <section id={id} className="scroll-mt-32 py-10 lg:py-14">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-ocean uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>}
      <div className="mt-6 lg:mt-8">{children}</div>
    </section>
  )
}
