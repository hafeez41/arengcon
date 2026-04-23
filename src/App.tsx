import { useState, useEffect, Suspense, lazy } from 'react'
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
import Updates from './components/Updates'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import type { SavedSection } from './components/admin/AdminPanel'

const AdminPanel = lazy(() => import('./components/admin/AdminPanel'))

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [projectsKey, setProjectsKey] = useState(0)
  const [teamKey, setTeamKey] = useState(0)
  const [refsKey, setRefsKey] = useState(0)
  const [settingsKey, setSettingsKey] = useState(0)
  const [updatesKey, setUpdatesKey] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
  }, [isLight])

  useEffect(() => {
    setIsAdminMode(window.location.search.includes('admin'))
  }, [])

  const bump = (section: SavedSection) => {
    if (section === 'projects')   setProjectsKey(k => k + 1)
    if (section === 'team')       setTeamKey(k => k + 1)
    if (section === 'references') setRefsKey(k => k + 1)
    if (section === 'settings')   setSettingsKey(k => k + 1)
    if (section === 'updates')    setUpdatesKey(k => k + 1)
  }

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
              <Updates refreshKey={updatesKey} />
              <Projects refreshKey={projectsKey} />
              <Services />
              <Team refreshKey={teamKey} />
              <References refreshKey={refsKey} />
              <Studio />
              <Contact refreshKey={settingsKey} />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

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
          <Suspense fallback={null}>
            <AdminPanel onClose={() => setAdminOpen(false)} onSaved={bump} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
