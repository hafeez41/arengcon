import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

/* ── helpers ─────────────────────────────────────────────────────── */

/** Upload a file to the project-images bucket and return its public URL */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('project-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('project-images').getPublicUrl(path)
  return data.publicUrl
}

/** Extract YouTube video ID from any standard YouTube URL */
export function extractVideoId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  )
  return match ? match[1] : ''
}
