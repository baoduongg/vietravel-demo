import { PlaneIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface Peak {
  x: number
  width: number
  height: number
}

const VIEW_WIDTH = 800
const VIEW_HEIGHT = 1000

/** Dãy núi đá vôi kiểu Hạ Long: vách dốc, đỉnh bo tròn, mọc lên từ mặt nước tại `base`. */
function karstRidge(peaks: Peak[], base: number): string {
  let path = `M0 ${base}`
  for (const { x, width, height } of peaks) {
    const top = base - height
    const half = width / 2
    path += ` L${x - half} ${base}`
    path += ` C${x - half * 0.9} ${top + height * 0.3} ${x - half * 0.6} ${top} ${x} ${top}`
    path += ` C${x + half * 0.6} ${top} ${x + half * 0.9} ${top + height * 0.3} ${x + half} ${base}`
  }
  return `${path} L${VIEW_WIDTH} ${base} Z`
}

const FAR_RIDGE = karstRidge(
  [
    { x: 60, width: 160, height: 260 },
    { x: 170, width: 130, height: 340 },
    { x: 280, width: 140, height: 200 },
    { x: 520, width: 120, height: 210 },
    { x: 640, width: 150, height: 330 },
    { x: 760, width: 150, height: 270 },
  ],
  700,
)

const MID_RIDGE = karstRidge(
  [
    { x: -20, width: 180, height: 300 },
    { x: 110, width: 120, height: 190 },
    { x: 700, width: 130, height: 220 },
    { x: 810, width: 190, height: 330 },
  ],
  740,
)

export function StageScenery({ className }: { className?: string }): React.JSX.Element {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="scenery-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff6d6" />
            <stop offset="0.35" stopColor="#ffe9a8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="scenery-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c2ddf4" />
            <stop offset="1" stopColor="#dcedfa" />
          </linearGradient>
          <linearGradient id="scenery-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fc4de" />
            <stop offset="1" stopColor="#bfe0ee" />
          </linearGradient>
          <linearGradient id="scenery-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7eefb" />
            <stop offset="1" stopColor="#eef8fd" />
          </linearGradient>
          <linearGradient id="scenery-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b5e2c6" />
            <stop offset="1" stopColor="#e4f5ea" />
          </linearGradient>
          <linearGradient id="scenery-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9ed6b6" />
            <stop offset="0.6" stopColor="#d5efdf" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        <circle cx="640" cy="260" r="150" fill="url(#scenery-sun)" />
        <circle cx="640" cy="260" r="46" fill="#fff4cf" />

        <path d={FAR_RIDGE} fill="url(#scenery-far)" />
        <rect x="0" y="700" width={VIEW_WIDTH} height="300" fill="url(#scenery-water)" />
        <path d={MID_RIDGE} fill="url(#scenery-mid)" />

        <g stroke="#ffffff" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round">
          <line x1="200" y1="762" x2="250" y2="762" />
          <line x1="40" y1="790" x2="100" y2="790" />
          <line x1="600" y1="770" x2="660" y2="770" />
          <line x1="700" y1="792" x2="760" y2="792" />
        </g>

        {/* Thuyền buồm trên vịnh */}
        <g transform="translate(150 780)">
          <path d="M-26 0 L26 0 L18 9 L-18 9 Z" fill="#7a5a3a" />
          <path d="M-4 -2 L-4 -38 L-22 -4 Z" fill="#f08a4b" />
          <path d="M2 -2 L2 -46 L22 -4 Z" fill="#f4a261" />
        </g>

        <path d="M0 830 C140 780 260 800 400 812 C540 824 660 790 800 800 L800 1000 L0 1000 Z" fill="url(#scenery-hill)" />
        <path d="M0 900 C170 850 330 862 420 870 C560 882 680 850 800 862 L800 1000 L0 1000 Z" fill="url(#scenery-hill-near)" />

        <path
          d="M90 210 C180 160 260 190 330 150"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="3"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <g transform="rotate(-12 346 140)">
          <PlaneIcon x={326} y={120} width={40} height={40} strokeWidth={1.5} className="fill-white text-ocean/70" />
        </g>
      </svg>
    </div>
  )
}
