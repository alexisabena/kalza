import { useEffect, useRef, useState } from 'react'

const FIRST_MS = 3000 // first plates this page load take their time…
const NEXT_MS = 1750 // …everything after (new rows, or scrolling back) is quicker

// Flips true once the first plate has revealed this page load.
let firstRevealDone = false

// Price-plate reveal, viewport-driven and cheap. One IntersectionObserver per
// card — no scroll listeners, no per-frame layout reads, so it stays light even
// with a long catalog. A plate reveals only after the card has dwelled on screen
// (FIRST_MS the first time, NEXT_MS after), and hides again when it scrolls off,
// so coming back re-reveals it. A small viewport-relative delay makes each batch
// ripple top-to-bottom instead of popping in together. Images themselves are
// native lazy-loaded (ProductImage), so off-screen cards cost nothing until near.
export function usePriceReveal() {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer.current)
        if (entry.isIntersecting) {
          const dwell = firstRevealDone ? NEXT_MS : FIRST_MS
          const rel = Math.max(0, entry.boundingClientRect.top) / window.innerHeight
          const stagger = Math.min(rel * 280, 280)
          timer.current = setTimeout(() => {
            firstRevealDone = true
            setRevealed(true)
          }, dwell + stagger)
        } else {
          setRevealed(false)
        }
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => {
      clearTimeout(timer.current)
      io.disconnect()
    }
  }, [])

  return [ref, revealed]
}
