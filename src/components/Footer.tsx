import { useEffect, useState } from 'react'
import LogoIcon from './LogoIcon'
import { supabase } from '../lib/supabase'

interface Props {
  refreshKey?: number
}

const DEFAULTS = {
  email1: 'info@arengcon.com',
  email2: 'projects@arengcon.com',
  phone: '+234 000 000 0000',
  location: 'Lagos, Nigeria',
  hours: 'Mon – Fri, 9am – 6pm',
  instagram: '#',
  linkedin: '#',
}

type Settings = typeof DEFAULTS

export default function Footer({ refreshKey }: Props) {
  const year = new Date().getFullYear()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const merged: Settings = { ...DEFAULTS }
        data.forEach((row: { key: string; value: string }) => {
          if (row.key in merged) {
            (merged as any)[row.key] = row.value
          }
        })
        setSettings(merged)
      })
  }, [refreshKey])

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--sans)',
    fontSize: 9,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: 14,
    display: 'block',
  }

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--sans)',
    fontSize: 13,
    color: 'var(--muted)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: 6,
    transition: 'color 0.25s',
  }

  const textStyle: React.CSSProperties = {
    fontFamily: 'var(--sans)',
    fontSize: 13,
    color: 'var(--muted)',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      {/* Main grid */}
      <div style={{
        padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 80px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'clamp(32px, 4vw, 48px)',
        maxWidth: 1200,
        margin: '0 auto',
      }}>

        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <LogoIcon style={{ width: 36, height: 36 }} />
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: 15,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}>
              Arengcon
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--muted)',
            maxWidth: 220,
          }}>
            Architecture, interior design &amp; construction rooted in African identity.
          </p>
        </div>

        {/* Contact column */}
        <div>
          <span style={labelStyle}>Contact</span>
          <a
            href={`mailto:${settings.email1}`}
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {settings.email1}
          </a>
          <a
            href={`mailto:${settings.email2}`}
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {settings.email2}
          </a>
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            style={{ ...linkStyle, marginBottom: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {settings.phone}
          </a>
        </div>

        {/* Studio column */}
        <div>
          <span style={labelStyle}>Studio</span>
          <span style={textStyle}>{settings.location}</span>
          <span style={{ ...textStyle, marginBottom: 0 }}>{settings.hours}</span>
        </div>

        {/* Follow column */}
        <div>
          <span style={labelStyle}>Follow</span>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Instagram
          </a>
          <a
            href={settings.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, marginBottom: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '20px clamp(24px, 5vw, 80px)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}>
          © {year} Arengcon — Design &amp; Construction · All rights reserved
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms'].map(l => (
            <a
              key={l}
              href="#"
              className="link-slide"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
