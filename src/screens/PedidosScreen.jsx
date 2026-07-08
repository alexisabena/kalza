import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, ChevronLeft } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { StatusChip } from '@/components/StatusChip'
import { useT } from '@/i18n'

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

const orderTotal = (order) =>
  order.items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0)

function OrderRow({ order, title, showMessages, t }) {
  const pieces = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <li>
      <Link to={`/pedido/${order.id}`} className="flex items-center gap-3 py-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-primary">
          {title.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {t.pedidos.itemCount(pieces)} ·{' '}
            <span className="font-semibold text-primary">
              ${orderTotal(order).toLocaleString('es-MX')}
            </span>{' '}
            · {formatDate(order.date)}
          </p>
        </div>
        {showMessages && order.messages.length > 0 && (
          <span
            className="flex items-center gap-1 text-sm text-muted-foreground"
            aria-label={t.pedidos.messages(order.messages.length)}
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

// Active orders. A buyer's order lands in the seller's list too — she
// coordinates inventory and pickup with the wholesaler in the order's thread.
export function PedidosScreen() {
  const { role, buyerClientId, sellerId } = useSessionStore()
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const navigate = useNavigate()
  const t = useT()
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? t.pedidos.client
  const clientSeller = (id) => clients.find((c) => c.id === id)?.sellerId

  const isBuyer = role === 'buyer'

  // Buyer: her own orders. Vendedora: orders from her clientas.
  const visible = isBuyer
    ? orders.filter((o) => o.clientId === buyerClientId)
    : orders.filter((o) => clientSeller(o.clientId) === sellerId)

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Explicit way back to the catalog on tablet-l — the floating nav's own
          Catálogo tab already does this, but Alexis wanted a direct top-left
          back button too (2026-07-07). */}
      <button
        type="button"
        onClick={() => navigate('/app')}
        aria-label={t.topbar.back}
        className="hidden size-11 items-center justify-center self-start rounded-full text-foreground hover:bg-muted tablet-l:flex"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <h1 className="text-2xl font-bold">{isBuyer ? t.pedidos.myOrders : t.pedidos.title}</h1>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isBuyer ? t.pedidos.emptyBuyer : t.pedidos.emptyRetailer}
        </p>
      ) : (
        <ul className="divide-y">
          {visible.map((order) => {
            const pieces = order.items.map((i) => getProduct(i.productId)?.name).filter(Boolean)
            const title = isBuyer ? pieces[0] ?? t.pedidos.order : clientName(order.clientId)
            return (
              <OrderRow
                key={order.id}
                order={order}
                title={title}
                showMessages={!isBuyer}
                t={t}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
