import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: '1px solid var(--border)',
  padding: '12px 0', color: 'var(--text)',
  fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 300,
  outline: 'none', transition: 'border-color 0.3s',
}

const DEFAULTS = {
  email1: 'info@arengcon.com',
  email2: 'projects@arengcon.com',
  phone: '+234 000 000 0000',
  location: 'Lagos, Nigeria',
  hours: 'Mon – Fri, 9am – 6pm',
  instagram: '#',
  linkedin: '#',
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact({ refreshKey }: { refreshKey?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [info, setInfo] = useState(DEFAULTS)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (!data || data.length === 0) return
      const merged = { ...DEFAULTS }
      data.forEach((row: { key: string; value: string }) => {
        if (row.key in merged) (merged as any)[row.key] = row.value
      })
      setInfo(merged)
    })
  }, [refreshKey])

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--gold)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--border)'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/9b45c5626d94268c4c051548d5be048f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: `New enquiry from ${form.name} — Arengcon`,
          _template: 'table',
        }),
      })
      const data = await res.json()
      if (data.success === 'true' || data.success === true) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" style={{ padding: 'clamp(64px, 8vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid var(--border)' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 'clamp(40px, 6vw, 72px)', textAlign: 'center' }}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            Get In Touch
          </motion.p>
          <div className="heading-clip">
            <motion.h2 initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }} style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.05 }}>
              Let's build <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>something great</em>
            </motion.h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'clamp(40px, 6vw, 96px)' }}>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2, duration: 0.55 }} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>Email</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 300, color: 'var(--text)' }}>{info.email1}</p>
              {info.email2 && <p style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 300, color: 'var(--text)', marginTop: 4 }}>{info.email2}</p>}
            </div>
            {[
              { label: 'Phone',  val: info.phone },
              { label: 'Studio', val: info.location },
              { label: 'Hours',  val: info.hours },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{item.label}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 300, color: 'var(--text)' }}>{item.val}</p>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 20, paddingTop: 8 }}>
              {[{ label: 'Instagram', href: info.instagram }, { label: 'LinkedIn', href: info.linkedin }].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link-slide"
                  style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                >{s.label}</a>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3, duration: 0.55 }}>
            {status === 'sent' ? (
              <div style={{ paddingTop: 40 }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 10 }}>Thank you.</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 17, color: 'var(--muted)' }}>We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {([['name','text','Name','Your name'],['email','email','Email','your@email.com']] as [string,string,string,string][]).map(([id,type,label,ph]) => (
                  <div key={id}>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</p>
                    <input id={id} type={type} required placeholder={ph}
                      value={form[id as 'name'|'email']}
                      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                      onFocus={onFocus} onBlur={onBlur}
                      style={{ ...INPUT_STYLE }}
                    />
                  </div>
                ))}
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Message</p>
                  <textarea required rows={4} placeholder="Tell us about your project..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    onFocus={onFocus} onBlur={onBlur}
                    style={{ ...INPUT_STYLE, resize: 'none', display: 'block' }}
                  />
                </div>

                {status === 'error' && (
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#c0392b', letterSpacing: '0.05em' }}>
                    Something went wrong — please try again or email us directly.
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'} style={{
                  padding: '14px 0', background: 'none',
                  border: '1px solid rgba(238,235,229,0.2)',
                  fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
                  color: status === 'sending' ? 'var(--muted)' : 'var(--text)',
                  cursor: status === 'sending' ? 'default' : 'none',
                  transition: 'all 0.3s',
                  opacity: status === 'sending' ? 0.6 : 1,
                }}
                  onMouseEnter={e => {
                    if (status === 'sending') return
                    const el = e.currentTarget
                    el.style.background = 'var(--gold)'; el.style.borderColor = 'var(--gold)'; el.style.color = 'var(--bg)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'none'; el.style.borderColor = 'rgba(238,235,229,0.2)'; el.style.color = 'var(--text)'
                  }}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
