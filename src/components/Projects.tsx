import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import ProjectModal, { type Project } from './ProjectModal'
import { supabase } from '../lib/supabase'

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Lagoon Residence',
    location: 'Lagos', year: '2024',
    category: 'Built', type: 'Residential',
    area: '850 sqm', duration: '18 months',
    videoId: '',   // ← paste a YouTube video ID here when available
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&auto=format&fit=crop',
    description: 'A contemporary waterfront residence nestled along the Lagos lagoon. The design responds to the tropical climate through deep overhanging eaves, cross-ventilated spaces, and a series of terraced outdoor living areas that dissolve the boundary between interior and exterior. Materials — raw concrete, teak, and Lagos stone — were chosen for their ability to weather gracefully under the coastal sun.',
    gallery: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    title: 'Abuja Commercial Hub',
    location: 'Abuja', year: '2023',
    category: 'Built', type: 'Commercial',
    area: '4 200 sqm', duration: '28 months',
    videoId: '',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&auto=format&fit=crop',
    description: "A mixed-use commercial tower in the capital's central business district. Clad in a double-skin facade of fritted glass and perforated aluminium, the building passively reduces solar heat gain by 42% while maintaining panoramic city views. Ground-floor retail spills into a landscaped public plaza that has become an informal gathering space for the neighbourhood.",
    gallery: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 3,
    title: 'Savanna Cultural Centre',
    location: 'Kaduna', year: '2025',
    category: 'Unbuilt', type: 'Cultural',
    area: '2 600 sqm', duration: '—',
    videoId: '',
    img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=900&q=80&auto=format&fit=crop',
    description: 'A proposed cultural centre on the edge of the Guinea savanna. The scheme draws on the earthen architecture of northern Nigeria — a series of compressed laterite vaults and courtyard galleries arranged around a central performance amphitheatre. The project is currently in planning submission and is expected to break ground in Q1 2026.',
    gallery: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604014055117-5c93cbc77f54?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 4,
    title: 'Eko Tower',
    location: 'Lagos', year: '2022',
    category: 'Built', type: 'Commercial',
    area: '12 000 sqm', duration: '36 months',
    videoId: '',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80&auto=format&fit=crop',
    description: 'A 24-storey office tower on Victoria Island. The structural exoskeleton — expressed on the exterior as a diagrid of painted steel — reduces internal column transfers, freeing each floor plate as a column-free open plan. A rooftop garden and sky lounge on the 22nd floor offer tenants panoramic views of the Lagos Bight.',
    gallery: [
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    title: 'Hilltop Retreat',
    location: 'Plateau State', year: '2024',
    category: 'Built', type: 'Residential',
    area: '620 sqm', duration: '14 months',
    videoId: '',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80&auto=format&fit=crop',
    description: 'Perched at 1 300m above sea level on the Jos Plateau, this private residence is designed around the drama of the landscape. A single-storey bar plan steps down the hillside, with each bedroom pavilion oriented to capture the cooler prevailing winds. Local granite boulders are woven into the architecture as retaining walls and feature elements.',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 6,
    title: 'Marina Pavilion',
    location: 'Port Harcourt', year: '2025',
    category: 'Unbuilt', type: 'Public',
    area: '1 100 sqm', duration: '—',
    videoId: '',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop',
    description: 'A waterfront pavilion and market hall for the Port Harcourt Marina regeneration scheme. The floating timber roof — inspired by mangrove canopies — shelters an open programme of market stalls, event space, and a public jetty. The design prioritises passive cooling through elevated floors and a porous perimeter, inviting river breezes through the space.',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c349479?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    ],
  },
]

type Filter = 'All' | 'Built' | 'Unbuilt'
const FILTERS: Filter[] = ['All', 'Built', 'Unbuilt']

async function fetchFromSupabase(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data || data.length === 0) return []
  return data.map((r: any) => ({
    id: Number(r.id), title: r.title, location: r.location, year: r.year,
    category: r.category, type: r.type, img: r.img, description: r.description,
    area: r.area ?? '—', duration: r.duration ?? '—',
    videoId: r.video_id ?? '', gallery: r.gallery ?? [],
  }))
}

/* ─── Badge ──────────────────────────────────────────────────────── */
/* Badges sit on top of images so we never use theme CSS vars here — */
/* hardcoded dark overlay + light text works on any image in any     */
/* theme (light or dark mode, bright or dark photo).                 */
function Badge({ label, gold }: { label: string; gold?: boolean }) {
  return (
    <span style={{
      fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.32em',
      textTransform: 'uppercase' as const,
      padding: '4px 10px',
      border: `1px solid ${gold ? 'rgba(196,168,119,0.75)' : 'rgba(255,255,255,0.22)'}`,
      color: gold ? '#c4a877' : '#eeebe5',
      background: 'rgba(10,10,8,0.68)',
      backdropFilter: 'blur(8px)',
      whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </span>
  )
}

/* ─── Card ───────────────────────────────────────────────────────── */
function Card({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: 'flex', flexDirection: 'column' as const, gap: 14, cursor: 'none' }}
      onClick={() => onOpen(p)}
    >
      {/* Image */}
      <div className="img-zoom" style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: 'var(--surface)' }}>
        <img src={p.img} alt={p.title} loading="lazy" />

        {/* Badges — top-left */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          <Badge label={p.type} />
          <Badge label={p.category} gold={p.category === 'Built'} />
        </div>

        {/* Hover overlay with open hint */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(12,12,10,0.6) 0%, transparent 50%)',
          opacity: 0, transition: 'opacity 0.4s',
          display: 'flex', alignItems: 'flex-end', padding: '18px',
        }}
          className="card-overlay"
        >
          <span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: 'var(--text)' }}>
            View Project ↗
          </span>
        </div>
      </div>

      {/* Text */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 25, fontWeight: 400, color: 'var(--text)', lineHeight: 1.2 }}>
            {p.title}
          </h3>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--muted)', flexShrink: 0, marginLeft: 8 }}>{p.year}</span>
        </div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--muted)', letterSpacing: '0.04em' }}>
          {p.location}, Nigeria
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */
export default function Projects({ refreshKey = 0 }: { refreshKey?: number }) {
  const [filter, setFilter] = useState<Filter>('All')
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS)
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-50px' })

  useEffect(() => {
    fetchFromSupabase().then(data => {
      if (data.length > 0) setProjects(data)
    })
  }, [refreshKey])

  const shown = filter === 'All' ? projects : projects.filter(p => p.category === filter)

  return (
    <>
      <section id="projects" style={{ padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)' }}>

        {/* Header */}
        <div ref={headRef} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 24, marginBottom: 'clamp(40px, 6vw, 72px)' }}>
          <div>
            <motion.p
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
              style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 12 }}
            >
              Selected Work
            </motion.p>
            {/* heading-clip class prevents letter clipping */}
            <div className="heading-clip">
              <motion.h2
                initial={{ y: '110%' }} animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}
              >
                Our projects span <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>typologies</em> &amp; locations
              </motion.h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: 'flex', gap: 4 }}
          >
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 22px', cursor: 'none',
                  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase' as const,
                  border: '1px solid',
                  borderColor: filter === f ? 'var(--gold)' : 'var(--border)',
                  background: filter === f ? 'var(--gold)' : 'transparent',
                  color: filter === f ? 'var(--bg)' : 'var(--muted)',
                  transition: 'all 0.25s',
                }}
              >
                {f}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(20px, 3vw, 40px)' }}
          >
            {shown.map((p, i) => <Card key={p.id} p={p} i={i} onOpen={setActiveProject} />)}
          </motion.div>
        </AnimatePresence>

        <style>{`
          .img-zoom:hover .card-overlay { opacity: 1 !important; }
        `}</style>
      </section>

      {/* Modal */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  )
}
