import type { Metadata } from "next"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { PartnerDetail } from "@/components/partner/partner-detail"
import { partnerDestinations } from "@/lib/partners/destination"

export const metadata: Metadata = {
  title: "Thương hiệu của tôi · Vietravel Explorer",
  robots: { index: false, follow: false },
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const { id } = await params
  return (
    <ExplorerShell>
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-16 lg:px-6">
        <PartnerDetail id={id} destinations={partnerDestinations()} />
      </div>
    </ExplorerShell>
  )
}
