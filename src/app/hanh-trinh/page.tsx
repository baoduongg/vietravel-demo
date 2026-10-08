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
        <h1 className="font-voyage text-[2rem] leading-tight font-medium tracking-[-0.01em] text-champagne sm:text-4xl">Kế hoạch của tôi</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Chọn khách sạn, vé máy bay, xe và điểm vui chơi cho chuyến đi, xếp theo ngày, rồi mời gia đình, bạn bè cùng bình chọn. Giá trong kế hoạch là giá tham khảo.
        </p>
        <JourneysHome destinationSlug={phuQuoc.slug} destinationName={phuQuoc.name} />
      </div>
    </ExplorerShell>
  )
}
