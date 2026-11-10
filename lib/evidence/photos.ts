import { imageFormat, MAX_FILE_BYTES, MAX_STORED_BYTES } from "./model"
// Canvas re-encoding removes original EXIF/location metadata. The original is never stored.
export async function preparePhoto(file: File): Promise<Blob> {
  if (file.size > MAX_FILE_BYTES) throw new Error("size")
  if (!imageFormat(new Uint8Array(await file.slice(0, 16).arrayBuffer()))) throw new Error("format")
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    if (!img.naturalWidth || !img.naturalHeight) throw new Error("format")
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("format")
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b ? resolve(b) : reject(new Error("format")), "image/jpeg", .82))
    if (blob.size > MAX_STORED_BYTES) throw new Error("size")
    return blob
  } finally { URL.revokeObjectURL(url) }
}
