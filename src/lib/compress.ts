const MAX = 2400
const QUALITY = 0.82

/** Resize + compress an image off the main thread using OffscreenCanvas */
export async function compressImage(file: File): Promise<File> {
  const outName = file.name.replace(/\.\w+$/, '.jpg')
  try {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap
    if (Math.max(width, height) > MAX) {
      const scale = MAX / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }
    const canvas = new OffscreenCanvas(width, height)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY })
    return new File([blob], outName, { type: 'image/jpeg' })
  } catch {
    // Safari fallback
    return new Promise((resolve) => {
      const img = new Image()
      const src = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(src)
        let { width, height } = img
        if (Math.max(width, height) > MAX) {
          const scale = MAX / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (b) => resolve(b ? new File([b], outName, { type: 'image/jpeg' }) : file),
          'image/jpeg', QUALITY,
        )
      }
      img.onerror = () => { URL.revokeObjectURL(src); resolve(file) }
      img.src = src
    })
  }
}
