import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AnchorNav } from "@/components/explorer/anchor-nav"
import { CostChecklist } from "@/components/explorer/cost-checklist"
import { DestinationHero } from "@/components/explorer/destination-hero"
import { EatBlock } from "@/components/explorer/eat-block"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { GettingThere } from "@/components/explorer/getting-there"
import { Itinerary } from "@/components/explorer/itinerary"
import { PlayBlock } from "@/components/explorer/play-block"
import { Reviews } from "@/components/explorer/reviews"
import { StayBlock } from "@/components/explorer/stay-block"
import { WeatherBlock } from "@/components/explorer/weather-block"
import { destinations, getGuide } from "@/data/destinations"
import { toursForDestination } from "@/lib/destination-tours"

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return destinations.filter((destination) => destination.active).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getGuide((await params).slug)
  if (!guide) return {}
  return { title: `${guide.name} · Vietravel Explorer`, description: guide.intro }
}

export default async function DestinationPage({ params }: PageProps): Promise<React.JSX.Element> {
  const guide = getGuide((await params).slug)
  if (!guide) notFound()
  const tours = toursForDestination(guide)

  return (
    <ExplorerShell>
      <DestinationHero guide={guide} />
      <AnchorNav />
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <WeatherBlock guide={guide} />
        <GettingThere guide={guide} />
        <StayBlock guide={guide} />
        <EatBlock guide={guide} />
        <PlayBlock guide={guide} />
        <Itinerary guide={guide} />
        <CostChecklist guide={guide} minTourPriceVnd={tours[0]?.priceVnd ?? null} />
        <Reviews guide={guide} />
      </div>
    </ExplorerShell>
  )
}
