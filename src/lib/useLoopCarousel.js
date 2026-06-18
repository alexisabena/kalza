import { useCallback, useEffect, useRef, useState } from 'react'

// Infinite looping for a horizontal scroll-snap carousel. You can't overscroll
// past the ends, so we clone the last slide before the first and the first after
// the last; once a scroll settles on a clone, we jump instantly to the matching
// real slide — seamless because it's the same image. Swiping (and autoplay) then
// wrap both ways. Returns the slides to render (with clones), the REAL active
// index, and the handlers to wire up.
export function useLoopCarousel(items, initialIndex = 0) {
  const ref = useRef(null)
  const idle = useRef(null)
  const loop = items.length > 1
  const display = loop ? [items[items.length - 1], ...items, items[0]] : items
  const [active, setActive] = useState(initialIndex)

  // Start on the real initial slide (offset past the leading clone).
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = (loop ? initialIndex + 1 : initialIndex) * el.clientWidth
  }, [initialIndex, loop])

  useEffect(() => () => clearTimeout(idle.current), [])

  // After scrolling settles on a clone, hop to the real slide (instant, no smooth).
  const correct = () => {
    const el = ref.current
    if (!el || !loop) return
    const raw = Math.round(el.scrollLeft / el.clientWidth)
    if (raw === 0) el.scrollLeft = items.length * el.clientWidth
    else if (raw === display.length - 1) el.scrollLeft = el.clientWidth
  }

  const onScroll = (e) => {
    const el = e.currentTarget
    const raw = Math.round(el.scrollLeft / el.clientWidth)
    const real = loop ? ((raw - 1) % items.length + items.length) % items.length : raw
    setActive(real)
    clearTimeout(idle.current)
    idle.current = setTimeout(correct, 90)
  }

  // Advance one slide (autoplay) — the clone + correction handle the wrap.
  // Stable identity so it can sit in an interval's dependency array.
  const next = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ left: el.scrollLeft + el.clientWidth, behavior: 'smooth' })
  }, [])

  return { ref, display, active, loop, onScroll, next }
}
