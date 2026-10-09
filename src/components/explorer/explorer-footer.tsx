import { PhoneCallIcon, MailIcon, GlobeIcon, SparklesIcon, Share2Icon } from "lucide-react"
import { company } from "@/config/company"

export function ExplorerFooter(): React.JSX.Element {
  return (
    <footer className="mt-16 rounded-t-[2.5rem] bg-[#0A111F] pt-16 pb-12 text-title border-t border-tint/10 shadow-2xl light:bg-white light:shadow-[0_-20px_50px_-30px_rgba(0,80,200,0.18)]">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] pb-12 border-b border-tint/10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-ink/30 bg-primary-ink/10 px-4 py-1.5 text-xs font-bold text-primary-ink">
              <SparklesIcon className="size-3.5 text-amber-400 light:text-amber-600" />
              <span>Vietravel Explorer 2026</span>
            </div>
            <p className="font-sans text-3xl sm:text-4xl font-black tracking-tight leading-tight text-balance">
              Khởi đầu hành trình thanh xuân <br />
              <span className="text-gradient-brand font-extrabold">tràn đầy cảm hứng & năng lượng</span>
            </p>
            <p className="max-w-md text-sm sm:text-base text-tint/70 leading-relaxed">
              Khám phá cẩm nang du lịch độc quyền, bí kíp săn tour ưu đãi và lịch trình tối ưu trải nghiệm từ {company.brand}.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-tint/5 border border-tint/10 px-3.5 py-1.5 text-xs font-semibold text-tint/80">
                <span className="size-2 rounded-full bg-emerald-400 light:bg-emerald-500 animate-pulse"></span>
                <span>Cộng đồng 1.5M+ Travellers</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-ink/10 border border-primary-ink/30 px-3.5 py-1.5 text-xs font-semibold text-primary-ink">
                <Share2Icon className="size-3.5" />
                <span>#VietravelVibe</span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-tint/10 bg-tint/[0.03] p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-primary-ink mb-2">
                <PhoneCallIcon className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-tint/60">Hotline tư vấn</span>
              </div>
              <a 
                className="block text-xl font-black text-title hover:text-primary-ink transition-colors" 
                href={`tel:${company.hotline.replace(/\s/g, "")}`}
              >
                {company.hotline}
              </a>
              <p className="text-xs text-tint/50 mt-1">Hỗ trợ 24/7 toàn quốc</p>
            </div>

            <div className="rounded-2xl border border-tint/10 bg-tint/[0.03] p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-400 light:text-cyan-600 mb-2">
                <MailIcon className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-tint/60">Email hỗ trợ</span>
              </div>
              <a 
                className="block text-sm font-bold text-title hover:text-cyan-400 light:hover:text-cyan-600 transition-colors truncate" 
                href={`mailto:${company.email}`}
              >
                {company.email}
              </a>
              <p className="text-xs text-tint/50 mt-1">Phản hồi trong 15 phút</p>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-tint/10 bg-gradient-to-r from-primary-ink/10 to-blue-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-tint/60 uppercase tracking-wider block">Website chính thức</span>
                  <a 
                    className="text-lg font-bold text-primary-ink hover:underline inline-flex items-center gap-1.5 mt-0.5" 
                    href={`https://${company.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <GlobeIcon className="size-4" />
                    {company.website}
                  </a>
                </div>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md light:bg-[#071426] light:text-white hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Đặt tour ngay
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tint/50">
          <p>© 2026 {company.brand}. Giao diện phong cách Trẻ trung - Năng động - Tươi mới.</p>
          <p>Demo Explorer Experience • Thiết kế tối ưu trải nghiệm thế hệ mới</p>
        </div>
      </div>
    </footer>
  )
}

