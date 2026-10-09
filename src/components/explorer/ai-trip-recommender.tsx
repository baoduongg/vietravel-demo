"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  SparklesIcon,
  SearchIcon,
  CompassIcon,
  FlameIcon,
  ClockIcon,
  PlaneIcon,
  StarIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  BotIcon,
  RotateCcwIcon,
} from "lucide-react"

import { AddToPlanButton } from "@/components/journey/add-to-plan-button"
import { tourServiceId } from "@/lib/journey/ids"
import { formatRating, formatShortDate, formatVnd } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Tour } from "@/types/tour"

interface AiTripRecommenderProps {
  tours: Tour[]
  hotline: string
}

const BUDGET_OPTIONS = [
  { label: "Tất cả mức giá", min: 0, max: Infinity },
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5 - 8 triệu", min: 5000000, max: 8000000 },
  { label: "8 - 12 triệu", min: 8000000, max: 12000000 },
  { label: "Trên 12 triệu", min: 12000000, max: Infinity },
]

const VIBE_OPTIONS = [
  { id: "all", label: "✨ Mọi phong cách", keywords: [] },
  { id: "beach", label: "🏖️ Chill Biển & Sunset", keywords: ["phú quốc", "nha trang", "đà nẵng", "quy nhơn", "hạ long", "biển", "đảo"] },
  { id: "island", label: "🤿 Lặn San Hô & Khám Phá", keywords: ["phú quốc", "hòn thơm", "cano", "cù lao", "lặn", "san hô"] },
  { id: "mountain", label: "🏔️ Săn Mây & Núi Rừng", keywords: ["sapa", "fansipan", "hà giang", "đà lạt", "yên tử"] },
  { id: "food", label: "🍜 Food Tour & Phố Cổ", keywords: ["hội an", "đà nẵng", "hà nội", "huế", "ẩm thực", "chợ đêm"] },
  { id: "international", label: "✈️ Du Lịch Quốc Tế", keywords: ["bangkok", "thái lan", "nhật bản", "hàn quốc", "singapore", "châu âu"] },
]

const CITIES = [
  "Tất cả nơi đi",
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
]

const QUICK_PROMPTS = [
  "🏖️ Phú Quốc cano 4 đảo giá tốt",
  "⚡ Tour giờ chót giảm sâu",
  "🍜 Đà Nẵng - Hội An 3N2Đ",
  "🏔️ Sapa săn mây Fansipan",
  "✈️ Du lịch Thái Lan shopping",
]

export function AiTripRecommender({ tours, hotline }: AiTripRecommenderProps): React.JSX.Element {
  const [selectedBudget, setSelectedBudget] = useState(0)
  const [selectedVibe, setSelectedVibe] = useState("all")
  const [selectedCity, setSelectedCity] = useState("Tất cả nơi đi")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTours = useMemo(() => {
    const budget = BUDGET_OPTIONS[selectedBudget]
    const vibe = VIBE_OPTIONS.find((v) => v.id === selectedVibe)
    const query = searchQuery.trim().toLowerCase()

    return tours
      .map((tour) => {
        const price = tour.deal?.priceVnd ?? tour.priceVnd
        let score = 0
        const reasons: string[] = []

        // Budget match
        if (price >= budget.min && price <= budget.max) {
          score += 30
          reasons.push(`Giá ${formatVnd(price)} chuẩn ngân sách`)
        } else if (selectedBudget !== 0) {
          return null
        }

        // City match
        if (selectedCity === "Tất cả nơi đi" || tour.departureCity.toLowerCase().includes(selectedCity.toLowerCase())) {
          score += 20
          if (selectedCity !== "Tất cả nơi đi") reasons.push(`Khởi hành từ ${tour.departureCity}`)
        } else {
          return null
        }

        // Vibe match
        if (vibe && vibe.keywords.length > 0) {
          const matchVibe = vibe.keywords.some((k) =>
            tour.name.toLowerCase().includes(k) || tour.region.toLowerCase().includes(k)
          )
          if (matchVibe) {
            score += 35
            reasons.push(`Đúng phong cách ${vibe.label.split(" ")[1]}`)
          } else if (selectedVibe !== "all" && query === "") {
            score -= 10
          }
        }

        // Custom query match
        if (query) {
          const nameMatch = tour.name.toLowerCase().includes(query)
          const regionMatch = tour.region.toLowerCase().includes(query)
          const dealMatch = (query.includes("giờ chót") || query.includes("giảm") || query.includes("ưu đãi")) && tour.deal !== undefined
          
          if (nameMatch || regionMatch || dealMatch) {
            score += 40
            reasons.push("Khớp với yêu cầu tìm kiếm")
          } else {
            return null
          }
        }

        // Deal bonus
        if (tour.deal) {
          score += 15
          reasons.push("Đang có ưu đãi giá sốc")
        }

        // Rating bonus
        if (tour.rating && tour.rating >= 4.5) {
          score += 10
        }

        const matchPercent = Math.min(Math.max(Math.round(score + 15), 75), 99)

        return {
          tour,
          matchPercent,
          reason: reasons.slice(0, 2).join(" • "),
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 6)
  }, [tours, selectedBudget, selectedVibe, selectedCity, searchQuery])

  const handleReset = () => {
    setSelectedBudget(0)
    setSelectedVibe("all")
    setSelectedCity("Tất cả nơi đi")
    setSearchQuery("")
  }

  return (
    <section id="ai-recommender" className="scroll-mt-28 py-10 lg:py-16">
      <div className="double-bezel shadow-2xl">
        <div className="double-bezel-inner p-6 sm:p-10 lg:p-12">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-tint/10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-ink/15 to-cyan-500/15 px-3.5 py-1 text-xs font-bold text-primary-ink ring-1 ring-primary-ink/30 mb-3">
                <BotIcon className="size-3.5 text-primary-ink animate-pulse" />
                <span>Trí Tuệ Nhân Tạo Vietravel Explorer</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-title leading-tight">
                AI Gợi Ý Chuyến Đi <span className="text-gradient-brand">Chuẩn Gu & Khớp Ví</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tự động quét kho tour chính thức của Vietravel để tìm lịch trình tối ưu theo sở thích, túi tiền và thời gian của bạn.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/tripi"
                className="btn-glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs sm:text-sm font-bold text-title hover:border-primary-ink/50"
              >
                <SparklesIcon className="size-4 text-amber-400" />
                <span>Tâm sự cùng Tripi AI</span>
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 size-11 items-center justify-center rounded-full bg-tint/5 text-muted-foreground hover:text-title ring-1 ring-tint/10 transition-colors"
                title="Làm mới bộ lọc"
              >
                <RotateCcwIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="pt-8 space-y-6">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary-ink" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập yêu cầu tự do... (Ví dụ: Tour Phú Quốc cano 4 đảo giá rẻ, đi cuối tuần từ TP.HCM)"
                className="w-full h-13 pl-12 pr-4 rounded-2xl bg-tint/[0.04] border border-tint/12 text-sm sm:text-base text-title placeholder:text-muted-foreground focus:outline-none focus:border-primary-ink focus:ring-2 focus:ring-primary-ink/20 transition-all shadow-inner"
              />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground shrink-0">Gợi ý tìm nhanh:</span>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setSearchQuery(prompt.replace(/^[^\s]+\s/, ""))}
                  className="rounded-full bg-tint/5 hover:bg-primary-ink/15 hover:text-primary-ink px-3 py-1 text-xs font-medium text-body border border-tint/10 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Vibe Tabs */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-ink mb-2.5">
                1. Chọn Vibe Chuyến Đi:
              </p>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((vibe) => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={cn(
                      "h-9.5 rounded-full px-4 text-xs font-bold transition-all duration-300 ring-1",
                      selectedVibe === vibe.id
                        ? "bg-primary text-white ring-primary shadow-md scale-102"
                        : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10 hover:text-title"
                    )}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & Departure Grid */}
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-ink mb-2.5">
                  2. Ngân Sách Dự Kiến:
                </p>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_OPTIONS.map((b, idx) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setSelectedBudget(idx)}
                      className={cn(
                        "h-9 rounded-full px-3.5 text-xs font-bold transition-all duration-300 ring-1",
                        selectedBudget === idx
                          ? "bg-primary text-white ring-primary shadow-sm"
                          : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10 hover:text-title"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-ink mb-2.5">
                  3. Nơi Khởi Hành:
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={cn(
                        "h-9 rounded-full px-3.5 text-xs font-bold transition-all duration-300 ring-1",
                        selectedCity === city
                          ? "bg-primary text-white ring-primary shadow-sm"
                          : "bg-tint/5 text-body ring-tint/10 hover:bg-tint/10 hover:text-title"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="mt-10 pt-8 border-t border-tint/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-primary-ink" />
                <p className="font-heading text-lg font-bold text-title">
                  Kết Quả AI Đề Xuất ({filteredTours.length} tour phù hợp nhất)
                </p>
              </div>
              <span className="text-xs text-muted-foreground">Cập nhật theo thời gian thực</span>
            </div>

            {filteredTours.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-tint/[0.02] border border-dashed border-tint/15">
                <CompassIcon className="mx-auto size-12 text-muted-foreground/50 animate-spin-slow mb-3" />
                <p className="font-heading text-base font-bold text-title">Chưa tìm thấy tour khớp 100% với bộ lọc này</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Hãy thử nới lỏng mức giá, đổi phong cách du lịch hoặc bấm vào nút bên dưới để chuyên viên Vietravel tư vấn tour riêng.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-primary inline-flex h-9.5 items-center rounded-full px-5 text-xs font-bold"
                  >
                    Xem tất cả tour mở bán
                  </button>
                  <a
                    href={`tel:${hotline.replace(/\s/g, "")}`}
                    className="btn-glass inline-flex h-9.5 items-center rounded-full px-5 text-xs font-bold text-title"
                  >
                    Gọi hotline {hotline}
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTours.map(({ tour, matchPercent, reason }) => {
                  const price = tour.deal?.priceVnd ?? tour.priceVnd
                  const dates = (tour.deal ? [tour.deal.departureDate] : tour.departureDates).slice(0, 2).map(formatShortDate)
                  const rating = formatRating(tour.rating)

                  return (
                    <div
                      key={tour.code}
                      className="group lift relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-tint/12 bg-tint/[0.03] p-4.5 transition-all duration-300 hover:border-primary-ink/40 hover:shadow-xl"
                    >
                      <div>
                        {/* Image Header */}
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                          <Image
                            src={tour.imageUrl}
                            alt={tour.name}
                            fill
                            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-106 brightness-[0.92]"
                          />
                          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          {/* Match Chip */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                            <CheckCircle2Icon className="size-3" />
                            <span>{matchPercent}% Match</span>
                          </div>

                          {/* Deal Chip */}
                          {tour.deal && (
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                              <FlameIcon className="size-3 fill-white" />
                              <span>Giảm {Math.round((1 - tour.deal.priceVnd / tour.deal.originalPriceVnd) * 100)}%</span>
                            </div>
                          )}

                          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-white text-[11px] font-bold">
                            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                              <ClockIcon className="size-3 text-primary-ink" />
                              {tour.days}N{tour.nights}Đ
                            </span>
                            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-amber-300">
                              <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                              {rating ?? "4.8"}
                            </span>
                          </div>
                        </div>

                        {/* AI Match Reason Pill */}
                        {reason && (
                          <div className="mt-3 rounded-xl bg-primary-ink/10 px-3 py-1.5 border border-primary-ink/20 text-[11px] font-semibold text-primary-ink flex items-center gap-1.5">
                            <SparklesIcon className="size-3 shrink-0" />
                            <span className="truncate">{reason}</span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="mt-2.5 font-heading text-base font-extrabold tracking-tight text-title line-clamp-2 group-hover:text-primary-ink transition-colors">
                          {tour.name}
                        </h3>

                        {/* Route & Dates */}
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <PlaneIcon className="size-3 text-cyan-400" />
                            <span>Từ: <strong className="text-title">{tour.departureCity}</strong> ({tour.transport})</span>
                          </p>
                          <p>Lịch khởi hành: <strong className="text-primary-ink font-semibold">{dates.join(" • ")}</strong></p>
                        </div>
                      </div>

                      {/* Pricing & CTA Actions */}
                      <div className="mt-4 pt-3 border-t border-tint/10">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Giá trọn gói từ</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-heading text-xl font-extrabold text-orange-400">
                                {formatVnd(price)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">/khách</span>
                            </div>
                          </div>
                          {tour.deal && (
                            <span className="text-xs line-through text-muted-foreground">
                              {formatVnd(tour.deal.originalPriceVnd)}
                            </span>
                          )}
                        </div>

                        {/* Direct Reference link to official Vietravel booking */}
                        <div className="grid grid-cols-1 gap-2">
                          <a
                            href={tour.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold whitespace-nowrap shadow-md"
                          >
                            <span>Đặt tour trên Vietravel</span>
                            <ExternalLinkIcon className="size-3.5" />
                          </a>
                          <AddToPlanButton
                            destinationSlug="phu-quoc"
                            destinationName="Điểm đến gợi ý"
                            serviceId={tourServiceId(tour.code)}
                            className="h-10 w-full justify-center px-3 text-xs bg-tint/5 hover:bg-tint/10 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
