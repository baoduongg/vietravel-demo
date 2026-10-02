import * as THREE from "three"

const GAZE_PX = 24
/** Miệng luôn hé cười một chút khi im lặng, giống nhân vật gốc. */
const IDLE_MOUTH = 0.22
/** Bán kính mắt dùng làm chuẩn cho các khoảng cách nhỏ (nét vẽ, điểm sáng). */
const BASE_EYE_R = 140

/** Bố cục mặt LED, tính bằng pixel trên canvas. Mỗi model có màn hình kích thước khác nhau. */
export interface FaceLayout {
  width: number
  height: number
  eyeOffsetX: number
  eyeY: number
  eyeR: number
  mouthY: number
  mouthScale: number
  /** Vị trí vạch má so với tâm mắt cùng bên: [dx, dy]. */
  cheekLeft: [number, number]
  cheekRight: [number, number]
  colors: {
    led: string
    ledGlow: string
    mouth: string
    tongue: string
  }
}

/** Bố cục cho Tripi dựng bằng code (mặt phẳng 1.1 x 0.84). */
export const PROCEDURAL_FACE_LAYOUT: FaceLayout = {
  width: 1024,
  height: 784,
  eyeOffsetX: 230,
  eyeY: 350,
  eyeR: 140,
  mouthY: 610,
  mouthScale: 1,
  cheekLeft: [-75, 215],
  cheekRight: [60, 180],
  colors: { led: "#7fe3ff", ledGlow: "#36b8ff", mouth: "#d8336b", tongue: "#ff8fb3" },
}

export interface FaceState {
  /** 1 = mở mắt, 0 = nhắm mắt (chớp mắt). */
  eyeOpen: number
  /** 0 đến 1, nháy mắt phải (mắt bên phải người xem). */
  wink: number
  /** 0 đến 1, độ mở miệng theo âm lượng giọng nói. */
  mouthOpen: number
  /** Hướng nhìn, mỗi trục trong khoảng -1 đến 1. */
  gazeX: number
  gazeY: number
}

export interface TripiFace {
  texture: THREE.CanvasTexture
  draw: (state: FaceState) => void
  dispose: () => void
}

export function createTripiFace(layout: FaceLayout = PROCEDURAL_FACE_LAYOUT): TripiFace {
  const { width, height, eyeR, colors } = layout
  const s = eyeR / BASE_EYE_R
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas 2D.")

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  const glow = (blur: number): void => {
    ctx.shadowColor = colors.ledGlow
    ctx.shadowBlur = blur * s
  }

  const drawOpenEye = (cx: number, cy: number, open: number, lookX: number, lookY: number): void => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, Math.max(open, 0.08))

    glow(36)
    ctx.fillStyle = colors.led
    ctx.beginPath()
    ctx.arc(0, 0, eyeR, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    const iris = ctx.createRadialGradient(lookX - 10 * s, lookY - 14 * s, 8 * s, lookX, lookY, eyeR * 0.8)
    iris.addColorStop(0, "#5fb4ff")
    iris.addColorStop(0.7, "#2a6fe0")
    iris.addColorStop(1, "#1d4fb8")
    ctx.fillStyle = iris
    ctx.beginPath()
    ctx.arc(lookX, lookY, eyeR * 0.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#0a1a45"
    ctx.beginPath()
    ctx.arc(lookX + 4 * s, lookY + 4 * s, eyeR * 0.42, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(lookX - 4 * s, lookY - 22 * s, eyeR * 0.17, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lookX + 34 * s, lookY + 30 * s, eyeR * 0.07, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const drawClosedEye = (cx: number, cy: number): void => {
    glow(30)
    ctx.strokeStyle = colors.led
    ctx.lineWidth = 34 * s
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.arc(cx, cy + 50 * s, eyeR * 0.95, Math.PI * 1.18, Math.PI * 1.82)
    ctx.stroke()
  }

  const drawEyebrow = (cx: number, cy: number, side: number, lift: number): void => {
    glow(24)
    ctx.strokeStyle = colors.led
    ctx.lineWidth = 18 * s
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.arc(
      cx + side * 10 * s,
      cy + (70 - lift) * s,
      eyeR * 1.45,
      Math.PI * (side < 0 ? 1.3 : 1.42),
      Math.PI * (side < 0 ? 1.58 : 1.7),
    )
    ctx.stroke()
  }

  const drawCheekMarks = (cx: number, cy: number): void => {
    glow(16)
    ctx.strokeStyle = colors.led
    ctx.lineWidth = 13 * s
    ctx.lineCap = "round"
    for (const offset of [0, 30 * s]) {
      ctx.beginPath()
      ctx.moveTo(cx + offset - 8 * s, cy + 22 * s)
      ctx.lineTo(cx + offset + 8 * s, cy - 22 * s)
      ctx.stroke()
    }
  }

  const drawMouth = (cx: number, cy: number, open: number): void => {
    const halfWidth = (92 + open * 26) * layout.mouthScale
    const depth = (46 + open * 120) * layout.mouthScale
    const top = cy - 30 * layout.mouthScale

    ctx.save()
    glow(30)
    ctx.beginPath()
    ctx.moveTo(cx - halfWidth, top)
    ctx.quadraticCurveTo(cx, top + 8, cx + halfWidth, top)
    ctx.bezierCurveTo(cx + halfWidth * 0.95, top + depth * 0.85, cx + halfWidth * 0.4, top + depth, cx, top + depth)
    ctx.bezierCurveTo(cx - halfWidth * 0.4, top + depth, cx - halfWidth * 0.95, top + depth * 0.85, cx - halfWidth, top)
    ctx.closePath()
    ctx.fillStyle = colors.mouth
    ctx.fill()
    ctx.clip()

    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(cx - halfWidth, top - 10, halfWidth * 2, (14 + open * 10) * layout.mouthScale)

    ctx.fillStyle = colors.tongue
    ctx.beginPath()
    ctx.ellipse(cx, top + depth * 0.95, halfWidth * 0.62, depth * 0.42, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const draw = (state: FaceState): void => {
    // Canvas báo lỗi với giá trị NaN/vô cực, nên thay bằng giá trị trung tính thay vì làm hỏng cả khung hình.
    const finite = (value: number, fallback: number): number => (Number.isFinite(value) ? value : fallback)
    const eyeOpen = finite(state.eyeOpen, 1)
    const wink = finite(state.wink, 0)
    const mouthOpen = finite(state.mouthOpen, 0)
    const gazeX = finite(state.gazeX, 0)
    const gazeY = finite(state.gazeY, 0)
    ctx.clearRect(0, 0, width, height)
    const cx = width / 2 + gazeX * GAZE_PX * 0.6 * s
    const cy = gazeY * GAZE_PX * 0.6 * s
    const lookX = gazeX * 16 * s
    const lookY = gazeY * 12 * s
    const leftX = cx - layout.eyeOffsetX
    const rightX = cx + layout.eyeOffsetX
    const eyeY = cy + layout.eyeY

    drawEyebrow(leftX, eyeY - eyeR, -1, wink * 12)
    drawEyebrow(rightX, eyeY - eyeR, 1, -wink * 10)
    drawOpenEye(leftX, eyeY, eyeOpen, lookX, lookY)
    if (wink > 0.5) drawClosedEye(rightX, eyeY)
    else drawOpenEye(rightX, eyeY, eyeOpen * (1 - wink * 2), lookX, lookY)

    drawCheekMarks(leftX + layout.cheekLeft[0], eyeY + layout.cheekLeft[1])
    drawCheekMarks(rightX + layout.cheekRight[0], eyeY + layout.cheekRight[1] - wink * 30 * s)
    drawMouth(cx, cy + layout.mouthY, IDLE_MOUTH + mouthOpen * (1 - IDLE_MOUTH))
    ctx.shadowBlur = 0

    texture.needsUpdate = true
  }

  draw({ eyeOpen: 1, wink: 0, mouthOpen: 0, gazeX: 0, gazeY: 0 })

  return {
    texture,
    draw,
    dispose: () => texture.dispose(),
  }
}
