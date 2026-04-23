import { useState } from 'react'
import type { ReactNode, FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { inputStyle, labelStyle, primaryBtn, rowBtn, destructiveBtn, errorText } from './styles'
import type { Tab } from './types'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
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
        {error && <p style={errorText}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          ...primaryBtn, marginTop: 8, padding: '12px 24px',
          cursor: loading ? 'default' : 'none', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
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

interface RowActionsProps {
  onEdit: () => void
  onConfirmDelete: () => void | Promise<void>
  deleting: boolean
}

/**
 * Edit / Delete buttons with inline "Confirm" state so every row
 * handles its own destructive confirmation without a global modal.
 */
export function RowActions({ onEdit, onConfirmDelete, deleting }: RowActionsProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onConfirmDelete} disabled={deleting} style={destructiveBtn}>
          {deleting ? '…' : 'Confirm'}
        </button>
        <button onClick={() => setConfirming(false)} style={rowBtn}>Cancel</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <button onClick={onEdit} style={rowBtn}>Edit</button>
      <button onClick={() => setConfirming(true)} style={rowBtn}>Delete</button>
    </div>
  )
}

export function VideoHint({ url }: { url: string }) {
  return (
    <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>
      ✓ Video ID: {url}
    </p>
  )
}
