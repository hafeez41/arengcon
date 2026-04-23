import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { supabase, uploadImage, deleteImages, extractVideoId } from '../../lib/supabase'
import { compressImage } from '../../lib/compress'
import { useObjectUrls } from '../../lib/useObjectUrls'
import type { UpdateEntry } from './types'
import { Field, RowActions, VideoHint } from './shared'
import {
  inputStyle, textAreaStyle, primaryBtn, secondaryBtn, pickerBtn,
  xBtn, errorText, formStyle, actionsStyle, thumbnailPreview,
} from './styles'

const MAX_IMAGES = 3

interface FormProps {
  update?: UpdateEntry
  onSaved: () => void
  onCancel: () => void
}

export function UpdateForm({ update, onSaved, onCancel }: FormProps) {
  const isEdit = !!update
  const urls = useObjectUrls()

  const [form, setForm] = useState({
    title: update?.title ?? '',
    details: update?.details ?? '',
    youtubeUrl: update?.video_id ? `https://www.youtube.com/watch?v=${update.video_id}` : '',
  })
  const [keptImages, setKeptImages] = useState<string[]>(update?.images ?? [])
  const [addedImages, setAddedImages] = useState<File[]>([])
  const [addedPreviews, setAddedPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const totalImages = keptImages.length + addedImages.length

  const pickImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const available = MAX_IMAGES - totalImages
    if (available <= 0) return
    const files = Array.from(e.target.files ?? []).slice(0, available); if (!files.length) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setAddedImages(prev => [...prev, ...compressed])
    setAddedPreviews(prev => [...prev, ...compressed.map(f => urls.create(f))])
    setCompressing(false)
  }

  const removeAdded = (i: number) => {
    urls.revoke(addedPreviews[i])
    setAddedImages(p => p.filter((_, j) => j !== i))
    setAddedPreviews(p => p.filter((_, j) => j !== i))
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (isEdit && update) {
        const removed = (update.images ?? []).filter(u => !keptImages.includes(u))
        await deleteImages(removed)
      }

      const uploadedUrls = await Promise.all(addedImages.map(uploadImage))
      const finalImages = [...keptImages, ...uploadedUrls]

      const payload = {
        title: form.title,
        details: form.details,
        video_id: extractVideoId(form.youtubeUrl) || null,
        images: finalImages,
      }

      const { error: dbErr } = isEdit && update
        ? await supabase.from('updates').update(payload).eq('id', update.id)
        : await supabase.from('updates').insert(payload)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const videoId = extractVideoId(form.youtubeUrl)
  const busy = saving || compressing
  const imageLabel = isEdit ? `Images (${totalImages}/${MAX_IMAGES})` : `Images (up to ${MAX_IMAGES})`

  return (
    <form onSubmit={save} style={formStyle}>
      <Field label="Title *">
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required />
      </Field>
      <Field label="Details *">
        <textarea style={textAreaStyle(120)} value={form.details}
          onChange={e => set('details', e.target.value)} required />
      </Field>
      <Field label="YouTube URL (optional)">
        <input style={inputStyle} value={form.youtubeUrl}
          onChange={e => set('youtubeUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..." />
        {form.youtubeUrl && videoId && <VideoHint url={videoId} />}
      </Field>

      <Field label={imageLabel}>
        {(keptImages.length > 0 || addedPreviews.length > 0) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {keptImages.map(src => (
              <div key={src} style={{ position: 'relative' }}>
                <img src={src} alt="" loading="lazy" style={thumbnailPreview} />
                <button type="button" onClick={() => setKeptImages(p => p.filter(u => u !== src))} style={xBtn}>×</button>
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
        {totalImages < MAX_IMAGES && (
          <label style={pickerBtn}>
            {isEdit ? 'Add images' : 'Choose images'}
            <input type="file" accept="image/*" multiple onChange={pickImages} style={{ display: 'none' }} />
          </label>
        )}
      </Field>

      {error && <p style={errorText}>{error}</p>}
      <div style={actionsStyle}>
        <button type="submit" disabled={busy} style={{ ...primaryBtn, cursor: busy ? 'default' : 'none', opacity: busy ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Update'}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  )
}

interface RowProps {
  u: UpdateEntry
  onDelete: (id: number) => void
  onEdit: (u: UpdateEntry) => void
}

export function UpdateRow({ u, onDelete, onEdit }: RowProps) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{u.title}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
            {u.details}
          </p>
        </div>
        <RowActions onEdit={() => onEdit(u)} onConfirmDelete={del} deleting={deleting} />
      </div>
      {error && <p style={{ ...errorText, marginTop: 6 }}>{error}</p>}
    </div>
  )
}
