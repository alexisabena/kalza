import { useCatalogStore } from '@/stores/catalogStore'
import { useSessionStore } from '@/stores/sessionStore'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const roles = [
  { id: 'buyer', label: 'Compradora' },
  { id: 'retailer', label: 'Vendedora' },
]

// Catalog selector inside the hamburger drawer — the DSM showcase moment.
// Selecting a catalog updates data-theme on <html> and the whole app rebrands.
export function CatalogDrawer({ open, onClose }) {
  const { catalogs, activeCatalog, setCatalog } = useCatalogStore()
  const { role, setRole } = useSessionStore()

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
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar catálogo"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold">Catálogos</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
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
                  {/* Cover placeholder until catalog imagery is decided (open-questions.md) */}
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-primary">
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
                      Activo
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Demo-only: flip between profiles to present both experiences */}
        <div className="mt-auto border-t p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Perfil (demo)</p>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                aria-pressed={role === r.id}
                className={cn(
                  'h-10 flex-1 rounded-md border text-sm font-medium',
                  role === r.id && 'border-primary bg-primary text-primary-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
