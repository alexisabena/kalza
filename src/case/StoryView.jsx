import { useEffect, useRef, useState } from 'react'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'
import { useScrollScreen } from '@/case/useScrollScreen'

// Story layout: the device is front and centre. A sticky phone holds the middle
// of the screen while the story beats scroll past on alternating sides, the
// phone changing screen for each beat.
export function StoryView() {
  const { t } = useLang()
  const ref = useRef(null)
  const screen = useScrollScreen(ref, 'catalog')

  const [themeIdx, setThemeIdx] = useState(0)
  useEffect(() => {
    if (screen !== 'theme') return
    const id = setInterval(() => setThemeIdx((i) => (i + 1) % catalogs.length), 1700)
    return () => clearInterval(id)
  }, [screen])

  const catalog = screen === 'theme' ? catalogs[themeIdx] : catalogs[0]
  const phoneScreen = screen === 'theme' ? 'catalog' : screen

  return (
    <div ref={ref} className="mx-auto max-w-5xl px-6">
      {/* Intro */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          {t.story.eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t.story.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.story.lead}</p>
      </section>

      {/* Desktop: sticky centre phone + beats scrolling on alternating sides */}
      <div className="hidden lg:block">
        <div
          className="pointer-events-none sticky top-0 z-0 flex h-dvh items-center justify-center"
          aria-hidden="true"
        >
          <PhoneFrame
            key={`${catalog.id}-${phoneScreen}`}
            catalog={catalog}
            screen={phoneScreen}
            className="scale-110 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          />
        </div>

        <div className="relative z-10 -mt-[100dvh]">
          {t.story.beats.map((b, i) => (
            <section
              key={b.title}
              data-screen={b.screen}
              className={cn('flex min-h-dvh items-center', i % 2 ? 'justify-end' : 'justify-start')}
            >
              <div className="w-80 rounded-2xl border bg-background/85 p-6 shadow-sm backdrop-blur">
                <h2 className="mb-2 text-2xl font-bold">{b.title}</h2>
                <p className="leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Mobile: stacked beats, each with its own phone */}
      <div className="flex flex-col gap-16 py-8 lg:hidden">
        {t.story.beats.map((b) => (
          <section key={b.title} className="flex flex-col items-center gap-6 text-center">
            <PhoneFrame catalog={b.screen === 'theme' ? catalogs[1] : catalogs[0]} screen={b.screen === 'theme' ? 'catalog' : b.screen} />
            <div className="max-w-md">
              <h2 className="mb-2 text-2xl font-bold">{b.title}</h2>
              <p className="leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Close */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h2 className="max-w-2xl text-2xl font-bold sm:text-3xl">{t.story.close.title}</h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.story.close.body}</p>
      </section>
    </div>
  )
}
