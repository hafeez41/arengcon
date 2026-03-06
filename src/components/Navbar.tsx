import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoIcon from './LogoIcon'

const LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Studio',   href: '#studio' },
  { label: 'Contact',  href: '#contact' },
]

interface NavbarProps {
  isLight: boolean
  onToggleTheme: () => void
}

export default function Navbar({ isLight, onToggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: scrolled ? '14px clamp(24px, 5vw, 80px)' : '22px clamp(24px, 5vw, 80px)',
    background: scrolled ? 'color-mix(in srgb, var(--bg) 90%, transparent)' : 'transparent',
    backdropFilter: scrolled ? 'blur(18px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
  }

  const SunIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
  const MoonIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )

  return (
    <>
      <motion.header
        data-scrolled={scrolled || undefined}
        style={navStyle}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Logo */}
        <button onClick={() => go('#hero')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}>
          <LogoIcon style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 15, letterSpacing: '0.16em', textTransform: 'uppercase' as const }}>Arengcon</span>
        </button>

        {/* Desktop nav + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
            {LINKS.map(l => (
              <button key={l.href} onClick={() => go(l.href)} className="link-slide"
                style={{ background: 'none', border: 'none', cursor: 'none', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: 'var(--muted)', transition: 'color 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >{l.label}</button>
            ))}
          </nav>

          {/* Theme toggle */}
          <button onClick={onToggleTheme} className="theme-toggle" aria-label="Toggle theme" title={isLight ? 'Switch to dark' : 'Switch to light'}>
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Hamburger */}
          <button onClick={() => setOpen(v => !v)} aria-label="Toggle menu" className="mobile-menu-btn"
            style={{ display: 'none', flexDirection: 'column' as const, gap: 5, padding: 4, background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}>
            <motion.span style={{ display: 'block', width: 22, height: 1, background: 'currentColor' }} animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} />
            <motion.span style={{ display: 'block', width: 22, height: 1, background: 'currentColor' }} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.2 }} />
            <motion.span style={{ display: 'block', width: 22, height: 1, background: 'currentColor' }} animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} />
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div key="mob" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 35, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(16px, 3vh, 28px)' }}>
            {LINKS.map((l, i) => (
              <motion.button key={l.href} onClick={() => go(l.href)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                style={{ background: 'none', border: 'none', cursor: 'none', fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 300, color: 'var(--text)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                {l.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
