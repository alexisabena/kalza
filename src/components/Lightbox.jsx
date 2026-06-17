import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// A closer view of the product photos, bound to the phone frame (centered
// max-w-md), not the whole desktop. Swipe between photos; the backdrop is a
// "theater glow" — the current photo blown up + blurred, spilling light into the
// frame. The image sits inset with theme-radius corners so it reads as a focused
// view, not an accidental full-screen zoom. Double-tap the photo (or X / Escape)
// to leave. A one-time swipe nudge invites the gesture.
export function Lightbox({ images, alt, initialIndex = 0, onClose }) {
  const [active, setActive] = useState(initialIndex)
  const [hint, setHint] = useState(images.length > 1)
  const trackRef = useRef(null)
  const lastTap = useRef(0)

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

  // Retire the nudge after a moment even if the viewer doesn't move.
  useEffect(() => {
    if (!hint) return
    const id = setTimeout(() => setHint(false), 4200)
    return () => clearTimeout(id)
  }, [hint])

  const handleScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget
    const i = Math.round(scrollLeft / clientWidth)
    // Only a real slide change retires the nudge — not the initial positioning scroll.
    if (i !== active) {
      setActive(i)
      if (hint) setHint(false)
    }
  }

  // Double-tap the photo to leave the closer view.
  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      onClose()
      return
    }
    lastTap.current = now
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería: ${alt}`}
      className="fixed inset-y-0 left-0 right-0 z-50 mx-auto max-w-md overflow-hidden bg-black"
    >
      {/* Theater glow — current photo, blown up + blurred, fades in on swipe. */}
      <div
        key={images[active]}
        aria-hidden="true"
        style={{ backgroundImage: `url(${images[active]})` }}
        className="absolute inset-0 scale-125 bg-cover bg-center blur-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/55" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar galería"
        className="absolute right-3 top-3 z-20 flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
      >
        <X className="size-6" aria-hidden="true" />
      </button>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={() => hint && setHint(false)}
        className="relative flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center p-5"
          >
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              onClick={handleTap}
              className="max-h-full max-w-full rounded-[var(--radius)] object-contain shadow-2xl"
            />
          </div>
        ))}
      </div>

      {/* Swipe nudge — a fingertip that drifts left, twice, then fades. */}
      {hint && images.length > 1 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="swipe-hint size-10 rounded-full border-2 border-white/70 bg-white/25 backdrop-blur-sm" />
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-1.5">
          {images.map((src, i) => (
            <span
              key={src}
              className={cn('size-1.5 rounded-full bg-white/40 transition-all', i === active && 'w-3 bg-white')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
