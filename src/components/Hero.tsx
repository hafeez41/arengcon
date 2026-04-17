import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const HERO_IMG = 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=90&auto=format&fit=crop'

const STATS = [
  { num: '14+', label: 'Interior Design Completed' },
  { num: '22+', label: 'Architectural Completed' },
  { num: '12+', label: 'Construction Completed' },
  { num: '12',  label: 'Years Experience' },
  { num: '8',   label: 'Ongoing Projects' },
]

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

        <div style={{ padding: '36px clamp(24px, 5vw, 80px) 0' }}>

          {/* H1 */}
          <div className="heading-clip">
            <motion.h1
              initial={{ y: '110%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              style={{
                fontFamily: "'Rajdhani', system-ui, sans-serif",
                fontSize: 'clamp(2.6rem, 7.5vw, 6.8rem)',
                fontWeight: 700,
                lineHeight: 1.06,
                color: 'var(--text)',
              }}
            >
              We Build <em style={{ fontStyle: 'italic', color: 'var(--gold)', fontFamily: "'Rajdhani', system-ui, sans-serif" }}>Enduring</em> Spaces
            </motion.h1>
          </div>

          {/* Subtext + CTA */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.35 }}
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 20, marginTop: 24, paddingBottom: 36 }}>
            <p style={{ fontFamily: "'Rajdhani', system-ui, sans-serif", fontWeight: 500, fontSize: 'clamp(15px, 1.8vw, 20px)', lineHeight: 1.75, color: '#d0ccc6', maxWidth: 400 }}>
              Architecture, interior design, and construction<br />that honour craft, context, and the people<br />who inhabit our work.
            </p>
            <button
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(238,235,229,0.1)',
                border: '1px solid rgba(238,235,229,0.4)',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(20px, 2.5vw, 32px)',
                cursor: 'none',
                fontFamily: 'var(--sans)', fontSize: 'clamp(10px, 1vw, 12px)', fontWeight: 600, letterSpacing: '0.36em',
                textTransform: 'uppercase' as const, color: 'var(--text)',
                transition: 'all 0.3s', whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--gold)'; el.style.color = 'var(--gold)'; el.style.background = 'rgba(200,185,154,0.12)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(238,235,229,0.4)'; el.style.color = 'var(--text)'; el.style.background = 'rgba(238,235,229,0.1)'; }}
            >
              View Projects
              <svg width="13" height="9" viewBox="0 0 13 9" fill="none"><path d="M1 4.5H12M8 1L12 4.5L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </motion.div>
        </div>

        {/* Stats bar — wraps to 2-3 cols on mobile */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.5 }}
          className="hero-stats"
          style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', background: 'rgba(12,12,10,0.85)', backdropFilter: 'blur(16px)' }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="hero-stat-cell" style={{ padding: 'clamp(12px,1.8vw,18px) 8px', textAlign: 'center' as const, borderRight: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{s.num}</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(8px, 0.85vw, 11px)', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginTop: 5 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }
        .hero-stat-cell { border-right: 1px solid var(--border); }
        .hero-stat-cell:last-child { border-right: none; }

        @media (max-width: 500px) {
          .hero-stats { grid-template-columns: repeat(2, 1fr); }
          .hero-stat-cell { border-top: 1px solid var(--border); }
          .hero-stat-cell:nth-child(even) { border-right: none; }
          .hero-stat-cell:last-child { grid-column: 1 / -1; border-right: none; }
        }
        @media (min-width: 501px) and (max-width: 860px) {
          .hero-stats { grid-template-columns: repeat(3, 1fr); }
          .hero-stat-cell { border-top: 1px solid var(--border); }
          .hero-stat-cell:nth-child(3n) { border-right: none; }
          .hero-stat-cell:last-child { border-right: none; }
        }
      `}</style>
    </section>
  )
}
