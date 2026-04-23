import { supabase } from './supabase'
import type { Project } from '../components/ProjectModal'

export const LIMITS = {
  projects: 100,
  team: 50,
  references: 6,
  updates: 10,
  settings: 50,
} as const

export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
}

export interface Reference {
  id: number
  name: string
  title: string
  project: string
  quote: string
}

export interface UpdateEntry {
  id: number
  title: string
  details: string
  video_id: string | null
  images: string[]
  created_at?: string
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(LIMITS.projects)
  if (error || !data) return []
  return data.map((r: any) => ({
    id: Number(r.id),
    title: r.title,
    location: r.location,
    year: r.year,
    category: r.category,
    type: r.type,
    img: r.img,
    description: r.description,
    area: r.area ?? '—',
    duration: r.duration ?? '—',
    videoId: r.video_id ?? '',
    gallery: r.gallery ?? [],
  }))
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(LIMITS.team)
  if (error || !data) return []
  return data.map((r: any) => ({
    id: Number(r.id),
    name: r.name,
    role: r.role,
    bio: r.bio,
    image: r.image || '/avatar-default.svg',
  }))
}

export async function fetchReferences(): Promise<Reference[]> {
  const { data, error } = await supabase
    .from('client_references')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(LIMITS.references)
  if (error || !data) return []
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    title: r.title || '',
    project: r.project || '',
    quote: r.quote || '',
  }))
}

export async function fetchUpdates(): Promise<UpdateEntry[]> {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(LIMITS.updates)
  if (error || !data) return []
  return data.map((r: any) => ({
    id: r.id,
    title: r.title,
    details: r.details || '',
    video_id: r.video_id || null,
    images: r.images ?? [],
    created_at: r.created_at || '',
  }))
}

export async function fetchSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .limit(LIMITS.settings)
  if (error || !data) return {}
  const out: Record<string, string> = {}
  data.forEach((row: any) => { out[row.key] = row.value })
  return out
}
