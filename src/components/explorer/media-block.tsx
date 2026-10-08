import Image from "next/image"

import { Section } from "@/components/explorer/section"
import { VideoPlayer } from "@/components/explorer/video-player"
import { cn } from "@/lib/utils"
import type { DestinationGuide, GalleryPhoto } from "@/types/destination"

const GRID = "grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-3"

function Photo({ photo, className }: { photo: GalleryPhoto; className?: string }): React.JSX.Element {
  return (
    <li className={cn("group lift relative overflow-hidden rounded-[1.75rem]", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:1024px) 360px, 50vw" className="object-cover transition-transform duration-1000 ease-soft group-hover:scale-105" />
      <span aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/75 via-transparent to-transparent" />
      <div className="absolute inset-x-4 bottom-3 text-white">
        <p className="text-xs leading-snug font-semibold sm:text-sm">{photo.caption}</p>
        <a href={photo.credit.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/75 underline-offset-2 hover:underline sm:text-[11px]">
          Ảnh: {photo.credit.author}, {photo.credit.license}
        </a>
      </div>
    </li>
  )
}

/** Hàng 1: video cao bên trái, bốn ảnh xếp hai cột bên phải. Hàng 2 đảo lại: hai ảnh bên trái, video rộng bên phải. */
export function MediaBlock({ guide }: { guide: DestinationGuide }): React.JSX.Element {
  const [videoA, videoB] = guide.videos
  const [first, second] = [guide.gallery.slice(0, 4), guide.gallery.slice(4, 6)]

  return (
    <Section id="hinh-anh" title={`${guide.name} qua hình ảnh và video`} intro="Xem trước biển, hoàng hôn và những điểm sôi động nhất trước khi chọn lịch trình.">
      <ul className={cn(GRID, "lg:grid-cols-[2fr_1fr_1fr]")}>
        {videoA && (
          <li className="col-span-2 row-span-2 lg:col-span-1">
            <VideoPlayer video={videoA} className="aspect-auto size-full" />
          </li>
        )}
        {first.map((photo) => (
          <Photo key={photo.src} photo={photo} />
        ))}
      </ul>

    </Section>
  )
}
