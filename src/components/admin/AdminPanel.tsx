import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { fetchProjects, fetchTeam, fetchReferences, fetchUpdates } from '../../lib/queries'
import type { Project } from '../ProjectModal'
import type { Tab, TeamMember, Reference, UpdateEntry } from './types'
import { Login, TabBar } from './shared'
import { primaryBtn, secondaryBtn, sectionHeading, metaText } from './styles'
import { ProjectForm, ProjectRow } from './ProjectSection'
import { TeamForm, TeamRow } from './TeamSection'
import { ReferenceForm, ReferenceRow } from './ReferenceSection'
import { UpdateForm, UpdateRow } from './UpdateSection'
import { ContactForm } from './ContactSection'

export type SavedSection = 'projects' | 'team' | 'references' | 'updates' | 'settings'

interface Props {
  onClose: () => void
  onSaved: (section: SavedSection) => void
}

export default function AdminPanel({ onClose, onSaved }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  // Data state
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [refs, setRefs] = useState<Reference[]>([])
  const [updates, setUpdates] = useState<UpdateEntry[]>([])

  // Loading state
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [loadingRefs, setLoadingRefs] = useState(true)
  const [loadingUpdates, setLoadingUpdates] = useState(true)

  // Add/edit state
  const [adding, setAdding] = useState<Tab | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingRef, setEditingRef] = useState<Reference | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<UpdateEntry | null>(null)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Initial fetch on login (all tabs so switching is instant)
  useEffect(() => {
    if (!session) return
    let alive = true

    setLoadingProjects(true); setLoadingMembers(true)
    setLoadingRefs(true); setLoadingUpdates(true)

    fetchProjects().then(d => { if (alive) { setProjects(d); setLoadingProjects(false) } })
    fetchTeam().then(d => { if (alive) { setMembers(d); setLoadingMembers(false) } })
    fetchReferences().then(d => { if (alive) { setRefs(d); setLoadingRefs(false) } })
    fetchUpdates().then(d => { if (alive) { setUpdates(d); setLoadingUpdates(false) } })

    return () => { alive = false }
  }, [session])

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const resetEditState = () => {
    setAdding(null)
    setEditingProject(null); setEditingMember(null)
    setEditingRef(null); setEditingUpdate(null)
  }

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); resetEditState() }

  // Saved handlers — refetch only the relevant section and notify parent
  const onProjectsSaved = async () => {
    resetEditState()
    const data = await fetchProjects()
    setProjects(data)
    onSaved('projects')
  }

  const onTeamSaved = async () => {
    resetEditState()
    const data = await fetchTeam()
    setMembers(data)
    onSaved('team')
  }

  const onRefsSaved = async () => {
    resetEditState()
    const data = await fetchReferences()
    setRefs(data)
    onSaved('references')
  }

  const onUpdatesSaved = async () => {
    resetEditState()
    const data = await fetchUpdates()
    setUpdates(data)
    onSaved('updates')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const atRefLimit = refs.length >= 6
  const atUpdateLimit = updates.length >= 10

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'var(--bg)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <Header session={session} onLogout={logout} onClose={onClose} />

      <div style={{ flex: 1, padding: 'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 80px)', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        {!session ? (
          <Login onLogin={setSession} />
        ) : (
          <>
            <TabBar active={activeTab} onChange={handleTabChange} />

            {activeTab === 'projects' && (
              <SectionShell
                mode={editingProject ? 'edit' : adding === 'projects' ? 'add' : 'list'}
                entityLabel="Project"
                onAdd={() => setAdding('projects')}
                addBtnText="+ Add New Project"
                count={projects.length}
                loading={loadingProjects}
                unitLabel="project"
                addForm={<ProjectForm onSaved={onProjectsSaved} onCancel={() => setAdding(null)} />}
                editForm={editingProject && <ProjectForm project={editingProject} onSaved={onProjectsSaved} onCancel={() => setEditingProject(null)} />}
                list={projects.map(p => (
                  <ProjectRow key={p.id} p={p}
                    onDelete={id => { setProjects(ps => ps.filter(x => x.id !== id)); onSaved('projects') }}
                    onEdit={setEditingProject} />
                ))}
              />
            )}

            {activeTab === 'team' && (
              <SectionShell
                mode={editingMember ? 'edit' : adding === 'team' ? 'add' : 'list'}
                entityLabel="Member"
                onAdd={() => setAdding('team')}
                addBtnText="+ Add Team Member"
                count={members.length}
                loading={loadingMembers}
                unitLabel="member"
                addForm={<TeamForm onSaved={onTeamSaved} onCancel={() => setAdding(null)} />}
                editForm={editingMember && <TeamForm member={editingMember} onSaved={onTeamSaved} onCancel={() => setEditingMember(null)} />}
                list={members.map(m => (
                  <TeamRow key={m.id} m={m}
                    onDelete={id => { setMembers(ms => ms.filter(x => x.id !== id)); onSaved('team') }}
                    onEdit={setEditingMember} />
                ))}
              />
            )}

            {activeTab === 'references' && (
              <SectionShell
                mode={editingRef ? 'edit' : adding === 'references' ? 'add' : 'list'}
                entityLabel="Reference"
                onAdd={() => { if (!atRefLimit) setAdding('references') }}
                addBtnText="+ Add New Reference"
                addDisabled={atRefLimit}
                limitNote={atRefLimit ? '(max 6)' : undefined}
                count={refs.length}
                loading={loadingRefs}
                unitLabel="reference"
                addForm={<ReferenceForm onSaved={onRefsSaved} onCancel={() => setAdding(null)} />}
                editForm={editingRef && <ReferenceForm reference={editingRef} onSaved={onRefsSaved} onCancel={() => setEditingRef(null)} />}
                list={refs.map(r => (
                  <ReferenceRow key={r.id} r={r}
                    onDelete={id => { setRefs(rs => rs.filter(x => x.id !== id)); onSaved('references') }}
                    onEdit={setEditingRef} />
                ))}
              />
            )}

            {activeTab === 'contact' && (
              <>
                <h2 style={sectionHeading}>
                  Site <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Settings</em>
                </h2>
                <ContactForm onSaved={() => onSaved('settings')} />
              </>
            )}

            {activeTab === 'updates' && (
              <SectionShell
                mode={editingUpdate ? 'edit' : adding === 'updates' ? 'add' : 'list'}
                entityLabel="Update"
                onAdd={() => { if (!atUpdateLimit) setAdding('updates') }}
                addBtnText="+ Add New Update"
                addDisabled={atUpdateLimit}
                limitNote={atUpdateLimit ? '(max 10)' : undefined}
                count={updates.length}
                loading={loadingUpdates}
                unitLabel="update"
                addForm={<UpdateForm onSaved={onUpdatesSaved} onCancel={() => setAdding(null)} />}
                editForm={editingUpdate && <UpdateForm update={editingUpdate} onSaved={onUpdatesSaved} onCancel={() => setEditingUpdate(null)} />}
                list={updates.map(u => (
                  <UpdateRow key={u.id} u={u}
                    onDelete={id => { setUpdates(us => us.filter(x => x.id !== id)); onSaved('updates') }}
                    onEdit={setEditingUpdate} />
                ))}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

function Header({ session, onLogout, onClose }: { session: Session | null; onLogout: () => void; onClose: () => void }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--bg)', borderBottom: '1px solid var(--border)',
      padding: '16px clamp(24px, 5vw, 80px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 300, color: 'var(--text)' }}>
          Content <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Manager</em>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {session && (
          <button onClick={onLogout} style={{ ...secondaryBtn, padding: '9px 18px' }}>Logout</button>
        )}
        <button onClick={onClose} style={{ ...secondaryBtn, padding: '9px 18px' }}>× Close</button>
      </div>
    </div>
  )
}

interface SectionProps {
  mode: 'list' | 'add' | 'edit'
  entityLabel: string
  onAdd: () => void
  addBtnText: string
  addDisabled?: boolean
  limitNote?: string
  count: number
  loading: boolean
  unitLabel: string
  addForm: ReactNode
  editForm: ReactNode
  list: ReactNode
}

function SectionShell(props: SectionProps) {
  const {
    mode, entityLabel, onAdd, addBtnText, addDisabled,
    limitNote, count, loading, unitLabel, addForm, editForm, list,
  } = props

  if (mode === 'edit') {
    return (
      <>
        <h2 style={sectionHeading}>
          Edit <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{entityLabel}</em>
        </h2>
        {editForm}
      </>
    )
  }

  if (mode === 'add') {
    return (
      <>
        <h2 style={sectionHeading}>
          New <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{entityLabel}</em>
        </h2>
        {addForm}
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <button
          onClick={onAdd}
          disabled={addDisabled}
          style={{
            ...primaryBtn, display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 28px',
            cursor: addDisabled ? 'default' : 'none',
            opacity: addDisabled ? 0.5 : 1,
          }}
        >
          {addBtnText}
        </button>
        {limitNote && (
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {limitNote}
          </span>
        )}
      </div>
      <div>
        <p style={metaText}>
          {loading ? 'Loading…' : `${count} ${unitLabel}${count !== 1 ? 's' : ''}`}
        </p>
        {loading ? (
          <SkeletonRows />
        ) : count === 0 ? (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', padding: '32px 0' }}>
            No {unitLabel}s yet. Add your first one above.
          </p>
        ) : list}
      </div>
    </>
  )
}

function SkeletonRows() {
  return (
    <div aria-hidden>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: 76, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 48, height: 48, background: 'var(--surface)', opacity: 0.5 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '40%', background: 'var(--surface)', marginBottom: 8, opacity: 0.5 }} />
            <div style={{ height: 10, width: '28%', background: 'var(--surface)', opacity: 0.35 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

