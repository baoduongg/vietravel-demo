import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

import type { MascotPose, MascotRig } from "@/lib/mascot/rig"
import type { FaceLayout } from "@/lib/mascot/tripi-face"

export const TRIPI_GLB_URL = "/avatars/vietravel-robot.glb"

/**
 * Bố cục mặt LED khớp với các mảnh mặt gốc trong file GLB.
 * Màn hình `face-display` rộng 1.11 x 0.744 đơn vị, UV phẳng nên canvas phủ khít lên mặt kính cong.
 */
export const GLB_FACE_LAYOUT: FaceLayout = {
  width: 1170,
  height: 784,
  eyeOffsetX: 263,
  eyeY: 434,
  eyeR: 172,
  mouthY: 560,
  mouthScale: 1.2,
  cheekLeft: [-58, 228],
  cheekRight: [200, 130],
  colors: { led: "#8fe9ff", ledGlow: "#3cc4ff", mouth: "#db5e96", tongue: "#f6a6cf" },
}

/** Các mảnh mặt vẽ sẵn biểu cảm nháy mắt; ẩn đi để thay bằng mặt LED động. */
const BAKED_FACE_PARTS = /^(eye-|brow-|mouth|teeth|tongue|blush-tick-)/
/** Phần vải vàng: mũ, quai mũ, ba lô, dây đeo. Màu gốc bị nhạt dưới ánh sáng của cảnh. */
const YELLOW_PARTS = /^(hat-crown|hat-brim|chin-strap|backpack|strap-)/
const YELLOW = new THREE.Color("#f2b705")
/**
 * Nón trong file là lớp vỏ mỏng chỉ vẽ mặt ngoài; nhìn từ dưới vành lên sẽ thấy xuyên qua lòng nón.
 * Bật vẽ hai mặt cho nón và đường chỉ may để lòng nón hiện màu vải.
 */
const DOUBLE_SIDED_PARTS = /^(hat-|brim-stitch|crown-stitch)/
/** Góc hạ tay từ tư thế chéo 45 độ trong file xuống gần thẳng đứng. */
const ARM_DOWN_ANGLE = 0.6
const MITTEN_REST_SCALE = 1.02
const MITTEN_WAVE_SCALE = 1.26
const ROBOT_WIDTH = 2.2

function findGroup(scene: THREE.Object3D, name: string): THREE.Object3D {
  const node = scene.getObjectByName(name)
  if (!node) throw new Error(`File GLB thiếu phần "${name}".`)
  return node
}

function rotationZ(angle: number): THREE.Quaternion {
  return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle)
}

export async function loadTripiGlb(
  faceTexture: THREE.Texture,
  onProgress: (percent: number) => void,
): Promise<MascotRig> {
  const gltf = await new GLTFLoader().loadAsync(TRIPI_GLB_URL, (event: ProgressEvent) => {
    if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
  })
  const model = gltf.scene
  const root = new THREE.Group()
  root.add(model)

  const torso = findGroup(model, "torso")
  const head = findGroup(model, "head")
  const rightArm = findGroup(model, "arm-r")
  const leftArm = findGroup(model, "arm-l")
  const rightMitten = findGroup(model, "mitten-r")
  const display = model.getObjectByName("face-display")
  if (!(display instanceof THREE.Mesh)) throw new Error('File GLB thiếu màn hình "face-display".')

  model.traverse((child) => {
    if (BAKED_FACE_PARTS.test(child.name)) child.visible = false
    if (!(child instanceof THREE.Mesh)) return
    const material = child.material as THREE.MeshStandardMaterial
    if (YELLOW_PARTS.test(child.name)) material.color.copy(YELLOW)
    if (DOUBLE_SIDED_PARTS.test(child.name)) material.side = THREE.DoubleSide
  })

  const face = new THREE.Mesh(
    display.geometry,
    new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
  )
  face.position.copy(display.position)
  face.quaternion.copy(display.quaternion)
  face.scale.copy(display.scale)
  face.renderOrder = 2
  display.parent?.add(face)

  // Tay phải trong file đang ở tư thế vẫy: lấy làm đích khi chào, còn khi đứng yên thì hạ tay xuống.
  const rightWave = rightArm.quaternion.clone()
  const rightRest = rotationZ(ARM_DOWN_ANGLE)
  const leftRest = rotationZ(-ARM_DOWN_ANGLE)
  const mittenWave = rightMitten.quaternion.clone()
  const leftMitten = findGroup(model, "mitten-l").quaternion
  const mittenRest = new THREE.Quaternion(leftMitten.x, -leftMitten.y, -leftMitten.z, leftMitten.w)
  const torsoRest = torso.quaternion.clone()
  const headRest = head.quaternion.clone()
  const swing = new THREE.Quaternion()
  const euler = new THREE.Euler()

  const box = new THREE.Box3().setFromObject(model)

  const applyPose = ({ time, lift, sway, headPitch, headYaw, headRoll, wave, waveSwing, armsOpen }: MascotPose): void => {
    const idle = Math.sin(time * 1.8) * 0.03
    root.position.y = lift
    torso.quaternion.copy(torsoRest).multiply(swing.setFromEuler(euler.set(0, 0, sway)))
    head.quaternion.copy(headRest).multiply(swing.setFromEuler(euler.set(headPitch, headYaw, headRoll)))

    rightArm.quaternion.slerpQuaternions(rightRest, rightWave, wave)
    rightArm.quaternion.multiply(rotationZ(THREE.MathUtils.lerp(-armsOpen - idle, waveSwing, wave)))
    rightMitten.quaternion.slerpQuaternions(mittenRest, mittenWave, wave)
    rightMitten.scale.setScalar(THREE.MathUtils.lerp(MITTEN_REST_SCALE, MITTEN_WAVE_SCALE, wave))

    const leftIdle = Math.sin(time * 1.8 + 1) * 0.03
    leftArm.quaternion.copy(leftRest).multiply(rotationZ(armsOpen + leftIdle))
  }

  return { root, topY: box.max.y, width: ROBOT_WIDTH, applyPose }
}
