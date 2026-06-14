import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UserPlus, UserCheck, UserX } from 'lucide-react'
import { useStaffStore } from '@/stores/staffStore'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'
import { Button } from '@/components/ui/button'

const tierLabel = { 'super-admin': 'Super admin', admin: 'Admin' }

// User Access — super-admin only (wholesaler-admin-spec.md). Grant/revoke admin
// access and invite new admins. Gated: a regular admin is redirected away.
export function UserAccessPage() {
  const { staff, currentStaffId, invite, setAccess } = useStaffStore()
  const current = staff.find((s) => s.id === currentStaffId)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  if (current?.tier !== 'super-admin') {
    return <Navigate to="/admin" replace />
  }

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    invite(name.trim(), email.trim())
    setName('')
    setEmail('')
  }

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Acceso de usuarios' }]} title="Acceso de usuarios" />
      <p className="mb-6 max-w-prose text-sm text-muted-foreground">
        Administra quién puede operar el back-office. Las personas con acceso aparecen como
        aprobadores en el historial de los pedidos.
      </p>

      {/* Invite */}
      <form onSubmit={submit} className="mb-8 rounded-xl border p-5">
        <h2 className="mb-3 font-semibold">Invitar administrador</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-48 flex-1">
            <span className="mb-1 block text-xs text-muted-foreground">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </label>
          <label className="block min-w-48 flex-1">
            <span className="mb-1 block text-xs text-muted-foreground">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@kalza.mx"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </label>
          <Button type="submit" disabled={!name.trim() || !email.trim()}>
            <UserPlus aria-hidden="true" /> Invitar
          </Button>
        </div>
      </form>

      {/* Staff list */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Nombre</th>
              <th className="px-5 py-2.5 text-left font-medium">Correo</th>
              <th className="px-5 py-2.5 text-left font-medium">Rol</th>
              <th className="px-5 py-2.5 text-left font-medium">Acceso</th>
              <th className="px-5 py-2.5 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((s) => {
              const isSelf = s.id === currentStaffId
              const isSuper = s.tier === 'super-admin'
              return (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-5 py-2.5 font-medium">
                    {s.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground">{s.email}</td>
                  <td className="px-5 py-2.5">{tierLabel[s.tier]}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-medium',
                        s.access ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {s.access ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    {/* A super-admin can't revoke their own / another super-admin's access */}
                    {isSuper ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : s.access ? (
                      <Button variant="ghost" size="sm" onClick={() => setAccess(s.id, false)}>
                        <UserX aria-hidden="true" /> Revocar
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setAccess(s.id, true)}>
                        <UserCheck aria-hidden="true" /> Conceder
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
