"use client"

import { useState } from "react"
import { CopyIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { Modal } from "@/components/journey/modal"
import { GHOST_BUTTON, INPUT_CLASS } from "@/components/journey/styles"
import type { PublicJourney } from "@/types/journey"

async function copy(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Đã sao chép link")
  } catch {
    toast.error("Không sao chép được, Quý khách chọn link và sao chép thủ công nhé.")
  }
}

export function InviteDialog({ journey }: { journey: PublicJourney }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  // Phần tử con của Modal được tạo ngay cả khi đóng (và khi render phía server), nhưng chỉ hiện ra khi mở trên trình duyệt.
  const origin = typeof window === "undefined" ? "" : window.location.origin
  const links = [
    ...(journey.editToken ? [{ label: "Link được sửa", hint: "Người nhận thêm dịch vụ, bình chọn và bình luận.", token: journey.editToken }] : []),
    { label: "Link chỉ xem", hint: "Người nhận xem kế hoạch và chi phí, không sửa được.", token: journey.viewToken },
  ]

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={GHOST_BUTTON}>
        <UsersIcon aria-hidden strokeWidth={1.5} className="size-4" />
        Mời
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Mời cùng lên kế hoạch" description="Gửi link qua Zalo, Messenger hoặc email. Người nhận cần mật khẩu demo để mở.">
        <ul className="flex flex-col gap-5">
          {links.map((link) => {
            const url = `${origin}/hanh-trinh/${link.token}`
            return (
              <li key={link.token}>
                <p className="text-sm font-semibold text-title">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.hint}</p>
                <div className="flex items-end gap-2">
                  <input readOnly aria-label={link.label} value={url} onFocus={(event) => event.currentTarget.select()} className={INPUT_CLASS} />
                  <button type="button" onClick={() => void copy(url)} className={GHOST_BUTTON}>
                    <CopyIcon aria-hidden strokeWidth={1.5} className="size-4" />
                    Sao chép
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Modal>
    </>
  )
}
