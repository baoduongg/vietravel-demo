import type { Metadata } from "next"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { JourneysHome } from "@/components/journey/journeys-home"
import { phuQuoc } from "@/data/destinations/phu-quoc"

export const metadata: Metadata = {
  title: "Kế hoạch của tôi · Vietravel Explorer",
  robots: { index: false, follow: false },
}

export default function JourneysPage(): React.JSX.Element {
  return (
    <ExplorerShell>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 lg:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-ink/15 px-3.5 py-1 text-xs font-bold text-primary-ink ring-1 ring-primary-ink/30 mb-3">
          <span>Kế Hoạch & Trợ Lý Du Lịch</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-title leading-tight">
          Lên Kế Hoạch Chuyến Đi <span className="text-gradient-brand">Cùng Bạn Bè & AI</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          Tùy chọn khách sạn, vé máy bay, xe và điểm vui chơi, để AI tự động xếp theo ngày hoặc mời gia đình, bạn bè cùng bình chọn.
        </p>
        <JourneysHome destinationSlug={phuQuoc.slug} destinationName={phuQuoc.name} />
      </div>
    </ExplorerShell>
  )
}
