import { Link } from 'react-router-dom'
import { useCatalogStore } from '@/stores/catalogStore'
import { useSessionStore } from '@/stores/sessionStore'
import { X, ExternalLink, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT, useLocale, LOCALES } from '@/i18n'

// Buyer + vendedora are the two mobile profiles. The mayorista is not a mobile
// role — he runs the desktop back-office, linked below. Labels resolve via i18n.
const roles = ['buyer', 'retailer']

// Catalog selector inside the hamburger drawer — the DSM showcase moment.
// Selecting a catalog updates data-theme on <html> and the whole app rebrands.
export function CatalogDrawer({ open, onClose }) {
  const { catalogs, activeCatalog, setCatalog } = useCatalogStore()
  const { role, setRole } = useSessionStore()
  const t = useT()
  const { locale, setLocale } = useLocale()

  const handleSelect = (catalog) => {
    setCatalog(catalog)
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-30 bg-foreground/40 motion-safe:transition-opacity motion-safe:duration-250',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      {/* Centered max-w-md wrapper so the drawer slides from the phone column's
          left edge on desktop, not the viewport edge (forced mobile frame).
          overflow-hidden clips the closed drawer to the column so it doesn't
          peek into the desktop gutter. */}
      <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 mx-auto max-w-md overflow-hidden">
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar catálogo"
        className={cn(
          'pointer-events-auto absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold">{t.drawer.title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawer.close}
            className="flex size-12 items-center justify-center text-muted-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="flex flex-col gap-3 p-4">
          {catalogs.map((catalog) => {
            const isActive = catalog.id === activeCatalog.id
            return (
              <li key={catalog.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(catalog)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left',
                    isActive && 'border-primary ring-1 ring-primary'
                  )}
                >
                  {/* Cover placeholder — tinted with each catalog's OWN brand
                      colour (not the active theme's) so it hints at the brand. */}
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
                    style={{
                      color: `var(--brand-${catalog.id})`,
                      backgroundColor: `color-mix(in oklch, var(--brand-${catalog.id}) 12%, transparent)`,
                    }}
                  >
                    {catalog.brand.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{catalog.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {catalog.brand} · {catalog.season}
                    </p>
                  </div>
                  {isActive && (
                    <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      {t.drawer.active}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Demo-only: flip between profiles to present both experiences */}
        <div className="mt-auto border-t p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t.drawer.profile}</p>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  'h-10 flex-1 rounded-md border text-sm font-medium',
                  role === r && 'border-primary bg-primary text-primary-foreground'
                )}
              >
                {t.drawer[r]}
              </button>
            ))}
          </div>

          {/* Language switcher — reviewer affordance (the app ships ES) */}
          <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">{t.drawer.language}</p>
          <div className="flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                aria-pressed={locale === l.code}
                className={cn(
                  'h-10 flex-1 rounded-md border text-sm font-medium',
                  locale === l.code && 'border-primary bg-primary text-primary-foreground'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* The mayorista's surface is a separate desktop back-office */}
          <Link
            to="/admin"
            onClick={onClose}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {t.drawer.backoffice}
          </Link>

          {/* Return to the portfolio case study */}
          <Link
            to="/"
            onClick={onClose}
            className="mt-2 flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-4 translate-y-[2px]" aria-hidden="true" />
            {t.drawer.caseStudy}
          </Link>
        </div>
      </aside>
      </div>
    </>
  )
}
