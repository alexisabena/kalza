import { useEffect, useState } from 'react'

// Tracks which [data-screen] beat is currently centered in the viewport, so a
// sticky phone can show the matching screen as the reader scrolls.
export function useScrollScreen(containerRef, initial = 'catalog') {
  const [screen, setScreen] = useState(initial)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const els = root.querySelectorAll('[data-screen]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setScreen(e.target.dataset.screen)
        })
      },
      // A narrow band across the middle of the viewport is the trigger line.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [containerRef])

  return screen
}
