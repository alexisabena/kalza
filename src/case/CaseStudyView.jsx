import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Store, LayoutDashboard } from 'lucide-react'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'
import { useScrollScreen } from '@/case/useScrollScreen'
import { QrAppModal } from '@/case/QrAppModal'

// Font + radius per brand are design facts, not translated copy.
const THEME_META = {
  'cat-001': { font: 'Plus Jakarta Sans', radius: '0.2rem' },
  'cat-002': { font: 'DM Sans', radius: '0.1rem' },
  'cat-003': { font: 'Montserrat', radius: '0.75rem' },
}

// Case study layout: narrative on the left, a phone on the right that follows
// the scroll and shows the screen relevant to each section.
export function CaseStudyView() {
  const { t } = useLang()
  const ref = useRef(null)
  const screen = useScrollScreen(ref, 'catalog')
  const [qrOpen, setQrOpen] = useState(false)

  // During the theming section, cycle the phone through the brands.
  const [themeIdx, setThemeIdx] = useState(0)
  useEffect(() => {
    if (screen !== 'theme') return
    const id = setInterval(() => setThemeIdx((i) => (i + 1) % catalogs.length), 1700)
    return () => clearInterval(id)
  }, [screen])

  const catalog = screen === 'theme' ? catalogs[themeIdx] : catalogs[0]
  const phoneScreen = screen === 'theme' ? 'catalog' : screen

  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Narrative */}
        <div ref={ref} className="min-w-0 py-10">
          <Beat screen="catalog" first>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              {t.hero.eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{t.hero.title}</h1>
            <p className="mt-5 text-lg text-muted-foreground">{t.hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => setQrOpen(true)} className={cn(buttonVariants(), 'px-5')}>
                <Store aria-hidden="true" /> {t.hero.ctaApp}
              </button>
              <Link to="/admin" className={cn(buttonVariants({ variant: 'outline' }), 'px-5')}>
                <LayoutDashboard aria-hidden="true" /> {t.hero.ctaAdmin}
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-8 text-sm">
              <Meta label={t.hero.yearLabel} value={t.hero.year} />
              <Meta label={t.hero.roleLabel} value={t.hero.role} />
              <Meta label={t.hero.stackLabel} value={t.hero.stack} />
            </dl>
          </Beat>

          <Beat screen="catalog" eyebrow={t.reto.eyebrow} title={t.reto.title}>
            <p>{t.reto.body}</p>
          </Beat>

          <Beat screen="share" eyebrow={t.solucion.eyebrow} title={t.solucion.title}>
            <div className="grid gap-4 sm:grid-cols-3">
              {t.solucion.cards.map((c) => (
                <div key={c.title} className="rounded-xl border p-4">
                  <h3 className="mb-1.5 font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </Beat>

          <Beat screen="theme" eyebrow={t.theming.eyebrow} title={t.theming.title}>
            <p className="mb-6">{t.theming.body}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {catalogs.map((c) => (
                <div key={c.id} data-theme={c.themeId || undefined} className="font-sans rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="size-7 rounded-lg bg-primary" aria-hidden="true" />
                    <span className="font-bold text-primary">{c.brand}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.theming.themes[c.id]}</p>
                  <dl className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                    <div className="flex justify-between"><dt>{t.theming.fontLabel}</dt><dd className="font-medium text-foreground">{THEME_META[c.id].font}</dd></div>
                    <div className="flex justify-between"><dt>{t.theming.radiusLabel}</dt><dd className="font-medium text-foreground">{THEME_META[c.id].radius}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          </Beat>

          <Beat screen="order" eyebrow={t.flujo.eyebrow} title={t.flujo.title}>
            <p className="mb-6">{t.flujo.body}</p>
            <ol className="flex flex-wrap gap-2">
              {t.phone.steps.map((label, i) => (
                <li key={label} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </Beat>

          <Beat screen="catalog" eyebrow={t.superficies.eyebrow} title={t.superficies.title}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Surface icon={Store} data={t.superficies.app} onClick={() => setQrOpen(true)} />
              <Surface icon={LayoutDashboard} data={t.superficies.admin} to="/admin" />
            </div>
          </Beat>
        </div>

        {/* Following phone (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-28 flex justify-center pt-6">
            <PhoneFrame
              key={`${catalog.id}-${phoneScreen}`}
              catalog={catalog}
              screen={phoneScreen}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 border-t">
        <div className="flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold text-primary">Kalza</p>
            <p className="text-sm text-muted-foreground">{t.footer.brandLine}</p>
          </div>
          <button type="button" onClick={() => setQrOpen(true)} className={cn(buttonVariants(), 'px-5')}>
            {t.footer.cta} <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </footer>

      {qrOpen && <QrAppModal onClose={() => setQrOpen(false)} />}
    </div>
  )
}

function Beat({ screen, eyebrow, title, first, children }) {
  return (
    <section data-screen={screen} className={cn('max-w-2xl', first ? 'pb-16' : 'py-16')}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      {title && <h2 className="mb-5 text-2xl font-bold sm:text-3xl">{title}</h2>}
      <div className="text-muted-foreground [&_p]:leading-relaxed">{children}</div>
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  )
}

function Surface({ icon: Icon, data, to, onClick }) {
  const cls = cn(buttonVariants({ variant: 'outline' }), 'self-start px-4')
  return (
    <div className="flex flex-col rounded-xl border p-5">
      <Icon className="mb-3 size-6 text-primary" aria-hidden="true" />
      <h3 className="mb-1.5 text-lg font-semibold text-foreground">{data.title}</h3>
      <p className="mb-4 flex-1 text-sm">{data.body}</p>
      {onClick ? (
        <button type="button" onClick={onClick} className={cls}>
          {data.cta} <ArrowRight aria-hidden="true" />
        </button>
      ) : (
        <Link to={to} className={cls}>
          {data.cta} <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
