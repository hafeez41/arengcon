import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ringX = 0, ringY = 0, dotX = 0, dotY = 0, raf: number

    const move = (e: MouseEvent) => { dotX = e.clientX; dotY = e.clientY }

    const tick = () => {
      ringX += (dotX - ringX) * 0.1
      ringY += (dotY - ringY) * 0.1
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${dotX}px, ${dotY}px)`
      if (ringRef.current) ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', move)
    raf = requestAnimationFrame(tick)

    const onEnter = () => ringRef.current?.classList.add('hovered')
    const onLeave = () => ringRef.current?.classList.remove('hovered')

    const observe = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    observe()
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
      mo.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cur-dot" />
      <div ref={ringRef} className="cur-ring" />
    </>
  )
}
