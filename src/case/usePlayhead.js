import { useEffect, useState } from 'react'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A playhead that advances 0 → count-1 while a step is active, so a step can
// auto-play its interaction (tap → confirm → propagate). Resets when the active
// step changes; jumps to the end under reduced motion.
export function usePlayhead(activeId, count, interval = 850) {
  const [phase, setPhase] = useState(0)
  const [prevId, setPrevId] = useState(activeId)

  // Reset the playhead when the active step changes (render-time adjustment).
  if (activeId !== prevId) {
    setPrevId(activeId)
    setPhase(REDUCED ? Math.max(0, count - 1) : 0)
  }

  useEffect(() => {
    if (count <= 1 || REDUCED) return
    let p = 0
    const id = setInterval(() => {
      p += 1
      setPhase(p)
      if (p >= count - 1) clearInterval(id)
    }, interval)
    return () => clearInterval(id)
  }, [activeId, count, interval])

  return phase
}
