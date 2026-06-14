// Read an uploaded image file and return a downscaled webp data URL.
// Downscaling keeps captured items small enough to persist in localStorage
// (there's no upload backend in this mock — images live in the store).
export function fileToDataUrl(file, max = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/webp', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
