import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PhoneFrame } from '@/case/PhoneScreens'
import { useScrollShrink } from '@/case/useScrollShrink'

// PhoneFrame's own rendered height (11 header + 420 content + 7*2 border, all
// border-box) — used to land the pinned phone's center exactly at top-[58px]
// once settled. Keep in sync with PhoneScreens.jsx if that layout changes.
const PHONE_NATIVE_HEIGHT = 478
// The phone's pinned top edge, in viewport px — must match the "58" baked
// into centerTop below and into the fully-covered check.
const PHONE_TOP = 58
// Figma "Hero - Before" phone is 350px wide vs. today's 248px settled frame —
// the intro starts at that same ratio and scales down to 1 (native/today).
const HERO_START_SCALE = 350 / 248
// Reserves layout space for the fixed-position phone (which doesn't occupy
// flow space on its own) so the text below starts clear of the initial
// splash. Only affects pacing now, not correctness — the phone's visibility
// is driven by real geometry (isFullyCovered below), not a scroll budget.
const SPACER_HEIGHT = '90dvh'
// Height of the gradient band between the phone and the text (matches the
// Figma "Gradient" node) — the phone stays visible, blending through this
// band, until its own bottom edge (where the solid background begins)
// reaches the phone's top. Only then does the phone disappear.
const GRADIENT_HEIGHT = 140
// The cover (gradient + text) must stay opaque for at least the phone's own
// height below where it starts, or there's a real gap under a short text
// block where the still-fixed phone shows through from below before
// isFullyCovered ever triggers. +40 for a little safety margin.
const COVER_MIN_HEIGHT = GRADIENT_HEIGHT + PHONE_NATIVE_HEIGHT + 40

// Mobile-only case-study hero (Alexis, 2026-06-19; splash-style rebuild
// 2026-07-05 from a Figma prototype at node 169:1900). On a phone there's no
// room for the desktop "following phone", so the hero leads with the device
// itself:
//   · the app frame opens oversized and centered on both axes — filling
//     roughly one screen like a splash screen — and settles to its normal
//     size as you start scrolling (useScrollShrink's `shrink`), sliding from
//     screen-center up to pinned-at-top-[58px] in the same motion
//   · it's `position: fixed` the whole time, not sticky-with-release — it
//     never scrolls away on its own
//   · below it: a gradient band, then the eyebrow/title/CTA text on a solid
//     background — together they're the "cover". Ordinary scrolling carries
//     this cover up over the still-fixed phone; the phone stays visible
//     (blending through the gradient) for the whole climb and disappears
//     only once the cover's solid part has actually reached the phone's top
//     edge (isFullyCovered, measured via gradientRef) — never before, so it
//     can't vanish into a gap the way a fixed scroll-distance fade did
//   · tapping the frame raises an action bar (Open the app / Back-office)
//   · scrolling down hands that bar off to its inline resting place under the
//     title, and you keep scrolling
// Everything here is lg:hidden — the desktop case study is untouched.
export function MobileCaseHero({ catalog, t, onOpenApp }) {
  const slotRef = useRef(null)
  const gradientRef = useRef(null)
  const [barOpen, setBarOpen] = useState(false)
  const [isFullyCovered, setIsFullyCovered] = useState(false)
  const { shrink } = useScrollShrink()
  const heroScale = HERO_START_SCALE - (HERO_START_SCALE - 1) * shrink

  // The phone disappears exactly when the cover's solid part (the gradient's
  // own bottom edge, where it finishes fading to the page background) has
  // risen to the phone's top — not a moment before, and not based on any
  // fixed scroll distance.
  useEffect(() => {
    const measure = () => {
      const el = gradientRef.current
      if (!el) return
      setIsFullyCovered(el.getBoundingClientRect().bottom <= PHONE_TOP)
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    return () => window.removeEventListener('scroll', measure)
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

  // Once the phone is covered, the bar only shows on tap — a scroll dismisses it.
  useEffect(() => {
    if (!barOpen || !isFullyCovered) return
    const start = window.scrollY
    const onScroll = () => Math.abs(window.scrollY - start) > 48 && setBarOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [barOpen, isFullyCovered])

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

  // Center's vertical position blends from screen-center (shrink 0) to
  // exactly top-[58px] once settled (shrink 1) — mixes vh and px in one
  // calc() so it works at any viewport height without reading it in JS.
  const centerTop = `calc(${50 * (1 - shrink)}vh + ${(PHONE_TOP + PHONE_NATIVE_HEIGHT / 2) * shrink}px)`

  return (
    <div className="lg:hidden">
      {/* Splash-like: phone fixed in the viewport, centered on both axes at
          rest, sliding up to pin at top-[58px] as it settles. Stays fully
          crisp and visible until isFullyCovered flips it off — no
          independent fade of its own. z-0 (not negative — a negative
          z-index sits behind the page's own top-level bg-background
          wrapper too, hiding the phone everywhere, even at rest). The
          cover panel below is explicitly z-10 so it stacks above the
          phone; COVER_MIN_HEIGHT is what actually prevents later, plain
          sections from being able to expose it (see below). */}
      <div
        className={cn('fixed left-1/2 z-0', isFullyCovered && 'invisible')}
        style={{
          top: centerTop,
          transform: `translate(-50%, -50%) scale(${heroScale})`,
        }}
      >
        <button
          type="button"
          onClick={() => setBarOpen(true)}
          aria-label={t.hero.ctaApp}
          className="relative block motion-safe:transition-transform active:scale-[0.98]"
        >
          <PhoneFrame catalog={catalog} screen="catalog" />
        </button>
      </div>

      {/* Reserves flow space for the fixed phone above (which doesn't occupy
          any on its own) so the text below starts clear of the splash. */}
      <div aria-hidden="true" style={{ height: SPACER_HEIGHT }} />

      {/* The cover: a gradient band (matches the Figma "Gradient" node) the
          phone actually blends through, then a solid filler for the text —
          kept as two separate elements, not one bg-background wrapper
          around both. A parent background would sit behind the gradient
          too, turning its "transparent" stops into a hard cutoff instead of
          a blend (the parent's own opaque fill shows through instead of the
          phone). The filler's own min-height (COVER_MIN_HEIGHT minus the
          gradient) is what guarantees no gap below a text block shorter
          than the phone, exposing it from below before isFullyCovered ever
          triggers. */}
      <div className="relative z-10">
        <div
          ref={gradientRef}
          aria-hidden="true"
          className="bg-gradient-to-b from-transparent to-background"
          style={{ height: GRADIENT_HEIGHT }}
        />
        <div className="bg-background" style={{ minHeight: COVER_MIN_HEIGHT - GRADIENT_HEIGHT }}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            {t.hero.eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-tight">{t.hero.title}</h1>

          {/* Inline resting place — the buttons "fall into" here as you scroll past */}
          <div ref={slotRef} className="mt-8 flex gap-3">
            {actions}
          </div>
        </div>
      </div>

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
