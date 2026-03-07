import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const TEAM = [
  {
    name: 'Emeka Okafor',
    role: 'Founder & Principal Architect',
    bio: 'Over 18 years designing buildings across West Africa. Emeka founded Arengcon on the conviction that great architecture must be rooted in place.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Amina Disu',
    role: 'Design Director',
    bio: 'Amina leads the design studio with a rigorous attention to proportion and material. Her work has been featured in Architectural Digest Africa.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Taiwo Bello',
    role: 'Senior Architect',
    bio: 'Taiwo specialises in large-scale mixed-use developments, bringing technical rigour and creative ambition to every stage of a project.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Chioma Eze',
    role: 'Interior Design Lead',
    bio: 'With a background in fine art, Chioma approaches interiors as spatial narratives — layering texture, light, and material with quiet intention.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Segun Adeyemi',
    role: 'Project Manager',
    bio: 'Segun keeps every project on time and on budget without ever compromising on quality. He has delivered over 40 projects across Nigeria.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Fatima Musa',
    role: 'Structural Consultant',
    bio: 'Fatima bridges architecture and engineering, ensuring every bold design decision is backed by sound structural thinking.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Adebayo Ola',
    role: 'Site Supervisor',
    bio: 'Adebayo is the link between drawing and reality. His site knowledge and hands-on discipline ensure craft is upheld through every build phase.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Ngozi Obi',
    role: 'Architect',
    bio: "A graduate of the University of Lagos, Ngozi brings fresh thinking and meticulous draftsmanship to the studio's residential and civic portfolio.",
    image: '/avatar-default.svg',
  },
  {
    name: 'Kola Adesanya',
    role: '3D Visualisation Lead',
    bio: 'Kola translates concept into vivid three-dimensional worlds, helping clients see and feel a space long before construction begins.',
    image: '/avatar-default.svg',
  },
  {
    name: 'Zainab Ibrahim',
    role: 'Client Relations',
    bio: 'Zainab is the first voice clients hear and a constant presence throughout every project. She ensures every relationship is built on clarity and trust.',
    image: '/avatar-default.svg',
  },
]

function Card({ m, i }: { m: typeof TEAM[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (i % 5) * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'none' }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', marginBottom: 12, background: 'var(--surface)', borderRadius: 2 }}>
        <img
          src={m.image}
          alt={m.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.55s ease',
          }}
        />
        {/* Bio overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(12,12,10,0.88)',
          padding: 16,
          display: 'flex', alignItems: 'flex-end',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: 'var(--muted)' }}>
            {m.bio}
          </p>
        </div>
      </div>

      {/* Name + role */}
      <p style={{
        fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 300,
        color: hovered ? 'var(--gold)' : 'var(--text)',
        transition: 'color 0.3s', marginBottom: 3,
      }}>
        {m.name}
      </p>
      <p style={{
        fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 1.4,
      }}>
        {m.role}
      </p>
    </motion.div>
  )
}

export default function Team() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })

  return (
    <section id="team" style={{ padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div ref={headRef} style={{ marginBottom: 'clamp(32px, 5vw, 64px)' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}
          >
            The People
          </motion.p>
          <div className="heading-clip">
            <motion.h2
              initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}
            >
              Meet the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>team</em>
            </motion.h2>
          </div>
        </div>

        {/* Grid — 2 cols on mobile, scales up to 5 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(calc(50% - 12px), 160px), 1fr))',
          gap: 'clamp(16px, 2.5vw, 32px)',
        }}>
          {TEAM.map((m, i) => <Card key={m.name} m={m} i={i} />)}
        </div>
      </div>
    </section>
  )
}
