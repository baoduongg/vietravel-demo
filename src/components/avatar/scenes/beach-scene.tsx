import { SceneSvg, VIEW_WIDTH } from "@/components/avatar/scenes/scene-svg"

/** Cây dừa: thân cong và các tàu lá xòe ra từ ngọn. `lean` âm nghiêng sang trái, dương sang phải. */
function Palm({ x, y, height, lean }: { x: number; y: number; height: number; lean: number }): React.JSX.Element {
  const topX = x + lean
  const topY = y - height
  const fronds = [-150, -115, -80, -35, 10, 50, 95, 140]
  return (
    <g>
      <path
        d={`M${x - 7} ${y} Q${x + lean * 0.2} ${y - height * 0.55} ${topX - 3} ${topY} L${topX + 4} ${topY} Q${x + lean * 0.3 + 8} ${y - height * 0.5} ${x + 7} ${y} Z`}
        fill="#7a4a2c"
      />
      <g transform={`translate(${topX} ${topY})`} fill="#2f8f5b">
        {fronds.map((angle) => (
          <path key={angle} transform={`rotate(${angle})`} d="M0 0 C18 -22 70 -26 96 -2 C62 -12 26 -8 0 0 Z" />
        ))}
      </g>
      <circle cx={topX - 4} cy={topY + 6} r="5" fill="#6b4226" />
      <circle cx={topX + 5} cy={topY + 8} r="5" fill="#6b4226" />
    </g>
  )
}

/** Phú Quốc, Nha Trang, Côn Đảo: hoàng hôn trên biển, dừa, sóng lấp lánh. */
export function BeachScene(): React.JSX.Element {
  return (
    <SceneSvg>
      <defs>
        <radialGradient id="beach-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c9" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffc58a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffc58a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb98c" />
          <stop offset="0.35" stopColor="#7fd0e6" />
          <stop offset="1" stopColor="#4fb8dc" />
        </linearGradient>
        <linearGradient id="beach-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6bd" />
          <stop offset="1" stopColor="#fff6e2" />
        </linearGradient>
      </defs>

      <circle cx="420" cy="620" r="300" fill="url(#beach-glow)" />
      <circle cx="420" cy="640" r="70" fill="#ffd89a" />
      <rect x="0" y="640" width={VIEW_WIDTH} height="360" fill="url(#beach-sea)" />
      <rect x="0" y="640" width={VIEW_WIDTH} height="3" fill="#ffe3b5" opacity="0.8" />

      {/* Vệt nắng trên mặt nước */}
      <g stroke="#fff3d6" strokeLinecap="round" strokeWidth="5" opacity="0.8" className="animate-twinkle">
        <line x1="380" y1="670" x2="460" y2="670" />
        <line x1="360" y1="700" x2="480" y2="700" />
        <line x1="395" y1="730" x2="445" y2="730" />
        <line x1="340" y1="765" x2="500" y2="765" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round">
        <line x1="90" y1="720" x2="160" y2="720" />
        <line x1="620" y1="700" x2="700" y2="700" />
        <line x1="560" y1="790" x2="640" y2="790" />
      </g>

      {/* Đảo xa */}
      <path d="M560 646 C600 600 650 598 690 646 Z" fill="#3a8a86" opacity="0.7" />

      <g className="animate-float" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <g transform="translate(640 740)">
          <path d="M-22 0 L22 0 L14 8 L-14 8 Z" fill="#7a5a3a" />
          <path d="M-2 -2 L-2 -34 L-18 -4 Z" fill="#ffffff" />
          <path d="M3 -2 L3 -40 L19 -4 Z" fill="#ffe3b5" />
        </g>
      </g>

      <path d="M0 860 C180 820 340 850 520 830 C660 816 740 836 800 826 L800 1000 L0 1000 Z" fill="url(#beach-sand)" />
      <path d="M0 860 C180 820 340 850 520 830 C660 816 740 836 800 826" fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.8" />

      <Palm x={70} y={930} height={470} lean={-40} />
      <Palm x={740} y={920} height={400} lean={36} />
      <Palm x={175} y={935} height={260} lean={30} />
    </SceneSvg>
  )
}
