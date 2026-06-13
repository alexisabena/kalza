import { Link } from 'react-router-dom'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { orderSplit, mxn, SELLER_MARGIN } from '@/data/pricing'

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

// Income recognized once the buyer has paid (pagado → recolectado → entregado).
const EARNED = new Set(['pagado', 'recolectado', 'entregado'])

export function IngresosScreen() {
  const role = useSessionStore((s) => s.role)
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? 'Clienta'

  const isWholesaler = role === 'wholesaler'
  const mineKey = isWholesaler ? 'wholesaler' : 'seller'
  const theirsKey = isWholesaler ? 'seller' : 'wholesaler'
  const mineLabel = isWholesaler ? 'Para el mayorista' : 'Para ti'
  const theirsLabel = isWholesaler ? 'Para la vendedora' : 'Para el mayorista'

  const earned = orders
    .filter((o) => EARNED.has(effectiveStatus(o)))
    .sort((a, b) => b.date.localeCompare(a.date))

  const totals = earned.reduce(
    (acc, o) => {
      const s = orderSplit(o)
      acc.total += s.total
      acc.seller += s.seller
      acc.wholesaler += s.wholesaler
      return acc
    },
    { total: 0, seller: 0, wholesaler: 0 }
  )

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-2xl font-bold">Ingresos</h1>

      {/* My earnings — the headline figure for this profile */}
      <div className="rounded-xl bg-primary p-4 text-primary-foreground">
        <p className="text-sm opacity-90">{mineLabel}</p>
        <p className="text-3xl font-bold">{mxn(totals[mineKey])}</p>
        <p className="mt-1 text-xs opacity-80">
          {isWholesaler
            ? `${Math.round((1 - SELLER_MARGIN) * 100)}% de cada pedido pagado`
            : `${Math.round(SELLER_MARGIN * 100)}% de cada pedido pagado`}
        </p>
      </div>

      {/* The split, disclosed in full */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl border p-3">
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <p className="text-lg font-semibold">{mxn(totals.total)}</p>
        </div>
        <div className="flex-1 rounded-xl border p-3">
          <p className="text-xs text-muted-foreground">{theirsLabel}</p>
          <p className="text-lg font-semibold">{mxn(totals[theirsKey])}</p>
        </div>
      </div>

      {/* Listing of every paid / delivered order */}
      <section aria-label="Pedidos pagados">
        <h2 className="mb-2 font-semibold">Pedidos pagados</h2>
        {earned.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aquí verás tus ingresos cuando se paguen los pedidos.
          </p>
        ) : (
          <ul className="divide-y">
            {earned.map((order) => {
              const split = orderSplit(order)
              const first = getProduct(order.items[0]?.productId)?.name ?? 'Pedido'
              const extra = order.items.length - 1
              return (
                <li key={order.id}>
                  <Link to={`/pedido/${order.id}`} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{clientName(order.clientId)}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {first}
                        {extra > 0 && ` +${extra}`} · {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      {/* This profile's cut, with the full total underneath */}
                      <p className="font-semibold text-primary">{mxn(split[mineKey])}</p>
                      <p className="text-xs text-muted-foreground">de {mxn(split.total)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
