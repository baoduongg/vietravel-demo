"use client"

import { useState } from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, WifiOffIcon } from "lucide-react"
import { toast } from "sonner"

import { CostPanel } from "@/components/journey/cost-panel"
import { InviteDialog } from "@/components/journey/invite-dialog"
import { JoinForm } from "@/components/journey/join-form"
import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { JourneyItemCard } from "@/components/journey/journey-item-card"
import { Modal } from "@/components/journey/modal"
import { ServicePicker } from "@/components/journey/service-picker"
import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/journey/styles"
import { useJourney } from "@/hooks/use-journey"
import { addDays, dayLabel, durationLabel, travelersLabel } from "@/lib/journey/labels"
import { voteScore } from "@/lib/journey/operations"
import { formatShortDate } from "@/lib/format"
import type { JourneyItem, JourneyOp, JourneyRole, PublicJourney, ServiceItem, ServiceKind } from "@/types/journey"

interface JourneyViewProps {
  token: string
  initial: { journey: PublicJourney; role: JourneyRole }
  services: ServiceItem[]
  bookUrl: string
  /** Mở sẵn bảng chọn ở tab này (từ nút "Chọn khách sạn cho kế hoạch"). */
  openPicker?: ServiceKind
}

export function JourneyView({ token, initial, services, bookUrl, openPicker }: JourneyViewProps): React.JSX.Element {
  const { journey, role, memberId, offline, missing, send, join } = useJourney(token, initial, services)
  const [pickerKind, setPickerKind] = useState<ServiceKind | null>(openPicker ?? null)
  const [editing, setEditing] = useState(false)
  const canEdit = role === "edit" && memberId !== undefined
  const dayCount = journey.nights + 1
  const memberName = (id: string): string => journey.members.find((member) => member.id === id)?.name ?? "Thành viên"
  const me = memberId ? memberName(memberId) : undefined
  const onOp = (op: JourneyOp): void => void send(op)

  if (missing) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
        <h1 className="font-voyage text-3xl font-semibold text-title">Kế hoạch này không còn tồn tại</h1>
        <Link href="/hanh-trinh" className={PRIMARY_BUTTON}>
          Về Kế hoạch của tôi
        </Link>
      </div>
    )
  }

  const considering = journey.items.filter((item) => item.day === null).sort((a, b) => voteScore(b) - voteScore(a) || a.order - b.order)
  const groups: { key: string; title: string; hint?: string; items: JourneyItem[] }[] = [
    { key: "considering", title: "Đang cân nhắc", hint: "Các lựa chọn để cả nhóm bình chọn. Mục chưa xếp vào ngày chưa tính vào chi phí.", items: considering },
    ...Array.from({ length: dayCount }, (_, position) => ({
      key: `day-${position + 1}`,
      title: dayLabel(journey.startDate, position + 1),
      items: journey.items.filter((item) => item.day === position + 1).sort((a, b) => a.order - b.order),
    })),
  ]
  const dateRange = journey.startDate ? ` · ${formatShortDate(journey.startDate)}–${formatShortDate(addDays(journey.startDate, journey.nights))}` : ""

  function handleAdd(service: ServiceItem): void {
    void send({ type: "addItem", serviceId: service.id }).then((ok) => ok && toast.success(`Đã thêm ${service.name} vào Đang cân nhắc`))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-32 pb-28 lg:px-6 lg:pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gold">Kế hoạch chuyến đi</p>
          <h1 className="font-voyage text-3xl font-semibold tracking-tight text-title sm:text-4xl">{journey.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {durationLabel(journey.nights)}
            {dateRange} · {travelersLabel(journey.travelers)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ul aria-label="Thành viên" className="flex -space-x-2">
            {journey.members.slice(0, 6).map((member) => (
              <li
                key={member.id}
                title={member.name}
                className="grid size-9 place-items-center rounded-full bg-champagne text-sm font-bold text-void ring-2 ring-void"
              >
                {member.name.charAt(0).toUpperCase()}
              </li>
            ))}
            {journey.members.length > 6 && (
              <li className="grid size-9 place-items-center rounded-full bg-tint/10 text-xs font-bold ring-2 ring-void">+{journey.members.length - 6}</li>
            )}
          </ul>
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} className={GHOST_BUTTON}>
              <PencilIcon aria-hidden strokeWidth={1.5} className="size-4" />
              Sửa thông tin
            </button>
          )}
          <InviteDialog journey={journey} />
        </div>
      </header>

      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-tint/[0.08] px-3 py-1 font-semibold">{role === "view" ? "Chỉ xem" : me ? `Đang sửa · ${me}` : "Nhập tên để bắt đầu sửa"}</span>
        {offline && (
          <span role="status" className="inline-flex items-center gap-1.5 text-coral">
            <WifiOffIcon aria-hidden strokeWidth={1.5} className="size-4" />
            Mất kết nối, đang thử lại…
          </span>
        )}
      </p>

      {role === "edit" && !memberId && <JoinForm onJoin={join} />}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={group.key}>
              <h2 id={group.key} className="font-voyage text-xl font-semibold tracking-tight text-title">
                {group.title} <span className="text-sm font-normal text-muted-foreground">({group.items.length})</span>
              </h2>
              {group.hint && <p className="mt-1 text-sm text-muted-foreground">{group.hint}</p>}
              {group.items.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-tint/15 p-4 text-sm text-muted-foreground">Chưa có mục nào.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {group.items.map((item, index) => (
                    <JourneyItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      groupSize={group.items.length}
                      dayCount={dayCount}
                      travelers={journey.travelers}
                      canEdit={canEdit}
                      memberId={memberId}
                      memberName={memberName}
                      onOp={onOp}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))}
          {canEdit && (
            <button type="button" onClick={() => setPickerKind("hotel")} className={`${PRIMARY_BUTTON} self-start`}>
              <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
              Thêm dịch vụ
            </button>
          )}
        </div>
        <CostPanel journey={journey} bookUrl={bookUrl} />
      </div>

      {canEdit && (
        <ServicePicker
          services={services}
          kind={pickerKind}
          onKindChange={setPickerKind}
          onAdd={handleAdd}
          addedIds={new Set(journey.items.map((item) => item.serviceId))}
        />
      )}
      {canEdit && (
        <Modal open={editing} onOpenChange={setEditing} title="Sửa thông tin chuyến">
          <JourneyInfoForm
            initial={{ title: journey.title, startDate: journey.startDate, nights: journey.nights, travelers: journey.travelers, memberName: "" }}
            askName={false}
            submitLabel="Lưu"
            onSubmit={async ({ title, startDate, nights, travelers }) => {
              if (await send({ type: "updateInfo", title, startDate, nights, travelers })) setEditing(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
