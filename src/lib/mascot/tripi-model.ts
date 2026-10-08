import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"

import type { MascotPose, MascotRig } from "@/lib/mascot/rig"

interface Palette {
  shell: THREE.MeshPhysicalMaterial
  blue: THREE.MeshPhysicalMaterial
  visor: THREE.MeshPhysicalMaterial
  fabric: THREE.MeshPhysicalMaterial
  stitch: THREE.MeshStandardMaterial
  buckle: THREE.MeshStandardMaterial
}

const HEAD_WIDTH = 1.56
const HEAD_HEIGHT = 1.3
const HEAD_DEPTH = 1.24
const HEAD_CENTER_Y = 0.66
const HAT_BASE_Y = 1.2
const BRIM_SLOPE = 0.2
const ARM_REST_ANGLE = 0.14
const WAVE_RAISE_ANGLE = 2.2
const ROBOT_WIDTH = 2.2

function createPalette(): Palette {
  return {
    shell: new THREE.MeshPhysicalMaterial({ color: "#fbfcff", roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
    blue: new THREE.MeshPhysicalMaterial({ color: "#1f5fe0", roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
    visor: new THREE.MeshPhysicalMaterial({ color: "#0b1740", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04 }),
    fabric: new THREE.MeshPhysicalMaterial({
      color: "#e9a400",
      roughness: 0.92,
      sheen: 0.25,
      sheenColor: new THREE.Color("#ffe27a"),
      sheenRoughness: 0.7,
      side: THREE.DoubleSide,
    }),
    stitch: new THREE.MeshStandardMaterial({ color: "#d9a514", roughness: 0.9 }),
    buckle: new THREE.MeshStandardMaterial({ color: "#3a3f4a", roughness: 0.5, metalness: 0.2 }),
  }
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number] = [0, 0, 0]): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material)
  result.position.set(...position)
  return result
}

function tube(points: [number, number, number][], radius: number, material: THREE.Material): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 12, false), material)
}

function createLogoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.font = "800 150px Nunito, Mulish, Arial, sans-serif"
    ctx.textBaseline = "alphabetic"
    const text = "Vietravel"
    const width = ctx.measureText(text).width
    const left = (canvas.width - width) / 2
    const baseline = 190
    ctx.fillStyle = "#1f4fc4"
    ctx.fillText(text, left, baseline)
    // Thay chấm chữ i bằng chấm đỏ như logo Vietravel.
    const iCenter = left + ctx.measureText("V").width + ctx.measureText("i").width / 2
    ctx.clearRect(iCenter - 24, baseline - 150, 48, 46)
    ctx.fillStyle = "#ed1d24"
    ctx.beginPath()
    ctx.arc(iCenter, baseline - 124, 22, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Mũ tai bèo: thân mũ thuôn, vành xòe xuống, có đường chỉ may và logo phía trước. */
function buildHat(palette: Palette): THREE.Group {
  const hat = new THREE.Group()
  const profile = [
    [0, 0.5],
    [0.32, 0.5],
    [0.52, 0.48],
    [0.63, 0.42],
    [0.69, 0.3],
    [0.73, 0.12],
    [0.76, 0.02],
    [0.78, 0],
    [0.92, -BRIM_SLOPE * 0.45],
    [1.06, -BRIM_SLOPE],
    [1.09, -BRIM_SLOPE - 0.02],
  ].map(([radius, y]) => new THREE.Vector2(radius, y))
  hat.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), palette.fabric))

  for (const [radius, y] of [
    [0.74, 0.085],
    [0.88, -BRIM_SLOPE * 0.39],
    [0.98, -BRIM_SLOPE * 0.72],
    [0.6, 0.44],
  ]) {
    const stitch = mesh(new THREE.TorusGeometry(radius, 0.007, 6, 96), palette.stitch, [0, y, 0])
    stitch.rotation.x = Math.PI / 2
    hat.add(stitch)
  }

  const logo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.705, 0.74, 0.22, 48, 1, true, -0.9, 1.8),
    new THREE.MeshBasicMaterial({ map: createLogoTexture(), transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }),
  )
  logo.position.y = 0.22
  hat.add(logo)
  return hat
}

function buildHead(palette: Palette, faceTexture: THREE.Texture): THREE.Group {
  const head = new THREE.Group()
  head.add(
    mesh(new RoundedBoxGeometry(HEAD_WIDTH, HEAD_HEIGHT, HEAD_DEPTH, 10, 0.52), palette.shell, [0, HEAD_CENTER_Y, 0]),
  )
  head.add(mesh(new RoundedBoxGeometry(1.2, 0.92, 0.3, 10, 0.26), palette.visor, [0, HEAD_CENTER_Y - 0.04, 0.5]))
  head.add(
    mesh(
      new THREE.PlaneGeometry(1.1, 0.84),
      new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true, toneMapped: false }),
      [0, HEAD_CENTER_Y - 0.04, 0.652],
    ),
  )

  const hat = buildHat(palette)
  hat.position.set(0, HAT_BASE_Y, -0.02)
  hat.rotation.set(-0.2, 0, -0.08)
  head.add(hat)

  for (const side of [-1, 1]) {
    head.add(
      tube(
        [
          [side * 0.7, HAT_BASE_Y - 0.12, 0.02],
          [side * 0.8, 0.62, 0.2],
          [side * 0.68, 0.2, 0.34],
          [side * 0.38, 0.02, 0.42],
        ],
        0.022,
        palette.fabric,
      ),
    )
    const clip = mesh(new RoundedBoxGeometry(0.07, 0.11, 0.06, 2, 0.02), palette.buckle, [side * 0.79, 0.5, 0.25])
    clip.rotation.z = side * 0.25
    head.add(clip)
  }
  return head
}

function buildArm(palette: Palette, side: number): THREE.Group {
  const arm = new THREE.Group()
  arm.add(mesh(new THREE.SphereGeometry(0.15, 32, 24), palette.shell))
  arm.add(mesh(new THREE.CapsuleGeometry(0.135, 0.3, 8, 24), palette.shell, [0, -0.25, 0]))
  const hand = mesh(new THREE.SphereGeometry(0.17, 32, 24), palette.blue, [0, -0.56, 0.02])
  hand.scale.set(0.95, 1.15, 0.85)
  arm.add(hand)
  const thumb = mesh(new THREE.CapsuleGeometry(0.06, 0.08, 6, 16), palette.blue, [side * -0.13, -0.47, 0.06])
  thumb.rotation.z = side * 0.7
  arm.add(thumb)
  return arm
}

function buildBackpack(palette: Palette): THREE.Group {
  const pack = new THREE.Group()
  pack.add(mesh(new RoundedBoxGeometry(0.74, 0.7, 0.3, 6, 0.13), palette.fabric, [0, 0.86, -0.44]))
  for (const side of [-1, 1]) {
    pack.add(
      tube(
        [
          [side * 0.26, 1.05, -0.4],
          [side * 0.3, 1.3, -0.12],
          [side * 0.33, 1.26, 0.25],
          [side * 0.36, 0.95, 0.47],
          [side * 0.33, 0.55, 0.42],
          [side * 0.28, 0.4, 0.2],
        ],
        0.06,
        palette.fabric,
      ),
    )
    const buckle = mesh(new RoundedBoxGeometry(0.13, 0.08, 0.05, 2, 0.02), palette.buckle, [side * 0.36, 0.86, 0.5])
    buckle.rotation.set(-0.15, side * 0.25, 0)
    pack.add(buckle)
  }
  return pack
}

export function buildTripi(faceTexture: THREE.Texture): MascotRig {
  const palette = createPalette()
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  for (const side of [-1, 1]) {
    body.add(mesh(new THREE.CapsuleGeometry(0.15, 0.12, 8, 24), palette.shell, [side * 0.22, 0.38, 0]))
    body.add(mesh(new RoundedBoxGeometry(0.34, 0.26, 0.42, 6, 0.12), palette.blue, [side * 0.23, 0.13, 0.04]))
  }

  const torso = mesh(new THREE.SphereGeometry(0.56, 64, 48), palette.shell, [0, 0.86, 0])
  torso.scale.set(1, 0.95, 0.85)
  body.add(torso)

  const collar = mesh(new THREE.TorusGeometry(0.27, 0.09, 20, 48), palette.blue, [0, 1.33, 0])
  collar.rotation.x = Math.PI / 2
  body.add(collar)
  body.add(buildBackpack(palette))

  const head = new THREE.Group()
  head.position.set(0, 1.36, 0)
  head.add(buildHead(palette, faceTexture))
  body.add(head)

  const rightArm = buildArm(palette, -1)
  rightArm.position.set(-0.58, 1.12, 0)
  const leftArm = buildArm(palette, 1)
  leftArm.position.set(0.58, 1.12, 0)
  body.add(rightArm, leftArm)

  const applyPose = ({
    time,
    lift,
    sway,
    headPitch,
    headYaw,
    headRoll,
    wave,
    waveSwing,
    armsOpen,
    cheer,
    pointLeft,
  }: MascotPose): void => {
    const restRight = -ARM_REST_ANGLE - Math.sin(time * 1.8) * 0.03 - armsOpen
    const restLeft = ARM_REST_ANGLE + Math.sin(time * 1.8 + 1) * 0.03 + armsOpen
    root.position.y = lift
    body.rotation.z = sway
    head.rotation.set(headPitch, headYaw, headRoll)
    rightArm.rotation.set(
      Math.sin(time * 1.8) * 0.04,
      0,
      THREE.MathUtils.lerp(restRight, -WAVE_RAISE_ANGLE + waveSwing, Math.max(wave, cheer)),
    )
    const leftRaise = Math.max(cheer, pointLeft * 0.55)
    leftArm.rotation.set(
      Math.sin(time * 1.8 + 1) * 0.04,
      0,
      THREE.MathUtils.lerp(restLeft, WAVE_RAISE_ANGLE - waveSwing * cheer, leftRaise),
    )
  }

  return { root, topY: 1.36 + HAT_BASE_Y + 0.5, width: ROBOT_WIDTH, applyPose }
}
