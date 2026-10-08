"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { Modal } from "@/components/journey/modal"
import { GHOST_BUTTON } from "@/components/journey/styles"
import { createJourneyAndSave } from "@/lib/journey/client"
import { defaultJourneyInfo } from "@/lib/journey/labels"
import { readSaved, type SavedJourney } from "@/lib/journey/local"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/services/http"
import { journeyService } from "@/services/journey.service"
import type { JourneyInfoValues, ServiceKind } from "@/types/journey"

interface AddToPlanButtonProps {
  destinationSlug: string
  destinationName: string
  /** Thêm thẳng dịch vụ này. Bỏ trống thì mở trang kế hoạch với bảng chọn ở tab pickerKind. */
  serviceId?: string
  pickerKind?: ServiceKind
  label?: string
  className?: string
}

export function AddToPlanButton({
  destinationSlug,
  destinationName,
  serviceId,
  pickerKind = "hotel",
  label = "Thêm vào kế hoạch",
  className,
}: AddToPlanButtonProps): React.JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [choices, setChoices] = useState<SavedJourney[]>([])

  async function addTo(saved: SavedJourney): Promise<void> {
    if (!serviceId) {
      router.push(`/hanh-trinh/${saved.token}?them=${pickerKind}`)
      return
    }
    try {
      await journeyService.op(saved.id, { token: saved.token, memberId: saved.memberId, op: { type: "addItem", serviceId } })
      setOpen(false)
      toast.success(`Đã thêm vào "${saved.title}"`, {
        action: { label: "Xem kế hoạch", onClick: () => router.push(`/hanh-trinh/${saved.token}`) },
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa thêm được vào kế hoạch, Quý khách thử lại nhé."))
    }
  }

  function handleClick(): void {
    // Chỉ kế hoạch có link sửa và đã nhập tên mới thêm được mục.
    const editable = readSaved().filter((item) => item.role === "edit" && item.memberId)
    if (editable.length === 1) {
      void addTo(editable[0])
      return
    }
    setChoices(editable)
    setOpen(true)
  }

  async function handleCreate(values: JourneyInfoValues): Promise<void> {
    try {
      const saved = await createJourneyAndSave(destinationSlug, values)
      await addTo(saved)
      if (serviceId) router.push(`/hanh-trinh/${saved.token}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa tạo được kế hoạch, Quý khách thử lại nhé."))
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={cn(GHOST_BUTTON, className)}>
        <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
        {label}
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Thêm vào kế hoạch"
        description={choices.length > 0 ? "Chọn kế hoạch, hoặc tạo kế hoạch mới." : "Tạo kế hoạch để lưu lựa chọn và mời bạn bè cùng bàn."}
      >
        {choices.length > 0 && (
          <ul className="mb-6 flex flex-col gap-2">
            {choices.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => void addTo(choice)}
                  className="w-full rounded-2xl bg-tint/[0.06] px-4 py-3 text-left text-sm font-semibold text-title ring-1 ring-tint/10 outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {choice.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        <JourneyInfoForm initial={defaultJourneyInfo(destinationName)} askName submitLabel="Tạo kế hoạch" onSubmit={handleCreate} />
      </Modal>
    </>
  )
}
