import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const HERO_IMG = 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=90&auto=format&fit=crop'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="hero" style={{ height: '100svh', minHeight: 600, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={HERO_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(12,12,10,0.45) 0%, rgba(12,12,10,0.05) 30%, rgba(12,12,10,0.65) 60%, rgba(12,12,10,0.96) 100%)' }} />
      </div>

      {/* Text content */}
      <div ref={ref} style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>

        {/* Frosted backdrop behind text */}
        <div style={{
          background: 'rgba(12,12,10,0.42)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(238,235,229,0.1)',
          padding: '36px clamp(24px, 5vw, 80px) 0',
        }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ width: 28, height: 1, background: 'var(--gold)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase' as const, color: 'var(--gold)' }}>
              Est. 2024 · Nigeria
            </span>
          </motion.div>

          <div className="heading-clip">
            <motion.h1
              initial={{ y: '110%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(3.4rem, 8vw, 7rem)',
                fontWeight: 400,
                lineHeight: 1.06,
                color: 'var(--text)',
              }}
            >
              We Build <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Enduring</em> Spaces
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.35 }}
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 24, marginTop: 28, paddingBottom: 40 }}>
            <p style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 19, lineHeight: 1.75, color: '#ccc8c2', maxWidth: 380 }}>
              Architecture, interior design, and construction<br />that honour craft, context, and the people<br />who inhabit our work.
            </p>
            <button
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(238,235,229,0.12)',
                border: '1px solid rgba(238,235,229,0.38)',
                padding: '16px 32px', cursor: 'none',
                fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.36em',
                textTransform: 'uppercase' as const, color: 'var(--text)',
                transition: 'all 0.3s',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--gold)'; el.style.color = 'var(--gold)'; el.style.background = 'rgba(200,185,154,0.14)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(238,235,229,0.38)'; el.style.color = 'var(--text)'; el.style.background = 'rgba(238,235,229,0.12)'; }}
            >
              View Projects
              <svg width="14" height="10" viewBox="0 0 13 9" fill="none"><path d="M1 4.5H12M8 1L12 4.5L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)', background: 'rgba(12,12,10,0.85)', backdropFilter: 'blur(16px)' }}>
          {[
            { num: '48+', label: 'Projects Completed' },
            { num: '12',  label: 'Years Experience' },
            { num: '6',   label: 'Industry Awards' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '18px 0', textAlign: 'center' as const, borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 300, color: 'var(--text)', lineHeight: 1 }}>{s.num}</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginTop: 6 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
