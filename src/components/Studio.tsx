import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const VALUES = [
  { title: 'Context-first',  desc: 'Every site has a story. We listen before we draw.' },
  { title: 'Craft matters',  desc: 'Detail is not decoration — it is the difference between ordinary and enduring.' },
  { title: 'People-centred', desc: 'Buildings serve people. We keep humans at the heart of every decision.' },
]

export default function Studio() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="studio" style={{ padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 'clamp(40px, 6vw, 96px)', alignItems: 'center' }}>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }} style={{ position: 'relative' }}>
          <div className="img-zoom" style={{ aspectRatio: '3/4', width: '100%', background: 'var(--bg)' }}>
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop" alt="Arengcon studio" />
          </div>
          <div style={{ position: 'absolute', bottom: -12, right: -12, width: 72, height: 72, border: '1px solid rgba(196,168,119,0.22)', pointerEvents: 'none' }} />
        </motion.div>

        <div ref={headRef}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            The Studio
          </motion.p>
          <div className="heading-clip" style={{ marginBottom: 22 }}>
            <motion.h2 initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }} style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}>
              Architecture rooted in<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>African identity</em>
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.5 }} style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 17, lineHeight: 1.8, color: 'var(--muted)', marginBottom: 32 }}>
            Arengcon was founded on the belief that great design is inseparable from its place. Our multidisciplinary team draws on a deep understanding of Nigerian landscapes, climate, and culture to deliver buildings that are at once contemporary and grounded.
          </motion.p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, x: -14 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + i * 0.09, duration: 0.5 }} style={{ display: 'flex', gap: 14 }}>
                <span style={{ width: 2, flexShrink: 0, background: 'var(--gold)', borderRadius: 1, alignSelf: 'stretch' }} />
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{v.title}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
