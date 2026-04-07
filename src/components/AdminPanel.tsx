import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase, uploadImage, extractVideoId } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Project } from './ProjectModal'

interface Props {
  onClose: () => void
  onSaved: () => void
}

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
}

const TYPES = ['Construction', 'Architecture', 'Interior']

const emptyProjectForm = {
  title: '', location: '', year: new Date().getFullYear().toString(),
  type: 'Construction', area: '', duration: '',
  youtubeUrl: '', description: '',
}

const emptyTeamForm = { name: '', role: '', bio: '' }

/* ── shared helpers ───────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)',
  background: 'var(--surface)', border: '1px solid var(--border)',
  padding: '10px 14px', outline: 'none', width: '100%',
  transition: 'border-color 0.2s',
}

/* ── Login ────────────────────────────────────────────────────────── */
function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) onLogin(data.session)
  }

  return (
    <div style={{ maxWidth: 380, margin: '0 auto', paddingTop: 80 }}>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Admin Access</p>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 40 }}>
        Sign <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>in</em>
      </h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle} placeholder="admin@email.com" required />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle} placeholder="••••••••" required />
        </Field>
        {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          marginTop: 8, padding: '12px 24px', background: 'var(--gold)',
          border: 'none', fontFamily: 'var(--sans)', fontSize: 10,
          letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bg)',
          cursor: loading ? 'default' : 'none', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

/* ── Tab bar ──────────────────────────────────────────────────────── */
type Tab = 'projects' | 'team'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'team',     label: 'Team' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '9px 22px', cursor: 'none',
            fontFamily: 'var(--sans)', fontSize: 10,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            border: '1px solid',
            borderColor: active === t.id ? 'var(--gold)' : 'var(--border)',
            background: active === t.id ? 'var(--gold)' : 'transparent',
            color: active === t.id ? 'var(--bg)' : 'var(--muted)',
            transition: 'all 0.2s',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ── Project Form ─────────────────────────────────────────────────── */
function ProjectForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyProjectForm)
  const [thumb, setThumb] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [gallery, setGallery] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyProjectForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const pickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumb(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  const pickGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setGallery(files)
    setGalleryPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thumb) { setError('Please upload a thumbnail image.'); return }
    setSaving(true); setError('')
    try {
      const imgUrl = await uploadImage(thumb)
      const galleryUrls = await Promise.all(gallery.map(uploadImage))

      const { error: dbErr } = await supabase.from('projects').insert({
        title: form.title, location: form.location, year: form.year,
        category: 'Built', type: form.type,
        area: form.area || '—', duration: form.duration || '—',
        video_id: extractVideoId(form.youtubeUrl),
        img: imgUrl, description: form.description, gallery: galleryUrls,
      })
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 100 }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Title">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
        </Field>
        <Field label="Location (city)">
          <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} required />
        </Field>
        <Field label="Year">
          <input style={inputStyle} value={form.year} onChange={e => set('year', e.target.value)} required />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Type">
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Area (e.g. 850 sqm)">
          <input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} />
        </Field>
        <Field label="Duration (e.g. 18 months)">
          <input style={inputStyle} value={form.duration} onChange={e => set('duration', e.target.value)} />
        </Field>
      </div>

      <Field label="YouTube URL (optional)">
        <input style={inputStyle} value={form.youtubeUrl}
          onChange={e => set('youtubeUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..." />
        {form.youtubeUrl && extractVideoId(form.youtubeUrl) && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>
            ✓ Video ID: {extractVideoId(form.youtubeUrl)}
          </p>
        )}
      </Field>

      <Field label="Description">
        <textarea style={ta} value={form.description}
          onChange={e => set('description', e.target.value)} required />
      </Field>

      <Field label="Thumbnail image *">
        <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Choose image
          <input type="file" accept="image/*" onChange={pickThumb} style={{ display: 'none' }} />
        </label>
        {thumbPreview && (
          <img src={thumbPreview} alt="thumb preview"
            style={{ marginTop: 10, height: 120, objectFit: 'cover', border: '1px solid var(--border)' }} />
        )}
      </Field>

      <Field label="Gallery images (optional, select multiple)">
        <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Choose images
          <input type="file" accept="image/*" multiple onChange={pickGallery} style={{ display: 'none' }} />
        </label>
        {galleryPreviews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {galleryPreviews.map((src, i) => (
              <img key={i} src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--border)' }} />
            ))}
          </div>
        )}
      </Field>

      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Save Project'}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: '12px 24px', background: 'none',
          border: '1px solid var(--border)', fontFamily: 'var(--sans)',
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'var(--muted)', cursor: 'none',
        }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Project Row ──────────────────────────────────────────────────── */
function ProjectRow({ p, onDelete }: { p: Project; onDelete: (id: number) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const del = async () => {
    setDeleting(true)
    // Delete images from storage
    const toRemove = [p.img, ...(p.gallery ?? [])].filter(Boolean).map(url => {
      const parts = url.split('/project-images/')
      return parts.length > 1 ? parts[1] : null
    }).filter(Boolean) as string[]
    if (toRemove.length > 0) {
      await supabase.storage.from('project-images').remove(toRemove)
    }
    await supabase.from('projects').delete().eq('id', p.id)
    onDelete(p.id)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {p.img && <img src={p.img} alt="" style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0 }} />}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{p.title}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {p.location} · {p.year} · {p.type}
          </p>
        </div>
      </div>
      {confirming ? (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={del} disabled={deleting} style={{ padding: '6px 14px', background: '#e05a5a', border: 'none', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', cursor: 'none' }}>
            {deleting ? '…' : 'Confirm'}
          </button>
          <button onClick={() => setConfirming(false)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none', flexShrink: 0 }}>
          Delete
        </button>
      )}
    </div>
  )
}

/* ── Team Form ────────────────────────────────────────────────────── */
function TeamForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyTeamForm)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyTeamForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      let imageUrl = '/avatar-default.svg'
      if (photo) imageUrl = await uploadImage(photo)

      const { error: dbErr } = await supabase.from('team').insert({
        name: form.name,
        role: form.role,
        bio: form.bio,
        image: imageUrl,
      })
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90 }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Full name">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
        </Field>
        <Field label="Role / title">
          <input style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)} required />
        </Field>
      </div>

      <Field label="Bio">
        <textarea style={ta} value={form.bio}
          onChange={e => set('bio', e.target.value)} required />
      </Field>

      <Field label="Photo (optional — uses placeholder if omitted)">
        <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Choose photo
          <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        </label>
        {photoPreview ? (
          <img src={photoPreview} alt="preview"
            style={{ marginTop: 10, height: 80, width: 80, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }} />
        ) : (
          <img src="/avatar-default.svg" alt="default"
            style={{ marginTop: 10, height: 80, width: 80, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)', opacity: 0.4 }} />
        )}
      </Field>

      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Save Member'}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: '12px 24px', background: 'none',
          border: '1px solid var(--border)', fontFamily: 'var(--sans)',
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'var(--muted)', cursor: 'none',
        }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Team Row ─────────────────────────────────────────────────────── */
function TeamRow({ m, onDelete }: { m: TeamMember; onDelete: (id: number) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const del = async () => {
    setDeleting(true)
    // Delete photo from storage (skip default placeholder)
    if (m.image && m.image !== '/avatar-default.svg' && m.image.includes('/project-images/')) {
      const path = m.image.split('/project-images/')[1]
      if (path) await supabase.storage.from('project-images').remove([path])
    }
    await supabase.from('team').delete().eq('id', m.id)
    onDelete(m.id)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <img
          src={m.image || '/avatar-default.svg'}
          alt={m.name}
          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%', flexShrink: 0, border: '1px solid var(--border)' }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{m.name}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {m.role}
          </p>
        </div>
      </div>
      {confirming ? (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={del} disabled={deleting} style={{ padding: '6px 14px', background: '#e05a5a', border: 'none', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', cursor: 'none' }}>
            {deleting ? '…' : 'Confirm'}
          </button>
          <button onClick={() => setConfirming(false)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none', flexShrink: 0 }}>
          Delete
        </button>
      )}
    </div>
  )
}

/* ── Main AdminPanel ──────────────────────────────────────────────── */
export default function AdminPanel({ onClose, onSaved }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [addingProject, setAddingProject] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Team state
  const [members, setMembers] = useState<TeamMember[]>([])
  const [addingMember, setAddingMember] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(true)

  const panelRef = useRef<HTMLDivElement>(null)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Fetch projects
  const fetchProjects = async () => {
    setLoadingProjects(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) {
      setProjects(data.map((r: any) => ({
        id: Number(r.id), title: r.title, location: r.location, year: r.year,
        category: r.category, type: r.type, img: r.img, description: r.description,
        area: r.area, duration: r.duration, videoId: r.video_id, gallery: r.gallery ?? [],
      })))
    }
    setLoadingProjects(false)
  }

  // Fetch team
  const fetchMembers = async () => {
    setLoadingMembers(true)
    const { data } = await supabase.from('team').select('*').order('created_at', { ascending: true })
    if (data) {
      setMembers(data.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        role: r.role,
        bio: r.bio,
        image: r.image || '/avatar-default.svg',
      })))
    }
    setLoadingMembers(false)
  }

  useEffect(() => {
    if (session) { fetchProjects(); fetchMembers() }
  }, [session])

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleProjectSaved = () => {
    setAddingProject(false)
    fetchProjects()
    onSaved()
  }

  const handleProjectDelete = (id: number) => {
    setProjects(ps => ps.filter(p => p.id !== id))
    onSaved()
  }

  const handleMemberSaved = () => {
    setAddingMember(false)
    fetchMembers()
    onSaved()
  }

  const handleMemberDelete = (id: number) => {
    setMembers(ms => ms.filter(m => m.id !== id))
    onSaved()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'var(--bg)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '16px clamp(24px, 5vw, 80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 300, color: 'var(--text)' }}>
            Content <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Manager</em>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {session && (
            <button onClick={logout} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Logout
            </button>
          )}
          <button onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
            × Close
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={panelRef} style={{ flex: 1, padding: 'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 80px)', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        {!session ? (
          <Login onLogin={setSession} />
        ) : (
          <>
            <TabBar active={activeTab} onChange={tab => {
              setActiveTab(tab)
              setAddingProject(false)
              setAddingMember(false)
            }} />

            {/* ── PROJECTS TAB ── */}
            {activeTab === 'projects' && (
              addingProject ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Project</em>
                  </h2>
                  <ProjectForm onSaved={handleProjectSaved} onCancel={() => setAddingProject(false)} />
                </>
              ) : (
                <>
                  <button onClick={() => setAddingProject(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40,
                    padding: '12px 28px', background: 'var(--gold)', border: 'none',
                    fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                    textTransform: 'uppercase', color: 'var(--bg)', cursor: 'none',
                  }}>
                    + Add New Project
                  </button>
                  <div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                      {loadingProjects ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                    </p>
                    {projects.length === 0 && !loadingProjects && (
                      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
                        No projects yet. Add your first one above.
                      </p>
                    )}
                    {projects.map(p => (
                      <ProjectRow key={p.id} p={p} onDelete={handleProjectDelete} />
                    ))}
                  </div>
                </>
              )
            )}

            {/* ── TEAM TAB ── */}
            {activeTab === 'team' && (
              addingMember ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Member</em>
                  </h2>
                  <TeamForm onSaved={handleMemberSaved} onCancel={() => setAddingMember(false)} />
                </>
              ) : (
                <>
                  <button onClick={() => setAddingMember(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40,
                    padding: '12px 28px', background: 'var(--gold)', border: 'none',
                    fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                    textTransform: 'uppercase', color: 'var(--bg)', cursor: 'none',
                  }}>
                    + Add Team Member
                  </button>
                  <div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                      {loadingMembers ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
                    </p>
                    {members.length === 0 && !loadingMembers && (
                      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
                        No team members yet. Add your first one above.
                      </p>
                    )}
                    {members.map(m => (
                      <TeamRow key={m.id} m={m} onDelete={handleMemberDelete} />
                    ))}
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
