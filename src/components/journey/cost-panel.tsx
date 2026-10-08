"use client"

import { useState } from "react"

import { CtaLink } from "@/components/explorer/cta-link"
import { Modal } from "@/components/journey/modal"
import { estimateCost } from "@/lib/journey/cost"
import { shortVnd } from "@/lib/journey/labels"
import { formatVnd } from "@/lib/format"
import { SERVICE_KINDS, SERVICE_KIND_LABEL, type PublicJourney } from "@/types/journey"

interface CostPanelProps {
  journey: PublicJourney
  /** Trang đặt dịch vụ của điểm đến trên travel.com.vn. */
  bookUrl: string
}

export function CostPanel({ journey, bookUrl }: CostPanelProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const cost = estimateCost(journey)
  const kinds = SERVICE_KINDS.filter((kind) => cost.byKind[kind] > 0)

  const details = (
    <>
      {kinds.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có mục nào được xếp vào ngày.</p>
      ) : (
        <dl className="flex flex-col gap-2 text-sm">
          {kinds.map((kind) => (
            <div key={kind} className="flex justify-between gap-3">
              <dt>{SERVICE_KIND_LABEL[kind]}</dt>
              <dd className="font-semibold text-title">{formatVnd(cost.byKind[kind])}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Giá tham khảo, chưa phải giá đặt. Chỉ tính các mục đã xếp vào ngày; giá trẻ em theo độ tuổi của từng dịch vụ.
      </p>
      <CtaLink href={bookUrl} className="mt-5 w-full justify-between">
        Đặt dịch vụ trên travel.com.vn
      </CtaLink>
    </>
  )

  return (
    <>
      <aside aria-label="Chi phí dự kiến" className="glass-card sticky top-28 hidden self-start p-6 lg:block">
        <h2 className="text-sm font-semibold text-gold">Chi phí dự kiến</h2>
        <p className="mt-2 font-sans text-3xl font-bold tracking-tight text-champagne">~{formatVnd(cost.totalVnd)}</p>
        <p className="mb-5 text-sm text-muted-foreground">~{formatVnd(cost.perAdultVnd)} / người lớn</p>
        {details}
      </aside>
      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full bg-void/90 py-2 pr-2 pl-5 shadow-2xl ring-1 ring-tint/10 backdrop-blur-xl lg:hidden">
        <p className="text-sm">
          Tổng <span className="font-bold text-champagne">~{shortVnd(cost.totalVnd)}</span>
        </p>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary h-10 rounded-full px-4 text-sm font-semibold">
          Xem chi tiết
        </button>
      </div>
      <Modal open={open} onOpenChange={setOpen} title={`Chi phí dự kiến ~${formatVnd(cost.totalVnd)}`} description={`~${formatVnd(cost.perAdultVnd)} / người lớn`}>
        {details}
      </Modal>
    </>
  )
}
