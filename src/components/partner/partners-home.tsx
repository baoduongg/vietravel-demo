"use client"

import { ChevronRightIcon, PlusIcon, StoreIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Tabs } from "radix-ui"
import { useEffect, useState } from "react"

import { GHOST_BUTTON } from "@/components/journey/styles"
import type { DestinationOption } from "@/components/partner/brand-fields"
import { PartnerForm } from "@/components/partner/partner-form"
import { PartnerReview } from "@/components/partner/partner-review"
import { PartnerStatusBadge } from "@/components/partner/status-badge"
import { readPartnerIds, savePartnerId } from "@/lib/partners/local"
import { partnerImageUrl } from "@/lib/partners/services"
import { partnerService } from "@/services/partner.service"
import type { Partner } from "@/types/partner"

const TAB_CLASS =
  "h-10 shrink-0 rounded-full bg-tint/5 px-4 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-champagne data-[state=active]:text-void"

function StoreCard({ partner }: { partner: Partner }): React.JSX.Element {
  const imageUrl = partnerImageUrl(partner)
  return (
    <li>
      <Link
        href={`/doi-tac/${partner.id}`}
        className="glass-card lift flex items-start gap-3 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-ink/15 text-primary-ink">
            <StoreIcon aria-hidden className="size-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-heading font-bold text-title">{partner.brand}</span>
            <PartnerStatusBadge status={partner.status} />
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {[partner.kind, partner.tier, partner.area, `${partner.products.length} sản phẩm`].filter(Boolean).join(" · ")}
          </span>
        </span>
        <ChevronRightIcon aria-hidden className="mt-2 size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  )
}

export function PartnersHome({ destinations }: { destinations: DestinationOption[] }): React.JSX.Element {
  // null = đang đọc localStorage / tải từ server.
  const [stores, setStores] = useState<Partner[] | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    partnerService
      .listMine(readPartnerIds(), controller.signal)
      .then(setStores)
      .catch(() => {
        if (!controller.signal.aborted) setStores([])
      })
    return () => controller.abort()
  }, [])

  function handleCreated(partner: Partner): void {
    savePartnerId(partner.id)
    setStores((list) => [partner, ...(list ?? [])])
    setShowForm(false)
  }

  function handleReviewed(updated: Partner): void {
    setStores((list) => list?.map((item) => (item.id === updated.id ? { ...item, status: updated.status, reviewedAt: updated.reviewedAt } : item)) ?? null)
  }

  const hasStores = stores !== null && stores.length > 0

  return (
    <Tabs.Root defaultValue="register" className="mt-8">
      <Tabs.List aria-label="Đối tác" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        <Tabs.Trigger value="register" className={TAB_CLASS}>
          Đăng ký đối tác
        </Tabs.Trigger>
        <Tabs.Trigger value="review" className={TAB_CLASS}>
          Xét duyệt (Vietravel)
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="register" className="mx-auto mt-6 flex max-w-3xl flex-col gap-6 outline-none">
        {stores === null ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : (
          <>
            {hasStores && (
              <section aria-labelledby="my-stores-heading">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="my-stores-heading" className="font-heading text-lg font-bold text-title">
                    Cửa hàng của bạn ({stores.length})
                  </h2>
                  {!showForm && (
                    <button type="button" onClick={() => setShowForm(true)} className={GHOST_BUTTON}>
                      <PlusIcon aria-hidden className="size-4" />
                      Đăng ký cửa hàng mới
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Danh sách lưu trên trình duyệt này, chỉ bạn thấy.</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {stores.map((partner) => (
                    <StoreCard key={partner.id} partner={partner} />
                  ))}
                </ul>
              </section>
            )}
            {(!hasStores || showForm) && (
              <section aria-label="Đăng ký cửa hàng mới">
                {showForm && (
                  <button type="button" onClick={() => setShowForm(false)} className="mb-3 text-sm font-semibold text-muted-foreground hover:text-title">
                    ← Hủy đăng ký mới
                  </button>
                )}
                <PartnerForm destinations={destinations} onCreated={handleCreated} />
              </section>
            )}
          </>
        )}
      </Tabs.Content>

      {/* Radix chỉ mount tab đang mở, nên mỗi lần vào tab xét duyệt là tải lại danh sách mới. */}
      <Tabs.Content value="review" className="mt-6 outline-none">
        <PartnerReview onChanged={handleReviewed} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
