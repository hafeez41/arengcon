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

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [isLight, setIsLight] = useState(false)

  // Sync class to <html> so CSS vars cascade everywhere
  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
  }, [isLight])

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
              <Projects />
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
    </div>
  )
}
