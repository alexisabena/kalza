import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Menu, ChevronLeft, ShoppingBag } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { CatalogDrawer } from '@/components/CatalogDrawer'

function CartButton() {
  const count = useCartStore(selectCount)

  return (
    <Link
      to="/carrito"
      aria-label={`Mi carrito, ${count} artículos`}
      className="relative flex size-12 items-center justify-center text-foreground"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export function TopBar() {
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Inside a product or the cart the catalog can't change — back instead of menu
  const showBack = pathname.startsWith('/producto') || pathname === '/carrito'
  const isCart = pathname === '/carrito'

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 grid h-14 grid-cols-[3rem_1fr_3rem] items-center border-b bg-background px-1">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Regresar"
            className="flex size-12 items-center justify-center text-foreground"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="flex size-12 items-center justify-center text-foreground"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}

        {/* aria-live announces the rebrand to screen readers on catalog switch */}
        <span aria-live="polite" className="truncate text-center text-lg font-bold text-primary">
          {isCart ? 'Mi carrito' : activeCatalog.brand}
        </span>

        {isCart ? <span aria-hidden="true" /> : <CartButton />}
      </header>
      {!showBack && <CatalogDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </>
  )
}
