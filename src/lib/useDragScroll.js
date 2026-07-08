import { useEffect } from 'react'

// Mouse + touch drag-to-swipe a horizontal scroller. Snap is suspended during
// the drag; on release WE resolve the target slide (SWIPE_FRACTION of the
// slide's width) instead of leaving it to the browser's native scroll-snap
// settle, which needs a drag past ~50% width when released without velocity —
// Alexis, 2026-07-07, flagged that as "too demanding," wanting a lighter swipe
// to change photos. touch-action: pan-y lets vertical page scroll pass through
// untouched while we own the horizontal gesture. A drag is flagged so the
// trailing click (open lightbox / double-tap exit) is suppressed.
const SWIPE_FRACTION = 0.18

export function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'pan-y'

    let down = false
    let startX = 0
    let startLeft = 0
    let moved = false

    const onDown = (e) => {
      down = true
      moved = false
      startX = e.clientX
      startLeft = el.scrollLeft
      el.style.scrollSnapType = 'none' // snap fights a live drag
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 3) moved = true
      el.scrollLeft = startLeft - dx
    }
    const settle = (e) => {
      if (!down) return
      down = false
      const width = el.clientWidth
      const dx = e.clientX - startX
      el.style.scrollSnapType = '' // restore class-based snap
      const startIndex = Math.round(startLeft / width)
      const target =
        width && Math.abs(dx) > width * SWIPE_FRACTION ? startIndex + (dx < 0 ? 1 : -1) : startIndex
      el.scrollTo({ left: target * width, behavior: 'smooth' })
    }
    // Capture-phase: swallow the click that ends a drag so it doesn't open/close.
    const onClick = (e) => {
      if (moved) {
        e.stopPropagation()
        e.preventDefault()
        moved = false
      }
    }

    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', settle)
    window.addEventListener('pointercancel', settle)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', settle)
      window.removeEventListener('pointercancel', settle)
      el.removeEventListener('click', onClick, true)
    }
  }, [ref])
}
