"use client"

import { AlertTriangleIcon, ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/journey/styles"
import { BrandFields, draftFromPartner, draftToInfo, type BrandDraft, type DestinationOption } from "@/components/partner/brand-fields"
import { ProductList } from "@/components/partner/product-list"
import { ProductRowsEditor, toProducts, toRow, type ProductRow } from "@/components/partner/product-rows-editor"
import { PartnerStatusBadge, STATUS_NOTE } from "@/components/partner/status-badge"
import { forgetPartner, readPartnerToken, savePartnerId } from "@/lib/partners/local"
import { partnerImageUrl } from "@/lib/partners/services"
import { getErrorMessage } from "@/services/http"
import { partnerService } from "@/services/partner.service"
import { SERVICE_KIND_LABEL } from "@/types/journey"
import { PARTNER_KIND_SERVICE, type Partner } from "@/types/partner"

/** Đăng ký gửi trước khi form có điểm đến, khu vực, phân khúc, đơn vị giá thì chưa lên được kế hoạch. */
function missingForPlan(partner: Partner): boolean {
  return (
    !partner.destinationSlug ||
    !partner.area ||
    !partner.address ||
    (partner.kind === "Khách sạn" && !partner.tier) ||
    partner.products.some((product) => !product.unit || !product.id || product.priceVnd <= 0)
  )
}

interface PartnerDetailProps {
  id: string
  destinations: DestinationOption[]
}

/** Trang chi tiết thương hiệu của đối tác: xem trạng thái, sửa thông tin, ảnh và sản phẩm. */
export function PartnerDetail({ id, destinations }: PartnerDetailProps): React.JSX.Element {
  // undefined = đang tải, null = không tìm thấy.
  const [partner, setPartner] = useState<Partner | null | undefined>(undefined)
  const [rows, setRows] = useState<ProductRow[] | null>(null)
  const [draft, setDraft] = useState<BrandDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()
    partnerService
      .listMine([id], controller.signal)
      .then(([found]) => {
        setPartner(found ?? null)
        // Mở link trên máy khác thì cửa hàng cũng vào "Cửa hàng của bạn".
        if (found) savePartnerId(found.id)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setPartner(null)
        toast.error(getErrorMessage(error, "Không tải được thương hiệu."))
      })
    return () => controller.abort()
  }, [id])

  async function save(request: () => Promise<Partner>, done: () => void, success: string, failure: string): Promise<void> {
    setBusy(true)
    try {
      setPartner(await request())
      done()
      toast.success(success)
    } catch (error) {
      toast.error(getErrorMessage(error, failure))
    } finally {
      setBusy(false)
    }
  }

  function handleSaveProducts(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!rows || !partner) return
    void save(() => partnerService.setProducts(id, readPartnerToken(id) ?? "", toProducts(rows, partner.kind)), () => setRows(null), "Đã lưu sản phẩm.", "Chưa lưu được sản phẩm, vui lòng thử lại.")
  }

  function handleSaveInfo(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!draft || !partner) return
    void save(() => partnerService.setInfo(id, readPartnerToken(id) ?? "", draftToInfo(draft, partner.kind)), () => setDraft(null), "Đã lưu thông tin.", "Chưa lưu được thông tin, vui lòng thử lại.")
  }

  async function handleDelete(): Promise<void> {
    setBusy(true)
    try {
      await partnerService.remove(id, readPartnerToken(id) ?? "")
      forgetPartner(id)
      toast.success("Đã xóa thương hiệu.")
      router.push("/doi-tac")
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa xóa được thương hiệu, vui lòng thử lại."))
      setBusy(false)
    }
  }

  const back = (
    <Link href="/doi-tac" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-title">
      <ArrowLeftIcon aria-hidden className="size-4" />
      Cửa hàng của bạn
    </Link>
  )

  if (partner === undefined) return <p className="text-sm text-muted-foreground">Đang tải…</p>
  if (partner === null) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <p className="text-sm text-body">Không tìm thấy thương hiệu này. Link có thể đã sai hoặc đăng ký đã bị xóa.</p>
      </div>
    )
  }

  const imageUrl = partnerImageUrl(partner)
  const incomplete = missingForPlan(partner)
  const editButtons = (cancel: () => void): React.JSX.Element => (
    <div className="flex flex-wrap gap-2 border-t border-tint/10 pt-4">
      <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
        {busy ? "Đang lưu…" : "Lưu thay đổi"}
      </button>
      <button type="button" disabled={busy} onClick={cancel} className={GHOST_BUTTON}>
        Hủy
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {back}

      {incomplete && (
        <p role="status" className="flex gap-2 rounded-2xl bg-amber-400/10 p-4 text-sm text-body ring-1 ring-amber-400/30">
          <AlertTriangleIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-500" />
          Đăng ký này còn thiếu thông tin (khu vực, phân khúc, đơn vị hoặc giá sản phẩm) nên chưa hiện trong phần lên kế hoạch. Vui lòng bổ sung bằng nút “Sửa thông tin” và “Thêm, sửa sản phẩm”.
        </p>
      )}

      <section aria-labelledby="brand-heading" className="glass-card overflow-hidden p-0">
        {!draft && imageUrl && (
          <div className="relative aspect-[21/9]">
            <Image src={imageUrl} alt={partner.brand} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" priority />
          </div>
        )}
        <div className="p-6 sm:p-7">
          {draft ? (
            <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
              <h1 id="brand-heading" className="font-heading text-lg font-bold text-title">
                Sửa thông tin thương hiệu
              </h1>
              <BrandFields value={draft} onChange={setDraft} destinations={destinations} kindLocked />
              {editButtons(() => setDraft(null))}
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary-ink">{[partner.kind, partner.tier, partner.area].filter(Boolean).join(" · ")}</p>
                  <h1 id="brand-heading" className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-title sm:text-3xl">
                    {partner.brand}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{partner.address}</p>
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-primary-ink underline-offset-2 hover:underline">
                      {partner.website}
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PartnerStatusBadge status={partner.status} />
                  <button type="button" onClick={() => setDraft(draftFromPartner(partner))} className={GHOST_BUTTON}>
                    <PencilIcon aria-hidden className="size-4" />
                    Sửa thông tin
                  </button>
                </div>
              </div>
              {partner.description && <p className="mt-4 text-sm text-body">{partner.description}</p>}
              {partner.childPolicy && (
                <p className="mt-2 text-sm text-body">
                  Giá trẻ em: dưới {partner.childPolicy.freeUnderAge} tuổi miễn phí, dưới 12 tuổi {partner.childPolicy.childPercent}% giá người lớn.
                </p>
              )}
              {/* Thiếu thông tin thì cảnh báo phía trên đã giải thích; "đang hiện trong kế hoạch" sẽ sai. */}
              {!incomplete && <p className="mt-4 rounded-xl bg-tint/[0.04] p-3 text-sm text-body">{STATUS_NOTE[partner.status]}</p>}
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="products-heading" className="glass-card p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="products-heading" className="font-heading text-lg font-bold text-title">
            Sản phẩm, dịch vụ ({partner.products.length})
          </h2>
          {!rows && (
            <button type="button" onClick={() => setRows(partner.products.map(toRow))} className={GHOST_BUTTON}>
              <PencilIcon aria-hidden className="size-4" />
              Thêm, sửa sản phẩm
            </button>
          )}
        </div>

        {rows ? (
          <form onSubmit={handleSaveProducts} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Khi đã được duyệt, sản phẩm hiện trong mục “{SERVICE_KIND_LABEL[PARTNER_KIND_SERVICE[partner.kind].kind]}” lúc du khách lên kế hoạch.</p>
            <ProductRowsEditor rows={rows} onChange={setRows} kind={partner.kind} />
            {editButtons(() => setRows(null))}
          </form>
        ) : (
          <ProductList products={partner.products} />
        )}
      </section>

      <section aria-labelledby="delete-heading" className="glass-card flex flex-wrap items-center justify-between gap-3 p-6 sm:p-7">
        <div>
          <h2 id="delete-heading" className="font-heading text-lg font-bold text-title">
            Xóa thương hiệu
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Xóa vĩnh viễn thương hiệu, ảnh và sản phẩm; dịch vụ sẽ không còn trong phần lên kế hoạch.</p>
        </div>
        {confirmDelete ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void handleDelete()} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold whitespace-nowrap text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
              {busy ? "Đang xóa…" : "Xóa vĩnh viễn"}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className={GHOST_BUTTON}>
              Hủy
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className={GHOST_BUTTON}>
            <Trash2Icon aria-hidden className="size-4" />
            Xóa thương hiệu
          </button>
        )}
      </section>
    </div>
  )
}
