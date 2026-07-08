import { NavLink, Link } from 'react-router-dom'
import { BookOpen, House, Package, TrendingUp, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { useT } from '@/i18n'

// Tablet-landscape navigation reflow (responsive-spec §5.2). The full-width
// bottom bar becomes a centered, inset FLOATING pill that does not span the
// width; the cart (buyer only) moves here out of the top bar. The hamburger
// STAYS in the top bar on tablet-l too (it opens the same CatalogDrawer as on
// phone — see TopBar.jsx) so this floating bar only ever holds the role's nav
// items + the buyer's cart. Hidden except on tablet-l.
//
// Item order LOCKED 2026-06-18:
//   seller — home · catalog · orders · income
//   buyer  — catalog · orders · cart (cart pinned right)
//
// Always fully pill-rounded regardless of the active theme's --radius (Alexis,
// 2026-07-07: the per-theme radius made this look "blocky" under sharp themes
// like Élite — a floating bar should read as a pill at every brand).

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
  'pointer-events-auto flex items-center gap-1 rounded-full border bg-background/95 shadow-lg backdrop-blur'

function NavItem({ to, label, icon: Icon }) {
  const t = useT()
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      aria-label={t.nav[label]}
      className={({ isActive }) =>
        cn(
          'flex min-w-11 flex-col items-center justify-center gap-0.5 rounded-full px-1.5 text-muted-foreground',
          isActive && 'text-primary'
        )
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="whitespace-nowrap text-[10px] font-medium leading-none">{t.nav[label]}</span>
    </NavLink>
  )
}

export function FloatingNav() {
  const role = useSessionStore((s) => s.role)
  const cartCount = useCartStore(selectCount)
  const t = useT()
  const items = itemsByRole[role] ?? itemsByRole.buyer

  return (
    // The floating reflow is a tablet-l-only move, but the bar is always
    // rendered so it can ANIMATE in/out (§6bis): off-screen + faded on
    // phone/tablet-p/desk, risen + visible on tablet-l. display:none can't
    // transition, so we gate with transform/opacity + pointer-events instead.
    <div className="pointer-events-none">
      <nav
        aria-label={t.topbar.menu}
        className={cn(
          barBase,
          // px-5 = extra horizontal breathing room now that labels can be
          // wider than the icon (min-w-11, not a fixed square); gap-7 = 28px
          // between buttons — both bumped 2026-07-07 so "Mi carrito" etc. never
          // wrap to two lines.
          'fixed inset-x-0 bottom-4 z-20 mx-auto w-fit justify-center gap-7 px-5 py-3',
          // rises from the bottom, slightly delayed so it reads as a hand-off
          // from the exiting top-bar icons; reduced-motion snaps.
          'translate-y-[150%] opacity-0 pointer-events-none',
          'tablet-l:translate-y-0 tablet-l:opacity-100 tablet-l:pointer-events-auto',
          'motion-safe:transition-[transform,opacity] motion-safe:[transition-duration:var(--dur-slow)] motion-safe:[transition-timing-function:var(--ease-out)] motion-safe:[transition-delay:80ms]'
        )}
      >
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Buyer only — cart pinned to the right (D1) */}
        {role === 'buyer' && (
          <Link
            to="/carrito"
            aria-label={t.topbar.cartAria(cartCount)}
            className="relative flex min-w-11 flex-col items-center justify-center gap-0.5 rounded-full px-1.5 text-muted-foreground"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">{t.topbar.cart}</span>
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
