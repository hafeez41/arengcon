import { createClient } from '@supabase/supabase-js'
import { upload } from '@vercel/blob/client'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

/* ── helpers ─────────────────────────────────────────────────────── */

/** Resize + compress an image to max 2400px on longest side, JPEG 82% quality */
function compressImage(file: File): Promise<File> {
  const MAX = 2400
  const QUALITY = 0.82
  return new Promise((resolve) => {
    const img = new Image()
    const src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(src)
      let { width, height } = img
      if (width <= MAX && height <= MAX && file.type === 'image/jpeg') {
        resolve(file)
        return
      }
      if (Math.max(width, height) > MAX) {
        const scale = MAX / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg',
        QUALITY,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(src); resolve(file) }
    img.src = src
  })
}

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file)
  const pathname = `arengcon/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const blob = await upload(pathname, compressed, {
    access: 'public',
    handleUploadUrl: '/api/upload-blob',
  })
  return blob.url
}

/**
 * Delete one or more Vercel Blob URLs via the server-side API route.
 * Best-effort — DB delete proceeds regardless of whether this succeeds.
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const valid = urls.filter(Boolean)
  if (valid.length === 0) return
  try {
    await fetch('/api/delete-blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: valid }),
    })
  } catch {
    // best-effort — silently ignore if the API route is unavailable
  }
}

/** Extract YouTube video ID from any standard YouTube URL */
export function extractVideoId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  )
  return match ? match[1] : ''
}
