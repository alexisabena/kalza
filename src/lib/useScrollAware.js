import { useEffect, useState } from 'react'

// Scroll-driven show/hide for fixed chrome — one hook, two behaviors (factored
// out of BottomNav's old useHideOnScrollDown per responsive-spec §6bis):
//   hideOn: 'down' — hide while scrolling DOWN, reveal on scroll up / near top
//                    (BottomNav's classic "images take priority").
//   hideOn: 'up'   — INVERTED (the tablet-l slim brand header, D4): hide while
//                    scrolling UP, reveal on scroll down OR after the view sits
//                    idle for `idleMs` (Alexis: reappear after 5s static).
// Listens to window scroll (the phone + tablet-l scroller). Returns `hidden`.
export function useScrollAware({ hideOn = 'down', idleMs = 0 } = {}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let idle

    const hide = () => {
      setHidden(true)
      if (idleMs) {
        clearTimeout(idle)
        idle = setTimeout(() => setHidden(false), idleMs)
      }
    }

    const onScroll = () => {
      const y = window.scrollY
      if (y < 16) {
        setHidden(false)
      } else if (hideOn === 'down') {
        if (y > last + 4) setHidden(true)
        else if (y < last - 4) setHidden(false)
      } else {
        // inverted: scroll up hides, scroll down reveals
        if (y < last - 4) hide()
        else if (y > last + 4) setHidden(false)
      }
      last = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idle)
    }
  }, [hideOn, idleMs])

  return hidden
}
