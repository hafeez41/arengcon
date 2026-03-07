import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const REFS = [
  {
    quote: 'Arengcon delivered a home that exceeded every expectation. Their ability to listen, interpret, and then build is unlike any firm we have worked with.',
    name: 'Oluwaseun Adeyinka',
    title: 'Private Client',
    project: 'Ikoyi Residence, Lagos',
  },
  {
    quote: 'From feasibility through to handover, the team were professional, precise, and genuinely invested in the outcome. An exceptional experience.',
    name: 'Chukwuemeka Nwachukwu',
    title: 'Managing Director',
    project: 'Lekki Commercial Tower',
  },
  {
    quote: 'The interior design work transformed our hospitality space entirely. Guests comment on the atmosphere constantly — it is exactly what we asked for.',
    name: 'Fatou Diallo',
    title: 'Director of Operations',
    project: 'The Meridian Hotel, Abuja',
  },
  {
    quote: 'Their consultancy report gave us the clarity we needed to move forward with confidence. Rigorous, honest, and well-reasoned throughout.',
    name: 'Babatunde Fashola',
    title: 'Head of Development',
    project: 'Victoria Island Mixed-Use Development',
  },
  {
    quote: 'Arengcon understands the Nigerian context in a way that few design firms do. Their work is contemporary without being disconnected from where it sits.',
    name: 'Dr Ngozi Okonkwo',
    title: 'Commissioner for Infrastructure',
    project: 'Enugu State Civic Centre',
  },
  {
    quote: 'A team that combines creative ambition with real delivery capability. They hit every milestone without once compromising on design quality.',
    name: 'Adeola Bakare',
    title: 'CEO',
    project: 'Mainland Logistics Hub, Lagos',
  },
]

function RefCard({ r, i }: { r: typeof REFS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (i % 3) * 0.09 }}
      style={{
        border: '1px solid var(--border)',
        padding: 'clamp(24px, 3vw, 36px)',
        display: 'flex', flexDirection: 'column', gap: 24,
        background: 'var(--surface)',
        transition: 'border-color 0.3s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,168,119,0.35)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
    >
      {/* Opening quote mark */}
      <span style={{
        fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 8vw, 64px)', lineHeight: 1,
        color: 'var(--gold)', opacity: 0.5, display: 'block',
        marginBottom: -10,
      }}>
        "
      </span>

      {/* Quote */}
      <p style={{
        fontFamily: 'var(--serif)', fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
        fontWeight: 300, lineHeight: 1.75, color: 'var(--text)',
        fontStyle: 'italic', flexGrow: 1,
      }}>
        {r.quote}
      </p>

      {/* Attribution */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
          {r.name}
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }}>
          {r.title}
        </p>
        <p style={{
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--gold)',
        }}>
          {r.project}
        </p>
      </div>
    </motion.div>
  )
}

export default function References() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })

  return (
    <section id="references" style={{ padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div ref={headRef} style={{ marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}
          >
            Client References
          </motion.p>
          <div className="heading-clip">
            <motion.h2
              initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}
            >
              Trusted by those who<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>demand the best</em>
            </motion.h2>
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(16px, 2.5vw, 28px)',
        }}>
          {REFS.map((r, i) => <RefCard key={r.name} r={r} i={i} />)}
        </div>
      </div>
    </section>
  )
}
