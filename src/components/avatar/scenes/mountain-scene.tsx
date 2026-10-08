import { SceneSvg } from "@/components/avatar/scenes/scene-svg"

/** Dải ruộng bậc thang: mỗi dải là một đường cong, xếp chồng từ xa đến gần. */
const TERRACES: { d: string; fill: string }[] = [
  { d: "M0 770 C160 730 300 790 480 752 C620 724 720 760 800 740 L800 1000 L0 1000 Z", fill: "#a9d48a" },
  { d: "M0 805 C140 770 320 830 500 790 C640 760 730 800 800 782 L800 1000 L0 1000 Z", fill: "#c5df88" },
  { d: "M0 850 C180 815 300 872 500 836 C650 810 740 848 800 832 L800 1000 L0 1000 Z", fill: "#8ec97c" },
  { d: "M0 900 C150 872 330 920 520 886 C660 862 740 896 800 884 L800 1000 L0 1000 Z", fill: "#e0e88f" },
  { d: "M0 950 C200 925 340 968 540 940 C670 922 750 944 800 936 L800 1000 L0 1000 Z", fill: "#a1d584" },
]

/** Sa Pa, Tây Bắc, Đà Lạt: núi xa trong sương, ruộng bậc thang, mặt trời ló dạng. */
export function MountainScene(): React.JSX.Element {
  return (
    <SceneSvg>
      <defs>
        <radialGradient id="mountain-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2d4" />
          <stop offset="0.4" stopColor="#ffd9b0" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffd9b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mountain-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9b4e0" />
          <stop offset="1" stopColor="#dcd7f1" />
        </linearGradient>
        <linearGradient id="mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fa6d8" />
          <stop offset="1" stopColor="#c6d3ee" />
        </linearGradient>
        <linearGradient id="mountain-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f9fb8" />
          <stop offset="1" stopColor="#b4d3d8" />
        </linearGradient>
        <linearGradient id="mountain-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="560" cy="330" r="190" fill="url(#mountain-sun)" />
      <circle cx="560" cy="330" r="42" fill="#fff3d8" />

      <path
        d="M0 560 L90 470 L170 540 L270 400 L360 520 L450 430 L560 540 L660 410 L740 500 L800 450 L800 780 L0 780 Z"
        fill="url(#mountain-far)"
      />
      {/* Đỉnh Fansipan chính giữa phía sau, thấp hơn mascot để không che mặt */}
      <path
        d="M-20 650 L100 520 L190 610 L300 500 L400 620 L520 540 L630 630 L720 520 L820 640 L820 790 L-20 790 Z"
        fill="url(#mountain-mid)"
      />
      <path d="M0 700 L110 610 L210 690 L330 600 L470 700 L610 620 L720 690 L800 640 L800 800 L0 800 Z" fill="url(#mountain-near)" />

      <g className="animate-cloud-drift">
        <rect x="-60" y="640" width="920" height="90" fill="url(#mountain-mist)" />
      </g>

      {TERRACES.map(({ d, fill }) => (
        <path key={d} d={d} fill={fill} />
      ))}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round">
        <path d="M30 792 C150 770 300 820 470 786" />
        <path d="M90 868 C200 846 320 892 470 862" />
        <path d="M300 940 C420 922 520 954 640 934" />
      </g>

      {/* Hai ngôi nhà gỗ nhỏ trên sườn đồi */}
      <g transform="translate(120 836)">
        <rect x="-14" y="-12" width="28" height="18" fill="#8a5a3a" />
        <path d="M-20 -12 L0 -28 L20 -12 Z" fill="#c05a3a" />
      </g>
      <g transform="translate(690 810)">
        <rect x="-10" y="-9" width="20" height="13" fill="#8a5a3a" />
        <path d="M-15 -9 L0 -21 L15 -9 Z" fill="#c05a3a" />
      </g>
    </SceneSvg>
  )
}
