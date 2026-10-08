import { DestinationGrid } from "@/components/explorer/destination-grid"
import { ExplorerShell } from "@/components/explorer/explorer-shell"
import { HomeHero } from "@/components/explorer/home-hero"
import { CARD_CLASS, Section } from "@/components/explorer/section"
import { TourList } from "@/components/explorer/tour-list"
import { company } from "@/config/company"
import { destinations } from "@/data/destinations"
import { phuQuoc } from "@/data/destinations/phu-quoc"
import { toursForDestination } from "@/lib/destination-tours"

export const revalidate = 1800

const WHY = [
  { title: `Từ năm ${company.founded}`, text: "Hơn ba thập kỷ tổ chức tour trong nước và quốc tế, mạng lưới chi nhánh và hướng dẫn viên khắp nơi." },
  { title: "Tour và dịch vụ lẻ", text: "Tour trọn gói, khách sạn, vé máy bay, combo: chọn đúng thứ Quý khách cần." },
  { title: "Hỗ trợ tận tâm", text: `Tư vấn viên luôn sẵn sàng qua tổng đài ${company.hotline}.` },
]

export default function HomePage(): React.JSX.Element {
  const tours = toursForDestination(phuQuoc)

  return (
    <ExplorerShell>
      <HomeHero />
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Section id="diem-den" eyebrow="Khám phá" title="Điểm đến cho chuyến đi sắp tới" intro="Hiện bản demo mở sẵn Phú Quốc. Các điểm đến khác sẽ lần lượt ra mắt.">
          <DestinationGrid items={destinations} />
        </Section>
        <Section id="tour-noi-bat" eyebrow="Ưu đãi" title="Tour Phú Quốc đang mở bán" intro="Giá và ngày khởi hành lấy từ travel.com.vn.">
          <TourList tours={tours} limit={3} hotline={company.hotline} />
        </Section>
        <Section id="vi-sao" eyebrow={company.brand} title="Vì sao đi cùng Vietravel">
          <ul className="grid gap-4 md:grid-cols-3">
            {WHY.map((item) => (
              <li key={item.title} className={CARD_CLASS}>
                <h3 className="font-extrabold text-ocean">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </ExplorerShell>
  )
}
