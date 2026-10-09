import type { Metadata } from "next"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { PartnersHome } from "@/components/partner/partners-home"
import { partnerDestinations } from "@/lib/partners/destination"

export const metadata: Metadata = {
  title: "Đăng ký đối tác · Vietravel Explorer",
  robots: { index: false, follow: false },
}

export default function PartnersPage(): React.JSX.Element {
  return (
    <ExplorerShell>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 lg:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-ink/15 px-3.5 py-1 text-xs font-bold text-primary-ink ring-1 ring-primary-ink/30 mb-3">
          <span>Dành cho doanh nghiệp địa phương</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-title leading-tight">
          Trở Thành <span className="text-gradient-brand">Đối Tác Vietravel</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          Đặc sản địa phương, nhà hàng hay khách sạn: đăng ký thương hiệu và sản phẩm để giới thiệu tới du khách của Vietravel.
        </p>
        <PartnersHome destinations={partnerDestinations()} />
      </div>
    </ExplorerShell>
  )
}
