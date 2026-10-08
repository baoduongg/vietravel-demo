import { PlaneIcon } from "lucide-react"

import { SceneSvg } from "@/components/avatar/scenes/scene-svg"

const PETALS = [
  { x: 90, y: 300, r: 8, delay: 0 },
  { x: 180, y: 420, r: 6, delay: 1.2 },
  { x: 640, y: 340, r: 9, delay: 0.6 },
  { x: 720, y: 470, r: 6, delay: 1.8 },
  { x: 560, y: 250, r: 7, delay: 2.4 },
  { x: 300, y: 230, r: 6, delay: 0.9 },
]

/** Nước ngoài: núi Phú Sĩ, tháp Eiffel, hoa anh đào bay và máy bay vẽ đường bay. */
export function WorldScene(): React.JSX.Element {
  return (
    <SceneSvg>
      <defs>
        <linearGradient id="world-fuji" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e9ee0" />
          <stop offset="1" stopColor="#c7d0f4" />
        </linearGradient>
        <linearGradient id="world-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6e3d0" />
          <stop offset="0.7" stopColor="#e6f5ee" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <circle cx="400" cy="470" r="320" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 12" />
      <circle cx="400" cy="470" r="230" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 12" />

      {/* Núi Phú Sĩ với chỏm tuyết */}
      <path d="M-60 780 L250 470 L330 438 L420 470 L720 780 Z" fill="url(#world-fuji)" />
      <path d="M250 470 L330 438 L420 470 L388 486 L350 468 L322 492 L296 470 L270 490 Z" fill="#ffffff" />

      {/* Tháp Eiffel bên phải */}
      <g transform="translate(655 790)" fill="#6b78c4">
        <path d="M0 -330 L-6 -250 L-34 0 L-18 0 L-4 -150 L4 -150 L18 0 L34 0 L6 -250 Z" />
        <rect x="-26" y="-190" width="52" height="8" />
        <rect x="-14" y="-262" width="28" height="6" />
        <path d="M-22 0 Q0 -90 22 0 Z" fill="#e9ecfb" />
      </g>

      {/* Hoa anh đào bay lơ lửng */}
      {PETALS.map(({ x, y, r, delay }) => (
        <ellipse
          key={x}
          cx={x}
          cy={y}
          rx={r}
          ry={r * 0.6}
          fill="#ffc2d4"
          className="animate-float"
          style={{ animationDelay: `${delay}s`, transformBox: "fill-box" }}
        />
      ))}

      <path d="M0 820 C160 790 300 830 450 806 C600 784 700 812 800 800 L800 1000 L0 1000 Z" fill="url(#world-ground)" />

      <path
        d="M40 190 C180 120 300 170 420 110 C520 66 620 90 760 60"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.95"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <g transform="rotate(-14 770 60)">
        <PlaneIcon x={746} y={36} width={46} height={46} strokeWidth={1.5} className="fill-white text-ocean/70" />
      </g>

      {/* Hai đám mây trôi */}
      <g fill="#ffffff" opacity="0.85" className="animate-cloud-drift">
        <ellipse cx="170" cy="260" rx="70" ry="20" />
        <ellipse cx="215" cy="248" rx="44" ry="18" />
        <ellipse cx="620" cy="190" rx="80" ry="22" />
        <ellipse cx="575" cy="178" rx="46" ry="17" />
      </g>
    </SceneSvg>
  )
}
