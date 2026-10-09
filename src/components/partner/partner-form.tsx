"use client"

import { useState } from "react"
import { toast } from "sonner"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { BrandFields, draftToInfo, emptyDraft, type BrandDraft, type DestinationOption } from "@/components/partner/brand-fields"
import { emptyRow, ProductRowsEditor, toProducts, type ProductRow } from "@/components/partner/product-rows-editor"
import { savePartnerToken } from "@/lib/partners/local"
import { PARTNER_LIMITS } from "@/lib/partners/validate"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { partnerService } from "@/services/partner.service"
import { SERVICE_KIND_LABEL } from "@/types/journey"
import { PARTNER_KIND_SERVICE, type Partner } from "@/types/partner"

interface PartnerFormProps {
  /** Điểm đến đang mở; đối tác hiện trong kế hoạch của điểm đến đã chọn. */
  destinations: DestinationOption[]
  onCreated: (partner: Partner) => void
}

const LABEL = "flex flex-col text-sm font-semibold text-title"

/** Gửi xong thì PartnersHome đóng form, nên không cần xóa từng ô. */
export function PartnerForm({ destinations, onCreated }: PartnerFormProps): React.JSX.Element {
  const [draft, setDraft] = useState<BrandDraft>(() => emptyDraft(destinations))
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [products, setProducts] = useState<ProductRow[]>(() => [emptyRow()])
  const [busy, setBusy] = useState(false)
  const { kind } = draft

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!kind) return
    setBusy(true)
    try {
      const { partner, editToken } = await partnerService.create({ ...draftToInfo(draft, kind), kind, contactName, phone, email, products: toProducts(products, kind) })
      savePartnerToken(partner.id, editToken)
      onCreated(partner)
      toast.success("Đã gửi đăng ký! Vietravel sẽ liên hệ xác minh trong 1–2 ngày làm việc.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa gửi được đăng ký, vui lòng thử lại."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-6 p-6 sm:p-7">
      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-bold text-title">1. Thương hiệu</legend>
        <BrandFields value={draft} onChange={setDraft} destinations={destinations} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-bold text-title">2. Sản phẩm, dịch vụ</legend>
        <p className="text-sm text-muted-foreground">
          {kind
            ? `Khi được duyệt, sản phẩm hiện trong mục “${SERVICE_KIND_LABEL[PARTNER_KIND_SERVICE[kind].kind]}” lúc du khách lên kế hoạch, giá được cộng vào chi phí chuyến đi.`
            : "Chọn loại hình ở trên để biết cách tính giá."}
        </p>
        <ProductRowsEditor rows={products} onChange={setProducts} kind={kind} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-bold text-title">3. Liên hệ</legend>
        <p className="text-sm text-muted-foreground">Chỉ Vietravel thấy, dùng để xác minh đối tác.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={LABEL}>
            Người liên hệ
            <input required maxLength={PARTNER_LIMITS.name} autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} className={INPUT_CLASS} />
          </label>
          <label className={LABEL}>
            Số điện thoại
            <input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 678" className={INPUT_CLASS} />
          </label>
          <label className={LABEL}>
            Email <span className="sr-only">(không bắt buộc)</span>
            <input type="email" autoComplete="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
          </label>
        </div>
      </fieldset>

      <button type="submit" disabled={busy} className={cn(PRIMARY_BUTTON, "self-start")}>
        {busy ? "Đang gửi…" : "Gửi đăng ký"}
      </button>
    </form>
  )
}
