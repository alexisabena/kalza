import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PhoneFrame } from '@/case/PhoneScreens'

// Mobile-only case-study hero (Alexis, 2026-06-19). On a phone there's no room
// for the desktop "following phone", so the hero leads with the device itself:
//   · the app frame sits ON TOP, above the eyebrow + title (nothing else)
//   · tapping the frame raises an action bar (Open the app / Back-office)
//   · scrolling down hands that bar off to its inline resting place under the
//     title, and you keep scrolling
//   · past the hero a compact frame pins below the header; tapping it raises the
//     same bar again, and scrolling dismisses it
// Everything here is lg:hidden — the desktop case study is untouched.
export function MobileCaseHero({ catalog, t, onOpenApp }) {
  const heroPhoneRef = useRef(null)
  const slotRef = useRef(null)
  const [barOpen, setBarOpen] = useState(false)
  const [dock, setDock] = useState(false) // compact frame pinned (scrolled past hero)
  const [titleNearDock, setTitleNearDock] = useState(false) // a section title is passing under the dock's band

  // Pin the compact frame once the hero frame scrolls out of view.
  useEffect(() => {
    const el = heroPhoneRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Section titles run full-width in this column, so the pinned dock (top-[58px]
  // to ~256px) would otherwise sit on top of whichever title is scrolling past.
  // Hide the dock while any title is in that band instead of guessing a safe size.
  useEffect(() => {
    const titles = document.querySelectorAll('[data-case-title]')
    if (!titles.length) return
    const obs = new IntersectionObserver(
      (entries) => setTitleNearDock(entries.some((e) => e.isIntersecting)),
      { rootMargin: '-58px 0px -70% 0px' }
    )
    titles.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [])

  // Hand the raised bar off to the inline buttons when they scroll into view.
  useEffect(() => {
    const el = slotRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setBarOpen(false),
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Past the hero the bar only shows on tap — a scroll dismisses it.
  useEffect(() => {
    if (!barOpen || !dock) return
    const start = window.scrollY
    const onScroll = () => Math.abs(window.scrollY - start) > 48 && setBarOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [barOpen, dock])

  const actions = (
    <>
      <button type="button" onClick={onOpenApp} className={cn(buttonVariants(), 'flex-1')}>
        <Store aria-hidden="true" /> {t.hero.ctaApp}
      </button>
      <Link to="/admin" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
        <LayoutDashboard aria-hidden="true" /> {t.hero.ctaAdmin}
      </Link>
    </>
  )

  return (
    <div className="lg:hidden">
      {/* App frame on top — tap to raise the action bar */}
      <button
        ref={heroPhoneRef}
        type="button"
        onClick={() => setBarOpen(true)}
        aria-label={t.hero.ctaApp}
        className="mx-auto mb-9 block w-fit motion-safe:transition-transform active:scale-[0.98]"
      >
        <PhoneFrame catalog={catalog} screen="catalog" />
      </button>

      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
        {t.hero.eyebrow}
      </p>
      <h1 className="text-4xl font-bold leading-tight">{t.hero.title}</h1>

      {/* Inline resting place — the buttons "fall into" here as you scroll past */}
      <div ref={slotRef} className="mt-8 flex gap-3">
        {actions}
      </div>

      {/* Compact frame pinned below the header for the rest of the page — anchored
          to the corner, and hidden whenever a section title is passing through its
          band (see the titleNearDock observer above), so it never sits on top of
          text. */}
      <button
        type="button"
        onClick={() => setBarOpen(true)}
        aria-label={t.hero.ctaApp}
        className={cn(
          'fixed right-4 top-[58px] z-20 h-[198px] w-[110px] overflow-visible motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out',
          dock && !titleNearDock ? 'opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
        )}
      >
        <span className="block origin-top-right scale-[0.44]">
          <PhoneFrame catalog={catalog} screen="catalog" />
        </span>
      </button>

      {/* Action bar — raised on tap, hidden otherwise; reduced-motion still toggles */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur',
          'motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out',
          barOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        aria-hidden={!barOpen}
      >
        {actions}
      </div>
    </div>
  )
}
