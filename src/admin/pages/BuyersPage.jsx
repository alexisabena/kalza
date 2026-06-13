import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { itemTotal } from '@/data/pricing'
import { mxn } from '@/admin/lib/format'
import { isEarned } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { SearchFilters } from '@/admin/components/SearchFilters'

export function BuyersPage() {
  const orders = useOrdersStore((s) => s.orders)
  const clients = useClientsStore((s) => s.clients)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')

  const years = useMemo(
    () => [...new Set(orders.map((o) => o.date.slice(0, 4)))].sort().reverse(),
    [orders]
  )

  const inPeriod = (date) => {
    if (year !== 'all' && date.slice(0, 4) !== year) return false
    if (month !== 'all' && Number(date.slice(5, 7)) !== Number(month)) return false
    return true
  }

  const q = query.trim().toLowerCase()
  const rows = clients
    .map((client) => {
      const herOrders = orders.filter((o) => o.clientId === client.id && inPeriod(o.date))
      const spent = herOrders
        .filter(isEarned)
        .reduce((sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0), 0)
      return {
        client,
        seller: getSeller(client.sellerId),
        orderCount: herOrders.length,
        spent,
      }
    })
    .filter(
      ({ client, seller }) =>
        client.name.toLowerCase().includes(q) ||
        client.phone.includes(q) ||
        (seller?.name.toLowerCase().includes(q) ?? false)
    )

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Compradoras' }]} title="Compradoras" />
      <SearchFilters
        query={query}
        onQuery={setQuery}
        placeholder="Buscar por nombre, teléfono o vendedora…"
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
              <th className="px-5 py-2.5 text-left font-medium">Compradora</th>
              <th className="px-5 py-2.5 text-left font-medium">Teléfono</th>
              <th className="px-5 py-2.5 text-left font-medium">Vendedora</th>
              <th className="px-5 py-2.5 text-right font-medium">Pedidos</th>
              <th className="px-5 py-2.5 text-right font-medium">Comprado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ client, seller, orderCount, spent }) => (
              <tr
                key={client.id}
                onClick={() => navigate(`/admin/buyers/${client.id}`)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <td className="px-5 py-2.5 font-medium">{client.name}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{client.phone}</td>
                <td className="px-5 py-2.5">{seller?.name ?? '—'}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{orderCount}</td>
                <td className="px-5 py-2.5 text-right font-medium tabular-nums">{mxn(spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
