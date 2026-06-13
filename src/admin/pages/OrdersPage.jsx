import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { orderSplit } from '@/data/pricing'
import { mxn, fmtDate } from '@/admin/lib/format'
import { orderCatalogs, orderPieces } from '@/admin/lib/analytics'
import { useListFilters } from '@/admin/lib/useListFilters'
import { PageHeader } from '@/admin/components/PageHeader'
import { SearchFilters } from '@/admin/components/SearchFilters'
import { CatalogChips } from '@/admin/components/CatalogChips'
import { StatusChip } from '@/components/StatusChip'

export function OrdersPage() {
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const navigate = useNavigate()

  const sellerName = (clientId) =>
    getSeller(clients.find((c) => c.id === clientId)?.sellerId)?.name ?? '—'
  const buyerName = (clientId) =>
    clients.find((c) => c.id === clientId)?.name ?? '—'

  const haystack = (o) =>
    [o.id, sellerName(o.clientId), buyerName(o.clientId), orderCatalogs(o).map((c) => c.brand).join(' ')].join(' ')

  const { query, setQuery, year, setYear, month, setMonth, years, filtered } = useListFilters(
    orders,
    { date: (o) => o.date, text: haystack }
  )

  const rows = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  )

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Pedidos' }]} title="Pedidos" />
      <SearchFilters
        query={query}
        onQuery={setQuery}
        placeholder="Buscar por ID, vendedora o compradora…"
        year={year}
        onYear={setYear}
        years={years}
        month={month}
        onMonth={setMonth}
      />

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Pedido</th>
              <th className="px-4 py-2.5 text-left font-medium">Fecha</th>
              <th className="px-4 py-2.5 text-left font-medium">Vendedora</th>
              <th className="px-4 py-2.5 text-left font-medium">Compradora</th>
              <th className="px-4 py-2.5 text-right font-medium">Art.</th>
              <th className="px-4 py-2.5 text-left font-medium">Catálogos</th>
              <th className="px-4 py-2.5 text-right font-medium">Ingreso</th>
              <th className="px-4 py-2.5 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <td className="px-4 py-2.5 font-mono text-xs">{order.id}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(order.date)}</td>
                <td className="px-4 py-2.5">{sellerName(order.clientId)}</td>
                <td className="px-4 py-2.5">{buyerName(order.clientId)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{orderPieces(order)}</td>
                <td className="px-4 py-2.5"><CatalogChips order={order} /></td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                  {mxn(orderSplit(order).total)}
                </td>
                <td className="px-4 py-2.5"><StatusChip status={effectiveStatus(order)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay pedidos que coincidan.
          </p>
        )}
      </div>
    </div>
  )
}
