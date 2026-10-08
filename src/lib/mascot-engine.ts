import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

import type { AvatarEngine, MascotMood, MascotReaction } from "@/lib/avatar-engine"
import { createConfetti } from "@/lib/mascot/confetti"
import { disposeObject, type MascotRig } from "@/lib/mascot/rig"
import { createTripiFace, PROCEDURAL_FACE_LAYOUT } from "@/lib/mascot/tripi-face"
import { GLB_FACE_LAYOUT, loadTripiGlb } from "@/lib/mascot/tripi-glb"
import { buildTripi } from "@/lib/mascot/tripi-model"

/** "glb": Tripi từ file 3D; "procedural": Tripi dựng bằng code. */
export type MascotSource = "glb" | "procedural"

type GestureKind = "wave" | "nod" | "open-arms" | MascotReaction

interface Gesture {
  kind: GestureKind
  start: number
  duration: number
  /** Pháo giấy chỉ bắn một lần trong mỗi lần ăn mừng. */
  fired?: boolean
}

const CAMERA_FOV = 30
const FRAME_BOTTOM_Y = 0
/** Chừa rộng quanh Tripi để cảnh nền và pháo giấy còn chỗ hiện ra. */
const FRAME_MARGIN = 1.55
/** Đẩy robot xuống dưới tâm khung để chừa chỗ cho phần vòm và nhãn trạng thái phía trên. */
const FRAME_TOP_PADDING = 0.3
const GESTURE_DURATION: Record<GestureKind, number> = { wave: 2.6, nod: 0.9, "open-arms": 1.6, celebrate: 2.6, point: 2.2 }
const SPEECH_GESTURE_CHANCE = 0.6
const MOUTH_GAIN = 9
const MOUTH_NOISE_FLOOR = 0.012
const MOUTH_ATTACK = 0.55
const MOUTH_RELEASE = 0.25
/** Sau bao lâu chuột đứng yên thì Tripi thôi nhìn theo và quay lại liếc ngẫu nhiên (ms). */
const POINTER_IDLE_MS = 4000
/** Độ cao của mắt so với đỉnh nhân vật, dùng làm gốc khi tính hướng nhìn theo chuột. */
const EYE_HEIGHT_RATIO = 0.72
const GAZE_FOLLOW_SPEED = 0.12
const GAZE_WANDER_SPEED = 0.06
/** Đang nghĩ thì Tripi ngước nhìn lên phía trên bên trái, như đang cân nhắc. */
const THINKING_GAZE = new THREE.Vector2(-0.55, -0.6)
/** Khi chỉ tay về thẻ tour (bên phải màn hình), mắt và đầu quay sang phải. */
const POINT_GAZE_X = 0.75
const POINT_YAW = 0.28
const SHADOW_RADIUS = 1.25
const CELEBRATE_JUMPS = 3
const CELEBRATE_JUMP_HEIGHT = 0.14

/** Bóng mờ dưới chân để Tripi đứng trên sân khấu thay vì lơ lửng. */
function createGroundShadow(): { mesh: THREE.Mesh; dispose: () => void } {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, "rgba(0, 40, 120, 0.38)")
    gradient.addColorStop(1, "rgba(0, 40, 120, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  }
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SHADOW_RADIUS * 2, SHADOW_RADIUS * 2), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.01
  return {
    mesh,
    dispose: () => {
      mesh.geometry.dispose()
      material.dispose()
      texture.dispose()
    },
  }
}

function easeInOut(value: number): number {
  const clamped = THREE.MathUtils.clamp(value, 0, 1)
  return clamped * clamped * (3 - 2 * clamped)
}

/** Đường cong 0 → 1 → 0 cho động tác: tăng dần, giữ, rồi hạ xuống. */
function envelope(progress: number, rise: number, fall: number): number {
  if (progress < rise) return easeInOut(progress / rise)
  if (progress > 1 - fall) return easeInOut((1 - progress) / fall)
  return 1
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function frameCamera(camera: THREE.PerspectiveCamera, rig: MascotRig, width: number, height: number): void {
  // Khung chứa chưa có kích thước (đang dàn trang hoặc bị ẩn): giữ camera cũ, tránh khoảng cách vô cực.
  if (width <= 0 || height <= 0) return
  camera.aspect = width / height
  const frameHeight = (rig.topY - FRAME_BOTTOM_Y) * FRAME_MARGIN
  const halfFov = THREE.MathUtils.degToRad(CAMERA_FOV / 2)
  const distanceForHeight = frameHeight / 2 / Math.tan(halfFov)
  const distanceForWidth = (rig.width * FRAME_MARGIN) / 2 / (Math.tan(halfFov) * camera.aspect)
  const distance = Math.max(distanceForHeight, distanceForWidth)
  const centerY = FRAME_BOTTOM_Y + (rig.topY - FRAME_BOTTOM_Y) / 2 + FRAME_TOP_PADDING
  camera.position.set(0, centerY + 0.05, distance)
  camera.lookAt(0, centerY, 0)
  camera.updateProjectionMatrix()
}

export async function createMascotEngine(
  container: HTMLElement,
  onProgress: (percent: number) => void,
  modelSource: MascotSource = "glb",
): Promise<AvatarEngine> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.width = "100%"
  renderer.domElement.style.height = "100%"
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.6

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(-2.5, 4, 5)
  scene.add(keyLight, new THREE.HemisphereLight(0xffffff, 0xb8d4ff, 0.6))

  const face = createTripiFace(modelSource === "glb" ? GLB_FACE_LAYOUT : PROCEDURAL_FACE_LAYOUT)
  let rig: MascotRig
  try {
    rig = modelSource === "glb" ? await loadTripiGlb(face.texture, onProgress) : buildTripi(face.texture)
  } catch (error: unknown) {
    face.dispose()
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    throw error
  }
  scene.add(rig.root)
  const shadow = createGroundShadow()
  const confetti = createConfetti()
  scene.add(shadow.mesh, confetti.object)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
  const resize = (): void => {
    const { clientWidth, clientHeight } = container
    renderer.setSize(clientWidth, clientHeight, false)
    frameCamera(camera, rig, clientWidth, clientHeight)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  onProgress(100)

  const audioCtx = new AudioContext()
  const analyser = new AnalyserNode(audioCtx, { fftSize: 1024 })
  analyser.connect(audioCtx.destination)
  const samples = new Float32Array(analyser.fftSize)

  let source: AudioBufferSourceNode | null = null
  let speechToken = 0
  let finishCurrent: (() => void) | null = null
  let hasGreeted = false
  let mood: MascotMood = "idle"
  let gesture: Gesture | null = null
  let mouth = 0
  let gaze = new THREE.Vector2()
  let gazeTarget = new THREE.Vector2()
  let nextGlanceAt = 0
  let eyeContactUntil = 0
  // movedAt bắt đầu ở -Infinity: performance.now() cũng tính từ 0 nên giá trị 0 sẽ bị hiểu là "vừa di chuột".
  const pointer = { x: 0, y: 0, movedAt: Number.NEGATIVE_INFINITY }
  const eyeAnchor = new THREE.Vector3()

  const handlePointerMove = (event: PointerEvent): void => {
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.movedAt = performance.now()
  }
  const handlePointerLeave = (): void => {
    pointer.movedAt = Number.NEGATIVE_INFINITY
  }
  window.addEventListener("pointermove", handlePointerMove, { passive: true })
  document.documentElement.addEventListener("pointerleave", handlePointerLeave)
  window.addEventListener("blur", handlePointerLeave)

  /** Hướng nhìn từ mắt Tripi tới con trỏ, mỗi trục trong khoảng -1 đến 1. */
  const pointerGaze = (): THREE.Vector2 => {
    const rect = renderer.domElement.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return new THREE.Vector2()
    eyeAnchor.set(0, rig.topY * EYE_HEIGHT_RATIO, 0).project(camera)
    if (!Number.isFinite(eyeAnchor.x) || !Number.isFinite(eyeAnchor.y)) return new THREE.Vector2()
    const eyeX = rect.left + ((eyeAnchor.x + 1) / 2) * rect.width
    const eyeY = rect.top + ((1 - eyeAnchor.y) / 2) * rect.height
    return new THREE.Vector2(
      THREE.MathUtils.clamp((pointer.x - eyeX) / (window.innerWidth * 0.45), -1, 1),
      THREE.MathUtils.clamp((pointer.y - eyeY) / (window.innerHeight * 0.45), -1, 1),
    )
  }
  let lastFrameTime = 0
  let nextBlinkAt = 2
  let blinkStart = -1
  let frameId = 0

  const clock = new THREE.Clock()

  const startGesture = (kind: GestureKind): void => {
    gesture = { kind, start: clock.elapsedTime, duration: GESTURE_DURATION[kind] }
  }

  const readVoiceLevel = (): number => {
    if (!source) return 0
    analyser.getFloatTimeDomainData(samples)
    let sum = 0
    for (const sample of samples) sum += sample * sample
    const rms = Math.sqrt(sum / samples.length)
    return THREE.MathUtils.clamp((rms - MOUTH_NOISE_FLOOR) * MOUTH_GAIN, 0, 1)
  }

  const animate = (): void => {
    frameId = requestAnimationFrame(animate)
    const time = clock.getElapsedTime()
    // getElapsedTime đã tự gọi getDelta nên tính khoảng cách giữa hai khung hình từ mốc trước.
    const deltaSeconds = Math.min(time - lastFrameTime, 0.05)
    lastFrameTime = time

    const level = readVoiceLevel()
    mouth += (level - mouth) * (level > mouth ? MOUTH_ATTACK : MOUTH_RELEASE)

    if (time > nextBlinkAt) {
      blinkStart = time
      nextBlinkAt = time + randomBetween(2.5, 5.5)
    }
    const blinkProgress = blinkStart < 0 ? 1 : (time - blinkStart) / 0.18
    const eyeOpen = blinkProgress >= 1 ? 1 : 1 - Math.sin(blinkProgress * Math.PI)

    // Đang nói thì nhìn thẳng vào khách; không nói thì nhìn theo chuột, chuột đứng yên lâu thì liếc ngẫu nhiên.
    const now = performance.now()
    const followPointer = !source && now >= eyeContactUntil && now - pointer.movedAt < POINTER_IDLE_MS
    if (mood === "thinking" && !source) {
      gazeTarget = THINKING_GAZE.clone()
    } else if (source || now < eyeContactUntil || mood === "listening") {
      gazeTarget.set(0, 0)
    } else if (followPointer) {
      gazeTarget = pointerGaze()
      nextGlanceAt = time + randomBetween(1, 2.5)
    } else if (time > nextGlanceAt) {
      gazeTarget = new THREE.Vector2(randomBetween(-0.7, 0.7), randomBetween(-0.4, 0.3))
      nextGlanceAt = time + randomBetween(1.8, 4)
    }
    gaze = gaze.lerp(gazeTarget, followPointer ? GAZE_FOLLOW_SPEED : GAZE_WANDER_SPEED)
    // NaN không tự hết khi nội suy, nên đặt lại ngay nếu lỡ xuất hiện.
    if (!Number.isFinite(gaze.x) || !Number.isFinite(gaze.y)) gaze.set(0, 0)

    let wink = 0
    let happy = 0
    let cheer = 0
    let pointLeft = 0
    let pointYaw = 0

    let wave = 0
    let waveSwing = 0
    let armsOpen = 0
    let headPitch = mouth * 0.06 + Math.sin(time * 1.1) * 0.02 + gaze.y * 0.12
    let bodyLift = 0
    let headRoll = Math.sin(time * 1.3) * 0.035 - gaze.x * 0.03

    // Nghe khách nói thì nghiêng đầu về phía trước một chút, đang nghĩ thì nghiêng sang một bên.
    if (mood === "listening") {
      headRoll += 0.1
      headPitch -= 0.04
    } else if (mood === "thinking" && !source) {
      headRoll -= 0.12
      headPitch -= 0.06
    }

    if (gesture) {
      const progress = (time - gesture.start) / gesture.duration
      if (progress >= 1) {
        gesture = null
      } else if (gesture.kind === "wave") {
        const raise = envelope(progress, 0.15, 0.2)
        wink = envelope((progress - 0.1) / 0.75, 0.12, 0.2)
        wave = raise
        waveSwing = Math.sin(time * 11) * 0.28
        bodyLift = raise * 0.03
      } else if (gesture.kind === "nod") {
        headPitch += Math.sin(progress * Math.PI * 2) * 0.14
      } else if (gesture.kind === "celebrate") {
        cheer = envelope(progress, 0.15, 0.25)
        happy = envelope(progress, 0.1, 0.2)
        waveSwing = Math.sin(time * 12) * 0.25
        // Nhún nhảy vài nhịp trong lúc giơ hai tay.
        bodyLift = Math.abs(Math.sin(progress * Math.PI * CELEBRATE_JUMPS)) * CELEBRATE_JUMP_HEIGHT * cheer
        headPitch -= 0.08 * cheer
        if (!gesture.fired) {
          gesture.fired = true
          confetti.burst(new THREE.Vector3(0, rig.topY * 0.85, 0.2))
        }
      } else if (gesture.kind === "point") {
        pointLeft = envelope(progress, 0.25, 0.3)
        pointYaw = pointLeft
        headPitch += Math.sin(progress * Math.PI) * 0.05
      } else {
        armsOpen = envelope(progress, 0.3, 0.35) * 0.55
      }
    }

    face.draw({
      eyeOpen,
      wink,
      mouthOpen: mouth,
      gazeX: gaze.x + pointYaw * POINT_GAZE_X,
      gazeY: gaze.y,
      happy,
    })

    rig.applyPose({
      time,
      lift: Math.sin(time * 2) * 0.025 + bodyLift,
      sway: Math.sin(time * 0.9) * 0.015,
      headPitch,
      headYaw: gaze.x * 0.22 + pointYaw * POINT_YAW,
      headRoll,
      wave,
      waveSwing,
      armsOpen,
      cheer,
      pointLeft,
    })

    // Bóng co lại khi Tripi nhảy lên.
    const grounded = 1 / (1 + (rig.root.position.y > 0 ? rig.root.position.y * 3 : 0))
    shadow.mesh.scale.setScalar(grounded)
    confetti.update(deltaSeconds)

    renderer.render(scene, camera)
  }
  animate()

  const settle = (): void => {
    const finish = finishCurrent
    finishCurrent = null
    finish?.()
  }

  const stop = (): void => {
    speechToken += 1
    if (source) {
      source.onended = null
      source.stop()
      source.disconnect()
      source = null
    }
    settle()
  }

  const resumeAudio = (): void => {
    if (audioCtx.state === "suspended") {
      void audioCtx.resume()
    }
  }
  window.addEventListener("pointerdown", resumeAudio)
  window.addEventListener("keydown", resumeAudio)

  return {
    async unlock(): Promise<void> {
      if (audioCtx.state === "suspended") {
        await audioCtx.resume()
      }
    },

    async speak(audio: ArrayBuffer): Promise<void> {
      stop()
      if (audioCtx.state === "suspended") {
        await audioCtx.resume()
      }
      const token = speechToken
      const buffer = await audioCtx.decodeAudioData(audio.slice(0))
      if (token !== speechToken) return

      if (!hasGreeted) {
        hasGreeted = true
        startGesture("wave")
      } else if (!gesture && Math.random() < SPEECH_GESTURE_CHANCE) {
        startGesture(Math.random() < 0.5 ? "nod" : "open-arms")
      }

      await new Promise<void>((resolve) => {
        finishCurrent = resolve
        const node = new AudioBufferSourceNode(audioCtx, { buffer })
        node.connect(analyser)
        node.onended = (): void => {
          if (token !== speechToken) return
          node.disconnect()
          source = null
          settle()
        }
        source = node
        node.start()
      })
    },

    stop,

    lookAtUser(durationMs: number): void {
      eyeContactUntil = performance.now() + durationMs
    },

    setMood(next: MascotMood): void {
      mood = next
    },

    react(reaction: MascotReaction): void {
      startGesture(reaction)
    },

    dispose(): void {
      stop()
      cancelAnimationFrame(frameId)
      window.removeEventListener("pointermove", handlePointerMove)
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave)
      window.removeEventListener("blur", handlePointerLeave)
      window.removeEventListener("pointerdown", resumeAudio)
      window.removeEventListener("keydown", resumeAudio)
      resizeObserver.disconnect()
      disposeObject(rig.root)
      shadow.dispose()
      confetti.dispose()
      face.dispose()
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      void audioCtx.close()
    },
  }
}
