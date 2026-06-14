import { Link, useParams } from 'react-router-dom'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { itemTotal } from '@/data/pricing'
import { mxn } from '@/admin/lib/format'
import { isEarned } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrdersMiniTable } from '@/admin/components/OrdersMiniTable'
import { cn } from '@/lib/utils'

export function BuyerDetailPage() {
  const { id } = useParams()
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const client = clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Compradoras', to: '/admin/buyers' }, { label: 'No encontrada' }]} title="Compradora no encontrada" />
      </div>
    )
  }

  const seller = getSeller(client.sellerId)
  const herOrders = orders.filter((o) => o.clientId === client.id)
  const spent = herOrders
    .filter(isEarned)
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0), 0)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Compradoras', to: '/admin/buyers' }, { label: client.name }]}
        title={client.name}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="ID" value={client.id} mono />
        <Card label="Teléfono" value={client.phone} />
        <Card
          label="Vendedora"
          value={
            seller ? (
              <Link to={`/admin/sellers/${seller.id}`} className="text-primary hover:underline">
                {seller.name}
              </Link>
            ) : '—'
          }
        />
        <Card label="Total comprado" value={mxn(spent)} primary />
      </div>

      <section className="overflow-hidden rounded-xl border">
        <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Sus pedidos</h2>
        <OrdersMiniTable orders={herOrders} />
      </section>
    </div>
  )
}

function Card({ label, value, primary, mono }) {
  return (
    <div className={cn('rounded-xl border p-4', primary && 'border-primary/40 bg-primary/5')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-bold', mono && 'font-mono')}>{value}</p>
    </div>
  )
}
