import { useMemo, useState } from 'react'
import { ChevronDown, PanelRightOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { orderSplit, splitAmount } from '@/data/pricing'
import { mxn, fmtDate } from '@/admin/lib/format'
import {
  incomeKpis,
  isEarned,
  monthlySeriesByCatalog,
  orderItemsDetailed,
  orderPieces,
} from '@/admin/lib/analytics'
import { LineChart } from '@/admin/components/LineChart'
import { CatalogChips } from '@/admin/components/CatalogChips'
import { OrderDrawer } from '@/admin/components/OrderDrawer'

const today = () => new Date().toISOString().slice(0, 10)

const inPeriod = (date, scope, t) =>
  scope === 'year' ? date.slice(0, 4) === t.slice(0, 4)
  : scope === 'month' ? date.slice(0, 7) === t.slice(0, 7)
  : date === t

const PERIOD_CARDS = [
  { id: 'year', label: 'Ingresos del año', key: 'year' },
  { id: 'month', label: 'Ingresos del mes', key: 'month' },
  { id: 'today', label: 'Ventas de hoy', key: 'today' },
]

export function DashboardPage() {
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const t = today()

  const [scope, setScope] = useState('year')
  const [selected, setSelected] = useState(null)

  const sellerOf = (clientId) =>
    getSeller(clients.find((c) => c.id === clientId)?.sellerId)

  const kpis = useMemo(() => incomeKpis(orders, t), [orders, t])
  const chart = useMemo(() => monthlySeriesByCatalog(orders), [orders])

  // The KPI cards filter the table below by their period.
  const rows = useMemo(
    () =>
      orders
        .filter((o) => inPeriod(o.date, scope, t))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [orders, scope, t]
  )

  // Top at-a-glance KPIs: this year's recognized income, split, and volume.
  const yearSplit = splitAmount(kpis.year)
  const paidThisYear = orders.filter(
    (o) => isEarned(o) && o.date.slice(0, 4) === t.slice(0, 4)
  ).length

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Top income KPIs (at a glance, this year) */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Ingreso del año" value={mxn(yearSplit.total)} primary />
        <Kpi label="Mayorista · 40%" value={mxn(yearSplit.wholesaler)} />
        <Kpi label="Vendedoras · 60%" value={mxn(yearSplit.seller)} />
        <Kpi label="Pedidos pagados" value={paidThisYear} />
      </div>

      {/* Chart + period KPI cards (the cards filter the table) */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-xl border p-5">
          <h2 className="mb-4 font-semibold">Ventas por catálogo</h2>
          <LineChart months={chart.months} series={chart.series} />
        </section>

        <div className="flex flex-col gap-4">
          {PERIOD_CARDS.map((card) => {
            const active = scope === card.id
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setScope(card.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <p className={cn('text-xs', active ? 'opacity-90' : 'text-muted-foreground')}>
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{mxn(kpis[card.key])}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders table — chronological, scoped by the selected period card */}
      <section className="rounded-xl border">
        <header className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">Pedidos</h2>
          <span className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? 'pedido' : 'pedidos'} ·{' '}
            {scope === 'year' ? 'este año' : scope === 'month' ? 'este mes' : 'hoy'}
          </span>
        </header>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No hay pedidos en este periodo.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <Th>Pedido</Th>
                <Th>Vendedora</Th>
                <Th right>Art.</Th>
                <Th>Catálogos</Th>
                <Th right>Ingreso</Th>
                <Th right>Mayorista</Th>
                <Th right>Vendedora</Th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  sellerName={sellerOf(order.clientId)?.name ?? '—'}
                  onOpen={() => setSelected(order)}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function OrderRow({ order, sellerName, onOpen }) {
  const [open, setOpen] = useState(false)
  const split = orderSplit(order)
  const rows = orderItemsDetailed(order)

  return (
    <>
      <tr className="hover:bg-muted/40">
        <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
        <td className="px-3 py-2">{sellerName}</td>
        <td className="px-3 py-2 text-right tabular-nums">{orderPieces(order)}</td>
        <td className="px-3 py-2"><CatalogChips order={order} /></td>
        <td className="px-3 py-2 text-right font-medium tabular-nums">{mxn(split.total)}</td>
        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{mxn(split.wholesaler)}</td>
        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{mxn(split.seller)}</td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Ver artículos"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpen}
              aria-label="Abrir detalle"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <PanelRightOpen className="size-4" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-3 py-3">
            <div className="overflow-hidden rounded-lg border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Artículo</th>
                    <th className="px-3 py-2 text-left font-medium">Catálogo</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2 text-right font-medium">Mayorista</th>
                    <th className="px-3 py-2 text-right font-medium">Vendedora</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map(({ item, product, catalog, total, split: s }) => (
                    <tr key={`${item.productId}|${item.colorId}|${item.size}`}>
                      <td className="px-3 py-2">
                        {product.name}
                        {item.qty > 1 && <span className="text-muted-foreground"> ×{item.qty}</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{catalog?.brand}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{mxn(total)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{mxn(s.wholesaler)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{mxn(s.seller)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{fmtDate(order.date)}</p>
          </td>
        </tr>
      )}
    </>
  )
}

function Kpi({ label, value, primary }) {
  return (
    <div className={cn('rounded-xl border p-4', primary && 'border-primary/40 bg-primary/5')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th className={cn('px-3 py-2 font-medium', right ? 'text-right' : 'text-left')}>
      {children}
    </th>
  )
}
