import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { getSeller } from '@/data/sellers'
import { StatusChip } from '@/components/StatusChip'

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

const orderTotal = (order) =>
  order.items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0)

function OrderRow({ order, title, subtitle, showMessages }) {
  const pieces = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <li>
      <Link to={`/pedido/${order.id}`} className="flex items-center gap-3 py-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-primary">
          {title.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          {/* Wholesaler coordinates with the vendedora behind each order */}
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          <p className="text-sm text-muted-foreground">
            {pieces} {pieces === 1 ? 'artículo' : 'artículos'} ·{' '}
            <span className="font-semibold text-primary">
              ${orderTotal(order).toLocaleString('es-MX')}
            </span>{' '}
            · {formatDate(order.date)}
          </p>
        </div>
        {showMessages && order.messages.length > 0 && (
          <span
            className="flex items-center gap-1 text-sm text-muted-foreground"
            aria-label={`${order.messages.length} mensajes`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {order.messages.length}
          </span>
        )}
        <StatusChip status={effectiveStatus(order)} />
      </Link>
    </li>
  )
}

// Active orders. A buyer's order lands in the seller's AND the wholesaler's
// list — they coordinate inventory and pickup in the order's thread.
// Active orders. A buyer's order lands in the seller's AND the wholesaler's
// list — they coordinate inventory and pickup in the order's thread.
export function PedidosScreen() {
  const { role, buyerClientId, sellerId } = useSessionStore()
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? 'Clienta'
  const clientSeller = (id) => clients.find((c) => c.id === id)?.sellerId

  const isBuyer = role === 'buyer'
  const isWholesaler = role === 'wholesaler'

  // Buyer: her own orders. Vendedora: orders from her clientas. Mayorista: all.
  const visible = isBuyer
    ? orders.filter((o) => o.clientId === buyerClientId)
    : isWholesaler
      ? orders
      : orders.filter((o) => clientSeller(o.clientId) === sellerId)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{isBuyer ? 'Mis pedidos' : 'Pedidos'}</h1>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isBuyer
            ? 'Aquí verás tus pedidos cuando apartes algo del catálogo.'
            : 'Aún no hay pedidos activos.'}
        </p>
      ) : (
        <ul className="divide-y">
          {visible.map((order) => {
            const pieces = order.items.map((i) => getProduct(i.productId)?.name).filter(Boolean)
            const title = isBuyer ? pieces[0] ?? 'Pedido' : clientName(order.clientId)
            const subtitle = isWholesaler
              ? `vía ${getSeller(clientSeller(order.clientId))?.name ?? 'vendedora'}`
              : null
            return (
              <OrderRow
                key={order.id}
                order={order}
                title={title}
                subtitle={subtitle}
                showMessages={!isBuyer}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
