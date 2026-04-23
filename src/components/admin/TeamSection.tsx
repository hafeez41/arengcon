import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { supabase, uploadImage, deleteImages } from '../../lib/supabase'
import { compressImage } from '../../lib/compress'
import { useObjectUrls } from '../../lib/useObjectUrls'
import type { TeamMember } from './types'
import { Field, RowActions } from './shared'
import {
  inputStyle, textAreaStyle, primaryBtn, secondaryBtn, pickerBtn,
  errorText, gridStyle, formStyle, actionsStyle,
} from './styles'

const DEFAULT_AVATAR = '/avatar-default.svg'

interface FormProps {
  member?: TeamMember
  onSaved: () => void
  onCancel: () => void
}

export function TeamForm({ member, onSaved, onCancel }: FormProps) {
  const isEdit = !!member
  const urls = useObjectUrls()

  const [form, setForm] = useState({
    name: member?.name ?? '',
    role: member?.role ?? '',
    bio: member?.bio ?? '',
  })
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setCompressing(true)
    const c = await compressImage(file)
    if (newPhotoPreview) urls.revoke(newPhotoPreview)
    setNewPhoto(c); setNewPhotoPreview(urls.create(c))
    setCompressing(false)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let imageUrl = member?.image ?? DEFAULT_AVATAR
      if (newPhoto) {
        imageUrl = await uploadImage(newPhoto)
        if (isEdit && member?.image && member.image !== DEFAULT_AVATAR) {
          await deleteImages([member.image])
        }
      }

      const payload = { name: form.name, role: form.role, bio: form.bio, image: imageUrl }
      const { error: dbErr } = isEdit && member
        ? await supabase.from('team').update(payload).eq('id', member.id)
        : await supabase.from('team').insert(payload)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const busy = saving || compressing
  const previewSrc = newPhotoPreview || member?.image || DEFAULT_AVATAR

  return (
    <form onSubmit={save} style={formStyle}>
      <div style={gridStyle}>
        <Field label="Full name"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
        <Field label="Role / title"><input style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)} required /></Field>
      </div>
      <Field label="Bio">
        <textarea style={textAreaStyle(90)} value={form.bio}
          onChange={e => set('bio', e.target.value)} required />
      </Field>
      <Field label={isEdit ? 'Photo' : 'Photo (optional — uses placeholder if omitted)'}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <img src={previewSrc} alt="" width={80} height={80}
            style={{ height: 80, width: 80, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)', opacity: previewSrc === DEFAULT_AVATAR && !newPhotoPreview ? 0.4 : 1 }} />
          <label style={pickerBtn}>
            {isEdit ? 'Replace' : 'Choose photo'}
            <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
          </label>
        </div>
      </Field>
      {error && <p style={errorText}>{error}</p>}
      <div style={actionsStyle}>
        <button type="submit" disabled={busy} style={{ ...primaryBtn, cursor: busy ? 'default' : 'none', opacity: busy ? 0.6 : 1 }}>
          {compressing ? 'Compressing…' : saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Member'}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  )
}

interface RowProps {
  m: TeamMember
  onDelete: (id: number) => void
  onEdit: (m: TeamMember) => void
}

export function TeamRow({ m, onDelete, onEdit }: RowProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const del = async () => {
    setDeleting(true); setError('')
    if (m.image && m.image !== DEFAULT_AVATAR) await deleteImages([m.image])
    const { error: dbErr } = await supabase.from('team').delete().eq('id', m.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    onDelete(m.id)
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img src={m.image || DEFAULT_AVATAR} alt={m.name} loading="lazy" width={44} height={44}
            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%', flexShrink: 0, border: '1px solid var(--border)' }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{m.name}</p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{m.role}</p>
          </div>
        </div>
        <RowActions onEdit={() => onEdit(m)} onConfirmDelete={del} deleting={deleting} />
      </div>
      {error && <p style={{ ...errorText, marginTop: 6 }}>{error}</p>}
    </div>
  )
}
