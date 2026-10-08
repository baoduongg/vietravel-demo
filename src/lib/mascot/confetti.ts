import * as THREE from "three"

const COUNT = 140
const GRAVITY = 3.6
const LIFETIME = 2.6
const FADE_SECONDS = 0.9
/** Xanh Vietravel, vàng nón của Tripi, trắng, đỏ khuyến mãi và hồng. */
const COLORS = ["#0046c1", "#0391ff", "#f2b705", "#ffffff", "#ed1d24", "#ff8fb3"]

export interface Confetti {
  object: THREE.Points
  burst: (origin: THREE.Vector3) => void
  update: (deltaSeconds: number) => void
  dispose: () => void
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Pháo giấy bắn lên từ một điểm rồi rơi xuống; dùng cho khoảnh khắc có ưu đãi. */
export function createConfetti(): Confetti {
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const velocities = new Float32Array(COUNT * 3)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  })
  const object = new THREE.Points(geometry, material)
  object.frustumCulled = false
  object.visible = false

  const color = new THREE.Color()
  let age = LIFETIME

  const burst = (origin: THREE.Vector3): void => {
    for (let i = 0; i < COUNT; i += 1) {
      const at = i * 3
      positions[at] = origin.x + randomBetween(-0.5, 0.5)
      positions[at + 1] = origin.y + randomBetween(-0.1, 0.2)
      positions[at + 2] = origin.z + randomBetween(-0.2, 0.4)
      velocities[at] = randomBetween(-1.7, 1.7)
      velocities[at + 1] = randomBetween(1.6, 4)
      velocities[at + 2] = randomBetween(-0.4, 1)
      color.set(COLORS[Math.floor(Math.random() * COLORS.length)]).toArray(colors, at)
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    age = 0
    material.opacity = 1
    object.visible = true
  }

  const update = (deltaSeconds: number): void => {
    if (!object.visible) return
    age += deltaSeconds
    if (age >= LIFETIME) {
      object.visible = false
      return
    }
    for (let i = 0; i < COUNT; i += 1) {
      const at = i * 3
      velocities[at + 1] -= GRAVITY * deltaSeconds
      positions[at] += velocities[at] * deltaSeconds
      positions[at + 1] += velocities[at + 1] * deltaSeconds
      positions[at + 2] += velocities[at + 2] * deltaSeconds
    }
    geometry.attributes.position.needsUpdate = true
    material.opacity = THREE.MathUtils.clamp((LIFETIME - age) / FADE_SECONDS, 0, 1)
  }

  return {
    object,
    burst,
    update,
    dispose: () => {
      geometry.dispose()
      material.dispose()
    },
  }
}
