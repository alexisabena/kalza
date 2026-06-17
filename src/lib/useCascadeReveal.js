import { useLayoutEffect, useRef, useState } from 'react'

// Graceful top-to-bottom reveal for masonry cards. The parent flips `start`
// (e.g. when the catalog scrolls into view); each card then animates in after a
// delay proportional to its VISUAL vertical position, so the price plates ripple
// down the grid instead of popping in all at once or per-card-on-dwell.
//
// offsetTop in a CSS-columns layout already reflects rendered vertical position
// (a card high in column 2 has a small offsetTop), so the cascade reads as a
// clean downward sweep across both columns. Measured once after layout — product
// cards carry an aspect ratio, so heights are known before images load.
export function useCascadeReveal(start, { perPx = 0.45, max = 700 } = {}) {
  const ref = useRef(null)
  const [delay, setDelay] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) setDelay(Math.min(ref.current.offsetTop * perPx, max))
  }, [perPx, max])

  return [ref, start ? delay : 0]
}
