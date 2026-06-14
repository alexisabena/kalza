import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { getProduct } from '@/data/products'
import { orderSplit, splitAmount, itemTotal, mxn, SELLER_MARGIN } from '@/data/pricing'

// Income recognized once the buyer has paid (pagado → recolectado → entregado).
const EARNED = new Set(['pagado', 'recolectado', 'entregado'])

const sellerPct = Math.round(SELLER_MARGIN * 100)
const wholesalerPct = 100 - sellerPct

// es-MX gives "junio de 2026" → capitalize just the first letter
const monthLabel = (key) => {
  const s = new Date(`${key}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

function Amount({ value, mine }) {
  return (
    <span
      className={cn(
        'w-16 shrink-0 text-right text-sm tabular-nums',
        mine ? 'font-semibold text-primary' : 'text-muted-foreground'
      )}
    >
      {mxn(value)}
    </span>
  )
}

// Three money cells: total, the wholesaler's cut, then the seller's (hers).
function Cells({ split }) {
  return (
    <>
      <Amount value={split.total} />
      <Amount value={split.wholesaler} />
      <Amount value={split.seller} mine />
    </>
  )
}

// An order, expandable to its line items — each row repeats the 3-way split.
function OrderRow({ order, clientName }) {
  const [open, setOpen] = useState(false)
  const split = orderSplit(order)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-3 text-left"
      >
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{clientName}</span>
          <span className="block text-xs text-muted-foreground">{shortDate(order.date)}</span>
        </span>
        <Cells split={split} />
      </button>

      {open && (
        <ul className="mb-2 ml-6 border-l pl-3">
          {order.items.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            return (
              <li
                key={`${item.productId}|${item.colorId}|${item.size}`}
                className="flex items-center gap-2 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {product.name}
                  {item.qty > 1 && ` ×${item.qty}`}
                </span>
                <Cells split={splitAmount(itemTotal(item))} />
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export function IngresosScreen() {
  const { sellerId } = useSessionStore()
  const clients = useClientsStore((s) => s.clients)
  const orders = useOrdersStore((s) => s.orders)
  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? 'Clienta'
  const clientSeller = (id) => clients.find((c) => c.id === id)?.sellerId

  // The vendedora sees income only from her own clientas.
  const earned = useMemo(() => {
    const paid = orders.filter((o) => EARNED.has(effectiveStatus(o)))
    return paid
      .filter((o) => clientSeller(o.clientId) === sellerId)
      .sort((a, b) => b.date.localeCompare(a.date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, clients, sellerId])

  const today = new Date().toISOString().slice(0, 10)
  const { monthKeys, yearKeys } = useMemo(() => {
    const months = new Set([today.slice(0, 7)])
    const years = new Set([today.slice(0, 4)])
    earned.forEach((o) => {
      months.add(o.date.slice(0, 7))
      years.add(o.date.slice(0, 4))
    })
    return { monthKeys: [...months].sort().reverse(), yearKeys: [...years].sort().reverse() }
  }, [earned, today])

  const [view, setView] = useState('month')
  const [month, setMonth] = useState(today.slice(0, 7))
  const [year, setYear] = useState(today.slice(0, 4))

  const period = view === 'month' ? month : year
  const inPeriod = earned.filter((o) => o.date.startsWith(period))

  const totals = inPeriod.reduce(
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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Ingresos</h1>
          <div className="flex rounded-md border p-0.5 text-sm">
            {[
              ['month', 'Mes'],
              ['year', 'Año'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={cn(
                  'rounded px-3 py-1 font-medium',
                  view === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {view === 'month' ? (
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Elige el mes"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {monthKeys.map((k) => (
              <option key={k} value={k}>
                {monthLabel(k)}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Elige el año"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {yearKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Two small cards, then the seller's earnings highlighted */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Total cobrado</p>
            <p className="text-lg font-semibold">{mxn(totals.total)}</p>
          </div>
          <div className="flex-1 rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">
              Mayorista <span className="font-medium">· {wholesalerPct}%</span>
            </p>
            <p className="text-lg font-semibold">{mxn(totals.wholesaler)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-primary p-4 text-primary-foreground">
          <p className="text-sm opacity-90">
            Para ti <span className="font-medium">· {sellerPct}%</span>
          </p>
          <p className="text-3xl font-bold">{mxn(totals.seller)}</p>
        </div>
      </div>

      {/* Listing — by order, each expandable to its line items */}
      <section aria-label="Pedidos pagados">
        <h2 className="mb-2 font-semibold">Pedidos pagados</h2>
        {inPeriod.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay pedidos pagados en este periodo.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
              <span className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">Pedido</span>
              <span className="w-16 shrink-0 text-right">Total</span>
              <span className="w-16 shrink-0 text-right">Mayorista</span>
              <span className="w-16 shrink-0 text-right text-primary">Para ti</span>
            </div>
            <ul className="divide-y">
              {inPeriod.map((order) => (
                <OrderRow key={order.id} order={order} clientName={clientName(order.clientId)} />
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
