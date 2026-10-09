"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"

import { GHOST_BUTTON, ICON_BUTTON, INPUT_CLASS } from "@/components/journey/styles"
import { PARTNER_LIMITS } from "@/lib/partners/validate"
import { cn } from "@/lib/utils"
import { PRICE_UNIT_LABEL, type PriceUnit } from "@/types/journey"
import { PARTNER_KIND_SERVICE, type PartnerKind, type PartnerProduct } from "@/types/partner"

/** Giá giữ dạng chuỗi của ô nhập. id chỉ có ở sản phẩm đã lưu, để kế hoạch đã thêm nó vẫn trỏ đúng. */
export interface ProductRow {
  key: number
  id?: string
  name: string
  price: string
  unit: PriceUnit | ""
  description: string
}

const PRODUCT_HINT: Record<PartnerKind, string> = {
  "Khách sạn": "Ví dụ: Phòng Deluxe hướng biển, 2 khách",
  "Nhà hàng": "Ví dụ: Gỏi cá trích, set hải sản 4 người",
  "Vui chơi, trải nghiệm": "Ví dụ: Tour cano 4 đảo, lặn ngắm san hô",
  "Thuê xe, đưa đón": "Ví dụ: Xe máy tay ga, đưa đón sân bay 7 chỗ",
  "Sản phẩm địa phương": "Ví dụ: Nước mắm 40 độ đạm, chai 500ml",
}

let nextKey = 0
export const emptyRow = (): ProductRow => ({ key: nextKey++, name: "", price: "", unit: "", description: "" })

export function toRow(product: PartnerProduct): ProductRow {
  return { key: nextKey++, id: product.id, name: product.name, price: String(product.priceVnd), unit: product.unit, description: product.description }
}

/** Đơn vị chưa chọn hoặc không hợp loại hình (vừa đổi loại hình) thì lấy đơn vị đầu tiên. */
export function toProducts(rows: ProductRow[], kind: PartnerKind): (Omit<PartnerProduct, "id"> & { id?: string })[] {
  const { units } = PARTNER_KIND_SERVICE[kind]
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    priceVnd: Number(row.price),
    unit: row.unit && units.includes(row.unit) ? row.unit : units[0],
    description: row.description,
  }))
}

interface ProductRowsEditorProps {
  rows: ProductRow[]
  onChange: (rows: ProductRow[]) => void
  kind: PartnerKind | ""
}

/** Danh sách dòng sản phẩm dùng chung cho form đăng ký và trang chi tiết thương hiệu. */
export function ProductRowsEditor({ rows, onChange, kind }: ProductRowsEditorProps): React.JSX.Element {
  const units = kind ? PARTNER_KIND_SERVICE[kind].units : []

  function update(key: number, patch: Partial<ProductRow>): void {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  return (
    <>
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li key={row.key} className="grid gap-3 rounded-2xl bg-tint/[0.03] p-4 ring-1 ring-tint/10 sm:grid-cols-[1fr_10rem_auto]">
            <label className="flex flex-col text-sm font-semibold text-title">
              Tên sản phẩm {index + 1}
              <input
                required
                maxLength={PARTNER_LIMITS.name}
                value={row.name}
                onChange={(e) => update(row.key, { name: e.target.value })}
                placeholder={kind ? PRODUCT_HINT[kind] : "Tên sản phẩm hoặc dịch vụ"}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex flex-col text-sm font-semibold text-title">
              Giá (VNĐ{units.length === 1 ? ` ${PRICE_UNIT_LABEL[units[0]]}` : ""})
              <input
                required
                type="number"
                inputMode="numeric"
                min={PARTNER_LIMITS.minPriceVnd}
                max={PARTNER_LIMITS.maxPriceVnd}
                step={1000}
                value={row.price}
                onChange={(e) => update(row.key, { price: e.target.value })}
                placeholder="Ví dụ: 150000"
                className={INPUT_CLASS}
              />
            </label>
            <button
              type="button"
              aria-label={`Xóa sản phẩm ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() => onChange(rows.filter((item) => item.key !== row.key))}
              className={cn(ICON_BUTTON, "self-end mb-1")}
            >
              <Trash2Icon aria-hidden className="size-4" />
            </button>
            {units.length > 1 && (
              <label className="flex flex-col text-sm font-semibold text-title sm:col-span-3">
                Tính giá
                <select
                  value={row.unit && units.includes(row.unit) ? row.unit : units[0]}
                  onChange={(e) => update(row.key, { unit: e.target.value as PriceUnit })}
                  className={INPUT_CLASS}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {UNIT_OPTION_LABEL[unit]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col text-sm font-semibold text-title sm:col-span-3">
              Mô tả <span className="sr-only">(không bắt buộc)</span>
              <input
                maxLength={PARTNER_LIMITS.productDescription}
                value={row.description}
                onChange={(e) => update(row.key, { description: e.target.value })}
                placeholder="Một câu điểm nổi bật, ví dụ: Kèm 2 mũ bảo hiểm, giao tại khách sạn"
                className={INPUT_CLASS}
              />
            </label>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={rows.length >= PARTNER_LIMITS.maxProducts}
        onClick={() => onChange([...rows, emptyRow()])}
        className={cn(GHOST_BUTTON, "self-start")}
      >
        <PlusIcon aria-hidden className="size-4" />
        Thêm sản phẩm
      </button>
    </>
  )
}

/** Cách chi phí trong kế hoạch được nhân lên, nói theo lời của chủ quán. */
const UNIT_OPTION_LABEL: Record<PriceUnit, string> = {
  per_person: "Theo mỗi khách (nhân số người trong đoàn)",
  per_booking: "Theo lượt / phần / set (khách chọn số lượng)",
  per_room_night: "Theo phòng / đêm",
  per_day: "Theo ngày (nhân số ngày của chuyến)",
  per_item: "Theo sản phẩm",
}
