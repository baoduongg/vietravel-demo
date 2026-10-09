"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tabs } from "radix-ui"
import { PencilIcon, PlusIcon, WifiOffIcon } from "lucide-react"
import { toast } from "sonner"

import { AiJourneyAdvisor } from "@/components/journey/ai-journey-advisor"
import { CostPanel } from "@/components/journey/cost-panel"
import { InviteDialog } from "@/components/journey/invite-dialog"
import { JoinForm } from "@/components/journey/join-form"
import { JourneyInfoForm } from "@/components/journey/journey-info-form"
import { JourneyItemCard } from "@/components/journey/journey-item-card"
import { Modal } from "@/components/journey/modal"
import { ServiceCatalogPanel, type CatalogFilter } from "@/components/journey/service-catalog-panel"
import { ServicePicker } from "@/components/journey/service-picker"
import { GHOST_BUTTON, PRIMARY_BUTTON } from "@/components/journey/styles"
import { useJourney } from "@/hooks/use-journey"
import { addDays, dayLabel, durationLabel, travelersLabel } from "@/lib/journey/labels"
import { voteScore } from "@/lib/journey/operations"
import { formatShortDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { JourneyItem, JourneyOp, JourneyRole, PublicJourney, ServiceItem, ServiceKind } from "@/types/journey"

interface JourneyViewProps {
  token: string
  initial: { journey: PublicJourney; role: JourneyRole }
  services: ServiceItem[]
  bookUrl: string
  /** Chọn sẵn loại dịch vụ (từ nút "Chọn khách sạn cho kế hoạch"). */
  openPicker?: ServiceKind
}

/** null = tab "Đang cân nhắc"; số = ngày trong chuyến. */
type TabDay = number | null

const CONSIDERING = "considering"

function tabValue(day: TabDay): string {
  return day === null ? CONSIDERING : `day-${day}`
}

function parseTab(value: string): TabDay {
  return value === CONSIDERING ? null : Number(value.slice("day-".length))
}

export function JourneyView({ token, initial, services, bookUrl, openPicker }: JourneyViewProps): React.JSX.Element {
  const { journey, role, memberId, memberKnown, offline, missing, send, join } = useJourney(token, initial, services)
  const [activeDay, setActiveDay] = useState<TabDay>(1)
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>(openPicker ?? "all")
  const [pickerKind, setPickerKind] = useState<ServiceKind | null>(null)
  const [editing, setEditing] = useState(false)
  const canEdit = role === "edit" && memberId !== undefined
  const dayCount = journey.nights + 1
  // Giảm số đêm có thể làm tab đang mở biến mất: quay về ngày cuối còn lại.
  const currentDay = activeDay !== null && activeDay > dayCount ? dayCount : activeDay
  const memberName = (id: string): string => journey.members.find((member) => member.id === id)?.name ?? "Thành viên"
  const me = memberId ? memberName(memberId) : undefined
  const onOp = (op: JourneyOp): void => void send(op)

  // Trên điện thoại không có cột danh mục: link ?them=<loại> mở bảng chọn thay vào đó.
  useEffect(() => {
    if (openPicker && canEdit && window.matchMedia("(max-width: 1023px)").matches) setPickerKind(openPicker)
  }, [openPicker, canEdit])

  if (missing) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 pt-28 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-title">Kế hoạch này không còn tồn tại</h1>
        <Link href="/hanh-trinh" className={PRIMARY_BUTTON}>
          Về Kế hoạch của tôi
        </Link>
      </div>
    )
  }

  const groups: { day: TabDay; label: string; items: JourneyItem[] }[] = [
    {
      day: null,
      label: "Đang cân nhắc",
      items: journey.items.filter((item) => item.day === null).sort((a, b) => voteScore(b) - voteScore(a) || a.order - b.order),
    },
    ...Array.from({ length: dayCount }, (_, position) => ({
      day: position + 1,
      label: dayLabel(journey.startDate, position + 1),
      items: journey.items.filter((item) => item.day === position + 1).sort((a, b) => a.order - b.order),
    })),
  ]
  const targetLabel = currentDay === null ? "Cân nhắc" : `Ngày ${currentDay}`
  const dateRange = journey.startDate ? ` · ${formatShortDate(journey.startDate)}–${formatShortDate(addDays(journey.startDate, journey.nights))}` : ""

  function handleAdd(service: ServiceItem): void {
    const where = currentDay === null ? "Đang cân nhắc" : `Ngày ${currentDay}`
    void send({ type: "addItem", serviceId: service.id, day: currentDay }).then((ok) => ok && toast.success(`Đã thêm ${service.name} vào ${where}`))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-28 lg:px-6 lg:pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-ink">Kế hoạch chuyến đi Vietravel</p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-title sm:text-4xl">{journey.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
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
                className="grid size-9 place-items-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-sm font-extrabold text-white ring-2 ring-background shadow-sm"
              >
                {member.name.charAt(0).toUpperCase()}
              </li>
            ))}
            {journey.members.length > 6 && (
              <li className="grid size-9 place-items-center rounded-full bg-tint/10 text-xs font-bold ring-2 ring-background">+{journey.members.length - 6}</li>
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
        <span className="rounded-full bg-tint/[0.08] px-3 py-1 font-semibold text-title">{role === "view" ? "Chỉ xem" : me ? `Đang sửa · ${me}` : memberKnown ? "Nhập tên để bắt đầu sửa" : "Đang tải…"}</span>
        {offline && (
          <span role="status" className="inline-flex items-center gap-1.5 text-coral">
            <WifiOffIcon aria-hidden strokeWidth={1.5} className="size-4" />
            Mất kết nối, đang thử lại…
          </span>
        )}
      </p>

      {role === "edit" && memberKnown && !memberId && <JoinForm onJoin={join} />}

      {/* AI Smart Journey Advisor & Auto-Planner */}
      <div className="mt-8">
        <AiJourneyAdvisor
          journey={journey}
          services={services}
          canEdit={canEdit}
          onAddService={async (service, day) => {
            const ok = await send({ type: "addItem", serviceId: service.id, day })
            return ok
          }}
        />
      </div>

      <Tabs.Root value={tabValue(currentDay)} onValueChange={(value) => setActiveDay(parseTab(value))} className="mt-4">
        <Tabs.List aria-label="Ngày trong chuyến" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:px-0">
          {groups.map((group) => (
            <Tabs.Trigger
              key={tabValue(group.day)}
              value={tabValue(group.day)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-tint/5 px-4 text-sm font-bold whitespace-nowrap text-body ring-1 ring-tint/10 outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              {group.label}
              <span className="text-xs opacity-75">({group.items.length})</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className={cn("mt-6 grid gap-8", canEdit && "lg:grid-cols-[20rem_1fr]")}>
          {canEdit && (
            <ServiceCatalogPanel
              services={services}
              filter={catalogFilter}
              onFilterChange={setCatalogFilter}
              targetLabel={targetLabel}
              onAdd={handleAdd}
              className="hidden lg:flex"
            />
          )}
          <div className="flex min-w-0 flex-col gap-4">
            <CostPanel journey={journey} bookUrl={bookUrl} />
            {groups.map((group) => (
              <Tabs.Content key={tabValue(group.day)} value={tabValue(group.day)} className="outline-none">
                {group.day === null && <p className="mb-3 text-sm text-muted-foreground">Các lựa chọn để cả nhóm bình chọn. Mục ở đây chưa tính vào chi phí.</p>}
                {group.items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-tint/15 p-6 text-center text-sm text-muted-foreground">
                    {canEdit ? `Chưa có mục nào. Chọn dịch vụ để thêm vào ${group.label}.` : "Chưa có mục nào."}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
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
              </Tabs.Content>
            ))}
            {canEdit && (
              <button type="button" onClick={() => setPickerKind(openPicker ?? "hotel")} className={`${PRIMARY_BUTTON} self-start lg:hidden`}>
                <PlusIcon aria-hidden strokeWidth={1.5} className="size-4" />
                Thêm dịch vụ vào {targetLabel}
              </button>
            )}
          </div>
        </div>
      </Tabs.Root>

      {canEdit && <ServicePicker services={services} kind={pickerKind} onKindChange={setPickerKind} onAdd={handleAdd} targetLabel={targetLabel} />}
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
