import { useEffect, useState } from 'react'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Scroll distance (px) over which the oversized, centered hero phone settles
// to its normal size and slides from screen-center up to its pinned top spot.
// Not tied to any Figma duration (that was ms, this is scroll offset).
const SHRINK_PX = 220

// Scroll-scrubbed progress for the hero phone intro (MobileCaseHero): 0→1
// over the first SHRINK_PX of scroll. Reversible — scrolling back up
// un-shrinks it, since this is a continuous function of scrollY, not a
// one-shot trigger. Reduced motion jumps straight to the settled scale.
export function useScrollShrink() {
  const [scrollY, setScrollY] = useState(REDUCED ? SHRINK_PX : 0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { shrink: Math.min(1, scrollY / SHRINK_PX) }
}
