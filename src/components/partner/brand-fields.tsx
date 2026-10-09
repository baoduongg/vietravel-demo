"use client"

import { ImagePlusIcon } from "lucide-react"
import { toast } from "sonner"

import { INPUT_CLASS } from "@/components/journey/styles"
import { processAndCompressImage } from "@/lib/image-utils"
import { partnerImageUrl } from "@/lib/partners/services"
import { PARTNER_LIMITS } from "@/lib/partners/validate"
import { cn } from "@/lib/utils"
import { hasPerPersonPrice, HOTEL_TIERS, PARTNER_KINDS, type HotelTier, type Partner, type PartnerInfo, type PartnerKind } from "@/types/partner"

export interface DestinationOption {
  slug: string
  name: string
  /** Khu vực trong cẩm nang điểm đến, hiện trên thẻ dịch vụ trong kế hoạch. */
  areas: string[]
}

/** Giá trị ô nhập (chuỗi) của phần thương hiệu, dùng chung cho đăng ký mới và sửa thông tin. */
export interface BrandDraft {
  brand: string
  kind: PartnerKind | ""
  destinationSlug: string
  area: string
  tier: HotelTier | ""
  hasChildPrice: boolean
  freeUnderAge: string
  childPercent: string
  address: string
  website: string
  description: string
  /** Ảnh mới chọn (data URL đã nén); undefined thì giữ ảnh cũ. */
  image?: string
  /** Ảnh đang hiển thị: ảnh mới chọn hoặc ảnh đã lưu. */
  imagePreview?: string
}

export function emptyDraft(destinations: DestinationOption[]): BrandDraft {
  return {
    brand: "",
    kind: "",
    // Chỉ một điểm đến đang mở thì chọn sẵn.
    destinationSlug: destinations.length === 1 ? destinations[0].slug : "",
    area: "",
    tier: "",
    hasChildPrice: false,
    // Mặc định giống tour Vietravel: dưới 5 tuổi miễn phí, dưới 12 tuổi 75%.
    freeUnderAge: "5",
    childPercent: "75",
    address: "",
    website: "",
    description: "",
  }
}

/** Đăng ký cũ có thể thiếu khu vực, phân khúc...: để trống cho chủ cửa hàng bổ sung. */
export function draftFromPartner(partner: Partner): BrandDraft {
  return {
    brand: partner.brand,
    kind: partner.kind,
    destinationSlug: partner.destinationSlug ?? "",
    area: partner.area ?? "",
    tier: partner.tier ?? "",
    hasChildPrice: Boolean(partner.childPolicy),
    freeUnderAge: String(partner.childPolicy?.freeUnderAge ?? 5),
    childPercent: String(partner.childPolicy?.childPercent ?? 75),
    address: partner.address ?? "",
    website: partner.website ?? "",
    description: partner.description ?? "",
    imagePreview: partnerImageUrl(partner),
  }
}

export function draftToInfo(draft: BrandDraft, kind: PartnerKind): PartnerInfo & { image?: string } {
  return {
    brand: draft.brand,
    destinationSlug: draft.destinationSlug,
    area: draft.area,
    tier: kind === "Khách sạn" && draft.tier ? draft.tier : undefined,
    childPolicy:
      hasPerPersonPrice(kind) && draft.hasChildPrice ? { freeUnderAge: Number(draft.freeUnderAge), childPercent: Number(draft.childPercent) } : undefined,
    address: draft.address,
    website: draft.website,
    description: draft.description,
    image: draft.image,
  }
}

const LABEL = "flex flex-col text-sm font-semibold text-title"

interface BrandFieldsProps {
  value: BrandDraft
  onChange: (draft: BrandDraft) => void
  destinations: DestinationOption[]
  /** Khi sửa thông tin: loại hình quyết định đơn vị giá của sản phẩm nên không đổi được. */
  kindLocked?: boolean
}

export function BrandFields({ value, onChange, destinations, kindLocked = false }: BrandFieldsProps): React.JSX.Element {
  const set = (patch: Partial<BrandDraft>): void => onChange({ ...value, ...patch })
  const areas = destinations.find((item) => item.slug === value.destinationSlug)?.areas ?? []
  const askChildPrice = value.kind !== "" && hasPerPersonPrice(value.kind)

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      // 960px đủ nét cho thẻ dịch vụ ở màn hình 2x, data URL thường dưới 300KB.
      const image = await processAndCompressImage(file, 960, 0.8)
      if (image.length > PARTNER_LIMITS.imageChars) throw new Error("Ảnh quá lớn, vui lòng chọn ảnh khác.")
      set({ image, imagePreview: image })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không đọc được ảnh.")
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className={cn(LABEL, "sm:col-span-2")}>
        Tên thương hiệu
        <input required maxLength={PARTNER_LIMITS.name} value={value.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Ví dụ: Nhà hàng Biển Xanh" className={INPUT_CLASS} />
      </label>
      <label className={LABEL}>
        Loại hình
        <select required disabled={kindLocked} value={value.kind} onChange={(e) => set({ kind: e.target.value as PartnerKind })} className={cn(INPUT_CLASS, "disabled:opacity-60")}>
          <option value="" disabled>
            Chọn…
          </option>
          {PARTNER_KINDS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL}>
        Điểm đến
        <select required value={value.destinationSlug} onChange={(e) => set({ destinationSlug: e.target.value, area: "" })} className={INPUT_CLASS}>
          <option value="" disabled>
            Chọn…
          </option>
          {destinations.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL}>
        Khu vực
        <select required disabled={areas.length === 0} value={value.area} onChange={(e) => set({ area: e.target.value })} className={INPUT_CLASS}>
          <option value="" disabled>
            Chọn…
          </option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {value.kind === "Khách sạn" && (
        <label className={LABEL}>
          Phân khúc
          <select required value={value.tier} onChange={(e) => set({ tier: e.target.value as HotelTier })} className={INPUT_CLASS}>
            <option value="" disabled>
              Chọn…
            </option>
            {HOTEL_TIERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className={cn(LABEL, "sm:col-span-3")}>
        Địa chỉ
        <input
          required
          maxLength={PARTNER_LIMITS.address}
          autoComplete="street-address"
          value={value.address}
          onChange={(e) => set({ address: e.target.value })}
          placeholder="Ví dụ: 12 Trần Hưng Đạo, Dương Đông"
          className={INPUT_CLASS}
        />
      </label>
      <label className={cn(LABEL, "sm:col-span-3")}>
        Website / Fanpage đặt chỗ <span className="sr-only">(không bắt buộc)</span>
        <input
          type="url"
          maxLength={PARTNER_LIMITS.url}
          value={value.website}
          onChange={(e) => set({ website: e.target.value })}
          placeholder="https://… (nút “Đặt” trong kế hoạch dẫn tới đây)"
          className={INPUT_CLASS}
        />
      </label>
      <label className={cn(LABEL, "sm:col-span-3")}>
        Giới thiệu ngắn <span className="sr-only">(không bắt buộc)</span>
        <input
          maxLength={PARTNER_LIMITS.description}
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Điểm đặc biệt, năm thành lập…"
          className={INPUT_CLASS}
        />
      </label>

      <div className="flex flex-col gap-2 sm:col-span-3">
        <span className="text-sm font-semibold text-title">
          Ảnh đại diện <span className="font-normal text-muted-foreground">(không bắt buộc, hiện trên thẻ dịch vụ trong kế hoạch)</span>
        </span>
        <label className="group relative flex aspect-video w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-tint/[0.04] ring-1 ring-tint/10 focus-within:ring-2 focus-within:ring-ring">
          {value.imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- xem trước data URL vừa chọn hoặc ảnh đã lưu
            <img src={value.imagePreview} alt="Ảnh đại diện" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <ImagePlusIcon aria-hidden className="size-7" />
              Chọn ảnh
            </span>
          )}
          {value.imagePreview && (
            <span className="absolute right-2 bottom-2 rounded-full bg-void/80 px-3 py-1 text-xs font-semibold text-title">Đổi ảnh</span>
          )}
          <input type="file" accept="image/*" onChange={(e) => void handleImage(e)} className="sr-only" />
        </label>
      </div>

      {askChildPrice && (
        <div className="flex flex-col gap-3 rounded-2xl bg-tint/[0.03] p-4 ring-1 ring-tint/10 sm:col-span-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-title">
            <input type="checkbox" checked={value.hasChildPrice} onChange={(e) => set({ hasChildPrice: e.target.checked })} className="size-4 accent-primary-ink" />
            Có giá riêng cho trẻ em
          </label>
          <p className="text-xs text-muted-foreground">Áp dụng cho sản phẩm tính theo mỗi khách. Không chọn thì trẻ em được tính như người lớn.</p>
          {value.hasChildPrice && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={LABEL}>
                Miễn phí cho trẻ dưới (tuổi)
                <input required type="number" inputMode="numeric" min={0} max={12} value={value.freeUnderAge} onChange={(e) => set({ freeUnderAge: e.target.value })} className={INPUT_CLASS} />
              </label>
              <label className={LABEL}>
                Trẻ dưới 12 tuổi trả (% giá người lớn)
                <input required type="number" inputMode="numeric" min={0} max={100} value={value.childPercent} onChange={(e) => set({ childPercent: e.target.value })} className={INPUT_CLASS} />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
