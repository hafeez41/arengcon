import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const SERVICES = [
  {
    num: '01', title: 'Architecture',
    desc: 'From concept through construction documentation — we design buildings that respond to climate, culture, and client ambition.',
    tags: ['Masterplanning', 'Schematic Design', 'Technical Drawings'],
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1400&q=85&auto=format&fit=crop',
    longDesc: `Our architecture practice begins with deep listening. Before a line is drawn, we immerse ourselves in the context — the site, the climate, the cultural fabric, and your vision. From there we build a design language that is uniquely yours.\n\nWe carry projects from initial concept sketches through schematic design, design development, and full construction documentation. Our team coordinates with structural engineers, MEP consultants, planning authorities, and contractors to ensure the design intent is honoured at every stage.`,
    highlights: [
      { label: 'Typologies',   value: 'Residential · Commercial · Civic · Mixed-Use' },
      { label: 'Deliverables', value: 'Concept Design · Planning Submissions · Construction Drawings' },
      { label: 'Approach',     value: 'Context-first · Climate-responsive · Craft-led' },
    ],
  },
  {
    num: '02', title: 'Interior Design',
    desc: 'Spatial storytelling through material, light, and proportion. We create interiors that feel both considered and alive.',
    tags: ['Space Planning', 'FF&E', 'Lighting Design'],
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=85&auto=format&fit=crop',
    longDesc: `Interior design at Arengcon is the continuation of architecture by other means. Every surface, fixture, and fitting is chosen for how it performs in light, how it wears over time, and how it makes people feel.\n\nWe work across residential and commercial projects, developing bespoke interiors that layer texture, colour, and materiality with intention. Our FF&E process is meticulous — sourcing pieces that hold their character for decades, not seasons.`,
    highlights: [
      { label: 'Scope',      value: 'Full Interior Design · FF&E Procurement · Art Curation' },
      { label: 'Specialisms', value: 'Residential · Hospitality · Corporate · Retail' },
      { label: 'Process',    value: 'Concept Boards · 3D Visualisation · Site Oversight' },
    ],
  },
  {
    num: '03', title: 'Construction',
    desc: 'End-to-end project delivery with rigorous site management. Your vision, realised on time and to the highest standard.',
    tags: ['Project Management', 'Site Supervision', 'Quality Control'],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop',
    longDesc: `We don't just design buildings — we build them. Our construction arm brings the same discipline and precision to site as we apply to the drawing board, ensuring the design intent is honoured at every stage of delivery.\n\nOur site teams are experienced in managing complex, multi-trade projects across Nigeria. We maintain tight control over programme, cost, and quality — with transparent reporting so you always know exactly where your project stands.`,
    highlights: [
      { label: 'Services', value: 'Main Contractor · Project Management · Sub-contractor Co-ordination' },
      { label: 'Scale',    value: 'Residential · Commercial · Industrial' },
      { label: 'Standards', value: 'Rigorous QA · Health & Safety · Environmental Controls' },
    ],
  },
  {
    num: '04', title: 'Consultancy',
    desc: 'Strategic design advice for developers, investors, and institutions. We help complex projects find clarity.',
    tags: ['Feasibility Studies', 'Due Diligence', 'Design Reviews'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=85&auto=format&fit=crop',
    longDesc: `Not every project needs a full design team from day one. Our consultancy offer gives developers, investors, and institutions access to senior design thinking at the earliest — and most critical — stage of a project.\n\nWe conduct feasibility studies, review existing designs for buildability and value, advise on planning strategy, and provide independent due diligence on development opportunities. When clarity is what's needed, we deliver it efficiently and without agenda.`,
    highlights: [
      { label: 'Offerings', value: 'Feasibility · Design Review · Planning Strategy · Due Diligence' },
      { label: 'Clients',   value: 'Developers · Investors · Government · NGOs' },
      { label: 'Output',    value: 'Reports · Briefings · Workshop Facilitation' },
    ],
  },
]

type Service = typeof SERVICES[0]

/* ── Detail Modal ──────────────────────────────────────────────────── */
function ServiceModal({ s, onClose }: { s: Service; onClose: () => void }) {
  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,10,8,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        cursor: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 1040,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'grid',
          /* image left, content right on wide screens; stack on mobile */
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          cursor: 'none',
          position: 'relative',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', minHeight: 260, overflow: 'hidden', background: 'var(--bg)' }}>
          <img
            src={s.image}
            alt={s.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 'inherit' }}
          />
          {/* number watermark */}
          <span style={{
            position: 'absolute', bottom: 16, left: 20,
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}>
            {s.num} / 04
          </span>
        </div>

        {/* Content */}
        <div style={{
          padding: 'clamp(28px, 4vw, 48px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              alignSelf: 'flex-end',
              background: 'none', border: '1px solid var(--border)',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'none', flexShrink: 0,
              transition: 'border-color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--gold)'; el.style.background = 'var(--gold-dim)' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.background = 'none' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>

          {/* Title */}
          <div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
              {s.num} — Service
            </p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}>
              {s.title}
            </h3>
          </div>

          {/* Long description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {s.longDesc.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: 'var(--muted)' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            {s.highlights.map(h => (
              <div key={h.label} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'var(--muted2)',
                  flexShrink: 0, minWidth: 88,
                }}>
                  {h.label}
                </span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 300, color: 'var(--text)', lineHeight: 1.5 }}>
                  {h.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {s.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.28em',
                textTransform: 'uppercase', border: '1px solid var(--border)',
                color: 'var(--muted)', padding: '5px 11px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Service Row ────────────────────────────────────────────────────── */
function Row({ s, i, onOpen }: { s: Service; i: number; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 'clamp(20px, 4vw, 56px)',
        alignItems: 'start',
        padding: 'clamp(24px, 3vw, 36px) clamp(8px, 1.5vw, 16px)',
        borderBottom: '1px solid var(--border)',
        cursor: 'none',
        transition: 'background 0.3s',
        background: hovered ? 'rgba(196,168,119,0.04)' : 'transparent',
        margin: '0 clamp(-8px, -1.5vw, -16px)',
      }}
    >
      {/* Number */}
      <span style={{
        fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 400,
        letterSpacing: '0.1em',
        color: hovered ? 'var(--gold)' : 'var(--muted)',
        paddingTop: 6, transition: 'color 0.3s',
      }}>
        {s.num}
      </span>

      {/* Title + desc */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <h3 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 300, lineHeight: 1.1,
            color: hovered ? 'var(--text)' : 'var(--text)',
            transition: 'letter-spacing 0.35s',
            letterSpacing: hovered ? '0.02em' : '0',
          }}>
            {s.title}
          </h3>
          <motion.span
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
            transition={{ duration: 0.22 }}
            style={{
              fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--gold)',
            }}
          >
            View Details
          </motion.span>
        </div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 520 }}>
          {s.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 16 }}>
          {s.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.3em',
              textTransform: 'uppercase' as const,
              border: `1px solid ${hovered ? 'rgba(196,168,119,0.35)' : 'var(--border)'}`,
              color: hovered ? 'var(--gold)' : 'var(--muted)',
              padding: '5px 10px',
              transition: 'border-color 0.3s, color 0.3s',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow circle */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `1px solid ${hovered ? 'var(--gold)' : 'var(--border)'}`,
        background: hovered ? 'var(--gold)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 4,
        transition: 'border-color 0.3s, background 0.3s',
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: 'rotate(-45deg)', transition: 'transform 0.3s' }}>
          <path d="M1 9L9 1M9 1H3M9 1V7"
            stroke={hovered ? 'var(--bg)' : 'var(--muted)'}
            strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}

/* ── Section ────────────────────────────────────────────────────────── */
export default function Services() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })
  const [active, setActive] = useState<Service | null>(null)

  return (
    <>
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

          <div style={{ borderTop: '1px solid var(--border)' }} />

          {SERVICES.map((s, i) => (
            <Row key={s.num} s={s} i={i} onOpen={() => setActive(s)} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {active && <ServiceModal s={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  )
}
