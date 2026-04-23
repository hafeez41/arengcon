import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  images: string[]
  index: number | null
  onClose: () => void
  onChange: (i: number) => void
}

export default function Lightbox({ images, index, onClose, onChange }: Props) {
  useEffect(() => {
    if (index === null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange(Math.min(index + 1, images.length - 1))
      if (e.key === 'ArrowLeft')  onChange(Math.max(index - 1, 0))
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [index, images.length, onClose, onChange])

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          key="lb-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 70,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            src={images[index]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', display: 'block', userSelect: 'none' }}
          />

          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: '1px solid rgba(238,235,229,0.3)',
              color: 'var(--text)', padding: '8px 18px', cursor: 'none',
              fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            }}
          >
            × Close
          </button>

          <p style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em',
            color: 'rgba(238,235,229,0.4)', pointerEvents: 'none',
          }}>
            {index + 1} / {images.length}
          </p>

          {index > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onChange(index - 1) }}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(238,235,229,0.2)',
                color: 'var(--text)', width: 48, height: 48, cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, lineHeight: 1,
              }}
            >‹</button>
          )}

          {index < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); onChange(index + 1) }}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(238,235,229,0.2)',
                color: 'var(--text)', width: 48, height: 48, cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, lineHeight: 1,
              }}
            >›</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
