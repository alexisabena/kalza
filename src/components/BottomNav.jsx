import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, House, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'

// Which tabs each profile sees. The buyer's home is the catalog; the
// retailer's home is her dashboard of shared catalogs. The wholesaler is not a
// mobile profile — his surface is the desktop back-office at /admin.
const tabs = [
  { to: '/app', label: 'Catálogo', icon: BookOpen, roles: ['buyer'] },
  { to: '/app', label: 'Inicio', icon: House, roles: ['retailer'] },
  { to: '/catalogo', label: 'Catálogo', icon: BookOpen, roles: ['retailer'] },
  { to: '/pedidos', label: 'Pedidos', icon: Package, roles: ['buyer', 'retailer'] },
  { to: '/ingresos', label: 'Ingresos', icon: TrendingUp, roles: ['retailer'] },
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
  const visibleTabs = tabs.filter((t) => t.roles.includes(role))

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t bg-background pb-[env(safe-area-inset-bottom)]',
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
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
