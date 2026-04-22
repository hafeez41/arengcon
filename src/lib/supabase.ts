import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

/* ── helpers ─────────────────────────────────────────────────────── */

/** Upload a file via the server-side API route and return its public Blob URL */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const pathname = `arengcon/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const res = await fetch(`/api/upload-blob?pathname=${encodeURIComponent(pathname)}`, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
  const { url: blobUrl } = await res.json()
  return blobUrl
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
