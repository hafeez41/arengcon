import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase, uploadImage, deleteImages, extractVideoId } from '../lib/supabase'
import { compressImage } from '../lib/compress'
import type { Session } from '@supabase/supabase-js'
import type { Project } from './ProjectModal'

interface UpdateEntry {
  id: number
  title: string
  details: string
  video_id: string | null
  images: string[]
}

const emptyUpdateForm = { title: '', details: '', youtubeUrl: '' }

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

interface Reference {
  id: number
  name: string
  title: string
  project: string
  quote: string
}

const TYPES = ['Construction', 'Architecture', 'Interior']

const emptyProjectForm = {
  title: '', location: '', year: new Date().getFullYear().toString(),
  type: 'Construction', area: '', duration: '',
  youtubeUrl: '', description: '',
}

const emptyTeamForm = { name: '', role: '', bio: '' }

const emptyRefForm = { name: '', title: '', project: '', quote: '' }

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
type Tab = 'projects' | 'team' | 'references' | 'contact' | 'updates'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects',   label: 'Projects' },
    { id: 'team',       label: 'Team' },
    { id: 'references', label: 'References' },
    { id: 'contact',    label: 'Contact' },
    { id: 'updates',    label: 'Updates' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 40, flexWrap: 'wrap' }}>
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
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyProjectForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const pickThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    const compressed = await compressImage(file)
    setThumb(compressed)
    setThumbPreview(URL.createObjectURL(compressed))
    setCompressing(false)
  }

  const pickGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setGallery(prev => [...prev, ...compressed])
    setGalleryPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    setCompressing(false)
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
        <button type="submit" disabled={saving || compressing} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1,
        }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Project'}
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

/* ── Project Edit Form ────────────────────────────────────────────── */
function ProjectEditForm({ project, onSaved, onCancel }: { project: Project; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: project.title, location: project.location, year: project.year,
    type: project.type,
    area: project.area === '—' ? '' : project.area,
    duration: project.duration === '—' ? '' : project.duration,
    youtubeUrl: project.videoId ? `https://www.youtube.com/watch?v=${project.videoId}` : '',
    description: project.description,
  })
  const [newThumb, setNewThumb] = useState<File | null>(null)
  const [newThumbPreview, setNewThumbPreview] = useState('')
  const [keptGallery, setKeptGallery] = useState<string[]>(project.gallery ?? [])
  const [addedGallery, setAddedGallery] = useState<File[]>([])
  const [addedGalleryPreviews, setAddedGalleryPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const pickThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setCompressing(true)
    const c = await compressImage(file)
    setNewThumb(c); setNewThumbPreview(URL.createObjectURL(c))
    setCompressing(false)
  }

  const pickGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); if (!files.length) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setAddedGallery(prev => [...prev, ...compressed])
    setAddedGalleryPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    setCompressing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let imgUrl = project.img
      if (newThumb) { imgUrl = await uploadImage(newThumb); await deleteImages([project.img]) }
      const removedUrls = (project.gallery ?? []).filter(u => !keptGallery.includes(u))
      await deleteImages(removedUrls)
      const uploadedUrls = await Promise.all(addedGallery.map(uploadImage))
      const finalGallery = [...keptGallery, ...uploadedUrls]
      const { error: dbErr } = await supabase.from('projects').update({
        title: form.title, location: form.location, year: form.year, type: form.type,
        area: form.area || '—', duration: form.duration || '—',
        video_id: extractVideoId(form.youtubeUrl),
        img: imgUrl, description: form.description, gallery: finalGallery,
      }).eq('id', project.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) { setError(err.message ?? 'Something went wrong.'); setSaving(false) }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 100 }
  const btnStyle = { display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--muted)' }
  const xBtn: React.CSSProperties = { position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', width: 18, height: 18, cursor: 'none', fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Title"><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required /></Field>
        <Field label="Location (city)"><input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} required /></Field>
        <Field label="Year"><input style={inputStyle} value={form.year} onChange={e => set('year', e.target.value)} required /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Type"><select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Area"><input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} /></Field>
        <Field label="Duration"><input style={inputStyle} value={form.duration} onChange={e => set('duration', e.target.value)} /></Field>
      </div>
      <Field label="YouTube URL (optional)">
        <input style={inputStyle} value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        {form.youtubeUrl && extractVideoId(form.youtubeUrl) && <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>✓ Video ID: {extractVideoId(form.youtubeUrl)}</p>}
      </Field>
      <Field label="Description"><textarea style={ta} value={form.description} onChange={e => set('description', e.target.value)} required /></Field>
      <Field label="Thumbnail">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <img src={newThumbPreview || project.img} alt="" style={{ height: 100, objectFit: 'cover', border: '1px solid var(--border)' }} />
          <label style={btnStyle}>Replace<input type="file" accept="image/*" onChange={pickThumb} style={{ display: 'none' }} /></label>
        </div>
      </Field>
      <Field label="Gallery">
        {(keptGallery.length > 0 || addedGalleryPreviews.length > 0) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {keptGallery.map(src => (
              <div key={src} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--border)' }} />
                <button type="button" onClick={() => setKeptGallery(p => p.filter(u => u !== src))} style={xBtn}>×</button>
              </div>
            ))}
            {addedGalleryPreviews.map((src, i) => (
              <div key={`n${i}`} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--gold)', opacity: 0.9 }} />
                <button type="button" onClick={() => { setAddedGallery(p => p.filter((_, j) => j !== i)); setAddedGalleryPreviews(p => p.filter((_, j) => j !== i)) }} style={xBtn}>×</button>
              </div>
            ))}
          </div>
        )}
        <label style={btnStyle}>Add images<input type="file" accept="image/*" multiple onChange={pickGallery} style={{ display: 'none' }} /></label>
      </Field>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving || compressing} style={{ padding: '12px 32px', background: 'var(--gold)', border: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bg)', cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>Cancel</button>
      </div>
    </form>
  )
}

/* ── Project Row ──────────────────────────────────────────────────── */
function ProjectRow({ p, onDelete, onEdit }: { p: Project; onDelete: (id: number) => void; onEdit: (p: Project) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setDeleting(true); setError('')
    await deleteImages([p.img, ...(p.gallery ?? [])])
    const { error: dbErr } = await supabase.from('projects').delete().eq('id', p.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    onDelete(p.id)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
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
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onEdit(p)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Edit
            </button>
            <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Delete
            </button>
          </div>
        )}
      </div>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Team Form ────────────────────────────────────────────────────── */
function TeamForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyTeamForm)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyTeamForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    const compressed = await compressImage(file)
    setPhoto(compressed)
    setPhotoPreview(URL.createObjectURL(compressed))
    setCompressing(false)
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
        <button type="submit" disabled={saving || compressing} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1,
        }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Member'}
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

/* ── Team Edit Form ───────────────────────────────────────────────── */
function TeamEditForm({ member, onSaved, onCancel }: { member: TeamMember; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: member.name, role: member.role, bio: member.bio })
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setCompressing(true)
    const c = await compressImage(file)
    setNewPhoto(c); setNewPhotoPreview(URL.createObjectURL(c))
    setCompressing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let imageUrl = member.image
      if (newPhoto) {
        imageUrl = await uploadImage(newPhoto)
        if (member.image && member.image !== '/avatar-default.svg') await deleteImages([member.image])
      }
      const { error: dbErr } = await supabase.from('team').update({
        name: form.name, role: form.role, bio: form.bio, image: imageUrl,
      }).eq('id', member.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) { setError(err.message ?? 'Something went wrong.'); setSaving(false) }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90 }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Full name"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
        <Field label="Role / title"><input style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)} required /></Field>
      </div>
      <Field label="Bio"><textarea style={ta} value={form.bio} onChange={e => set('bio', e.target.value)} required /></Field>
      <Field label="Photo">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <img src={newPhotoPreview || member.image || '/avatar-default.svg'} alt=""
            style={{ height: 80, width: 80, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }} />
          <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Replace<input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
          </label>
        </div>
      </Field>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving || compressing} style={{ padding: '12px 32px', background: 'var(--gold)', border: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bg)', cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>Cancel</button>
      </div>
    </form>
  )
}

/* ── Team Row ─────────────────────────────────────────────────────── */
function TeamRow({ m, onDelete, onEdit }: { m: TeamMember; onDelete: (id: number) => void; onEdit: (m: TeamMember) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setDeleting(true); setError('')
    if (m.image && m.image !== '/avatar-default.svg') {
      await deleteImages([m.image])
    }
    const { error: dbErr } = await supabase.from('team').delete().eq('id', m.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    onDelete(m.id)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
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
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onEdit(m)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Edit
            </button>
            <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Delete
            </button>
          </div>
        )}
      </div>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Ref Form ─────────────────────────────────────────────────────── */
function RefForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyRefForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyRefForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const { error: dbErr } = await supabase.from('client_references').insert({
        name: form.name,
        title: form.title || null,
        project: form.project || null,
        quote: form.quote || null,
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
        <Field label="Name *">
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
        </Field>
        <Field label="Title / Company">
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Managing Director or Acme Ltd" />
        </Field>
      </div>

      <Field label="Project">
        <input style={inputStyle} value={form.project} onChange={e => set('project', e.target.value)}
          placeholder="e.g. Lekki Tower" />
      </Field>

      <Field label="Quote">
        <textarea style={ta} value={form.quote} onChange={e => set('quote', e.target.value)}
          placeholder="Leave blank if no testimonial quote" />
      </Field>

      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Save Reference'}
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

/* ── Ref Edit Form ────────────────────────────────────────────────── */
function RefEditForm({ ref: r, onSaved, onCancel }: { ref: Reference; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: r.name, title: r.title, project: r.project, quote: r.quote })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const { error: dbErr } = await supabase.from('client_references').update({
        name: form.name, title: form.title || null, project: form.project || null, quote: form.quote || null,
      }).eq('id', r.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) { setError(err.message ?? 'Something went wrong.'); setSaving(false) }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90 }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Name *"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
        <Field label="Title / Company"><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Managing Director" /></Field>
      </div>
      <Field label="Project"><input style={inputStyle} value={form.project} onChange={e => set('project', e.target.value)} placeholder="e.g. Lekki Tower" /></Field>
      <Field label="Quote"><textarea style={ta} value={form.quote} onChange={e => set('quote', e.target.value)} /></Field>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{ padding: '12px 32px', background: 'var(--gold)', border: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bg)', cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>Cancel</button>
      </div>
    </form>
  )
}

/* ── Ref Row ──────────────────────────────────────────────────────── */
function RefRow({ r, onDelete, onEdit }: { r: Reference; onDelete: (id: number) => void; onEdit: (r: Reference) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setDeleting(true); setError('')
    const { error: dbErr } = await supabase.from('client_references').delete().eq('id', r.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    onDelete(r.id)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{r.name}</p>
          {r.title && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 2 }}>
              {r.title}
            </p>
          )}
          {r.project && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              {r.project}
            </p>
          )}
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
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onEdit(r)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Edit
            </button>
            <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Delete
            </button>
          </div>
        )}
      </div>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Update Form ─────────────────────────────────────────────────── */
function UpdateForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyUpdateForm)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyUpdateForm, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const pickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError('')
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setImages(prev => [...prev, ...compressed].slice(0, 3))
    setImagePreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))].slice(0, 3))
    setCompressing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const imageUrls = await Promise.all(images.map(uploadImage))
      const { error: dbErr } = await supabase.from('updates').insert({
        title: form.title,
        details: form.details,
        video_id: extractVideoId(form.youtubeUrl) || null,
        images: imageUrls,
      })
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 120 }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Title *">
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
      </Field>

      <Field label="Details *">
        <textarea style={ta} value={form.details} onChange={e => set('details', e.target.value)} required />
      </Field>

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

      <Field label="Images (up to 3)">
        <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Choose images
          <input type="file" accept="image/*" multiple onChange={pickImages} style={{ display: 'none' }} />
        </label>
        {imagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {imagePreviews.map((src, i) => (
              <img key={i} src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--border)' }} />
            ))}
          </div>
        )}
      </Field>

      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving || compressing} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1,
        }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Update'}
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

/* ── Update Edit Form ─────────────────────────────────────────────── */
function UpdateEditForm({ update, onSaved, onCancel }: { update: UpdateEntry; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: update.title,
    details: update.details,
    youtubeUrl: update.video_id ? `https://www.youtube.com/watch?v=${update.video_id}` : '',
  })
  const [keptImages, setKeptImages] = useState<string[]>(update.images ?? [])
  const [addedImages, setAddedImages] = useState<File[]>([])
  const [addedImagePreviews, setAddedImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const pickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const available = 3 - keptImages.length - addedImages.length
    if (available <= 0) return
    const files = Array.from(e.target.files ?? []).slice(0, available); if (!files.length) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setAddedImages(prev => [...prev, ...compressed])
    setAddedImagePreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    setCompressing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const removedUrls = (update.images ?? []).filter(u => !keptImages.includes(u))
      await deleteImages(removedUrls)
      const uploadedUrls = await Promise.all(addedImages.map(uploadImage))
      const finalImages = [...keptImages, ...uploadedUrls]
      const { error: dbErr } = await supabase.from('updates').update({
        title: form.title, details: form.details,
        video_id: extractVideoId(form.youtubeUrl) || null,
        images: finalImages,
      }).eq('id', update.id)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) { setError(err.message ?? 'Something went wrong.'); setSaving(false) }
  }

  const ta: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 120 }
  const btnStyle = { display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--muted)' }
  const xBtn: React.CSSProperties = { position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', width: 18, height: 18, cursor: 'none', fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const totalImages = keptImages.length + addedImages.length

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Title *"><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required /></Field>
      <Field label="Details *"><textarea style={ta} value={form.details} onChange={e => set('details', e.target.value)} required /></Field>
      <Field label="YouTube URL (optional)">
        <input style={inputStyle} value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        {form.youtubeUrl && extractVideoId(form.youtubeUrl) && <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>✓ Video ID: {extractVideoId(form.youtubeUrl)}</p>}
      </Field>
      <Field label={`Images (${totalImages}/3)`}>
        {(keptImages.length > 0 || addedImagePreviews.length > 0) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {keptImages.map(src => (
              <div key={src} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--border)' }} />
                <button type="button" onClick={() => setKeptImages(p => p.filter(u => u !== src))} style={xBtn}>×</button>
              </div>
            ))}
            {addedImagePreviews.map((src, i) => (
              <div key={`n${i}`} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ height: 72, width: 72, objectFit: 'cover', border: '1px solid var(--gold)', opacity: 0.9 }} />
                <button type="button" onClick={() => { setAddedImages(p => p.filter((_, j) => j !== i)); setAddedImagePreviews(p => p.filter((_, j) => j !== i)) }} style={xBtn}>×</button>
              </div>
            ))}
          </div>
        )}
        {totalImages < 3 && (
          <label style={btnStyle}>Add images<input type="file" accept="image/*" multiple onChange={pickImages} style={{ display: 'none' }} /></label>
        )}
      </Field>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving || compressing} style={{ padding: '12px 32px', background: 'var(--gold)', border: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--bg)', cursor: (saving || compressing) ? 'default' : 'none', opacity: (saving || compressing) ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>Cancel</button>
      </div>
    </form>
  )
}

/* ── Update Row ───────────────────────────────────────────────────── */
function UpdateRow({ u, onDelete, onEdit }: { u: UpdateEntry; onDelete: (id: number) => void; onEdit: (u: UpdateEntry) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setDeleting(true); setError('')
    await deleteImages(u.images ?? [])
    const { error: dbErr } = await supabase.from('updates').delete().eq('id', u.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    onDelete(u.id)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{u.title}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
            {u.details}
          </p>
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
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onEdit(u)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Edit
            </button>
            <button onClick={() => setConfirming(true)} style={{ padding: '6px 14px', background: 'none', border: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'none' }}>
              Delete
            </button>
          </div>
        )}
      </div>
      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a', marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Contact Form ─────────────────────────────────────────────────── */
function ContactForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    email1: '', email2: '', phone: '',
    location: '', hours: '', instagram: '', linkedin: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (!data) return
      setForm(prev => {
        const next = { ...prev }
        data.forEach((row: { key: string; value: string }) => {
          if (row.key in next) (next as any)[row.key] = row.value
        })
        return next
      })
    })
  }, [])

  const set = (key: keyof typeof form, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      const rows = Object.entries(form).map(([key, value]) => ({ key, value }))
      const { error: dbErr } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })
      if (dbErr) throw dbErr
      setSuccess(true)
      onSaved()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Email 1">
          <input style={inputStyle} value={form.email1} onChange={e => set('email1', e.target.value)} placeholder="info@example.com" />
        </Field>
        <Field label="Email 2">
          <input style={inputStyle} value={form.email2} onChange={e => set('email2', e.target.value)} placeholder="projects@example.com" />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Phone">
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 000 000 0000" />
        </Field>
        <Field label="Location">
          <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Lagos, Nigeria" />
        </Field>
      </div>

      <Field label="Hours">
        <input style={inputStyle} value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="Mon – Fri, 9am – 6pm" />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Instagram URL">
          <input style={inputStyle} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="LinkedIn URL">
          <input style={inputStyle} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
        </Field>
      </div>

      {error && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a' }}>{error}</p>}
      {success && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--gold)' }}>Settings saved.</p>}

      <div style={{ paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{
          padding: '12px 32px', background: 'var(--gold)', border: 'none',
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--bg)',
          cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
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

  // References state
  const [refs, setRefs] = useState<Reference[]>([])
  const [addingRef, setAddingRef] = useState(false)
  const [loadingRefs, setLoadingRefs] = useState(true)

  // Updates state
  const [updates, setUpdates] = useState<UpdateEntry[]>([])
  const [addingUpdate, setAddingUpdate] = useState(false)
  const [loadingUpdates, setLoadingUpdates] = useState(true)

  // Edit state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingRef, setEditingRef] = useState<Reference | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<UpdateEntry | null>(null)

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

  // Fetch references
  const fetchRefs = async () => {
    setLoadingRefs(true)
    const { data } = await supabase.from('client_references').select('*').order('created_at', { ascending: true })
    if (data) setRefs(data.map((r: any) => ({ id: r.id, name: r.name, title: r.title || '', project: r.project || '', quote: r.quote || '' })))
    setLoadingRefs(false)
  }

  // Fetch updates
  const fetchUpdates = async () => {
    setLoadingUpdates(true)
    const { data } = await supabase.from('updates').select('*').order('created_at', { ascending: false })
    if (data) setUpdates(data.map((r: any) => ({ id: r.id, title: r.title, details: r.details || '', video_id: r.video_id || null, images: r.images ?? [] })))
    setLoadingUpdates(false)
  }

  useEffect(() => {
    if (session) { fetchProjects(); fetchMembers(); fetchRefs(); fetchUpdates() }
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
    setEditingProject(null)
    fetchProjects()
    onSaved()
  }

  const handleProjectDelete = (id: number) => {
    setProjects(ps => ps.filter(p => p.id !== id))
    onSaved()
  }

  const handleMemberSaved = () => {
    setAddingMember(false)
    setEditingMember(null)
    fetchMembers()
    onSaved()
  }

  const handleMemberDelete = (id: number) => {
    setMembers(ms => ms.filter(m => m.id !== id))
    onSaved()
  }

  const handleRefSaved = () => {
    setAddingRef(false)
    setEditingRef(null)
    fetchRefs()
    onSaved()
  }

  const handleRefDelete = (id: number) => {
    setRefs(rs => rs.filter(r => r.id !== id))
    onSaved()
  }

  const handleUpdateSaved = () => {
    setAddingUpdate(false)
    setEditingUpdate(null)
    fetchUpdates()
    onSaved()
  }

  const handleUpdateDelete = (id: number) => {
    setUpdates(us => us.filter(u => u.id !== id))
    onSaved()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const atRefLimit = refs.length >= 6

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
              setAddingRef(false)
              setAddingUpdate(false)
              setEditingProject(null)
              setEditingMember(null)
              setEditingRef(null)
              setEditingUpdate(null)
            }} />

            {/* ── PROJECTS TAB ── */}
            {activeTab === 'projects' && (
              editingProject ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    Edit <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Project</em>
                  </h2>
                  <ProjectEditForm project={editingProject} onSaved={handleProjectSaved} onCancel={() => setEditingProject(null)} />
                </>
              ) : addingProject ? (
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
                      <ProjectRow key={p.id} p={p} onDelete={handleProjectDelete} onEdit={setEditingProject} />
                    ))}
                  </div>
                </>
              )
            )}

            {/* ── TEAM TAB ── */}
            {activeTab === 'team' && (
              editingMember ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    Edit <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Member</em>
                  </h2>
                  <TeamEditForm member={editingMember} onSaved={handleMemberSaved} onCancel={() => setEditingMember(null)} />
                </>
              ) : addingMember ? (
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
                      <TeamRow key={m.id} m={m} onDelete={handleMemberDelete} onEdit={setEditingMember} />
                    ))}
                  </div>
                </>
              )
            )}

            {/* ── REFERENCES TAB ── */}
            {activeTab === 'references' && (
              editingRef ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    Edit <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Reference</em>
                  </h2>
                  <RefEditForm ref={editingRef} onSaved={handleRefSaved} onCancel={() => setEditingRef(null)} />
                </>
              ) : addingRef ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Reference</em>
                  </h2>
                  <RefForm onSaved={handleRefSaved} onCancel={() => setAddingRef(false)} />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                    <button
                      onClick={() => { if (!atRefLimit) setAddingRef(true) }}
                      disabled={atRefLimit}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 28px', background: 'var(--gold)', border: 'none',
                        fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                        textTransform: 'uppercase', color: 'var(--bg)',
                        cursor: atRefLimit ? 'default' : 'none',
                        opacity: atRefLimit ? 0.5 : 1,
                      }}
                    >
                      + Add New Reference
                    </button>
                    {atRefLimit && (
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                        (max 6)
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                      {loadingRefs ? 'Loading…' : `${refs.length} reference${refs.length !== 1 ? 's' : ''}`}
                    </p>
                    {refs.length === 0 && !loadingRefs && (
                      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
                        No references yet. Add your first one above.
                      </p>
                    )}
                    {refs.map(r => (
                      <RefRow key={r.id} r={r} onDelete={handleRefDelete} onEdit={setEditingRef} />
                    ))}
                  </div>
                </>
              )
            )}

            {/* ── CONTACT TAB ── */}
            {activeTab === 'contact' && (
              <>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                  Site <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Settings</em>
                </h2>
                <ContactForm onSaved={onSaved} />
              </>
            )}

            {/* ── UPDATES TAB ── */}
            {activeTab === 'updates' && (
              editingUpdate ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    Edit <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Update</em>
                  </h2>
                  <UpdateEditForm update={editingUpdate} onSaved={handleUpdateSaved} onCancel={() => setEditingUpdate(null)} />
                </>
              ) : addingUpdate ? (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
                    New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Update</em>
                  </h2>
                  <UpdateForm onSaved={handleUpdateSaved} onCancel={() => setAddingUpdate(false)} />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                    <button
                      onClick={() => { if (updates.length < 10) setAddingUpdate(true) }}
                      disabled={updates.length >= 10}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 28px', background: 'var(--gold)', border: 'none',
                        fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                        textTransform: 'uppercase', color: 'var(--bg)',
                        cursor: updates.length >= 10 ? 'default' : 'none',
                        opacity: updates.length >= 10 ? 0.5 : 1,
                      }}
                    >
                      + Add New Update
                    </button>
                    {updates.length >= 10 && (
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                        (max 10)
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                      {loadingUpdates ? 'Loading…' : `${updates.length} update${updates.length !== 1 ? 's' : ''}`}
                    </p>
                    {updates.length === 0 && !loadingUpdates && (
                      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
                        No updates yet. Add your first one above.
                      </p>
                    )}
                    {updates.map(u => (
                      <UpdateRow key={u.id} u={u} onDelete={handleUpdateDelete} onEdit={setEditingUpdate} />
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
