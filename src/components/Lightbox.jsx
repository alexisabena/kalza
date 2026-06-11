import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fullscreen gallery: swipe between photos (snap carousel), tap a photo to
// zoom 2x and pan by dragging/scrolling, tap again to zoom out, X / Escape closes.
export function Lightbox({ images, alt, initialIndex = 0, onClose }) {
  const [active, setActive] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)
  const trackRef = useRef(null)

  // Lock page scroll behind the lightbox
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Open on the photo that was tapped
  useEffect(() => {
    const track = trackRef.current
    if (track) track.scrollLeft = initialIndex * track.clientWidth
  }, [initialIndex])

  const handleScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget
    const i = Math.round(scrollLeft / clientWidth)
    if (i !== active) {
      setActive(i)
      setZoomed(false) // leaving a slide resets its zoom
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería: ${alt}`}
      className="fixed inset-0 z-50 bg-black"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar galería"
        className="absolute right-2 top-2 z-10 flex size-12 items-center justify-center rounded-full bg-black/50 text-white"
      >
        <X className="size-6" aria-hidden="true" />
      </button>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className={cn(
          'flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]',
          zoomed && 'overflow-x-hidden' // panning the zoomed photo must not swipe slides
        )}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className={cn(
              'h-full w-screen shrink-0 snap-center',
              zoomed && i === active ? 'overflow-auto [scrollbar-width:none]' : 'overflow-hidden'
            )}
          >
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              onClick={() => setZoomed((z) => !z)}
              className={cn(
                'motion-safe:transition-[width] motion-safe:duration-200',
                zoomed && i === active
                  ? 'w-[200%] max-w-none cursor-zoom-out'
                  : 'h-full w-full cursor-zoom-in object-contain'
              )}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && !zoomed && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-1.5">
          {images.map((src, i) => (
            <span
              key={src}
              className={cn('size-1.5 rounded-full bg-white/40', i === active && 'bg-white')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
