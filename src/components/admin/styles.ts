import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)',
  background: 'var(--surface)', border: '1px solid var(--border)',
  padding: '10px 14px', outline: 'none', width: '100%',
  transition: 'border-color 0.2s',
}

export const textAreaStyle = (minHeight = 100): CSSProperties => ({
  ...inputStyle, resize: 'vertical', minHeight,
})

export const labelStyle: CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: 'var(--muted)',
}

export const primaryBtn: CSSProperties = {
  padding: '12px 32px', background: 'var(--gold)', border: 'none',
  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: 'var(--bg)', cursor: 'none',
}

export const secondaryBtn: CSSProperties = {
  padding: '12px 24px', background: 'none',
  border: '1px solid var(--border)', fontFamily: 'var(--sans)',
  fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
  color: 'var(--muted)', cursor: 'none',
}

export const pickerBtn: CSSProperties = {
  display: 'inline-block', padding: '10px 20px',
  border: '1px solid var(--border)', cursor: 'none',
  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
  textTransform: 'uppercase', color: 'var(--muted)',
}

export const rowBtn: CSSProperties = {
  padding: '6px 14px', background: 'none',
  border: '1px solid var(--border)', fontFamily: 'var(--sans)',
  fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
  color: 'var(--muted)', cursor: 'none',
}

export const destructiveBtn: CSSProperties = {
  padding: '6px 14px', background: '#e05a5a', border: 'none',
  fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.2em',
  textTransform: 'uppercase', color: '#fff', cursor: 'none',
}

export const xBtn: CSSProperties = {
  position: 'absolute', top: 2, right: 2,
  background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff',
  width: 18, height: 18, cursor: 'none', fontSize: 11, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

export const errorText: CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 12, color: '#e05a5a',
}

export const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 14,
}

export const formStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 20,
}

export const actionsStyle: CSSProperties = {
  display: 'flex', gap: 12, paddingTop: 8,
}

export const thumbnailPreview: CSSProperties = {
  height: 72, width: 72, objectFit: 'cover',
  border: '1px solid var(--border)',
}

export const sectionHeading: CSSProperties = {
  fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)',
  fontWeight: 300, color: 'var(--text)', marginBottom: 32,
}

export const metaText: CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16,
}
