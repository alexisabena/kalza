import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Check, ChevronRight, Store, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { colors } from '@/data/colors'
import { ProductImage } from '@/components/ProductImage'
import { SuccessCheck } from '@/components/SuccessCheck'
import { Button } from '@/components/ui/button'
import { GatewayLogo } from '@/components/GatewayLogo'
import { GATEWAYS, gatewayById } from '@/data/gateways'
import { useT } from '@/i18n'

const mxn = (n) => `$${n.toLocaleString('es-MX')}`

// Deterministic 18-digit OXXO reference from the order id — stable across reloads
// (a real ficha's reference). Grouped in 4s for legibility.
function oxxoReference(id) {
  let seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) + 7
  let out = ''
  for (let i = 0; i < 18; i++) {
    seed = (seed * 9301 + 49297) % 233280
    out += Math.floor((seed / 233280) * 10)
  }
  return out
}

// Decorative barcode — bar widths derived from the reference so it's stable and
// looks like a scannable code without being one (illustrative ficha).
function Barcode({ seed }) {
  const bars = useMemo(() => {
    const digits = [...seed].map(Number)
    return Array.from({ length: 56 }, (_, i) => 1 + (digits[i % digits.length] % 3))
  }, [seed])
  return (
    <div className="flex h-14 items-stretch gap-px" aria-hidden="true">
      {bars.map((w, i) => (
        <span
          key={i}
          className={i % 2 ? 'bg-transparent' : 'bg-foreground'}
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  )
}

// Buyer checkout (responsive-spec §5.5). Surfaces only at status `apartado`
// (wholesaler-confirmed, pay window open) and performs the existing
// apartado → pagado transition — no order-model change. Framed as the original
// project's stage-3 roadmap (the 2019 app was cash-only): mocked, no real rail.
export function CheckoutScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { role, preferredGateway } = useSessionStore()
  const { orders, pay } = useOrdersStore()
  const order = orders.find((o) => o.id === id)

  const [selected, setSelected] = useState(preferredGateway)
  // select → (oxxo | atrato) → success ; instant rails jump straight to success
  const [stage, setStage] = useState('select')

  // Auto-return to the order status page a beat after success (the stepper now
  // shows pagado). A button is offered too for anyone who wants it sooner.
  useEffect(() => {
    if (stage !== 'success') return
    const tmr = setTimeout(() => navigate(`/pedido/${id}`), 2600)
    return () => clearTimeout(tmr)
  }, [stage, id, navigate])

  if (!order) return <Navigate to="/pedidos" replace />
  // Checkout is a buyer flow; a seller landing here goes to the order detail.
  if (role !== 'buyer') return <Navigate to={`/pedido/${id}`} replace />

  const status = effectiveStatus(order)
  const total = order.items.reduce(
    (sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty,
    0
  )

  // The window can lapse mid-flow; the order is then lost (stock released).
  if (status === 'vencido') {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">{t.checkout.expired}</p>
        <Button variant="outline" onClick={() => navigate(`/pedido/${id}`)}>
          {t.checkout.viewOrder}
        </Button>
      </div>
    )
  }
  // No checkout before the wholesaler confirms (or after it's already paid).
  if (status !== 'apartado' && stage !== 'success') {
    return <Navigate to={`/pedido/${id}`} replace />
  }

  const confirmPaid = () => {
    pay(order.id) // apartado → pagado
    setStage('success')
  }

  const onPay = () => {
    const kind = gatewayById[selected]?.kind
    if (kind === 'cash') return setStage('oxxo')
    if (kind === 'bnpl') return setStage('atrato')
    confirmPaid() // instant rails
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <SuccessCheck size={64} />
        <h1 className="text-xl font-bold">{t.checkout.success}</h1>
        <p className="text-sm text-muted-foreground">{t.checkout.successNote}</p>
        <Button className="mt-2" onClick={() => navigate(`/pedido/${id}`)}>
          {t.checkout.viewOrder}
        </Button>
      </div>
    )
  }

  // ── OXXO Pay ficha ───────────────────────────────────────────────────────
  if (stage === 'oxxo') {
    const ref = oxxoReference(order.id)
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Store className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-lg font-bold">{t.checkout.oxxoTitle}</h1>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-background py-4">
            <Barcode seed={ref} />
            <p className="mt-2 font-mono text-sm tracking-widest">
              {ref.replace(/(\d{4})(?=\d)/g, '$1 ')}
            </p>
          </div>
          <dl className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">{t.checkout.oxxoRef}</dt>
              <dd className="font-mono">{ref.slice(0, 6)}…{ref.slice(-4)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">{t.checkout.oxxoAmount}</dt>
              <dd className="text-xl font-bold text-primary">{mxn(total)} MXN</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">{t.checkout.oxxoNote}</p>
        </div>
        <Button className="w-full" onClick={confirmPaid}>
          {t.checkout.oxxoPaid}
        </Button>
      </div>
    )
  }

  // ── a trato plan ─────────────────────────────────────────────────────────
  if (stage === 'atrato') {
    const n = 4
    const each = Math.round(total / n)
    const plan = Array.from({ length: n }, (_, i) => {
      const due = new Date()
      due.setDate(due.getDate() + i * 15)
      return {
        label: t.checkout.installment(i + 1),
        amount: i === n - 1 ? total - each * (n - 1) : each,
        date: due.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
      }
    })
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-lg font-bold">{t.checkout.atratoTitle}</h1>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{t.checkout.atratoNote}</p>
          <ul className="divide-y">
            {plan.map((p) => (
              <li key={p.label} className="flex items-center justify-between py-2.5">
                <span>
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.date} · {t.checkout.atratoEvery}
                  </span>
                </span>
                <span className="font-semibold text-primary">{mxn(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button className="w-full" onClick={confirmPaid}>
          {t.checkout.atratoAccept}
        </Button>
      </div>
    )
  }

  // ── Summary + gateway selector ───────────────────────────────────────────
  return (
    <div className="p-4 tablet-p:mx-auto tablet-p:max-w-xl tablet-p:p-6 tablet-l:max-w-2xl">
      <section aria-label={t.checkout.summary} className="mb-6 rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.checkout.summary}
        </h2>
        <ul className="divide-y">
          {order.items.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            return (
              <li
                key={`${item.productId}|${item.colorId}|${item.size}`}
                className="flex items-center gap-3 py-2.5"
              >
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-12 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {colors[item.colorId].name} · {item.size}
                    {item.qty > 1 && ` · ${item.qty} pzas`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">{mxn(product.price * item.qty)}</p>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold">{t.checkout.total}</span>
          <span className="text-xl font-bold text-primary">{mxn(total)}</span>
        </div>
      </section>

      <section aria-label={t.checkout.choose}>
        <h2 className="mb-1 text-sm font-semibold">{t.checkout.choose}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{t.checkout.roadmapNote}</p>
        <div className="flex flex-col gap-2">
          {GATEWAYS.map(({ id: gid }) => {
            const active = selected === gid
            return (
              <button
                key={gid}
                type="button"
                onClick={() => setSelected(gid)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left',
                  active && 'border-primary ring-1 ring-primary'
                )}
              >
                <GatewayLogo id={gid} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t.gateways[gid]}</span>
                  <span className="block text-xs text-muted-foreground">{t.gatewayDesc[gid]}</span>
                </span>
                {active ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      <Button className="mt-6 w-full" size="lg" onClick={onPay}>
        {t.checkout.payNow} {mxn(total)}
      </Button>
    </div>
  )
}
