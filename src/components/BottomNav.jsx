import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, House, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useT } from '@/i18n'

// Which tabs each profile sees. The buyer's home is the catalog; the
// retailer's home is her dashboard of shared catalogs. The wholesaler is not a
// mobile profile — his surface is the desktop back-office at /admin.
// `label` is an i18n key resolved at render.
const tabs = [
  { to: '/app', label: 'catalogo', icon: BookOpen, roles: ['buyer'] },
  { to: '/app', label: 'inicio', icon: House, roles: ['retailer'] },
  { to: '/catalogo', label: 'catalogo', icon: BookOpen, roles: ['retailer'] },
  { to: '/pedidos', label: 'pedidos', icon: Package, roles: ['buyer', 'retailer'] },
  { to: '/ingresos', label: 'ingresos', icon: TrendingUp, roles: ['retailer'] },
]

// Hide when scrolling down, reappear on scroll up — images take priority.
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 16) setHidden(false)
      else if (y > last + 4) setHidden(true)
      else if (y < last - 4) setHidden(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return hidden
}

export function BottomNav() {
  const role = useSessionStore((s) => s.role)
  const hidden = useHideOnScrollDown()
  const t = useT()
  const visibleTabs = tabs.filter((tab) => tab.roles.includes(role))

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t bg-background pb-[env(safe-area-inset-bottom)]',
        // tablet relaxes the phone-column cap so the bar spans the tablet width
        // (tablet-l chrome becomes a floating bar in a later step)
        'tablet-p:max-w-none tablet-l:max-w-none',
        'motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in-out',
        hidden && 'translate-y-full'
      )}
    >
      <div className="flex h-[60px]">
        {visibleTabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground',
                isActive && 'text-primary'
              )
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-xs font-medium">{t.nav[label]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
