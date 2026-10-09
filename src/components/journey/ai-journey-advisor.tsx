"use client"

import { useState } from "react"
import {
  SparklesIcon,
  BotIcon,
  CheckCircle2Icon,
  PlusIcon,
  HotelIcon,
  WavesIcon,
  ZapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"
import { toast } from "sonner"

import { formatVnd } from "@/lib/format"
import { travelersLabel } from "@/lib/journey/labels"
import { cn } from "@/lib/utils"
import type { PublicJourney, ServiceItem } from "@/types/journey"

interface AiJourneyAdvisorProps {
  journey: PublicJourney
  services: ServiceItem[]
  canEdit: boolean
  onAddService: (service: ServiceItem, day: number | null) => Promise<boolean | void>
}

interface VibePreset {
  id: string
  name: string
  emoji: string
  tagline: string
  badge: string
  dayPlan: {
    day: number
    keyword: string
    reason: string
  }[]
}

const VIBE_PRESETS: VibePreset[] = [
  {
    id: "beach-chill",
    name: "Nghỉ Dưỡng & Chill Hoàng Hôn",
    emoji: "🏖️",
    tagline: "Resort view biển cao cấp, ngắm hoàng hôn triệu view và thưởng thức ẩm thực thư thái.",
    badge: "Thư giãn #1",
    dayPlan: [
      { day: 1, keyword: "resort", reason: "Nhận phòng khách sạn view biển & thư giãn hồ bơi" },
      { day: 1, keyword: "bãi sao", reason: "Tắm biển Bãi Sao ngắm cát trắng mịn" },
      { day: 2, keyword: "cáp treo", reason: "Trải nghiệm cáp treo Hòn Thơm vượt biển ngắm hoàng hôn" },
      { day: 2, keyword: "chợ đêm", reason: "Dạo phố và ăn hải sản tươi ngon chợ đêm" },
      { day: 3, keyword: "gỏi cá trích", reason: "Thưởng thức đặc sản gỏi cá trích trước khi về" },
    ],
  },
  {
    id: "island-adventure",
    name: "Khám Phá & Lặn Đảo Hoang",
    emoji: "🤿",
    tagline: "Cano lướt sóng qua các đảo hoang, lặn ngắm san hô tự nhiên và quẩy công viên giải trí.",
    badge: "Trending 2026",
    dayPlan: [
      { day: 1, keyword: "khách sạn", reason: "Check-in khách sạn trung tâm tiện di chuyển" },
      { day: 2, keyword: "cano", reason: "Tour Cano 4 đảo lặn ngắm san hô & chụp flycam" },
      { day: 2, keyword: "hòn thơm", reason: "Vui chơi công viên nước Aquatopia Hòn Thơm" },
      { day: 3, keyword: "vinwonders", reason: "Khám phá thủy cung & VinWonders Phú Quốc" },
    ],
  },
  {
    id: "foodie-culture",
    name: "Food Tour & Trải Nghiệm Local",
    emoji: "🍜",
    tagline: "Thưởng thức hải sản Hàm Ninh, bún quậy Kiến Xây và khám phá văn hóa bản địa.",
    badge: "Chuẩn gu ẩm thực",
    dayPlan: [
      { day: 1, keyword: "hàm ninh", reason: "Ăn ghẹ Hàm Ninh tươi sống trên nhà bè" },
      { day: 2, keyword: "bún quậy", reason: "Tự pha nước chấm ăn bún quậy trứ danh" },
      { day: 2, keyword: "chợ đêm", reason: "Ăn vặt nhum nướng mỡ hành & kem cuộn chợ đêm" },
      { day: 3, keyword: "nước mắm", reason: "Thăm nhà thùng nước mắm truyền thống mua quà" },
    ],
  },
]

export function AiJourneyAdvisor({
  journey,
  services,
  canEdit,
  onAddService,
}: AiJourneyAdvisorProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedVibe, setSelectedVibe] = useState<string>("beach-chill")
  const [isApplying, setIsApplying] = useState(false)

  const dayCount = journey.nights + 1
  const existingServiceIds = new Set(journey.items.map((i) => i.serviceId))
  const hasHotel = journey.items.some((i) => i.snapshot.kind === "hotel")

  // Find smart recommendations for gaps
  const hotelSuggestions = services
    .filter((s) => s.kind === "hotel" && !existingServiceIds.has(s.id))
    .slice(0, 2)

  const activitySuggestions = services
    .filter((s) => s.kind === "activity" && !existingServiceIds.has(s.id))
    .slice(0, 3)

  const activeVibe = VIBE_PRESETS.find((v) => v.id === selectedVibe) || VIBE_PRESETS[0]

  // Auto-plan generator by AI
  const handleApplyVibe = async (preset: VibePreset) => {
    if (!canEdit) {
      toast.error("Bạn cần quyền chỉnh sửa để áp dụng lịch trình.")
      return
    }

    setIsApplying(true)
    let addedCount = 0

    try {
      for (const step of preset.dayPlan) {
        // Adjust step day to fit journey length
        const targetDay = Math.min(step.day, dayCount)

        // Find service matching keyword
        const matchedService = services.find((s) =>
          s.name.toLowerCase().includes(step.keyword.toLowerCase()) ||
          (s.tag && s.tag.toLowerCase().includes(step.keyword.toLowerCase())) ||
          (s.blurb && s.blurb.toLowerCase().includes(step.keyword.toLowerCase()))
        )

        if (matchedService && !existingServiceIds.has(matchedService.id)) {
          await onAddService(matchedService, targetDay)
          existingServiceIds.add(matchedService.id)
          addedCount++
        }
      }

      if (addedCount > 0) {
        toast.success(`✨ AI đã thêm ${addedCount} mục phù hợp vào lịch trình của bạn!`)
      } else {
        toast.info("Các mục trong phong cách này đã có trong kế hoạch của bạn rồi.")
      }
    } catch {
      toast.error("Có lỗi khi thêm mục, vui lòng thử lại.")
    } finally {
      setIsApplying(false)
    }
  }

  const handleQuickAdd = async (service: ServiceItem, day: number | null) => {
    if (!canEdit) return
    const ok = await onAddService(service, day)
    if (ok !== false) {
      const target = day === null ? "mục Cân nhắc" : `Ngày ${day}`
      toast.success(`Đã thêm ${service.name} vào ${target}`)
    }
  }

  return (
    <div className="double-bezel shadow-xl overflow-hidden mb-8">
      <div className="double-bezel-inner p-5 sm:p-7">
        {/* Accordion Toggle Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent-cyan text-white shadow-md">
              <BotIcon className="size-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl font-extrabold text-title">
                  AI Gợi Ý & Trợ Lý Xếp Lịch Trình
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary-ink/15 px-2.5 py-0.5 text-[10px] font-bold text-primary-ink ring-1 ring-primary-ink/30">
                  <SparklesIcon className="size-2.5" />
                  Auto-Planner
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gợi ý phân bổ khách sạn, tour và hoạt động tối ưu cho chuyến đi {dayCount} ngày {journey.nights} đêm ({travelersLabel(journey.travelers)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex size-8 items-center justify-center rounded-lg bg-tint/5 hover:bg-tint/10 text-title transition-colors"
            aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
          >
            {isOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-6 pt-6 border-t border-tint/10 space-y-6">
            {/* Vibe Presets Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-ink flex items-center gap-1.5">
                  <ZapIcon className="size-3.5" />
                  1-Click AI Lên Lịch Trình Tự Động Theo Phong Cách:
                </p>
                <span className="text-[11px] text-muted-foreground">Chọn phong cách bạn thích</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {VIBE_PRESETS.map((vibe) => {
                  const isSelected = selectedVibe === vibe.id
                  return (
                    <div
                      key={vibe.id}
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={cn(
                        "cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative flex flex-col justify-between",
                        isSelected
                          ? "bg-primary-ink/10 border-primary-ink/50 shadow-md ring-1 ring-primary-ink/30"
                          : "bg-tint/[0.02] border-tint/10 hover:border-tint/25 hover:bg-tint/[0.05]"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{vibe.emoji}</span>
                          <span className="text-[10px] font-bold text-primary-ink bg-primary-ink/15 px-2 py-0.5 rounded-full">
                            {vibe.badge}
                          </span>
                        </div>
                        <h3 className="font-heading text-sm font-bold text-title">{vibe.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{vibe.tagline}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-tint/10 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-primary-ink">
                          {vibe.dayPlan.length} hoạt động mẫu
                        </span>
                        {isSelected && (
                          <CheckCircle2Icon className="size-4 text-primary-ink" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action button to apply active vibe */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-tint/[0.03] border border-tint/10">
                <div className="text-xs text-body">
                  <strong className="text-title">Đang chọn:</strong> {activeVibe.emoji} {activeVibe.name} ({activeVibe.dayPlan.length} hoạt động phân bổ tự động vào {dayCount} ngày)
                </div>
                {canEdit && (
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => handleApplyVibe(activeVibe)}
                    className="btn-primary inline-flex h-9.5 items-center gap-2 rounded-full px-5 text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    <SparklesIcon className="size-3.5 text-amber-200" />
                    <span>{isApplying ? "Đang xếp lịch trình..." : "Tự động xếp lịch trình bằng AI"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Smart Gap Alerts (Missing Hotel / Activities) */}
            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              {/* Hotel Suggestion Card */}
              <div className="rounded-2xl bg-tint/[0.02] p-4.5 border border-tint/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HotelIcon className="size-4 text-primary-ink" />
                    <h3 className="font-heading text-sm font-bold text-title">
                      {hasHotel ? "Chỗ nghỉ đã có trong chuyến" : "⚠️ Bạn chưa chọn khách sạn/resort"}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hasHotel
                      ? "Bạn đã có khách sạn trong kế hoạch. Muốn đổi hoặc thêm phòng cho nhóm?"
                      : "AI gợi ý những resort view biển được đánh giá cao nhất:"}
                  </p>

                  <ul className="mt-3 space-y-2">
                    {hotelSuggestions.map((hotel) => (
                      <li key={hotel.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-tint/[0.04] border border-tint/8 text-xs">
                        <div className="truncate">
                          <p className="font-bold text-title truncate">{hotel.name}</p>
                          <p className="text-[10px] text-primary-ink">{formatVnd(hotel.priceVnd)}/đêm</p>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(hotel, 1)}
                            className="shrink-0 flex items-center gap-1 rounded-lg bg-primary-ink/15 hover:bg-primary hover:text-white px-2.5 py-1 text-[11px] font-bold text-primary-ink transition-colors"
                          >
                            <PlusIcon className="size-3" />
                            <span>Thêm ngày 1</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Must-Try Activities Card */}
              <div className="rounded-2xl bg-tint/[0.02] p-4.5 border border-tint/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <WavesIcon className="size-4 text-cyan-400" />
                    <h3 className="font-heading text-sm font-bold text-title">
                      Gợi Ý Hoạt Động Triệu View Chưa Có
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Thêm nhanh các trải nghiệm hot nhất Phú Quốc vào lịch trình:
                  </p>

                  <ul className="mt-3 space-y-2">
                    {activitySuggestions.map((act) => (
                      <li key={act.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-tint/[0.04] border border-tint/8 text-xs">
                        <div className="truncate">
                          <p className="font-bold text-title truncate">{act.name}</p>
                          <p className="text-[10px] text-muted-foreground">{act.tag ?? "Trải nghiệm biển"}</p>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(act, 2)}
                            className="shrink-0 flex items-center gap-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 hover:text-white px-2.5 py-1 text-[11px] font-bold text-cyan-400 transition-colors"
                          >
                            <PlusIcon className="size-3" />
                            <span>Thêm ngày 2</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
