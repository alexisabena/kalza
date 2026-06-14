import { useParams } from 'react-router-dom'
import { PackageCheck, Truck } from 'lucide-react'
import { useOrdersStore, effectiveStatus } from '@/stores/ordersStore'
import { useClientsStore } from '@/stores/clientsStore'
import { useStaffStore } from '@/stores/staffStore'
import { getSeller } from '@/data/sellers'
import { orderSplit } from '@/data/pricing'
import { mxn, fmtDate, fmtDateTime } from '@/admin/lib/format'
import { orderItemsDetailed } from '@/admin/lib/analytics'
import { PageHeader } from '@/admin/components/PageHeader'
import { CatalogChips } from '@/admin/components/CatalogChips'
import { StatusHistoryLog } from '@/admin/components/StatusHistoryLog'
import { StatusChip } from '@/components/StatusChip'
import { Button } from '@/components/ui/button'

export function OrderDetailPage() {
  const { id } = useParams()
  const orders = useOrdersStore((s) => s.orders)
  const reserve = useOrdersStore((s) => s.reserve)
  const collect = useOrdersStore((s) => s.collect)
  const clients = useClientsStore((s) => s.clients)
  const currentStaffId = useStaffStore((s) => s.currentStaffId)
  const currentStaff = useStaffStore((s) => s.staff.find((x) => x.id === s.currentStaffId))

  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Pedidos', to: '/admin/orders' }, { label: 'No encontrado' }]} title="Pedido no encontrado" />
        <p className="text-muted-foreground">Este pedido ya no existe.</p>
      </div>
    )
  }

  const status = effectiveStatus(order)
  const client = clients.find((c) => c.id === order.clientId)
  const seller = getSeller(client?.sellerId)
  const rows = orderItemsDetailed(order)
  const split = orderSplit(order)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Pedidos', to: '/admin/orders' }, { label: order.id }]}
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{order.id}</span>
          </span>
        }
      >
        <StatusChip status={status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Left: info + items dispersion */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border p-5">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Info label="Fecha" value={fmtDate(order.date)} />
              <Info label="Vendedora" value={seller?.name ?? '—'} />
              <Info label="ID vendedora" value={seller?.id ?? '—'} mono />
              <Info label="Compradora" value={client?.name ?? '—'} />
              <Info label="ID compradora" value={order.clientId} mono />
              <Info label="Teléfono" value={client?.phone ?? '—'} />
            </dl>
            <div className="mt-4">
              <CatalogChips order={order} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border">
            <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Artículos y reparto</h2>
            <table className="w-full text-sm">
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 text-left font-medium">Artículo</th>
                  <th className="px-5 py-2 text-left font-medium">Catálogo</th>
                  <th className="px-5 py-2 text-right font-medium">Total</th>
                  <th className="px-5 py-2 text-right font-medium">Mayorista</th>
                  <th className="px-5 py-2 text-right font-medium">Vendedora</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(({ item, product, catalog, total, split: s }) => (
                  <tr key={`${item.productId}|${item.colorId}|${item.size}`}>
                    <td className="px-5 py-2.5">
                      <span className="block font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.id} · T{item.size}{item.qty > 1 && ` · ×${item.qty}`}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground">{catalog?.brand}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{mxn(total)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{mxn(s.wholesaler)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{mxn(s.seller)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/40 font-semibold">
                <tr>
                  <td className="px-5 py-2.5" colSpan={2}>Total</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{mxn(split.total)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{mxn(split.wholesaler)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-primary">{mxn(split.seller)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {order.messages.length > 0 && (
            <section className="rounded-xl border p-5">
              <h2 className="mb-3 font-semibold">Coordinación con la vendedora</h2>
              <ul className="flex flex-col gap-2">
                {order.messages.map((m, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium capitalize">{m.from}</span>
                    <span className="text-muted-foreground"> · {m.time}</span>
                    <p>{m.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right: actions + audit trail */}
        <div className="flex flex-col gap-6">
          {(status === 'pedido' || status === 'pagado') && (
            <section className="rounded-xl border p-5">
              <h2 className="mb-1 font-semibold">Acción</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Se registrará a nombre de{' '}
                <span className="font-medium text-foreground">{currentStaff?.name}</span>.
              </p>
              {status === 'pedido' && (
                <Button className="w-full" onClick={() => reserve(order.id, currentStaffId)}>
                  <PackageCheck aria-hidden="true" /> Confirmar y apartar
                </Button>
              )}
              {status === 'pagado' && (
                <Button className="w-full" onClick={() => collect(order.id, currentStaffId)}>
                  <Truck aria-hidden="true" /> Entregar a la vendedora
                </Button>
              )}
            </section>
          )}

          <section className="rounded-xl border p-5">
            <h2 className="mb-4 font-semibold">Historial de estado</h2>
            <StatusHistoryLog history={order.statusHistory} />
            {order.payDeadline && status === 'apartado' && (
              <p className="mt-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                Plazo de pago hasta {fmtDateTime(order.payDeadline)}.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono font-medium' : 'font-medium'}>{value}</dd>
    </div>
  )
}
