import { useRef } from 'react'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'
import { BackofficeMockup } from '@/case/BackofficeMockup'
import { useScrollScreen } from '@/case/useScrollScreen'

const KALZA = catalogs[0]

// The choreography: which devices are on stage per step, and the status each
// shows. Layout is fixed — back office (left) · seller (centre) · buyer (right)
// — so the seller is the constant anchor and partners enter from their own side
// (spatial continuity, per the motion guidance).
const STEPS = [
  { id: 'share', seller: { screen: 'share' }, side: null },
  { id: 'order', seller: { screen: 'order', orderStep: 0 }, side: 'buyer', buyer: { screen: 'catalog' } },
  { id: 'confirm', seller: { screen: 'order', orderStep: 1 }, side: 'backoffice' },
  { id: 'paid', seller: { screen: 'order', orderStep: 2 }, side: 'buyer', buyer: { screen: 'order', orderStep: 2 } },
]

// A labelled device that slides in from its own side and out faster than it
// entered. Transforms/opacity only (GPU); animation gated to motion-safe.
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
  const beat = t.story.beats[index]

  const boPresent = step.side === 'backoffice'
  const buyerPresent = step.side === 'buyer'
  // Keep the buyer's last screen while it slides away.
  const buyer = step.buyer ?? { screen: 'catalog' }

  return (
    <div>
      {/* Intro */}
      <section className="flex min-h-[58vh] flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{t.story.eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t.story.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.story.lead}</p>
      </section>

      {/* Desktop: sticky stage — back office · seller · buyer, caption at bottom */}
      <div ref={ref} className="hidden lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <div className="flex flex-1 items-center justify-center gap-8 px-6 pt-14">
            {/* left slot — back office */}
            <div className="flex w-[360px] justify-end">
              <Device label={t.phone.labelBackoffice} present={boPresent} from="left">
                <BackofficeMockup />
              </Device>
            </div>

            {/* centre — seller (anchor; re-fades only when its screen changes) */}
            <Device label={t.phone.labelSeller}>
              <PhoneFrame
                key={`seller-${step.seller.screen}`}
                catalog={KALZA}
                screen={step.seller.screen}
                orderStep={step.seller.orderStep}
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
              />
            </Device>

            {/* right slot — buyer */}
            <div className="flex w-[360px] justify-start">
              <Device label={t.phone.labelBuyer} present={buyerPresent} from="right">
                <PhoneFrame catalog={KALZA} screen={buyer.screen} orderStep={buyer.orderStep} />
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

      {/* Mobile: stacked, labelled devices then caption */}
      <div className="flex flex-col gap-16 py-8 lg:hidden">
        {STEPS.map((s, i) => (
          <section key={s.id} className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="flex w-full flex-wrap items-start justify-center gap-4">
              {s.side === 'backoffice' && (
                <Device label={t.phone.labelBackoffice}>
                  <BackofficeMockup className="scale-90" />
                </Device>
              )}
              <Device label={t.phone.labelSeller}>
                <PhoneFrame catalog={KALZA} screen={s.seller.screen} orderStep={s.seller.orderStep} className="scale-90" />
              </Device>
              {s.side === 'buyer' && (
                <Device label={t.phone.labelBuyer}>
                  <PhoneFrame catalog={KALZA} screen={s.buyer.screen} orderStep={s.buyer.orderStep} className="scale-90" />
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
