import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Desktop-only touch pointer. Emulates Chrome devtools' responsive/touch-mode
// cursor — a soft dark fingertip circle — so reviewing the phone on a desktop
// reads as a touch surface (and the lightbox can nudge swipe gestures). The
// column hides the native cursor on lg; this stands in for it. Position + opacity
// are written imperatively (no re-render per move); only the press state is React.
// Hidden below lg and on real touch input (coarse pointers don't move it).
export function TouchCursor() {
  const ref = useRef(null)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    let raf = 0
    let x = 0
    let y = 0
    const paint = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      el.style.opacity = '1'
    }
    const move = (e) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const hide = () => {
      if (ref.current) ref.current.style.opacity = '0'
    }
    const down = (e) => e.pointerType !== 'touch' && setPressed(true)
    const up = () => setPressed(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('mouseleave', hide)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('mouseleave', hide)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-[100] hidden size-9 rounded-full lg:block',
        'border border-white/50 bg-neutral-900/35 shadow-md backdrop-blur-[1px]',
        'motion-safe:transition-[width,height,background-color] motion-safe:duration-150',
        pressed && 'size-7 bg-neutral-900/60'
      )}
    />
  )
}
