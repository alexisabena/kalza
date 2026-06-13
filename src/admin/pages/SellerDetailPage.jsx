import { useParams } from 'react-router-dom'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { itemTotal, splitAmount } from '@/data/pricing'
import { mxn } from '@/admin/lib/format'
import { isEarned } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrdersMiniTable } from '@/admin/components/OrdersMiniTable'
import { cn } from '@/lib/utils'

export function SellerDetailPage() {
  const { id } = useParams()
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const seller = getSeller(id)

  if (!seller) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Vendedoras', to: '/admin/sellers' }, { label: 'No encontrada' }]} title="Vendedora no encontrada" />
      </div>
    )
  }

  const herClients = clients.filter((c) => c.sellerId === seller.id)
  const clientIds = new Set(herClients.map((c) => c.id))
  const herOrders = orders.filter((o) => clientIds.has(o.clientId))
  const amount = herOrders
    .filter(isEarned)
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0), 0)
  const income = splitAmount(amount)
  const clientName = (clientId) => clients.find((c) => c.id === clientId)?.name ?? '—'

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Vendedoras', to: '/admin/sellers' }, { label: seller.name }]}
        title={seller.name}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="ID" value={seller.id} mono />
        <Card label="Compradoras" value={herClients.length} />
        <Card label="Ventas (cobrado)" value={mxn(income.total)} />
        <Card label="Su comisión · 60%" value={mxn(income.seller)} primary />
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border">
        <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Sus compradoras</h2>
        {herClients.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">Sin compradoras.</p>
        ) : (
          <ul className="divide-y">
            {herClients.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.phone}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border">
        <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Sus pedidos</h2>
        <OrdersMiniTable orders={herOrders} nameOf={(o) => clientName(o.clientId)} />
      </section>
    </div>
  )
}

function Card({ label, value, primary, mono }) {
  return (
    <div className={cn('rounded-xl border p-4', primary && 'border-primary/40 bg-primary/5')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-bold tabular-nums', mono && 'font-mono')}>{value}</p>
    </div>
  )
}
