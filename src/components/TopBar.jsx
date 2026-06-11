import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { CatalogDrawer } from '@/components/CatalogDrawer'

export function TopBar() {
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 grid h-14 grid-cols-[3rem_1fr_3rem] items-center border-b bg-background px-1">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="flex size-12 items-center justify-center text-foreground"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        {/* aria-live announces the rebrand to screen readers on catalog switch */}
        <span aria-live="polite" className="truncate text-center text-lg font-bold text-primary">
          {activeCatalog.brand}
        </span>
        <span aria-hidden="true" />
      </header>
      <CatalogDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
