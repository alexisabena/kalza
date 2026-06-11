import { MessageCircle } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { orders } from '@/data/orders'
import { getProduct } from '@/data/products'
import { StatusChip } from '@/components/StatusChip'

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

const orderTotal = (order) =>
  order.items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0)

// Active orders. The conversation with the clienta lives here too —
// each order can be discussed (thread view pending).
function RetailerOrders() {
  const clients = useClientsStore((s) => s.clients)
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? 'Clienta'

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <ul className="divide-y">
        {orders.map((order) => {
          const pieces = order.items.reduce((n, i) => n + i.qty, 0)
          return (
            <li key={order.id} className="flex items-center gap-3 py-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-primary">
                {clientName(order.clientId).charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{clientName(order.clientId)}</p>
                <p className="text-sm text-muted-foreground">
                  {pieces} {pieces === 1 ? 'artículo' : 'artículos'} ·{' '}
                  <span className="font-semibold text-primary">
                    ${orderTotal(order).toLocaleString('es-MX')}
                  </span>{' '}
                  · {formatDate(order.date)}
                </p>
              </div>
              {order.messages > 0 && (
                <span
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                  aria-label={`${order.messages} mensajes`}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {order.messages}
                </span>
              )}
              <StatusChip status={order.status} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function BuyerOrders() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="text-sm text-muted-foreground">
        Aquí verás tus pedidos cuando apartes algo del catálogo.
      </p>
    </div>
  )
}

export function PedidosScreen() {
  const role = useSessionStore((s) => s.role)
  return role === 'retailer' ? <RetailerOrders /> : <BuyerOrders />
}
