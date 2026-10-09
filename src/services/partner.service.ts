import { http } from "@/services/http"
import type { Partner, PartnerInfo, PartnerInput, PartnerProduct, PartnerStatus, PartnerWithContact } from "@/types/partner"

type ProductInput = Omit<PartnerProduct, "id"> & { id?: string }

export const partnerService = {
  /** Chỉ các cửa hàng có id này (đã đăng ký trên trình duyệt hiện tại). */
  async listMine(ids: string[], signal?: AbortSignal): Promise<Partner[]> {
    if (ids.length === 0) return []
    const { data } = await http.get<{ partners: Partner[] }>("/partners", { params: { ids: ids.join(",") }, signal })
    return data.partners
  },

  /** image: data URL đã nén, gửi kèm trong cùng request. */
  /** editToken chỉ trả về một lần, cần lưu lại để sửa sau này. */
  async create(input: Omit<PartnerInput, "products"> & { products: ProductInput[]; image?: string }): Promise<{ partner: Partner; editToken: string }> {
    const { data } = await http.post<{ partner: Partner; editToken: string }>("/partners", input)
    return data
  },

  async listForReview(signal?: AbortSignal): Promise<PartnerWithContact[]> {
    const { data } = await http.get<{ partners: PartnerWithContact[] }>("/partners/review", { signal })
    return data.partners
  },

  async setStatus(id: string, status: PartnerStatus): Promise<PartnerWithContact> {
    const { data } = await http.patch<{ partner: PartnerWithContact }>(`/partners/${encodeURIComponent(id)}`, { status })
    return data.partner
  },

  async setProducts(id: string, editToken: string, products: ProductInput[]): Promise<Partner> {
    const { data } = await http.put<{ partner: Partner }>(`/partners/${encodeURIComponent(id)}`, { products, editToken })
    return data.partner
  },

  async setInfo(id: string, editToken: string, info: PartnerInfo & { image?: string }): Promise<Partner> {
    const { data } = await http.put<{ partner: Partner }>(`/partners/${encodeURIComponent(id)}/info`, { ...info, editToken })
    return data.partner
  },

  async remove(id: string, editToken: string): Promise<void> {
    await http.delete(`/partners/${encodeURIComponent(id)}`, { data: { editToken } })
  },
}
