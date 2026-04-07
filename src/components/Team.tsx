import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface Member {
  name: string
  role: string
  bio: string
  image: string
}

const SAMPLE_TEAM: Member[] = [
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

async function fetchFromSupabase(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .order('created_at', { ascending: true })
  if (error || !data || data.length === 0) return []
  return data.map((r: any) => ({
    name: r.name,
    role: r.role,
    bio: r.bio,
    image: r.image || '/avatar-default.svg',
  }))
}

/* ── Member Modal ─────────────────────────────────────────────────── */
function MemberModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    if (member) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [member])

  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          />

          {/* Slide-up panel */}
          <motion.div
            key="panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
              background: 'var(--bg)',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderTop: '1px solid var(--border)',
            }}
          >
            {/* Sticky header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10,
              background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              padding: '16px clamp(24px, 5vw, 80px)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                  {member.role}
                </p>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)' }}>
                  {member.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1px solid var(--border)',
                  padding: '9px 18px', cursor: 'none',
                  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  flexShrink: 0, transition: 'all 0.25s',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--text)'; el.style.color = 'var(--text)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted)'; }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Close
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '0 clamp(24px, 5vw, 80px) clamp(40px, 6vw, 72px)' }}>
              <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 64px)', flexWrap: 'wrap', marginTop: 40 }}>
                {/* Photo */}
                <div style={{ flexShrink: 0, width: 'clamp(140px, 20vw, 220px)', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--surface)' }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  />
                </div>

                {/* Bio */}
                <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>About</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 300, lineHeight: 1.9, color: 'var(--text)' }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Card ─────────────────────────────────────────────────────────── */
function Card({ m, i, onClick }: { m: Member; i: number; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (i % 5) * 0.07 }}
      onClick={onClick}
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
        {/* Hover hint */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(12,12,10,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--text)' }}>
            View Profile
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

/* ── Section ──────────────────────────────────────────────────────── */
export default function Team({ refreshKey = 0 }: { refreshKey?: number }) {
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })
  const [members, setMembers] = useState<Member[]>(SAMPLE_TEAM)
  const [selected, setSelected] = useState<Member | null>(null)

  useEffect(() => {
    fetchFromSupabase().then(data => {
      if (data.length > 0) setMembers(data)
    })
  }, [refreshKey])

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

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(calc(50% - 12px), 160px), 1fr))',
          gap: 'clamp(16px, 2.5vw, 32px)',
        }}>
          {members.map((m, i) => (
            <Card key={m.name + i} m={m} i={i} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      <MemberModal member={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
