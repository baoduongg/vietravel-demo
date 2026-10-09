"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { createJourneyAndSave } from "@/lib/journey/client"
import { defaultJourneyInfo } from "@/lib/journey/labels"
import { readSaved, type SavedJourney } from "@/lib/journey/local"
import { getErrorMessage } from "@/services/http"
import type { JourneyInfoValues } from "@/types/journey"

interface JourneysHomeProps {
  destinationSlug: string
  destinationName: string
}

export function JourneysHome({ destinationSlug, destinationName }: JourneysHomeProps): React.JSX.Element {
  const router = useRouter()
  // null = chưa đọc localStorage (lúc render phía server).
  const [saved, setSaved] = useState<SavedJourney[] | null>(null)

  useEffect(() => {
    setSaved(readSaved())
  }, [])

  async function handleCreate(values: JourneyInfoValues): Promise<void> {
    try {
      const journey = await createJourneyAndSave(destinationSlug, values)
      router.push(`/hanh-trinh/${journey.token}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Chưa tạo được kế hoạch, Quý khách thử lại nhé."))
    }
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_26rem]">
      <section aria-labelledby="ke-hoach-da-luu">
        <h2 id="ke-hoach-da-luu" className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-title">
          Kế hoạch đã lưu trên máy
        </h2>
        {saved === null ? null : saved.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-tint/[0.02] border border-dashed border-tint/15 p-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Chưa có kế hoạch nào. Hãy tạo kế hoạch mới hoặc mở link do bạn bè chia sẻ.</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {saved.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/hanh-trinh/${item.token}`}
                  className="glass-card flex items-center justify-between gap-4 p-5 outline-none hover:border-primary-ink/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring transition-all"
                >
                  <div>
                    <span className="font-heading font-bold text-title">{item.title}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Tự động đồng bộ cùng nhóm</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-ink/15 px-3 py-1 text-xs font-bold text-primary-ink">
                    {item.role === "edit" ? "✨ Được sửa & Dùng AI" : "Chỉ xem"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">💡 Danh sách được lưu an toàn trên trình duyệt này. Muốn cùng sửa trên điện thoại hoặc máy khác, hãy dùng nút Mời bạn bè.</p>
      </section>

      <section aria-labelledby="tao-ke-hoach" className="double-bezel shadow-xl">
        <div className="double-bezel-inner p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-1">
            <h2 id="tao-ke-hoach" className="font-heading text-xl font-extrabold tracking-tight text-title">
              Tạo kế hoạch {destinationName}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">AI sẽ tự động đề xuất khách sạn và lịch trình ngay sau khi tạo.</p>
          <div>
            <JourneyInfoForm initial={defaultJourneyInfo(destinationName)} askName submitLabel="Bắt đầu lên kế hoạch" onSubmit={handleCreate} />
          </div>
        </div>
      </section>
    </div>
  )
}
