import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoIcon from './LogoIcon'

export default function Intro({ onComplete }: { onComplete: () => void }) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setGone(true), 2800)
    const t2 = setTimeout(() => onComplete(), 3600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)',
            flexDirection: 'column',
          }}
        >
          {/* Subtle vertical grid lines */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.06, pointerEvents: 'none' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * (100 / 6)}%`, width: 1, background: 'var(--text)' }} />
            ))}
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {/* Logo spring-pop */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ color: 'var(--text)', marginBottom: 28 }}
            >
              <LogoIcon style={{ width: 'clamp(140px, 38vw, 320px)', height: 'clamp(140px, 38vw, 320px)' }} />
            </motion.div>

            {/* Company name */}
            <div style={{ overflow: 'hidden' }}>
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.42, duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(3.8rem, 12vw, 9rem)',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}
              >
                Arengcon
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              style={{
                fontFamily: 'var(--sans)', fontWeight: 500,
                fontSize: 14, letterSpacing: '0.38em',
                textTransform: 'uppercase', color: 'var(--muted)',
                marginTop: 18,
              }}
            >
              A Design &amp; Construction Company
            </motion.p>

            {/* Progress line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 2.5, ease: 'linear' }}
              style={{
                position: 'absolute', bottom: -48,
                width: 120, height: 1,
                background: 'var(--gold)',
                transformOrigin: 'left',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
