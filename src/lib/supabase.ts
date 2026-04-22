import { createClient } from '@supabase/supabase-js'
import { upload } from '@vercel/blob/client'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

/* ── helpers ─────────────────────────────────────────────────────── */

/**
 * Upload a file directly to Vercel Blob from the browser.
 * Uses the two-phase client upload: tiny token exchange via /api/upload-blob,
 * then browser streams the file straight to blob.vercel-storage.com — no
 * serverless payload limit applies.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const pathname = `arengcon/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const blob = await upload(pathname, file, {
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
