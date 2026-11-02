import { useEffect, useRef } from 'react'

const TILT_MAX = 10

/*
 * Scroll-linked illustration. JS only writes two CSS variables:
 *   --p  0 → 1 as the element travels from the bottom to the top of the viewport
 *   --k  motion strength (lower when the visitor prefers reduced motion)
 * Every transform below is derived from them in CSS, so React never re-renders on scroll.
 */
export default function EvGlobe({ src, alt, tone = 'dark' }) {
  const light = tone === 'light'
  const ref = useRef(null)
  const tilt = useRef(null)

  useEffect(() => {
    const el = ref.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
      el.style.setProperty('--p', p.toFixed(4))
      el.style.setProperty('--k', reduce.matches ? '0.3' : '1')
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    tilt.current.style.transform = `rotateY(${x * TILT_MAX * 2}deg) rotateX(${-y * TILT_MAX * 2}deg)`
  }
  const onPointerLeave = () => { tilt.current.style.transform = '' }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-md [perspective:1000px]"
      style={{ '--p': 0.5, '--k': 1 }}
    >
      {/* Red glow grows as the section scrolls in */}
      <div
        className={`absolute inset-[12%] rounded-full blur-3xl ${light ? 'bg-ev-red/20' : 'bg-ev-red/45'}`}
        style={{ transform: 'scale(calc(0.55 + var(--p) * 0.8))', opacity: 'calc(0.25 + var(--p) * 0.75)' }}
        aria-hidden="true"
      />
      {/* Dashed orbit ring turns with scroll */}
      <div
        className={`absolute inset-[3%] rounded-full border-2 border-dashed ${light ? 'border-ev-red/35' : 'border-white/15'}`}
        style={{ transform: 'rotate(calc(var(--p) * 260deg * var(--k)))' }}
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ev-red shadow-[0_0_16px_4px_rgba(239,77,72,0.6)]" />
      </div>

      <div ref={tilt} className="relative size-full transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`relative size-full object-contain ${light ? 'drop-shadow-[0_30px_30px_rgba(43,22,27,0.18)]' : 'drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]'}`}
          style={{
            transform:
              'translateY(calc((0.5 - var(--p)) * 140px * var(--k))) rotate(calc((var(--p) - 0.5) * 24deg * var(--k))) scale(calc(0.8 + min(var(--p) * 2, 1) * 0.2))',
          }}
        />
      </div>
    </div>
  )
}
