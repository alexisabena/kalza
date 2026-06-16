import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import '@/case/motion.css'
import { LanguageProvider, useLang } from '@/case/LanguageContext'
import { CaseStudyView } from '@/case/CaseStudyView'
import { StoryView } from '@/case/StoryView'

// Portfolio template: a sticky header with a view switcher (Case study / Story)
// and a language toggle (English default). Switching view keeps the scroll
// position. The page chrome stays on the Kalza base theme; mockups scope theirs.
export function CaseStudyPage() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
  }, [])

  return (
    <LanguageProvider>
      <Template />
    </LanguageProvider>
  )
}

function Template() {
  const { t, lang, setLang } = useLang()
  const [mode, setMode] = useState('case') // 'case' | 'story'
  const savedScroll = useRef(null)

  // Keep the scroll position when swapping views.
  const switchMode = (next) => {
    if (next === mode) return
    savedScroll.current = window.scrollY
    setMode(next)
  }
  useLayoutEffect(() => {
    if (savedScroll.current != null) {
      window.scrollTo(0, savedScroll.current)
      savedScroll.current = null
    }
  }, [mode])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <span className="text-lg font-bold text-primary">Kalza</span>

          {/* View switcher */}
          <div className="flex rounded-md border p-0.5 text-sm">
            {[
              ['case', t.nav.caseStudy],
              ['story', t.nav.story],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => switchMode(id)}
                aria-pressed={mode === id}
                className={cn(
                  'rounded px-3 py-1 font-medium transition-colors',
                  mode === id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Language toggle */}
          <div className="flex rounded-md border p-0.5 text-xs font-medium">
            {['en', 'es'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={cn(
                  'rounded px-2 py-1 uppercase transition-colors',
                  lang === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      {mode === 'case' ? <CaseStudyView /> : <StoryView />}
    </div>
  )
}
