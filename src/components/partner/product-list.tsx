import { formatVnd } from "@/lib/format"
import { priceLabel } from "@/lib/journey/labels"
import type { PartnerProduct } from "@/types/partner"

export function ProductList({ products }: { products: PartnerProduct[] }): React.JSX.Element {
  return (
    <ul className="mt-3 flex flex-col gap-1 text-sm">
      {products.map((product, index) => (
        <li key={product.id ?? index} className="flex justify-between gap-3">
          <span className="text-body">
            {product.name}
            {product.description && <span className="text-muted-foreground"> · {product.description}</span>}
          </span>
          <span className="shrink-0 font-semibold text-title">
            {/* Đăng ký cũ chưa có đơn vị giá. */}
            {product.unit ? priceLabel({ priceVnd: product.priceVnd, priceUnit: product.unit }) : formatVnd(product.priceVnd)}
          </span>
        </li>
      ))}
    </ul>
  )
}
