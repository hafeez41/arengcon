import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoIcon from './LogoIcon'
import Lightbox from './Lightbox'
import type { Update } from './Updates'

interface Props {
  update: Update | null
  onClose: () => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export default function UpdateModal({ update, onClose }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    if (update) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [update])

  return (
    <AnimatePresence>
      {update && (
        <>
          {/* Backdrop */}
          <motion.div
            key="update-backdrop"
            className="modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Slide-up panel */}
          <motion.div
            key="update-panel"
            className="modal-panel"
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
            <div className="modal-header">
              {/* Left — logo + name */}
              <div className="modal-brand">
                <LogoIcon style={{ width: 44, height: 44, flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--text)',
                }}>
                  Arengcon
                </span>
              </div>

              {/* Centre — update title */}
              <div style={{ textAlign: 'center' as const, minWidth: 0 }}>
                <h2 style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
                  fontWeight: 600,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {update.title}
                </h2>
              </div>

              {/* Right — close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: '1px solid var(--border)',
                    padding: '9px 18px', cursor: 'none',
                    fontFamily: 'var(--sans)', fontSize: 10,
                    letterSpacing: '0.3em', textTransform: 'uppercase' as const,
                    color: 'var(--muted)', flexShrink: 0, transition: 'all 0.25s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--text)'
                    el.style.color = 'var(--text)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border)'
                    el.style.color = 'var(--muted)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <style>{`
              .modal-header {
                position: sticky; top: 0; z-index: 10;
                background: var(--bg);
                border-bottom: 1px solid var(--border);
                padding: 14px clamp(16px, 5vw, 80px);
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                align-items: center;
                gap: 12px;
              }
              .modal-brand {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              @media (max-width: 600px) {
                .modal-header {
                  grid-template-columns: auto 1fr;
                  padding: 12px 16px;
                }
                .modal-brand { display: none; }
              }
            `}</style>

            {/* Scrollable content */}
            <div style={{ padding: 'clamp(24px, 4vw, 48px) clamp(24px, 5vw, 80px) clamp(40px, 6vw, 72px)' }}>

              {/* YouTube embed */}
              {update.video_id && (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  height: 0,
                  marginBottom: 32,
                  overflow: 'hidden',
                  background: '#000',
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${update.video_id}`}
                    title={update.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </div>
              )}

              {/* Images gallery */}
              {update.images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: 12,
                  marginBottom: 32,
                }}>
                  {update.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${update.title} image ${i + 1}`}
                      onClick={() => setLightboxIndex(i)}
                      style={{
                        width: '100%',
                        maxHeight: 400,
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid var(--border)',
                        cursor: 'none',
                      }}
                    />
                  ))}
                </div>
              )}
              <Lightbox
                images={update.images}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onChange={setLightboxIndex}
              />

              {/* Details text */}
              <div style={{ marginTop: 32 }}>
                {update.details.split(/\n\n+/).map((para, i) => (
                  <p key={i} style={{ fontFamily: "'Rajdhani', system-ui, sans-serif", fontSize: 17, fontWeight: 400, lineHeight: 1.85, color: 'var(--text)', marginBottom: 20 }}>
                    {para.split('\n').map((line, j, arr) => (
                      <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                    ))}
                  </p>
                ))}
              </div>

              {/* Date */}
              {update.created_at && (
                <p style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--muted)',
                  marginTop: 32,
                }}>
                  {formatDate(update.created_at)}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
