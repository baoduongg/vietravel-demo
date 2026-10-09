import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { buttonClass } from "@/components/explorer/cta-link"
import { EatBlock } from "@/components/explorer/eat-block"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { Faq } from "@/components/explorer/faq"
import { GettingThere } from "@/components/explorer/getting-there"
import { PlayBlock } from "@/components/explorer/play-block"
import { Section } from "@/components/explorer/section"
import { ServiceHub } from "@/components/explorer/service-hub"
import { ServiceListing } from "@/components/explorer/service-listing"
import { StayBlock } from "@/components/explorer/stay-block"
import { destinations, getGuide } from "@/data/destinations"
import { destinationServices } from "@/lib/destination-services"
import { formatVnd } from "@/lib/format"
import { priceLabel } from "@/lib/journey/labels"
import { kindFromSlug, KIND_SLUG, priceStats } from "@/lib/service-listing"
import type { DestinationGuide } from "@/types/destination"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type ServiceKind } from "@/types/journey"

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string; kind: string }>
}

// Khối guide có sẵn cho loại tương ứng; loại khác chỉ có mẹo.
const GUIDE_BLOCK: Partial<Record<ServiceKind, (props: { guide: DestinationGuide }) => React.JSX.Element>> = {
  flight: GettingThere,
  hotel: StayBlock,
  dining: EatBlock,
  activity: PlayBlock,
}

export function generateStaticParams(): { slug: string; kind: string }[] {
  return destinations
    .filter((destination) => destination.active)
    .flatMap(({ slug }) => SERVICE_KINDS.map((kind) => ({ slug, kind: KIND_SLUG[kind] })))
}

async function resolve(params: PageProps["params"]): Promise<{ guide: DestinationGuide; kind: ServiceKind } | null> {
  const { slug, kind: kindSlug } = await params
  const guide = getGuide(slug)
  const kind = kindFromSlug(kindSlug)
  return guide && kind ? { guide, kind } : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return {}
  const { guide, kind } = found
  return {
    title: `${SERVICE_KIND_LABEL[kind]} ${guide.name} · Vietravel Explorer`,
    description: guide.serviceGuides?.[kind]?.intro ?? guide.intro,
  }
}

export default async function ServiceKindPage({ params }: PageProps): Promise<React.JSX.Element> {
  const found = await resolve(params)
  if (!found) notFound()
  const { guide, kind } = found
  const all = await destinationServices(guide)
  const services = all.filter((service) => service.kind === kind)
  const { count, min, max } = priceStats(services)
  const serviceGuide = guide.serviceGuides?.[kind]
  const GuideBlock = GUIDE_BLOCK[kind]
  const label = SERVICE_KIND_LABEL[kind]

  return (
    <ExplorerShell>
      <div className="mx-auto max-w-6xl px-4 pt-28 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href={`/diem-den/${guide.slug}`} className="underline-offset-4 hover:underline">
            {guide.name}
          </Link>
          <span aria-hidden> › </span>
          <span aria-current="page" className="text-body">{label}</span>
        </nav>

        <header className="py-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-title sm:text-4xl">
            {label} tại {guide.name}
          </h1>
          {serviceGuide && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{serviceGuide.intro}</p>}
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Số lựa chọn</dt>
              <dd className="text-xl font-bold text-title">{count}</dd>
            </div>
            {min && (
              <div>
                <dt className="text-xs text-muted-foreground">Giá từ</dt>
                <dd className="text-xl font-bold text-champagne">{priceLabel(min)}</dd>
              </div>
            )}
            {/* Chỉ hiện khoảng giá khi hai đầu khác giá và cùng đơn vị (vd không trộn /ngày với /lượt). */}
            {min && max && max.priceVnd !== min.priceVnd && max.priceUnit === min.priceUnit && (
              <div>
                <dt className="text-xs text-muted-foreground">Khoảng giá</dt>
                <dd className="text-xl font-bold text-title">
                  {formatVnd(min.priceVnd)} – {formatVnd(max.priceVnd)}
                </dd>
              </div>
            )}
          </dl>
        </header>

        <ServiceHub guide={guide} services={all} current={kind} />

        <Section id="danh-sach" title={`Chọn ${label.toLowerCase()} ${guide.name}`}>
          <ServiceListing services={services} destinationSlug={guide.slug} destinationName={guide.name} />
        </Section>

        {GuideBlock && <GuideBlock guide={guide} />}

        {serviceGuide && serviceGuide.faqs.length > 0 && <Faq guide={guide} faqs={serviceGuide.faqs} title={`Hỏi đáp về ${label.toLowerCase()}`} />}

        <section className="py-14 text-center">
          <Link href="/hanh-trinh" className={buttonClass("primary", "h-12 px-6")}>
            Lên kế hoạch {guide.name}
          </Link>
        </section>
      </div>
    </ExplorerShell>
  )
}
