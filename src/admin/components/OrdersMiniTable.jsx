import { Link } from 'react-router-dom'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { orderSplit } from '@/data/pricing'
import { mxn, fmtDate } from '@/admin/lib/format'
import { orderPieces } from '@/admin/lib/analytics'
import { CatalogChips } from '@/admin/components/CatalogChips'
import { StatusChip } from '@/components/StatusChip'

// Compact order list embedded in seller/buyer detail pages — rows link out to
// the full order detail.
export function OrdersMiniTable({ orders, nameOf }) {
  const allOrders = useOrdersStore((s) => s.orders)
  const rows = [...orders].sort((a, b) => b.date.localeCompare(a.date))
  // allOrders kept in deps so the table re-renders on status changes
  void allOrders

  if (rows.length === 0) {
    return <p className="px-5 py-6 text-center text-sm text-muted-foreground">Sin pedidos.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead className="border-b text-xs text-muted-foreground">
        <tr>
          <th className="px-5 py-2 text-left font-medium">Pedido</th>
          <th className="px-5 py-2 text-left font-medium">Fecha</th>
          {nameOf && <th className="px-5 py-2 text-left font-medium">Quién</th>}
          <th className="px-5 py-2 text-left font-medium">Catálogos</th>
          <th className="px-5 py-2 text-right font-medium">Art.</th>
          <th className="px-5 py-2 text-right font-medium">Ingreso</th>
          <th className="px-5 py-2 text-left font-medium">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((order) => (
          <tr key={order.id} className="hover:bg-muted/40">
            <td className="px-5 py-2.5">
              <Link to={`/admin/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                {order.id}
              </Link>
            </td>
            <td className="px-5 py-2.5 text-muted-foreground">{fmtDate(order.date)}</td>
            {nameOf && <td className="px-5 py-2.5">{nameOf(order)}</td>}
            <td className="px-5 py-2.5"><CatalogChips order={order} /></td>
            <td className="px-5 py-2.5 text-right tabular-nums">{orderPieces(order)}</td>
            <td className="px-5 py-2.5 text-right font-medium tabular-nums">{mxn(orderSplit(order).total)}</td>
            <td className="px-5 py-2.5"><StatusChip status={effectiveStatus(order)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
