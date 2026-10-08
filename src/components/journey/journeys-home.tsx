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
        <h2 id="ke-hoach-da-luu" className="font-voyage text-2xl font-semibold tracking-tight text-title">
          Kế hoạch trên trình duyệt này
        </h2>
        {saved === null ? null : saved.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Chưa có kế hoạch nào. Tạo kế hoạch mới, hoặc mở link mời bạn bè gửi cho Quý khách.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {saved.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/hanh-trinh/${item.token}`}
                  className="glass-card flex items-center justify-between gap-4 p-5 outline-none hover:ring-tint/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-semibold text-title">{item.title}</span>
                  <span className="shrink-0 rounded-full bg-tint/[0.08] px-3 py-1 text-xs font-semibold">{item.role === "edit" ? "Được sửa" : "Chỉ xem"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Danh sách chỉ lưu trên trình duyệt này. Mở trên máy khác thì dùng link mời.</p>
      </section>
      <section aria-labelledby="tao-ke-hoach" className="glass-card p-6">
        <h2 id="tao-ke-hoach" className="font-voyage text-2xl font-semibold tracking-tight text-title">
          Tạo kế hoạch {destinationName}
        </h2>
        <div className="mt-5">
          <JourneyInfoForm initial={defaultJourneyInfo(destinationName)} askName submitLabel="Tạo kế hoạch" onSubmit={handleCreate} />
        </div>
      </section>
    </div>
  )
}
