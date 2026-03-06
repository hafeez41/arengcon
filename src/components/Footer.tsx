import LogoIcon from './LogoIcon'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{
      padding: '28px clamp(24px, 5vw, 80px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
        <LogoIcon style={{ width: 30, height: 30 }} />
        <span style={{ fontFamily: 'var(--serif)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Arengcon</span>
      </div>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--muted)' }}>
        © {year} Arengcon — Design &amp; Construction · All rights reserved
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Privacy', 'Terms'].map(l => (
          <a key={l} href="#" className="link-slide"
            style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >{l}</a>
        ))}
      </div>
    </footer>
  )
}
