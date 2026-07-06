import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'

// Shared chrome for the case-study and story pages: Kalza wordmark, a single
// nav link (either page links to the other), and the language toggle.
// Case study and Story are separate routes (not a client-side view switch),
// so each page's own scroll position and lifecycle are independent.
export function PortfolioHeader({ navLink }) {
  const { lang, setLang } = useLang()

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <span className="text-lg font-bold text-primary">Kalza</span>

        {navLink}

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
  )
}
