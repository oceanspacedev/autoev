import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// Full-screen image viewer; index === null means closed
export default function Lightbox({ images, index, onChange }) {
  const open = index !== null
  const go = (d) => onChange((index + d + images.length) % images.length)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onChange(null)
      if (e.key === 'ArrowRight') onChange((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') onChange((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, images.length, onChange])

  if (!open) return null
  const img = images[index]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" onClick={() => onChange(null)}>
      <img src={img.src} alt={img.alt ?? img.caption ?? ''} className="max-h-[88vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
      <button type="button" className="absolute right-4 top-4 grid size-11 place-items-center text-white hover:text-ev-red" onClick={() => onChange(null)} aria-label="Tutup">
        <X className="size-7" />
      </button>
      {images.length > 1 && (
        <>
          <button type="button" className="absolute left-2 grid size-12 place-items-center bg-white/10 text-white hover:bg-ev-red" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Sebelumnya">
            <ChevronLeft />
          </button>
          <button type="button" className="absolute right-2 grid size-12 place-items-center bg-white/10 text-white hover:bg-ev-red" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Berikutnya">
            <ChevronRight />
          </button>
          <p className="absolute bottom-4 font-ui text-xs font-semibold text-white/70">
            {index + 1} / {images.length}{img.caption ? ` · ${img.caption}` : ''}
          </p>
        </>
      )}
    </div>
  )
}
