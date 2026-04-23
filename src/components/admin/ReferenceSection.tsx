import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Reference } from './types'
import { Field, RowActions } from './shared'
import {
  inputStyle, textAreaStyle, primaryBtn, secondaryBtn,
  errorText, gridStyle, formStyle, actionsStyle,
} from './styles'

interface FormProps {
  reference?: Reference
  onSaved: () => void
  onCancel: () => void
}

export function ReferenceForm({ reference, onSaved, onCancel }: FormProps) {
  const isEdit = !!reference
  const [form, setForm] = useState({
    name: reference?.name ?? '',
    title: reference?.title ?? '',
    project: reference?.project ?? '',
    quote: reference?.quote ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const save = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = {
        name: form.name,
        title: form.title || null,
        project: form.project || null,
        quote: form.quote || null,
      }
      const { error: dbErr } = isEdit && reference
        ? await supabase.from('client_references').update(payload).eq('id', reference.id)
        : await supabase.from('client_references').insert(payload)
      if (dbErr) throw dbErr
      onSaved()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} style={formStyle}>
      <div style={gridStyle}>
        <Field label="Name *"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
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
        <textarea style={textAreaStyle(90)} value={form.quote} onChange={e => set('quote', e.target.value)}
          placeholder="Leave blank if no testimonial quote" />
      </Field>
      {error && <p style={errorText}>{error}</p>}
      <div style={actionsStyle}>
        <button type="submit" disabled={saving} style={{ ...primaryBtn, cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Reference'}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  )
}

interface RowProps {
  r: Reference
  onDelete: (id: number) => void
  onEdit: (r: Reference) => void
}

export function ReferenceRow({ r, onDelete, onEdit }: RowProps) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{r.name}</p>
          {r.title && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 2 }}>{r.title}</p>
          )}
          {r.project && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>{r.project}</p>
          )}
        </div>
        <RowActions onEdit={() => onEdit(r)} onConfirmDelete={del} deleting={deleting} />
      </div>
      {error && <p style={{ ...errorText, marginTop: 6 }}>{error}</p>}
    </div>
  )
}
