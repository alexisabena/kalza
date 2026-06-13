import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { colors } from '@/data/colors'
import { ProductImage } from '@/components/ProductImage'
import { StatusChip } from '@/components/StatusChip'
import { Button } from '@/components/ui/button'

const mxn = (n) => `$${n.toLocaleString('es-MX')}`

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

export function OrderDetailScreen() {
  const { id } = useParams()
  const { role } = useSessionStore()
  const clients = useClientsStore((s) => s.clients)
  const { orders, confirm, addMessage } = useOrdersStore()
  const order = orders.find((o) => o.id === id)
  const [draft, setDraft] = useState('')

  if (!order) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Este pedido ya no está disponible.</p>
      </div>
    )
  }

  const isRetailer = role === 'retailer'
  const me = isRetailer ? 'vendedora' : 'clienta'
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
    <div className="flex flex-col gap-5 p-4 pb-28">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {isRetailer ? client?.name ?? 'Clienta' : 'Mi pedido'}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Step 2 of the double confirmation — the vendedora makes it real */}
      {isRetailer && order.status === 'por-confirmar' && (
        <Button className="w-full" onClick={() => confirm(order.id)}>
          <Check aria-hidden="true" /> Confirmar pedido
        </Button>
      )}
      {!isRetailer && order.status === 'por-confirmar' && (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          Tu pedido fue enviado a tu vendedora. Ella lo confirmará pronto. 🧡
        </p>
      )}

      <section aria-label="Artículos">
        <ul className="divide-y">
          {order.items.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            return (
              <li key={`${item.productId}|${item.colorId}|${item.size}`} className="flex items-center gap-3 py-3">
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-14 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {colors[item.colorId].name} · Talla {item.size}
                    {item.qty > 1 && ` · ${item.qty} pzas`}
                  </p>
                </div>
                <p className="font-semibold text-primary">{mxn(product.price * item.qty)}</p>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">{mxn(total)}</span>
        </div>
      </section>

      <section aria-label="Conversación">
        <h2 className="mb-2 font-semibold">Conversación</h2>
        {order.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin mensajes todavía — escribe para comentar el pedido.
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

      {/* Composer — owns the bottom edge (immersive view, no bottom nav) */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md gap-2 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <label className="sr-only" htmlFor="order-message">
          Mensaje
        </label>
        <input
          id="order-message"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Escribe un mensaje…"
          className="h-12 min-w-0 flex-1 rounded-md border bg-background px-3 text-base"
        />
        <Button size="icon" onClick={send} disabled={!draft.trim()} aria-label="Enviar mensaje">
          <Send aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
