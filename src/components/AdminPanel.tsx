import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, uploadImage, extractVideoId } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Project } from './ProjectModal'

interface Props {
  onClose: () => void
  onSaved: () => void
}

const TYPES = ['Residential', 'Commercial', 'Cultural', 'Public', 'Mixed-Use', 'Hospitality']

const emptyForm = {
  title: '', location: '', year: new Date().getFullYear().toString(),
  category: 'Built' as 'Built' | 'Unbuilt',
  type: 'Residential', area: '', duration: '',
  youtubeUrl: '', description: '',
}

/* ── small sub-components ─────────────────────────────────────────── */

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

/* ── Project Form ─────────────────────────────────────────────────── */
function ProjectForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(emptyForm)
  const [thumb, setThumb] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [gallery, setGallery] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyForm, val: string) =>
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
        title: form.title,
        location: form.location,
        year: form.year,
        category: form.category,
        type: form.type,
        area: form.area || '—',
        duration: form.duration || '—',
        video_id: extractVideoId(form.youtubeUrl),
        img: imgUrl,
        description: form.description,
        gallery: galleryUrls,
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
      {/* Row 1 */}
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

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <Field label="Type">
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value as any)}>
            <option>Built</option>
            <option>Unbuilt</option>
          </select>
        </Field>
        <Field label="Area (e.g. 850 sqm)">
          <input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} />
        </Field>
        <Field label="Duration (e.g. 18 months)">
          <input style={inputStyle} value={form.duration} onChange={e => set('duration', e.target.value)} />
        </Field>
      </div>

      {/* YouTube */}
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

      {/* Description */}
      <Field label="Description">
        <textarea style={ta} value={form.description}
          onChange={e => set('description', e.target.value)} required />
      </Field>

      {/* Thumbnail */}
      <Field label="Thumbnail image *">
        <label style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid var(--border)', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', transition: 'border-color 0.2s' }}>
          Choose image
          <input type="file" accept="image/*" onChange={pickThumb} style={{ display: 'none' }} />
        </label>
        {thumbPreview && (
          <img src={thumbPreview} alt="thumb preview"
            style={{ marginTop: 10, height: 120, objectFit: 'cover', border: '1px solid var(--border)' }} />
        )}
      </Field>

      {/* Gallery */}
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
    await supabase.from('projects').delete().eq('id', p.id)
    onDelete(p.id)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {p.img && <img src={p.img} alt="" style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0 }} />}
        <div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{p.title}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {p.location} · {p.year} · {p.category} · {p.type}
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
  const [projects, setProjects] = useState<Project[]>([])
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Fetch existing projects
  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) {
      setProjects(data.map((r: any) => ({
        id: Number(r.id), title: r.title, location: r.location, year: r.year,
        category: r.category, type: r.type, img: r.img, description: r.description,
        area: r.area, duration: r.duration, videoId: r.video_id, gallery: r.gallery ?? [],
      })))
    }
    setLoading(false)
  }

  useEffect(() => { if (session) fetchProjects() }, [session])

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

  const handleSaved = () => {
    setAdding(false)
    fetchProjects()
    onSaved()
  }

  const handleDelete = (id: number) => {
    setProjects(ps => ps.filter(p => p.id !== id))
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
            Project <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Builder</em>
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
        ) : adding ? (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)', marginBottom: 32 }}>
              New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Project</em>
            </h2>
            <ProjectForm onSaved={handleSaved} onCancel={() => setAdding(false)} />
          </>
        ) : (
          <>
            {/* Add button */}
            <button onClick={() => setAdding(true)} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48,
              padding: '12px 28px', background: 'var(--gold)', border: 'none',
              fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'var(--bg)', cursor: 'none',
            }}>
              + Add New Project
            </button>

            {/* Project list */}
            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
              </p>
              {projects.length === 0 && !loading && (
                <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
                  No projects yet. Add your first one above.
                </p>
              )}
              {projects.map(p => (
                <ProjectRow key={p.id} p={p} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
