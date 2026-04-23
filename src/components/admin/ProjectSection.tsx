import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { supabase, uploadImage, deleteImages, extractVideoId } from '../../lib/supabase'
import { compressImage } from '../../lib/compress'
import { useObjectUrls } from '../../lib/useObjectUrls'
import type { Project } from '../ProjectModal'
import { Field, RowActions, VideoHint } from './shared'
import {
  inputStyle, textAreaStyle, primaryBtn, secondaryBtn, pickerBtn,
  xBtn, errorText, gridStyle, formStyle, actionsStyle, thumbnailPreview,
} from './styles'

const TYPES = ['Construction', 'Architecture', 'Interior']

interface FormProps {
  project?: Project
  onSaved: () => void
  onCancel: () => void
}

export function ProjectForm({ project, onSaved, onCancel }: FormProps) {
  const isEdit = !!project
  const urls = useObjectUrls()

  const [form, setForm] = useState({
    title: project?.title ?? '',
    location: project?.location ?? '',
    year: project?.year ?? new Date().getFullYear().toString(),
    type: project?.type ?? 'Construction',
    area: project?.area === '—' ? '' : (project?.area ?? ''),
    duration: project?.duration === '—' ? '' : (project?.duration ?? ''),
    youtubeUrl: project?.videoId ? `https://www.youtube.com/watch?v=${project.videoId}` : '',
    description: project?.description ?? '',
  })
  const [newThumb, setNewThumb] = useState<File | null>(null)
  const [newThumbPreview, setNewThumbPreview] = useState('')
  const [keptGallery, setKeptGallery] = useState<string[]>(project?.gallery ?? [])
  const [addedGallery, setAddedGallery] = useState<File[]>([])
  const [addedPreviews, setAddedPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const pickThumb = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setCompressing(true)
    const c = await compressImage(file)
    if (newThumbPreview) urls.revoke(newThumbPreview)
    setNewThumb(c); setNewThumbPreview(urls.create(c))
    setCompressing(false)
  }

  const pickGallery = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); if (!files.length) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setAddedGallery(prev => [...prev, ...compressed])
    setAddedPreviews(prev => [...prev, ...compressed.map(f => urls.create(f))])
    setCompressing(false)
  }

  const removeAdded = (i: number) => {
    urls.revoke(addedPreviews[i])
    setAddedGallery(p => p.filter((_, j) => j !== i))
    setAddedPreviews(p => p.filter((_, j) => j !== i))
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!isEdit && !newThumb) { setError('Please upload a thumbnail image.'); return }
    setSaving(true); setError('')
    try {
      let imgUrl = project?.img ?? ''
      if (newThumb) {
        imgUrl = await uploadImage(newThumb)
        if (isEdit && project?.img) await deleteImages([project.img])
      }

      if (isEdit) {
        const removed = (project?.gallery ?? []).filter(u => !keptGallery.includes(u))
        await deleteImages(removed)
      }

      const uploadedUrls = await Promise.all(addedGallery.map(uploadImage))
      const finalGallery = [...keptGallery, ...uploadedUrls]

      const payload = {
        title: form.title, location: form.location, year: form.year,
        type: form.type,
        area: form.area || '—', duration: form.duration || '—',
        video_id: extractVideoId(form.youtubeUrl),
        img: imgUrl, description: form.description, gallery: finalGallery,
      }

      const { error: dbErr } = isEdit && project
        ? await supabase.from('projects').update(payload).eq('id', project.id)
        : await supabase.from('projects').insert({ ...payload, category: 'Built' })

      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const videoId = extractVideoId(form.youtubeUrl)
  const busy = saving || compressing

  return (
    <form onSubmit={save} style={formStyle}>
      <div style={gridStyle}>
        <Field label="Title"><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required /></Field>
        <Field label="Location (city)"><input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} required /></Field>
        <Field label="Year"><input style={inputStyle} value={form.year} onChange={e => set('year', e.target.value)} required /></Field>
      </div>
      <div style={gridStyle}>
        <Field label="Type">
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Area (e.g. 850 sqm)"><input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} /></Field>
        <Field label="Duration (e.g. 18 months)"><input style={inputStyle} value={form.duration} onChange={e => set('duration', e.target.value)} /></Field>
      </div>
      <Field label="YouTube URL (optional)">
        <input style={inputStyle} value={form.youtubeUrl}
          onChange={e => set('youtubeUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..." />
        {form.youtubeUrl && videoId && <VideoHint url={videoId} />}
      </Field>

      <Field label="Description">
        <textarea style={textAreaStyle(100)} value={form.description}
          onChange={e => set('description', e.target.value)} required />
      </Field>

      <Field label={isEdit ? 'Thumbnail' : 'Thumbnail image *'}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          {(newThumbPreview || project?.img) && (
            <img src={newThumbPreview || project!.img} alt="thumbnail"
              style={{ height: 120, objectFit: 'cover', border: '1px solid var(--border)' }} />
          )}
          <label style={pickerBtn}>
            {isEdit ? 'Replace' : 'Choose image'}
            <input type="file" accept="image/*" onChange={pickThumb} style={{ display: 'none' }} />
          </label>
        </div>
      </Field>

      <Field label={isEdit ? 'Gallery' : 'Gallery images (optional, select multiple)'}>
        {(keptGallery.length > 0 || addedPreviews.length > 0) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {keptGallery.map(src => (
              <div key={src} style={{ position: 'relative' }}>
                <img src={src} alt="" loading="lazy" style={thumbnailPreview} />
                <button type="button" onClick={() => setKeptGallery(p => p.filter(u => u !== src))} style={xBtn}>×</button>
              </div>
            ))}
            {addedPreviews.map((src, i) => (
              <div key={`n${i}`} style={{ position: 'relative' }}>
                <img src={src} alt="" style={{ ...thumbnailPreview, borderColor: 'var(--gold)', opacity: 0.9 }} />
                <button type="button" onClick={() => removeAdded(i)} style={xBtn}>×</button>
              </div>
            ))}
          </div>
        )}
        <label style={pickerBtn}>
          {isEdit ? 'Add images' : 'Choose images'}
          <input type="file" accept="image/*" multiple onChange={pickGallery} style={{ display: 'none' }} />
        </label>
      </Field>

      {error && <p style={errorText}>{error}</p>}

      <div style={actionsStyle}>
        <button type="submit" disabled={busy} style={{ ...primaryBtn, cursor: busy ? 'default' : 'none', opacity: busy ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Project'}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  )
}

interface RowProps {
  p: Project
  onDelete: (id: number) => void
  onEdit: (p: Project) => void
}

export function ProjectRow({ p, onDelete, onEdit }: RowProps) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {p.img && <img src={p.img} alt="" loading="lazy" width={48} height={48} style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{p.title}</p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              {p.location} · {p.year} · {p.type}
            </p>
          </div>
        </div>
        <RowActions onEdit={() => onEdit(p)} onConfirmDelete={del} deleting={deleting} />
      </div>
      {error && <p style={{ ...errorText, marginTop: 6 }}>{error}</p>}
    </div>
  )
}
