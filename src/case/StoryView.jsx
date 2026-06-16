import { useRef } from 'react'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'
import { BackofficeMockup } from '@/case/BackofficeMockup'
import { BuyerScreen, SellerScreen } from '@/case/StoryDevices'
import { usePlayhead } from '@/case/usePlayhead'
import { useScrollScreen } from '@/case/useScrollScreen'

const KALZA = catalogs[0]

// Each active step auto-plays an interaction (count = phases): a tap on one
// device that propagates to the seller. Layout is fixed — back office (left) ·
// seller (centre) · buyer (right) — so the seller is the constant anchor.
const STEPS = [
  { id: 'share', count: 1, side: null },
  { id: 'order', count: 3, side: 'buyer', buyerKind: 'reserve' },
  { id: 'confirm', count: 3, side: 'backoffice' },
  { id: 'paid', count: 3, side: 'buyer', buyerKind: 'pay' },
]

// Which confirmations the seller has, given the active step index + phase.
function sellerChecks(index, phase) {
  return {
    buyer: index > 1 || (index === 1 && phase >= 2),
    bo: index > 2 || (index === 2 && phase >= 2),
    pay: index === 3 && phase >= 2,
  }
}

function Device({ label, present = true, from, children }) {
  const offset = from === 'left' ? '-translate-x-10' : from === 'right' ? 'translate-x-10' : ''
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 will-change-transform motion-safe:transition-[transform,opacity]',
        present
          ? 'translate-x-0 opacity-100 motion-safe:duration-500 motion-safe:ease-out'
          : cn('pointer-events-none opacity-0 motion-safe:duration-300 motion-safe:ease-in', offset)
      )}
    >
      <span className="rounded-full border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

export function StoryView() {
  const { t } = useLang()
  const ref = useRef(null)
  const activeId = useScrollScreen(ref, 'share')
  const index = Math.max(0, STEPS.findIndex((s) => s.id === activeId))
  const step = STEPS[index]
  const phase = usePlayhead(activeId, step.count)
  const beat = t.story.beats[index]

  const checks = sellerChecks(index, phase)
  const boPresent = step.side === 'backoffice'
  const buyerPresent = step.side === 'buyer'

  return (
    <div>
      {/* Intro */}
      <section className="mx-auto flex min-h-[58vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{t.story.eyebrow}</p>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{t.story.title}</h1>
        <div className="mt-6 flex flex-col gap-4">
          {t.story.intro.map((p, i) => (
            <p
              key={i}
              className={cn(
                'leading-relaxed',
                i === t.story.intro.length - 1 ? 'text-lg font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Desktop: sticky stage — back office · seller · buyer; caption at bottom */}
      <div ref={ref} className="hidden lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <div className="flex flex-1 items-center justify-center gap-8 px-6 pt-14">
            {/* left — back office */}
            <div className="flex w-[360px] justify-end">
              <Device label={t.phone.labelBackoffice} present={boPresent} from="left">
                <BackofficeMockup phase={boPresent ? phase : undefined} />
              </Device>
            </div>

            {/* centre — seller (anchor) */}
            <Device label={t.phone.labelSeller}>
              {index === 0 ? (
                <PhoneFrame key="seller-share" catalog={KALZA} screen="share" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" />
              ) : (
                <PhoneFrame key="seller-order" catalog={KALZA}>
                  <SellerScreen checks={checks} />
                </PhoneFrame>
              )}
            </Device>

            {/* right — buyer */}
            <div className="flex w-[360px] justify-start">
              <Device label={t.phone.labelBuyer} present={buyerPresent} from="right">
                <PhoneFrame catalog={KALZA}>
                  <BuyerScreen catalog={KALZA} kind={step.buyerKind ?? 'reserve'} phase={buyerPresent ? phase : 0} />
                </PhoneFrame>
              </Device>
            </div>
          </div>

          <div className="pb-14">
            <div
              key={step.id}
              className="mx-auto max-w-xl px-6 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-300"
            >
              <span className="text-xs font-semibold text-primary">{index + 1} / {STEPS.length}</span>
              <h2 className="mt-1 text-2xl font-bold">{beat.title}</h2>
              <p className="mt-2 text-muted-foreground">{beat.body}</p>
            </div>
          </div>
        </div>

        {/* invisible scroll drivers */}
        <div className="-mt-[100dvh]">
          {STEPS.map((s) => (
            <section key={s.id} data-screen={s.id} className="min-h-dvh" aria-hidden="true" />
          ))}
        </div>
      </div>

      {/* Mobile: stacked, each step at its completed state */}
      <div className="flex flex-col gap-16 py-8 lg:hidden">
        {STEPS.map((s, i) => (
          <section key={s.id} className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="flex w-full flex-wrap items-start justify-center gap-4">
              {s.side === 'backoffice' && (
                <Device label={t.phone.labelBackoffice}>
                  <BackofficeMockup phase={2} className="scale-90" />
                </Device>
              )}
              <Device label={t.phone.labelSeller}>
                {i === 0 ? (
                  <PhoneFrame catalog={KALZA} screen="share" className="scale-90" />
                ) : (
                  <PhoneFrame catalog={KALZA} className="scale-90">
                    <SellerScreen checks={sellerChecks(i, 2)} />
                  </PhoneFrame>
                )}
              </Device>
              {s.side === 'buyer' && (
                <Device label={t.phone.labelBuyer}>
                  <PhoneFrame catalog={KALZA} className="scale-90">
                    <BuyerScreen catalog={KALZA} kind={s.buyerKind} phase={2} />
                  </PhoneFrame>
                </Device>
              )}
            </div>
            <div className="max-w-md">
              <span className="text-xs font-semibold text-primary">{i + 1} / {STEPS.length}</span>
              <h2 className="mt-1 text-2xl font-bold">{t.story.beats[i].title}</h2>
              <p className="mt-2 text-muted-foreground">{t.story.beats[i].body}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Close */}
      <section className="flex min-h-[58vh] flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="max-w-2xl text-2xl font-bold sm:text-3xl">{t.story.close.title}</h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.story.close.body}</p>
      </section>
    </div>
  )
}
