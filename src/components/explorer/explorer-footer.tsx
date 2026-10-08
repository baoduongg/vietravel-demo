import { company } from "@/config/company"

export function ExplorerFooter(): React.JSX.Element {
  return (
    <footer className="mt-10 border-t border-ocean/10 bg-white/70 px-4 py-10 backdrop-blur lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-extrabold text-ocean">{company.brand} Explorer</p>
          <p className="mt-2 text-sm text-muted-foreground">{company.tagline}. Cảm hứng, thông tin điểm đến và liên kết đặt dịch vụ trên {company.website}.</p>
        </div>
        <ul className="space-y-1 text-sm">
          <li>
            Tổng đài: <a className="font-semibold text-ocean" href={`tel:${company.hotline.replace(/\s/g, "")}`}>{company.hotline}</a>
          </li>
          <li>
            Email: <a className="font-semibold text-ocean" href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          <li>
            Website: <a className="font-semibold text-ocean" href={`https://${company.website}`} target="_blank" rel="noreferrer">{company.website}</a>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-muted-foreground">
        Bản demo: nội dung điểm đến, chi phí và review mang tính minh họa, chưa qua kiểm duyệt chính thức.
      </p>
    </footer>
  )
}
