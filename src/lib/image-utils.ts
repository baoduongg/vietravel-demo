/**
 * Nén và chuyển đổi File ảnh sang định dạng Base64 Data URL (JPEG) tối ưu cho Gemini Vision API.
 */
export async function processAndCompressImage(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File tải lên không phải là định dạng hình ảnh hợp lệ."))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error("Không thể nạp hình ảnh để xử lý."))
      img.onload = () => {
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Không thể khởi tạo canvas xử lý ảnh."))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(dataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
