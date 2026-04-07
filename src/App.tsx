import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Intro from './components/Intro'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Services from './components/Services'
import Studio from './components/Studio'
import Contact from './components/Contact'
import Team from './components/Team'
import References from './components/References'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [projectsKey, setProjectsKey] = useState(0)

  // Sync class to <html> so CSS vars cascade everywhere
  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
  }, [isLight])

  // Detect ?admin in URL
  useEffect(() => {
    setIsAdminMode(window.location.search.includes('admin'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <CustomCursor />
      <Intro onComplete={() => setIntroComplete(true)} />

      <AnimatePresence>
        {introComplete && (
          <motion.div
            key="site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Navbar isLight={isLight} onToggleTheme={() => setIsLight(v => !v)} />
            <main>
              <Hero />
              <Projects refreshKey={projectsKey} />
              <Services />
              <Team />
              <References />
              <Studio />
              <Contact />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin entry — only visible when visiting /?admin */}
      <AnimatePresence>
        {isAdminMode && !adminOpen && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdminOpen(true)}
            title="Open Project Builder"
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 70,
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--gold)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adminOpen && (
          <AdminPanel
            onClose={() => setAdminOpen(false)}
            onSaved={() => setProjectsKey(k => k + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
