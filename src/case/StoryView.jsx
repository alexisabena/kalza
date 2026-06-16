import { useRef } from 'react'
import { catalogs } from '@/data/catalogs'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'
import { BackofficeMockup } from '@/case/BackofficeMockup'
import { useScrollScreen } from '@/case/useScrollScreen'

const KALZA = catalogs[0]

// The choreography: which devices are on stage per step, and the status each
// shows. The seller phone is persistent; the right slot cycles buyer →
// back-office → buyer as the order propagates across roles.
const STEPS = [
  { id: 'share', seller: { screen: 'share' }, right: null },
  { id: 'order', seller: { screen: 'order', orderStep: 0 }, right: { type: 'buyer', screen: 'catalog' } },
  { id: 'confirm', seller: { screen: 'order', orderStep: 1 }, right: { type: 'backoffice' } },
  { id: 'paid', seller: { screen: 'order', orderStep: 2 }, right: { type: 'buyer', screen: 'order', orderStep: 2 } },
]

function RightDevice({ right, idKey }) {
  if (!right) return null
  if (right.type === 'backoffice') {
    return <BackofficeMockup key={`bo-${idKey}`} className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500" />
  }
  return (
    <PhoneFrame
      key={`buyer-${idKey}`}
      catalog={KALZA}
      screen={right.screen}
      orderStep={right.orderStep}
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-8 motion-safe:duration-500"
    />
  )
}

export function StoryView() {
  const { t } = useLang()
  const ref = useRef(null)
  const activeId = useScrollScreen(ref, 'share')
  const index = Math.max(0, STEPS.findIndex((s) => s.id === activeId))
  const step = STEPS[index]
  const beat = t.story.beats[index]

  return (
    <div>
      {/* Intro */}
      <section className="flex min-h-[58vh] flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{t.story.eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t.story.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.story.lead}</p>
      </section>

      {/* Desktop: sticky stage, devices front and centre, caption at the bottom */}
      <div ref={ref} className="hidden lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <div className="flex flex-1 items-center justify-center gap-10 px-6 pt-14">
            <PhoneFrame
              key={`seller-${step.id}`}
              catalog={KALZA}
              screen={step.seller.screen}
              orderStep={step.seller.orderStep}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
            />
            <RightDevice right={step.right} idKey={step.id} />
          </div>
          <div className="pb-14">
            <div key={step.id} className="mx-auto max-w-xl px-6 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
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

      {/* Mobile: stacked, devices then caption */}
      <div className="flex flex-col gap-16 py-8 lg:hidden">
        {STEPS.map((s, i) => (
          <section key={s.id} className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="flex w-full flex-wrap items-center justify-center gap-4">
              <PhoneFrame catalog={KALZA} screen={s.seller.screen} orderStep={s.seller.orderStep} className="scale-90" />
              {s.right && (
                s.right.type === 'backoffice'
                  ? <BackofficeMockup className="scale-90" />
                  : <PhoneFrame catalog={KALZA} screen={s.right.screen} orderStep={s.right.orderStep} className="scale-90" />
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
