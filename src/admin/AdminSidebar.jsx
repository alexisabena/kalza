import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Store,
  Users,
  Boxes,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStaffStore } from '@/stores/staffStore'

// Sidebar by tier (wholesaler-admin-spec.md): every admin sees the six core
// sections; only a super-admin also sees User Access.
const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/income', label: 'Ingresos', icon: TrendingUp },
  { to: '/admin/sellers', label: 'Vendedoras', icon: Store },
  { to: '/admin/buyers', label: 'Compradoras', icon: Users },
  { to: '/admin/inventory', label: 'Inventario', icon: Boxes },
]

const tierLabel = { 'super-admin': 'Super admin', admin: 'Admin' }

export function AdminSidebar() {
  const { staff, currentStaffId, setCurrent } = useStaffStore()
  const current = staff.find((s) => s.id === currentStaffId)
  const isSuper = current?.tier === 'super-admin'

  // Demo: switch the acting staff member to present both tiers. Only active
  // staff can act; an admin acting can't reach User Access.
  const actable = staff.filter((s) => s.access)

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="text-lg font-bold text-primary">Kalza</span>
        <span className="text-xs text-muted-foreground">Back-office</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}

        {isSuper && (
          <>
            <div className="my-2 border-t" />
            <NavLink
              to="/admin/access"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )
              }
            >
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              Acceso de usuarios
            </NavLink>
          </>
        )}
      </nav>

      {/* Acting staff — drives the approver attribution + the audit trail */}
      <div className="border-t p-3">
        <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="acting-staff">
          Sesión (demo)
        </label>
        <select
          id="acting-staff"
          value={currentStaffId}
          onChange={(e) => setCurrent(e.target.value)}
          className="h-10 w-full rounded-md border bg-background px-2 text-sm"
        >
          {actable.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {tierLabel[s.tier]}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
