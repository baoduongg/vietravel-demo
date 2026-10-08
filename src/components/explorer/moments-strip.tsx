import Image from "next/image"

import { Section } from "@/components/explorer/section"
import type { DestinationGuide } from "@/types/destination"

/** Dải ảnh dọc cuộn ngang, ảnh lẻ hạ thấp xuống để nhịp so le như khung ảnh treo tường. */
export function MomentsStrip({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  return (
    <Section id="khoanh-khac" title={`Những khoảnh khắc ở ${guide.name}`} intro="Vuốt ngang để xem biển, hoàng hôn và những điểm sôi động nhất.">
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-12 [scrollbar-width:none] lg:-mx-6 lg:scroll-px-6 lg:px-6">
        {guide.gallery.map((photo, index) => (
          <li key={photo.src} className={index % 2 ? "mt-12 shrink-0 snap-start" : "shrink-0 snap-start"}>
            <figure className="group lift relative aspect-[3/4] w-[15rem] overflow-hidden rounded-[20px] shadow-[0_34px_60px_-34px_rgba(0,0,0,0.7)] sm:w-[18rem]">
              <Image src={photo.src} alt={photo.alt} fill sizes="288px" className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105" />
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/80 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 font-voyage text-lg leading-snug text-white">{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}
