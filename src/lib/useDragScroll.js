import { useEffect } from 'react'

// Mouse click-drag to scroll a horizontal scroller (touch already pans natively).
// Lets a desktop reviewer "swipe" the carousel/lightbox by dragging — without the
// native image-drag ghost taking over. Snap is suspended during the drag and
// restored on release so it settles on the nearest slide. A drag is flagged so
// the trailing click (open lightbox / double-tap exit) is suppressed.
export function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let down = false
    let startX = 0
    let startLeft = 0
    let moved = false

    const onDown = (e) => {
      if (e.pointerType === 'touch') return // touch pans on its own
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
    const onUp = () => {
      if (!down) return
      down = false
      el.style.scrollSnapType = '' // restore class-based snap → settles on nearest
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
    window.addEventListener('pointerup', onUp)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('click', onClick, true)
    }
  }, [ref])
}
