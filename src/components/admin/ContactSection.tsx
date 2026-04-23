import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchSiteSettings } from '../../lib/queries'
import { Field } from './shared'
import {
  inputStyle, primaryBtn, errorText, gridStyle, formStyle,
} from './styles'

const FIELDS = {
  email1: '', email2: '', phone: '',
  location: '', hours: '', instagram: '', linkedin: '',
}

export function ContactForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState(FIELDS)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    fetchSiteSettings().then(settings => {
      if (!alive) return
      setForm(prev => {
        const next = { ...prev }
        Object.entries(settings).forEach(([key, value]) => {
          if (key in next) (next as any)[key] = value
        })
        return next
      })
    })
    return () => { alive = false }
  }, [])

  const set = (key: keyof typeof FIELDS, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const save = async (e: FormEvent) => {
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
    <form onSubmit={save} style={formStyle}>
      <div style={gridStyle}>
        <Field label="Email 1">
          <input style={inputStyle} value={form.email1} onChange={e => set('email1', e.target.value)} placeholder="info@example.com" />
        </Field>
        <Field label="Email 2">
          <input style={inputStyle} value={form.email2} onChange={e => set('email2', e.target.value)} placeholder="projects@example.com" />
        </Field>
      </div>
      <div style={gridStyle}>
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
      <div style={gridStyle}>
        <Field label="Instagram URL">
          <input style={inputStyle} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="LinkedIn URL">
          <input style={inputStyle} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
        </Field>
      </div>
      {error && <p style={errorText}>{error}</p>}
      {success && <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--gold)' }}>Settings saved.</p>}
      <div style={{ paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{ ...primaryBtn, cursor: saving ? 'default' : 'none', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
