import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES = [
  {
    num: '01', title: 'Architecture',
    desc: 'From concept through construction documentation — we design buildings that respond to climate, culture, and client ambition.',
    tags: ['Masterplanning', 'Schematic Design', 'Technical Drawings'],
  },
  {
    num: '02', title: 'Interior Design',
    desc: 'Spatial storytelling through material, light, and proportion. We create interiors that feel both considered and alive.',
    tags: ['Space Planning', 'FF&E', 'Lighting Design'],
  },
  {
    num: '03', title: 'Construction',
    desc: 'End-to-end project delivery with rigorous site management. Your vision, realised on time and to the highest standard.',
    tags: ['Project Management', 'Site Supervision', 'Quality Control'],
  },
  {
    num: '04', title: 'Consultancy',
    desc: 'Strategic design advice for developers, investors, and institutions. We help complex projects find clarity.',
    tags: ['Feasibility Studies', 'Due Diligence', 'Design Reviews'],
  },
]

function Row({ s, i }: { s: typeof SERVICES[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 'clamp(20px, 4vw, 56px)',
        alignItems: 'start',
        padding: 'clamp(24px, 3vw, 36px) 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'none',
      }}
    >
      {/* Number — distinct color so it's actually visible */}
      <span style={{
        fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 400,
        letterSpacing: '0.1em', color: 'var(--muted)',
        paddingTop: 6,
      }}>
        {s.num}
      </span>

      {/* Title + desc */}
      <div>
        <h3 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 300, color: 'var(--text)', lineHeight: 1.1, marginBottom: 12,
        }}>
          {s.title}
        </h3>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 520 }}>
          {s.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 16 }}>
          {s.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.3em',
                textTransform: 'uppercase' as const,
                border: '1px solid var(--border)', color: 'var(--muted)',
                padding: '5px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 4,
        transition: 'border-color 0.3s, background 0.3s',
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: 'rotate(-45deg)' }}>
          <path d="M1 9L9 1M9 1H3M9 1V7" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })

  return (
    <section
      id="services"
      style={{
        padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div ref={headRef} style={{ marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 14 }}
          >
            What We Do
          </motion.p>
          <div className="heading-clip">
            <motion.h2
              initial={{ y: '100%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}
            >
              Full-spectrum design<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>&amp; delivery</em>
            </motion.h2>
          </div>
        </div>

        {/* Top border of first row */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {SERVICES.map((s, i) => <Row key={s.num} s={s} i={i} />)}
      </div>
    </section>
  )
}
