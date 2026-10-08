export const VIEW_WIDTH = 800
export const VIEW_HEIGHT = 1000

/** Khung SVG chung của mọi cảnh nền: neo đáy, phủ kín sân khấu bất kể tỉ lệ. */
export function SceneSvg({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 size-full"
    >
      {children}
    </svg>
  )
}
