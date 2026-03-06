import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Project {
  id: number
  title: string
  location: string
  year: string
  category: 'Built' | 'Unbuilt'
  type: string
  img: string
  description: string
  area: string
  duration: string
  videoId: string
  gallery: string[]
}

interface Props {
  project: Project | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M6 4L14 9L6 14V4Z" fill="var(--text)" />
  </svg>
)

export default function ProjectModal({ project, onClose }: Props) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden'
      setPlaying(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [project])

  const metadata = project ? [
    { label: 'Type',     val: project.type },
    { label: 'Status',   val: project.category },
    { label: 'Location', val: `${project.location}, Nigeria` },
    { label: 'Year',     val: project.year },
    { label: 'Area',     val: project.area },
    { label: 'Duration', val: project.duration },
  ] : []

  return (
    <AnimatePresence>
      {project && (
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
                <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 4 }}>
                  {project.type} · {project.category} · {project.location} · {project.year}
                </p>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 300, color: 'var(--text)' }}>
                  {project.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1px solid var(--border)',
                  padding: '9px 18px', cursor: 'none',
                  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em',
                  textTransform: 'uppercase' as const, color: 'var(--muted)',
                  flexShrink: 0, transition: 'all 0.25s',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--text)'; el.style.color = 'var(--text)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted)'; }}
              >
                <CloseIcon /> Close
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ padding: '0 clamp(24px, 5vw, 80px) clamp(40px, 6vw, 72px)' }}>

              {/* Video / image */}
              <div style={{ margin: '32px 0', position: 'relative', background: '#000', aspectRatio: '16/9', overflow: 'hidden' }}>
                {playing && project.videoId ? (
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${project.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={project.title}
                    allow="autoplay; fullscreen"
                    style={{ border: 'none', display: 'block', width: '100%', height: '100%' }}
                  />
                ) : (
                  <>
                    <img
                      src={project.img} alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.82 }}
                    />
                    <button
                      onClick={() => project.videoId && setPlaying(true)}
                      style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', cursor: project.videoId ? 'none' : 'default', gap: 14,
                      }}
                    >
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        border: '1px solid rgba(238,235,229,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(12,12,10,0.55)', backdropFilter: 'blur(6px)',
                      }}>
                        {project.videoId ? <PlayIcon /> : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="10" height="10" stroke="var(--muted)" strokeWidth="1" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' as const, color: project.videoId ? 'var(--text)' : 'var(--muted)' }}>
                        {project.videoId ? 'Watch Project Video' : 'Video Coming Soon'}
                      </span>
                    </button>
                  </>
                )}
              </div>

              {/* Metadata grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)', marginBottom: 48 }}>
                {metadata.map(item => (
                  <div key={item.label} style={{ padding: '18px 20px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 6 }}>{item.label}</p>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)', fontWeight: 300 }}>{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 52, maxWidth: 680 }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 16 }}>About the Project</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 300, lineHeight: 1.9, color: 'var(--text)' }}>
                  {project.description}
                </p>
              </div>

              {/* Gallery */}
              {project.gallery.length > 0 && (
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 16 }}>Gallery</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 10 }}>
                    {project.gallery.map((src, i) => (
                      <div key={i} className="img-zoom" style={{ aspectRatio: '4/3', background: 'var(--surface)' }}>
                        <img src={src} alt={`${project.title} view ${i + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
