import { useMemo, useState } from 'react'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { sellers } from '@/data/sellers'
import { catalogs } from '@/data/catalogs'
import { getProduct } from '@/data/products'
import { itemTotal, splitAmount } from '@/data/pricing'
import { mxn } from '@/admin/lib/format'
import { isEarned } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { SearchFilters } from '@/admin/components/SearchFilters'
import { cn } from '@/lib/utils'

const sumSplit = (amount) => splitAmount(amount)

export function IncomePage() {
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)

  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')
  const [query, setQuery] = useState('')

  const sellerOf = (clientId) => clients.find((c) => c.id === clientId)?.sellerId

  const earned = useMemo(() => orders.filter(isEarned), [orders])
  const years = useMemo(
    () => [...new Set(earned.map((o) => o.date.slice(0, 4)))].sort().reverse(),
    [earned]
  )

  const inPeriod = earned.filter((o) => {
    if (year !== 'all' && o.date.slice(0, 4) !== year) return false
    if (month !== 'all' && Number(o.date.slice(5, 7)) !== Number(month)) return false
    return true
  })

  // Totals
  const totalAmount = inPeriod.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0),
    0
  )
  const totals = sumSplit(totalAmount)

  // By vendedora
  const bySeller = sellers
    .map((seller) => {
      const amount = inPeriod
        .filter((o) => sellerOf(o.clientId) === seller.id)
        .reduce((sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0), 0)
      return { seller, amount, ...sumSplit(amount) }
    })
    .filter((r) => r.amount > 0)

  // By catalog
  const byCatalog = catalogs
    .map((catalog) => {
      const amount = inPeriod.reduce(
        (sum, o) =>
          sum +
          o.items
            .filter((i) => getProduct(i.productId)?.catalogId === catalog.id)
            .reduce((s, i) => s + itemTotal(i), 0),
        0
      )
      return { catalog, amount, ...sumSplit(amount) }
    })
    .filter((r) => r.amount > 0)

  const q = query.trim().toLowerCase()
  const sellerRows = bySeller.filter((r) => r.seller.name.toLowerCase().includes(q))
  const catalogRows = byCatalog.filter((r) => r.catalog.brand.toLowerCase().includes(q))

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Ingresos' }]} title="Ingresos" />
      <SearchFilters
        query={query}
        onQuery={setQuery}
        placeholder="Filtrar vendedora o catálogo…"
        year={year}
        onYear={setYear}
        years={years}
        month={month}
        onMonth={setMonth}
      />

      {/* Summary cards — the partition is always disclosed (DESIGN.md) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Total cobrado" value={mxn(totals.total)} />
        <Card label="Mayorista · 40%" value={mxn(totals.wholesaler)} primary />
        <Card label="Vendedoras · 60%" value={mxn(totals.seller)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SplitTable
          title="Por vendedora"
          firstCol="Vendedora"
          rows={sellerRows.map((r) => ({ key: r.seller.id, name: r.seller.name, ...r }))}
        />
        <SplitTable
          title="Por catálogo"
          firstCol="Catálogo"
          rows={catalogRows.map((r) => ({ key: r.catalog.id, name: r.catalog.brand, ...r }))}
        />
      </div>
    </div>
  )
}

function SplitTable({ title, firstCol, rows }) {
  return (
    <section className="overflow-hidden rounded-xl border">
      <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">{title}</h2>
      <table className="w-full text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-2 text-left font-medium">{firstCol}</th>
            <th className="px-5 py-2 text-right font-medium">Total</th>
            <th className="px-5 py-2 text-right font-medium">Mayorista</th>
            <th className="px-5 py-2 text-right font-medium">Vendedora</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="px-5 py-2.5 font-medium">{r.name}</td>
              <td className="px-5 py-2.5 text-right tabular-nums">{mxn(r.total)}</td>
              <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{mxn(r.wholesaler)}</td>
              <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{mxn(r.seller)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="px-5 py-6 text-center text-sm text-muted-foreground">Sin ingresos.</p>
      )}
    </section>
  )
}

function Card({ label, value, primary }) {
  return (
    <div className={cn('rounded-xl border p-4', primary && 'border-primary/40 bg-primary/5')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
