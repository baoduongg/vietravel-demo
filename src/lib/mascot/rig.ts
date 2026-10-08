import * as THREE from "three"

/** Tư thế trừu tượng do engine tính mỗi khung hình; mỗi model tự quy đổi sang góc xoay của mình. */
export interface MascotPose {
  /** Thời gian (giây), để model tự tạo dao động nhẹ khi đứng yên. */
  time: number
  /** Nhấc cả người lên (đơn vị cảnh). */
  lift: number
  /** Nghiêng thân sang hai bên (radian). */
  sway: number
  headPitch: number
  headYaw: number
  headRoll: number
  /** 0 = tay phải hạ, 1 = tay phải giơ lên vẫy. */
  wave: number
  /** Góc lắc tay khi vẫy (radian), chỉ có tác dụng khi wave > 0. */
  waveSwing: number
  /** Góc dang thêm của hai tay ra ngoài (radian). */
  armsOpen: number
  /** 0 đến 1, hai tay giơ cao ăn mừng. */
  cheer: number
  /** 0 đến 1, tay trái đưa ra chỉ về phía thẻ tour bên phải. */
  pointLeft: number
}

export interface MascotRig {
  root: THREE.Object3D
  /** Đỉnh nhân vật (đỉnh mũ), dùng để căn khung hình. */
  topY: number
  /** Bề ngang cần chừa khi căn khung hình. */
  width: number
  applyPose: (pose: MascotPose) => void
}

export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    for (const material of [child.material].flat() as THREE.Material[]) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}
