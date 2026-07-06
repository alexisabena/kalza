import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LanguageProvider, useLang } from '@/case/LanguageContext'
import { StoryView } from '@/case/StoryView'
import { PortfolioHeader } from '@/case/PortfolioHeader'

// The story's own page/route — see CaseStudyPage for why this isn't a
// client-side view switch.
export function StoryPage() {
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
  const { t } = useLang()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PortfolioHeader
        navLink={
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.nav.backToCase}
          </Link>
        }
      />
      <StoryView />
    </div>
  )
}
