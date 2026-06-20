import { NavLink, Link } from 'react-router-dom'
import { Menu, BookOpen, House, Package, TrendingUp, ShoppingBag, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useT } from '@/i18n'

// Tablet-landscape navigation reflow (responsive-spec §5.2). The full-width
// bottom bar becomes a centered, inset FLOATING pill that does not span the
// width; the hamburger (left) and — for the buyer — the cart (right) move here
// out of the top bar. The ☰ no longer opens the side drawer: it toggles a SECOND
// floating bar stacked above with the 3 catalogs (the DSM quick-switch); a
// "more" affordance opens the full CatalogDrawer. Hidden except on tablet-l.
//
// Item order LOCKED 2026-06-18:
//   seller — ☰ · home · catalog · orders · income
//   buyer  — ☰ · catalog · orders · cart (cart pinned right)
//
// D3 LOCKED: the bars bind border-radius to var(--radius), so their corners
// re-theme on catalog switch (sharp Élite ↔ round Pasos).

const itemsByRole = {
  retailer: [
    { to: '/app', label: 'inicio', icon: House },
    { to: '/catalogo', label: 'catalogo', icon: BookOpen },
    { to: '/pedidos', label: 'pedidos', icon: Package },
    { to: '/ingresos', label: 'ingresos', icon: TrendingUp },
  ],
  buyer: [
    { to: '/app', label: 'catalogo', icon: BookOpen },
    { to: '/pedidos', label: 'pedidos', icon: Package },
  ],
}

const barBase =
  'pointer-events-auto flex items-center gap-1 rounded-[var(--radius)] border bg-background/95 shadow-lg backdrop-blur'

function NavItem({ to, label, icon: Icon }) {
  const t = useT()
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      aria-label={t.nav[label]}
      className={({ isActive }) =>
        cn(
          'flex size-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius)] text-muted-foreground',
          isActive && 'text-primary'
        )
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="text-[10px] font-medium leading-none">{t.nav[label]}</span>
    </NavLink>
  )
}

// The second bar — catalog quick-switch, bottom-docked above the main bar.
function CatalogQuickBar() {
  const { catalogs, activeCatalog, setCatalog } = useCatalogStore()
  const { catalogBarOpen, setCatalogBarOpen, setDrawerOpen } = useUiStore()
  const t = useT()

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[4.75rem] z-20 mx-auto flex w-fit max-w-[92vw] justify-center',
        'motion-safe:transition-all motion-safe:duration-250 motion-safe:ease-out',
        catalogBarOpen ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      )}
      aria-hidden={!catalogBarOpen}
    >
      <div className={cn(barBase, 'gap-1 p-1.5')}>
        {catalogs.map((c) => {
          const active = c.id === activeCatalog.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCatalog(c)
                setCatalogBarOpen(false)
              }}
              aria-pressed={active}
              aria-label={c.brand}
              className={cn(
                'flex size-11 items-center justify-center rounded-[var(--radius)] text-base font-bold',
                active && 'ring-2 ring-primary'
              )}
              style={{
                color: `var(--brand-${c.id})`,
                backgroundColor: `color-mix(in oklch, var(--brand-${c.id}) 12%, transparent)`,
              }}
            >
              {c.brand.charAt(0)}
            </button>
          )
        })}
        {/* "more" → full drawer (Settings + portfolio controls live there, §5.2.1) */}
        <button
          type="button"
          onClick={() => {
            setCatalogBarOpen(false)
            setDrawerOpen(true)
          }}
          aria-label={t.drawer.title}
          className="flex size-11 items-center justify-center rounded-[var(--radius)] text-muted-foreground hover:bg-muted"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function FloatingNav() {
  const role = useSessionStore((s) => s.role)
  const cartCount = useCartStore(selectCount)
  const { catalogBarOpen, toggleCatalogBar } = useUiStore()
  const t = useT()
  const items = itemsByRole[role] ?? itemsByRole.buyer

  return (
    // The floating reflow is a tablet-l-only move, but the bars are always
    // rendered so they can ANIMATE in/out (§6bis): off-screen + faded on
    // phone/tablet-p/desk, risen + visible on tablet-l. display:none can't
    // transition, so we gate with transform/opacity + pointer-events instead.
    <div className="pointer-events-none">
      <CatalogQuickBar />

      <nav
        aria-label={t.topbar.menu}
        className={cn(
          barBase,
          'fixed inset-x-0 bottom-4 z-20 mx-auto w-fit justify-center px-2 py-1.5',
          // rises from the bottom, slightly delayed so it reads as a hand-off
          // from the exiting top-bar icons; reduced-motion snaps.
          'translate-y-[150%] opacity-0 pointer-events-none',
          'tablet-l:translate-y-0 tablet-l:opacity-100 tablet-l:pointer-events-auto',
          'motion-safe:transition-[transform,opacity] motion-safe:[transition-duration:var(--dur-base)] motion-safe:[transition-timing-function:var(--ease-out)] motion-safe:[transition-delay:60ms]'
        )}
      >
        {/* ☰ — toggles the catalog quick-switch bar, not the side drawer */}
        <button
          type="button"
          onClick={toggleCatalogBar}
          aria-label={t.topbar.menu}
          aria-expanded={catalogBarOpen}
          className={cn(
            'flex size-11 items-center justify-center rounded-[var(--radius)] text-muted-foreground',
            catalogBarOpen && 'bg-muted text-foreground'
          )}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Buyer only — cart pinned to the right (D1) */}
        {role === 'buyer' && (
          <Link
            to="/carrito"
            aria-label={t.topbar.cartAria(cartCount)}
            className="relative flex size-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius)] text-muted-foreground"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">{t.topbar.cart}</span>
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        )}
      </nav>
    </div>
  )
}
