import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrdersStore } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { sellers } from '@/data/sellers'
import { itemTotal, splitAmount } from '@/data/pricing'
import { mxn } from '@/admin/lib/format'
import { isEarned } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { SearchFilters } from '@/admin/components/SearchFilters'

export function SellersPage() {
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

  const sellerOf = (clientId) => clients.find((c) => c.id === clientId)?.sellerId

  const rows = sellers
    .map((seller) => {
      const herClients = clients.filter((c) => c.sellerId === seller.id)
      const herOrders = orders.filter(
        (o) => sellerOf(o.clientId) === seller.id && inPeriod(o.date)
      )
      const earned = herOrders.filter(isEarned)
      const amount = earned.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + itemTotal(i), 0),
        0
      )
      return {
        seller,
        clientCount: herClients.length,
        orderCount: herOrders.length,
        income: splitAmount(amount),
      }
    })
    .filter((r) => r.seller.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Vendedoras' }]} title="Vendedoras" />
      <SearchFilters
        query={query}
        onQuery={setQuery}
        placeholder="Buscar vendedora…"
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
              <th className="px-5 py-2.5 text-left font-medium">Vendedora</th>
              <th className="px-5 py-2.5 text-left font-medium">ID</th>
              <th className="px-5 py-2.5 text-right font-medium">Compradoras</th>
              <th className="px-5 py-2.5 text-right font-medium">Pedidos</th>
              <th className="px-5 py-2.5 text-right font-medium">Ventas</th>
              <th className="px-5 py-2.5 text-right font-medium">Su comisión · 60%</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ seller, clientCount, orderCount, income }) => (
              <tr
                key={seller.id}
                onClick={() => navigate(`/admin/sellers/${seller.id}`)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <td className="px-5 py-2.5 font-medium">{seller.name}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{seller.id}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{clientCount}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{orderCount}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{mxn(income.total)}</td>
                <td className="px-5 py-2.5 text-right font-medium tabular-nums text-primary">{mxn(income.seller)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
