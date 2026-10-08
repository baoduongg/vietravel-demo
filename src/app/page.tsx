import { DestinationGrid } from "@/components/explorer/destination-grid"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { HomeHero } from "@/components/explorer/home-hero"
import { MomentsStrip } from "@/components/explorer/moments-strip"
import { Section } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { company } from "@/config/company"
import { destinations } from "@/data/destinations"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"

export const revalidate = 1800

const WHY = [
  { title: "Tour và dịch vụ lẻ", text: "Tour trọn gói, khách sạn, vé máy bay, combo: chọn đúng thứ Quý khách cần." },
  { title: "Hỗ trợ tận tâm", text: `Tư vấn viên luôn sẵn sàng qua tổng đài ${company.hotline}.` },
]

export default function HomePage(): React.JSX.Element {
  const tours = toursForDestination(phuQuoc)

  return (
    <ExplorerShell>
      <HomeHero />
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Section id="diem-den" title="Điểm đến cho chuyến đi sắp tới" intro="Hiện bản demo mở sẵn Phú Quốc. Các điểm đến khác sẽ lần lượt ra mắt.">
          <DestinationGrid items={destinations} />
        </Section>
        <MomentsStrip guide={phuQuoc} />
        <Section id="tour-noi-bat" title="Tour Phú Quốc đang mở bán" intro="Giá và ngày khởi hành lấy từ travel.com.vn.">
          <TourList tours={tours} limit={3} hotline={company.hotline} planDestination={{ slug: phuQuoc.slug, name: phuQuoc.name }} />
        </Section>
        <Section id="vi-sao" title="Vì sao đi cùng Vietravel">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="on-dark flex flex-col justify-between gap-16 rounded-[20px] bg-dusk p-8 text-white md:col-span-3 md:row-span-2 lg:p-12">
              <p className="font-voyage leading-none font-semibold tracking-tighter">
                <span className="block text-xl font-semibold tracking-normal text-white/80">Từ năm</span>
                <span className="text-7xl text-champagne sm:text-8xl">{company.founded}</span>
              </p>
              <p className="max-w-sm text-lg text-white/85">Hơn ba thập kỷ tổ chức tour trong nước và quốc tế, mạng lưới chi nhánh và hướng dẫn viên khắp nơi.</p>
            </div>
            {WHY.map((item, index) => (
              <div key={item.title} className="glass-card relative overflow-hidden p-8 md:col-span-2">
                <span aria-hidden className="absolute top-4 right-6 font-voyage text-7xl leading-none text-tint/[0.06]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="relative font-voyage text-2xl font-semibold tracking-tight text-title">{item.title}</h3>
                <p className="relative mt-3 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </ExplorerShell>
  )
}
