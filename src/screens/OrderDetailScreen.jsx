import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Check, HandCoins, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { colors } from '@/data/colors'
import { ProductImage } from '@/components/ProductImage'
import { StatusChip } from '@/components/StatusChip'
import { OrderProgress } from '@/components/OrderProgress'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'

const mxn = (n) => `$${n.toLocaleString('es-MX')}`

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

const formatDeadline = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export function OrderDetailScreen() {
  const { id } = useParams()
  const { role } = useSessionStore()
  const clients = useClientsStore((s) => s.clients)
  const { orders, collect, deliver, addMessage } = useOrdersStore()
  const navigate = useNavigate()
  const order = orders.find((o) => o.id === id)
  const [draft, setDraft] = useState('')
  const t = useT()

  if (!order) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">{t.orderDetail.notAvailable}</p>
      </div>
    )
  }

  const status = effectiveStatus(order)
  const isBuyer = role === 'buyer'
  // On mobile, the non-buyer is always the vendedora — the mayorista is on the
  // desktop back-office. She coordinates with him in this thread.
  const me = 'vendedora'
  const client = clients.find((c) => c.id === order.clientId)
  const total = order.items.reduce(
    (sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty,
    0
  )

  const send = () => {
    const text = draft.trim()
    if (!text) return
    addMessage(order.id, me, text)
    setDraft('')
  }

  return (
    <div className={cn('flex flex-col gap-5 p-4', isBuyer ? 'pb-10' : 'pb-28')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {isBuyer ? t.orderDetail.myOrder : client?.name ?? t.pedidos.client}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
        </div>
        <StatusChip status={status} />
      </div>

      {/* ── Role actions ──────────────────────────────────────────── */}

      {/* Seller waits on the wholesaler, then moves the order physically */}
      {role === 'retailer' && status === 'pedido' && (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          {t.orderDetail.waitingWholesaler}
        </p>
      )}
      {role === 'retailer' && status === 'pagado' && (
        <Button className="w-full" onClick={() => collect(order.id)}>
          <Truck aria-hidden="true" /> {t.orderDetail.markCollected}
        </Button>
      )}
      {role === 'retailer' && status === 'recolectado' && (
        <Button className="w-full" onClick={() => deliver(order.id)}>
          <Check aria-hidden="true" /> {t.orderDetail.markDelivered}
        </Button>
      )}

      {/* Buyer: payment commitment within the window — or the order is lost */}
      {isBuyer && status === 'apartado' && (
        <div className="flex flex-col gap-2 rounded-xl border border-primary bg-primary/5 p-3">
          <p className="text-sm">
            {t.orderDetail.reservedPrefix}{' '}
            <strong>{formatDeadline(order.payDeadline)}</strong> {t.orderDetail.reservedSuffix}
          </p>
          <Button className="w-full" onClick={() => navigate(`/pago/${order.id}`)}>
            <HandCoins aria-hidden="true" /> {t.orderDetail.payAmount(mxn(total))}
          </Button>
        </div>
      )}

      {isBuyer && <OrderProgress order={order} variant="buyer" />}

      <section aria-label={t.orderDetail.items}>
        <ul className="divide-y">
          {order.items.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            return (
              <li
                key={`${item.productId}|${item.colorId}|${item.size}`}
                className="flex items-center gap-3 py-3"
              >
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-14 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {colors[item.colorId].name} · {t.cart.size} {item.size}
                    {item.qty > 1 && ` · ${t.cart.pieces(item.qty)}`}
                  </p>
                </div>
                <p className="font-semibold text-primary">{mxn(product.price * item.qty)}</p>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold">{t.orderDetail.total}</span>
          <span className="text-xl font-bold text-primary">{mxn(total)}</span>
        </div>
      </section>

      {/* Coordination thread — seller ↔ wholesaler only, never the buyer */}
      {!isBuyer && (
        <>
          <section aria-label={t.orderDetail.coordination}>
            <h2 className="mb-2 font-semibold">{t.orderDetail.coordination}</h2>
            {order.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t.orderDetail.noMessages}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {order.messages.map((m, i) => (
                  <li
                    key={i}
                    className={cn(
                      'max-w-[80%] rounded-xl p-3 text-sm',
                      m.from === me
                        ? 'self-end rounded-br-sm bg-primary/10'
                        : 'self-start rounded-bl-sm bg-muted'
                    )}
                  >
                    <p>{m.text}</p>
                    <p className="mt-1 text-right text-xs text-muted-foreground">{m.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md gap-2 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <label className="sr-only" htmlFor="order-message">
              {t.orderDetail.messageLabel}
            </label>
            <input
              id="order-message"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t.orderDetail.messagePlaceholder}
              className="h-12 min-w-0 flex-1 rounded-md border bg-background px-3 text-base"
            />
            <Button size="icon" onClick={send} disabled={!draft.trim()} aria-label={t.orderDetail.send}>
              <Send aria-hidden="true" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
