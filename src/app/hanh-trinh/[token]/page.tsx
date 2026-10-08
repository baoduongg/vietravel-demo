import type { Metadata } from "next"
import Link from "next/link"

import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { JourneyView } from "@/components/journey/journey-view"
import { PRIMARY_BUTTON } from "@/components/journey/styles"
import { getGuide } from "@/data/destinations"
import { getServices } from "@/lib/journey/catalog"
import { forRole } from "@/lib/journey/operations"
import { getJourneyStore } from "@/lib/journey/store"
import { isServiceKind } from "@/types/journey"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kế hoạch chuyến đi · Vietravel Explorer",
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function JourneyPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { token } = await params
  const found = await getJourneyStore().findByToken(token)
  const guide = found ? getGuide(found.journey.destinationSlug) : undefined

  if (!found || !guide) {
    return (
      <ExplorerShell>
        <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
          <h1 className="font-voyage text-3xl font-semibold text-title">Không tìm thấy kế hoạch</h1>
          <p className="text-muted-foreground">Link có thể bị thiếu ký tự hoặc kế hoạch đã bị xóa. Quý khách kiểm tra lại link được gửi nhé.</p>
          <Link href="/hanh-trinh" className={PRIMARY_BUTTON}>
            Về Kế hoạch của tôi
          </Link>
        </div>
      </ExplorerShell>
    )
  }

  const { them } = await searchParams
  return (
    <ExplorerShell showTripi={false}>
      <JourneyView
        token={token}
        initial={{ journey: forRole(found.journey, found.role), role: found.role }}
        services={getServices(guide.slug)}
        bookUrl={guide.links.tours}
        openPicker={isServiceKind(them) ? them : undefined}
      />
    </ExplorerShell>
  )
}
