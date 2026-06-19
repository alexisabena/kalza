import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Menu, ChevronLeft, ShoppingBag } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { useSessionStore } from '@/stores/sessionStore'
import { CatalogDrawer } from '@/components/CatalogDrawer'
import { useT } from '@/i18n'

function CartButton() {
  const count = useCartStore(selectCount)
  const t = useT()

  return (
    <Link
      to="/carrito"
      aria-label={t.topbar.cartAria(count)}
      className="relative flex size-12 items-center justify-center text-foreground"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {count > 0 && (
        // key={count} re-mounts the badge each change so it pops on add (subtle spring).
        <span
          key={count}
          className="badge-pop absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export function TopBar() {
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const role = useSessionStore((s) => s.role)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()

  // Inside a product, the cart or the share flow the catalog can't change —
  // back instead of menu
  const showBack =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') ||
    pathname === '/carrito' ||
    pathname === '/compartir' ||
    pathname === '/ajustes'
  const isCart = pathname === '/carrito'
  const isShare = pathname === '/compartir'
  const isSettings = pathname === '/ajustes'
  // The cart belongs to the buyer; the vendedora shares instead of buying
  const showCart = role === 'buyer' && !isCart && !isShare && !isSettings

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 mx-auto grid h-14 max-w-md grid-cols-[3rem_1fr_3rem] items-center border-b bg-background px-1 tablet-p:max-w-none tablet-l:max-w-none">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t.topbar.back}
            className="flex size-12 items-center justify-center text-foreground"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.topbar.menu}
            className="flex size-12 items-center justify-center text-foreground"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}

        {/* aria-live announces the rebrand to screen readers on catalog switch */}
        <span aria-live="polite" className="truncate text-center text-lg font-bold text-primary">
          {isCart
            ? t.topbar.cart
            : isShare
              ? t.topbar.share
              : isSettings
                ? t.topbar.settings
                : activeCatalog.brand}
        </span>

        {showCart ? <CartButton /> : <span aria-hidden="true" />}
      </header>
      {!showBack && <CatalogDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </>
  )
}
