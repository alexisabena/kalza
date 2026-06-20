import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Menu, ChevronLeft, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCatalogStore } from '@/stores/catalogStore'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useUiStore } from '@/stores/uiStore'
import { useScrollAware } from '@/lib/useScrollAware'
import { CatalogDrawer } from '@/components/CatalogDrawer'
import { useT } from '@/i18n'

function CartButton() {
  const count = useCartStore(selectCount)
  const t = useT()

  return (
    <Link
      to="/carrito"
      aria-label={t.topbar.cartAria(count)}
      // tablet-l: the cart leaves the top bar for the floating nav (§5.2).
      // invisible (not hidden) so its grid cell stays and the brand keeps centered.
      className="relative flex size-12 items-center justify-center text-foreground tablet-l:invisible"
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
  const { drawerOpen, setDrawerOpen } = useUiStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()
  // D4 (tablet-l): the brand header is scroll-aware with an INVERTED pattern —
  // hide on scroll up, reappear on scroll down or after 5s idle. The transform is
  // tablet-l-scoped, so this is inert on phone/tablet-p/desk (where the hook
  // still runs but no class applies).
  const headerHidden = useScrollAware({ hideOn: 'up', idleMs: 5000 })

  // Inside a product, the cart or the share flow the catalog can't change —
  // back instead of menu
  const showBack =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') ||
    pathname === '/carrito' ||
    pathname === '/compartir' ||
    pathname === '/ajustes' ||
    pathname.startsWith('/pago/')
  const isCart = pathname === '/carrito'
  const isShare = pathname === '/compartir'
  const isSettings = pathname === '/ajustes'
  const isCheckout = pathname.startsWith('/pago/')
  // The cart belongs to the buyer; the vendedora shares instead of buying
  const showCart = role === 'buyer' && !isCart && !isShare && !isSettings && !isCheckout

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-20 mx-auto grid h-14 max-w-md grid-cols-[3rem_1fr_3rem] items-center border-b bg-background px-1',
          'tablet-p:max-w-none tablet-l:max-w-none',
          'motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out',
          // tablet-l-scoped, so phone/tablet-p/desk never hide the header (D4)
          headerHidden && 'tablet-l:-translate-y-full'
        )}
      >
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t.topbar.back}
            // tablet-l: back leaves the top bar (immersive views carry their own);
            // invisible keeps the grid cell so the brand stays centered.
            className="flex size-12 items-center justify-center text-foreground tablet-l:invisible"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.topbar.menu}
            // tablet-l: the hamburger moves into the floating nav (§5.2);
            // invisible keeps the grid cell so the brand stays centered.
            className="flex size-12 items-center justify-center text-foreground tablet-l:invisible"
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
                : isCheckout
                  ? t.topbar.checkout
                  : activeCatalog.brand}
        </span>

        {showCart ? <CartButton /> : <span aria-hidden="true" />}
      </header>
      {!showBack && <CatalogDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </>
  )
}
