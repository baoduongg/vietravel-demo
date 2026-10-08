import Image from "next/image"

import { Section } from "@/components/explorer/section"
import { cn } from "@/lib/utils"
import type { DestinationGuide } from "@/types/destination"

/** Mũi tên vẽ tay nối hai chương, uốn qua bên và chỉ xuống. */
function DoodleArrow({ flip }: { flip: boolean }): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 160 90" fill="none" className={cn("mx-auto my-6 h-16 w-32 text-primary/60", flip && "-scale-x-100")}>
      <path d="M12 8C70 2 130 20 118 52c-6 16-34 14-30-2 4-14 30-6 40 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
      <path d="M118 62l10 14 14-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Cuốn sổ du ký: giấy be, mỗi ngày là một chương với ảnh Polaroid kẹp băng dính. */
export function Itinerary({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="lich-trinh" title={`${guide.name} ${guide.itinerary.length} ngày ${guide.itinerary.length - 1} đêm`} intro="Gợi ý lịch trình để Quý khách hình dung chuyến đi. Có thể thay đổi theo thời tiết và sở thích.">
      <div className="rounded-[20px] bg-paper p-6 ring-1 ring-night/10 text-night shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(212,163,115,0.18)] sm:p-10 lg:p-14">
        <ol>
          {guide.itinerary.map((day, index) => {
            const photo = guide.gallery.length > 0 ? guide.gallery[index % guide.gallery.length] : null
            const flip = index % 2 === 1
            return (
              <li key={day.day}>
                <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
                  <figure className={cn("mx-auto w-full max-w-xs lg:max-w-sm", flip ? "lg:order-2 lg:rotate-[2deg]" : "-rotate-2")}>
                    <div className="relative bg-white p-3 pb-4 shadow-[0_14px_30px_-12px_rgba(60,40,20,0.55)]">
                      <span aria-hidden className="washi absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3" />
                      {photo ? (
                        <>
                          <div className="relative aspect-[4/5] overflow-hidden">
                            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:1024px) 384px, 90vw" className="object-cover sepia-[.2]" />
                          </div>
                          <figcaption className="mt-3 font-voyage text-sm text-night/80 italic">{photo.caption}</figcaption>
                          <a href={photo.credit.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-night/60 underline-offset-2 hover:underline">
                            Ảnh: {photo.credit.author}, {photo.credit.license}
                          </a>
                        </>
                      ) : (
                        <div className="grid aspect-[4/5] place-items-center bg-night/5 font-voyage text-6xl text-night/30">{day.day}</div>
                      )}
                    </div>
                  </figure>
                  <div className={flip ? "lg:order-1" : ""}>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">Chương {String(day.day).padStart(2, "0")}</p>
                    <h3 className="mt-1 font-voyage text-2xl leading-snug font-semibold text-night sm:text-3xl">{day.title}</h3>
                    <ul className="mt-6 space-y-4 border-l-2 border-dashed border-night/20 pl-6">
                      {day.items.map((item) => (
                        <li key={`${item.time}-${item.text}`} className="relative">
                          <span aria-hidden className="absolute top-1.5 -left-[1.95rem] size-2.5 rounded-full bg-primary ring-4 ring-paper" />
                          <p className="text-sm font-bold text-primary">{item.time}</p>
                          <p className="mt-0.5 text-night/85">{item.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {index < guide.itinerary.length - 1 && <DoodleArrow flip={flip} />}
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
