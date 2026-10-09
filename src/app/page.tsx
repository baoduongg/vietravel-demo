import { AiTripRecommender } from "@/components/explorer/ai-trip-recommender"
import { DestinationGrid } from "@/components/explorer/destination-grid"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { HomeHero } from "@/components/explorer/home-hero"
import { MomentsStrip } from "@/components/explorer/moments-strip"
import { Section } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { TrendingMarquee } from "@/components/explorer/trending-marquee"
import { WorldTourSearch } from "@/components/explorer/world-tour-search"
import { company } from "@/config/company"
import { destinations } from "@/data/destinations"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { getUpcomingTours } from "@/data/tours"
import { toursForDestination } from "@/lib/destination-tours"
import { HeartHandshakeIcon, SparklesIcon, TrophyIcon, UsersIcon } from "lucide-react"

export const revalidate = 1800

const PERKS = [
  {
    icon: TrophyIcon,
    tag: "30+ NĂM KINH NGHIỆM",
    title: "Thương hiệu lữ hành hàng đầu",
    desc: "Hơn 3 thập kỷ tổ chức tour chuyên nghiệp với hệ thống hướng dẫn viên chuẩn quốc tế.",
    badge: "Uy tín #1",
  },
  {
    icon: SparklesIcon,
    tag: "COMBO & TOUR ĐỘC BẢN",
    title: "Tự do cá nhân hóa hành trình",
    desc: "Tour trọn gói, combo bay + khách sạn resort 4-5 sao hoặc vé vui chơi theo sở thích.",
    badge: "100% Linh hoạt",
  },
  {
    icon: UsersIcon,
    tag: "1.5M+ DU KHÁCH TIN CHỌN",
    title: "Cộng đồng xê dịch trẻ sôi động",
    desc: "Check-in những góc sống ảo triệu view, trải nghiệm lặn biển, cắm trại và khám phá ẩm thực local.",
    badge: "98% Hài lòng",
  },
  {
    icon: HeartHandshakeIcon,
    tag: "HỖ TRỢ ĐỒNG HÀNH 24/7",
    title: `Tư vấn tận tâm qua ${company.hotline}`,
    desc: "Đội ngũ chuyên viên luôn hỗ trợ xử lý vé, đổi lịch trình linh hoạt theo thời tiết.",
    badge: "Support 24/7",
  },
]

export default function HomePage(): React.JSX.Element {
  const phuQuocTours = toursForDestination(phuQuoc)
  const allTours = getUpcomingTours()

  return (
    <ExplorerShell>
      <HomeHero />
      <TrendingMarquee />

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Section
          id="diem-den"
          title="Bắt đầu chuyến đi trong mơ của bạn"
          intro="Khám phá các thiên đường du lịch hot nhất. Bản demo mở sẵn Phú Quốc với đầy đủ cẩm nang chi tiết."
        >
          <DestinationGrid items={destinations} />
        </Section>

        <Section
          id="tim-tour-the-gioi"
          title="Muốn đi đâu trên thế giới?"
          intro="Gõ bất kỳ quốc gia, thành phố nào. Tour, giá và lịch khởi hành lấy trực tiếp từ travel.com.vn."
        >
          <WorldTourSearch hotline={company.hotline} />
        </Section>

        {/* AI Smart Trip Matcher & Official Vietravel Ref Engine */}
        <AiTripRecommender tours={allTours} hotline={company.hotline} />

        <MomentsStrip guide={phuQuoc} />

        <Section
          id="tour-noi-bat"
          title="Tour Phú Quốc bùng nổ ưu đãi"
          intro="Giá và ngày khởi hành cập nhật trực tiếp từ hệ thống travel.com.vn."
        >
          <TourList
            tours={phuQuocTours}
            limit={3}
            hotline={company.hotline}
            planDestination={{ slug: phuQuoc.slug, name: phuQuoc.name }}
          />
        </Section>

        <Section
          id="vi-sao"
          title="Vì sao hàng triệu người trẻ chọn Vietravel?"
          intro="Chất lượng đảm bảo, trải nghiệm đỉnh cao và tự do khám phá theo phong cách của bạn."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((perk) => {
              const Icon = perk.icon
              return (
                <div
                  key={perk.title}
                  className="double-bezel group lift"
                >
                  <div className="double-bezel-inner flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-ink/15 text-primary-ink ring-1 ring-primary-ink/30">
                          <Icon className="size-5" />
                        </span>
                        <span className="rounded-full bg-tint/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary-ink">
                          {perk.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{perk.tag}</p>
                      <h3 className="mt-1 font-heading text-lg font-bold text-title group-hover:text-primary-ink transition-colors">
                        {perk.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {perk.desc}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-tint/8 pt-3 flex items-center justify-between text-[11px] font-semibold text-primary-ink">
                      <span>Khám phá ngay</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </div>
    </ExplorerShell>
  )
}

