"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/journey/styles"
import { ProductList } from "@/components/partner/product-list"
import { PartnerStatusBadge, STATUS_LABEL } from "@/components/partner/status-badge"
import { partnerImageUrl } from "@/lib/partners/services"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { partnerService } from "@/services/partner.service"
import { PARTNER_STATUSES, type PartnerStatus, type PartnerWithContact } from "@/types/partner"

/** Tab của Vietravel: xem đủ thông tin liên hệ, duyệt hoặc từ chối đăng ký. */
export function PartnerReview({ onChanged }: { onChanged: (partner: PartnerWithContact) => void }): React.JSX.Element {
  const [partners, setPartners] = useState<PartnerWithContact[] | null>(null)
  const [filter, setFilter] = useState<PartnerStatus>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    partnerService
      .listForReview(controller.signal)
      .then(setPartners)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setPartners([])
        toast.error(getErrorMessage(error, "Không tải được danh sách chờ duyệt."))
      })
    return () => controller.abort()
  }, [])

  async function decide(id: string, status: PartnerStatus): Promise<void> {
    setBusyId(id)
    try {
      const updated = await partnerService.setStatus(id, status)
      setPartners((list) => list?.map((item) => (item.id === id ? updated : item)) ?? null)
      onChanged(updated)
      toast.success(`${updated.brand}: ${STATUS_LABEL[status].toLowerCase()}.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa cập nhật được trạng thái, vui lòng thử lại."))
    } finally {
      setBusyId(null)
    }
  }

  if (partners === null) return <p className="text-sm text-muted-foreground">Đang tải…</p>

  const shown = partners.filter((partner) => partner.status === filter)

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
        {PARTNER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
            className="h-9 rounded-full bg-tint/5 px-4 text-sm font-semibold text-body ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-champagne aria-pressed:text-void"
          >
            {STATUS_LABEL[status]} ({partners.filter((partner) => partner.status === status).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có đăng ký nào ở mục này.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((partner) => (
            <li key={partner.id} className="glass-card flex flex-col p-5">
              {partnerImageUrl(partner) && (
                <div className="relative -mx-5 -mt-5 mb-4 aspect-video">
                  <Image src={partnerImageUrl(partner) ?? ""} alt={partner.brand} fill sizes="(min-width: 768px) 560px, 100vw" className="rounded-t-[inherit] object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-bold text-title">{partner.brand}</h3>
                <PartnerStatusBadge status={partner.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[partner.kind, partner.tier, partner.area].filter(Boolean).join(" · ")} · gửi {new Date(partner.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </p>
              {partner.description && <p className="mt-2 text-sm text-body">{partner.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{partner.address}</p>
              {partner.childPolicy && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Trẻ dưới {partner.childPolicy.freeUnderAge} tuổi miễn phí, dưới 12 tuổi {partner.childPolicy.childPercent}%
                </p>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-primary-ink underline-offset-2 hover:underline">
                  {partner.website}
                </a>
              )}
              <ProductList products={partner.products} />
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-tint/[0.04] p-3 text-sm">
                <dt className="text-muted-foreground">Liên hệ</dt>
                <dd className="text-title">{partner.contactName}</dd>
                <dt className="text-muted-foreground">Điện thoại</dt>
                <dd>
                  <a href={`tel:${partner.phone}`} className="text-primary-ink underline-offset-2 hover:underline">
                    {partner.phone}
                  </a>
                </dd>
                {partner.email && (
                  <>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="break-all">
                      <a href={`mailto:${partner.email}`} className="text-primary-ink underline-offset-2 hover:underline">
                        {partner.email}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {partner.status !== "approved" && (
                  <button type="button" disabled={busyId === partner.id} onClick={() => void decide(partner.id, "approved")} className={PRIMARY_BUTTON}>
                    Duyệt
                  </button>
                )}
                {partner.status !== "rejected" && (
                  <button type="button" disabled={busyId === partner.id} onClick={() => void decide(partner.id, "rejected")} className={GHOST_BUTTON}>
                    Từ chối
                  </button>
                )}
                {partner.status !== "pending" && (
                  <button type="button" disabled={busyId === partner.id} onClick={() => void decide(partner.id, "pending")} className={cn(GHOST_BUTTON, "text-muted-foreground")}>
                    Đưa về chờ duyệt
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
