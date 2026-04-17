import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase'
import UpdateModal from './UpdateModal'
import LogoIcon from './LogoIcon'

export interface Update {
  id: number
  title: string
  details: string
  video_id: string | null
  images: string[]
  created_at: string
}

interface Props {
  refreshKey?: number
}

const PLACEHOLDER_UPDATES: Update[] = [
  { id: -1, title: 'New Project Underway in Abuja', details: 'We have broken ground on our latest commercial development in the heart of Abuja. The project spans 2,400 sqm and is expected to complete in Q3 2025.', video_id: null, images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop'], created_at: '' },
  { id: -2, title: 'Interior Design Award Nomination', details: 'Arengcon has been nominated for the West African Interior Design Excellence Award for our work on the Meridian Hotel interiors in Abuja.', video_id: null, images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop'], created_at: '' },
  { id: -3, title: 'Team Expansion', details: 'We are proud to welcome three new senior architects to our growing team. Our expanded capacity allows us to take on larger and more complex commissions.', video_id: null, images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop'], created_at: '' },
  { id: -4, title: 'Completed: Lekki Waterfront Residence', details: 'We have successfully handed over the Lekki Waterfront Residence to our client. The project features floor-to-ceiling glazing and a rooftop pool terrace.', video_id: null, images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&auto=format&fit=crop'], created_at: '' },
  { id: -5, title: 'Speaking at Lagos Design Week', details: 'Our principal architect will be speaking at Lagos Design Week 2025, presenting on the intersection of African identity and contemporary construction practice.', video_id: null, images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop'], created_at: '' },
  { id: -6, title: 'New Partnership Announced', details: 'Arengcon has entered into a strategic partnership with a leading structural engineering firm to enhance our delivery capability on large-scale projects.', video_id: null, images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop'], created_at: '' },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Arengcon'
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

const GAP = 24
const CARD_W = 320

function UpdateCard({ update, onClick }: { update: Update; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: CARD_W,
        height: 420,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'none',
        transition: 'border-color 0.25s',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
    >
      {update.images[0] ? (
        <img src={update.images[0]} alt={update.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '100%', height: 200, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 700, color: 'var(--gold)', opacity: 0.7 }}>A</span>
        </div>
      )}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1, gap: 10, overflow: 'hidden' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: 'var(--gold)', margin: 0 }}>
          {formatDate(update.created_at)}
        </p>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
          {update.title}
        </h3>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', flex: 1 } as React.CSSProperties}>
          {update.details}
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: 'var(--gold)', margin: 0 }}>
          Read more →
        </p>
      </div>
    </div>
  )
}

export default function Updates({ refreshKey }: Props) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [selected, setSelected] = useState<Update | null>(null)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' })

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('updates').select('*').order('created_at', { ascending: false }).limit(10)
      if (data && data.length > 0) {
        setUpdates(data.map((r: any) => ({ id: r.id, title: r.title, details: r.details || '', video_id: r.video_id || null, images: r.images ?? [], created_at: r.created_at || '' })))
      } else {
        setUpdates(PLACEHOLDER_UPDATES)
      }
    }
    fetchData()
  }, [refreshKey])

  // Duplicate items for seamless loop
  const looped = updates.length > 0 ? [...updates, ...updates] : []
  const trackWidth = updates.length * (CARD_W + GAP)
  const duration = updates.length * 4 // seconds — ~4s per card

  return (
    <section id="updates" ref={sectionRef} style={{ padding: 'clamp(40px, 5vw, 72px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-${trackWidth}px); }
        }
        .updates-track {
          animation: marquee ${duration}s linear infinite;
        }
        .updates-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 'clamp(16px, 2vw, 24px)', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <LogoIcon style={{ width: 'clamp(48px, 6vw, 72px)', height: 'clamp(48px, 6vw, 72px)', flexShrink: 0 }} />
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.1 }}>
          Arengcon <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Updates</em>
        </h2>
      </motion.div>

      {/* Infinite track */}
      <div
        style={{ overflow: 'hidden', cursor: 'none' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className={`updates-track${paused ? ' paused' : ''}`}
          style={{ display: 'flex', gap: GAP, width: 'max-content' }}
        >
          {looped.map((update, i) => (
            <UpdateCard
              key={`${update.id}-${i}`}
              update={update}
              onClick={() => { setPaused(true); setSelected(update) }}
            />
          ))}
        </div>
      </div>

      <UpdateModal update={selected} onClose={() => { setSelected(null); setPaused(false) }} />
    </section>
  )
}
