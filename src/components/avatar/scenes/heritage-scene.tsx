import { SceneSvg, VIEW_WIDTH } from "@/components/avatar/scenes/scene-svg"

const LANTERN_COLORS = ["#e8452c", "#f59f2a", "#e8452c", "#f2c230", "#d6336c"]

/** Đèn lồng treo trên dây; ánh sáng nhấp nháy lệch pha để nhìn như đang đung đưa. */
function LanternString({ y, sag, delay }: { y: number; sag: number; delay: number }): React.JSX.Element {
  const count = 9
  const lanterns = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count
    const x = t * VIEW_WIDTH
    // Điểm trên đường cong bậc hai nối hai mép qua điểm rũ giữa dây.
    const lineY = y + 4 * sag * t * (1 - t)
    return { x, lineY, color: LANTERN_COLORS[i % LANTERN_COLORS.length] }
  })
  return (
    <g>
      <path d={`M0 ${y} Q${VIEW_WIDTH / 2} ${y + sag * 2} ${VIEW_WIDTH} ${y}`} fill="none" stroke="#7a4a2c" strokeWidth="2" />
      {lanterns.map(({ x, lineY, color }, i) => (
        <g
          key={x}
          className="animate-lantern"
          style={{ animationDelay: `${delay + i * 0.35}s`, transformBox: "fill-box", transformOrigin: "50% 0" }}
        >
          <line x1={x} y1={lineY} x2={x} y2={lineY + 14} stroke="#7a4a2c" strokeWidth="1.5" />
          <ellipse cx={x} cy={lineY + 32} rx="15" ry="19" fill={color} />
          <ellipse cx={x} cy={lineY + 32} rx="15" ry="19" fill="url(#heritage-lantern-glow)" />
          <rect x={x - 6} y={lineY + 12} width="12" height="4" fill="#5a3a22" />
          <rect x={x - 6} y={lineY + 48} width="12" height="4" fill="#5a3a22" />
          <line x1={x} y1={lineY + 52} x2={x} y2={lineY + 62} stroke={color} strokeWidth="2" />
        </g>
      ))}
    </g>
  )
}

/** Một dãy nhà cổ vàng mái ngói, chừa khoảng trống giữa cho mascot. */
function Houses({ side }: { side: "left" | "right" }): React.JSX.Element {
  const mirror = side === "right"
  const houses = [
    { x: 0, w: 150, h: 230, roof: "#9c4b2a" },
    { x: 150, w: 120, h: 180, roof: "#b05a30" },
  ]
  return (
    <g transform={mirror ? `translate(${VIEW_WIDTH} 0) scale(-1 1)` : undefined}>
      {houses.map(({ x, w, h, roof }) => {
        const top = 840 - h
        return (
          <g key={x}>
            <rect x={x} y={top} width={w} height={h} fill="#f6cf6a" />
            <path d={`M${x - 8} ${top} L${x + w / 2} ${top - 46} L${x + w + 8} ${top} Z`} fill={roof} />
            <rect x={x + w * 0.2} y={top + 36} width={w * 0.22} height="44" fill="#6b3b22" />
            <rect x={x + w * 0.58} y={top + 36} width={w * 0.22} height="44" fill="#6b3b22" />
            <rect x={x + w * 0.35} y={top + h - 80} width={w * 0.3} height="80" fill="#8a4a28" />
            <rect x={x} y={top + 108} width={w} height="6" fill="#e9b94a" />
          </g>
        )
      })}
    </g>
  )
}

/** Hội An, Huế, Hà Nội: phố cổ vàng, đèn lồng, dòng sông thả hoa đăng. */
export function HeritageScene(): React.JSX.Element {
  return (
    <SceneSvg>
      <defs>
        <radialGradient id="heritage-lantern-glow" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff6cf" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff6cf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heritage-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8e0" />
          <stop offset="0.5" stopColor="#ffe9a8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heritage-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3c27a" />
          <stop offset="1" stopColor="#fbe8c3" />
        </linearGradient>
      </defs>

      <circle cx="400" cy="300" r="200" fill="url(#heritage-moon)" />
      <circle cx="400" cy="300" r="48" fill="#fff6d2" />

      <Houses side="left" />
      <Houses side="right" />

      {/* Cầu Nhật Bản nhỏ phía xa */}
      <g transform="translate(400 836)">
        <path d="M-150 0 Q0 -70 150 0 L150 10 L-150 10 Z" fill="#b05a30" opacity="0.85" />
        <path d="M-60 -34 L0 -62 L60 -34 Z" fill="#9c4b2a" />
        <rect x="-50" y="-34" width="100" height="20" fill="#f6cf6a" opacity="0.9" />
      </g>

      <LanternString y={90} sag={26} delay={0} />
      <LanternString y={200} sag={22} delay={0.6} />

      <rect x="0" y="840" width={VIEW_WIDTH} height="160" fill="url(#heritage-river)" />
      <g stroke="#fff4d6" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="60" y1="880" x2="150" y2="880" />
        <line x1="300" y1="905" x2="420" y2="905" />
        <line x1="560" y1="875" x2="680" y2="875" />
        <line x1="180" y1="950" x2="300" y2="950" />
        <line x1="500" y1="965" x2="630" y2="965" />
      </g>

      {/* Hoa đăng trôi trên sông */}
      {[
        { x: 120, y: 920, c: "#e8452c" },
        { x: 440, y: 935, c: "#f59f2a" },
        { x: 690, y: 910, c: "#d6336c" },
        { x: 260, y: 975, c: "#f2c230" },
      ].map(({ x, y, c }, i) => (
        <g key={x} className="animate-float" style={{ animationDelay: `${i * 0.7}s`, transformBox: "fill-box" }}>
          <path d={`M${x - 14} ${y} Q${x} ${y + 12} ${x + 14} ${y} Z`} fill="#7a4a2c" />
          <path d={`M${x} ${y - 14} Q${x + 8} ${y - 4} ${x} ${y} Q${x - 8} ${y - 4} ${x} ${y - 14} Z`} fill={c} />
        </g>
      ))}
    </SceneSvg>
  )
}
