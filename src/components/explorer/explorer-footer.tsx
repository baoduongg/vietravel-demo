import { company } from "@/config/company"

export function ExplorerFooter(): React.JSX.Element {
  return (
    <footer className="on-dark mt-10 rounded-t-[2.5rem] bg-dusk pt-16 pb-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.4fr_1fr] lg:px-6">
        <div>
          <p className="font-voyage text-3xl leading-[1.2] font-medium tracking-[-0.01em] text-balance text-champagne sm:text-4xl">{company.tagline}</p>
          <p className="mt-4 max-w-md text-white/70">{company.brand} Explorer: cảm hứng, thông tin điểm đến và liên kết đặt dịch vụ trên {company.website}.</p>
        </div>
        <ul className="space-y-3 text-sm">
          <li>
            <span className="block text-white/60">Tổng đài</span>
            <a className="text-lg font-semibold" href={`tel:${company.hotline.replace(/\s/g, "")}`}>{company.hotline}</a>
          </li>
          <li>
            <span className="block text-white/60">Email</span>
            <a className="text-lg font-semibold" href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          <li>
            <span className="block text-white/60">Website</span>
            <a className="text-lg font-semibold" href={`https://${company.website}`} target="_blank" rel="noreferrer">{company.website}</a>
          </li>
        </ul>
      </div>
      <div className="mx-auto mt-12 max-w-6xl px-4 lg:px-6">
        <p className="border-t border-tint/10 pt-6 text-xs text-mute">
          Bản demo: nội dung điểm đến, chi phí và review mang tính minh họa, chưa qua kiểm duyệt chính thức.
        </p>
      </div>
    </footer>
  )
}
