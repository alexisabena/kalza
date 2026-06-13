import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClientsStore } from '@/stores/clientsStore'
import { getSeller } from '@/data/sellers'
import { orderSplit } from '@/data/pricing'
import { mxn, fmtDate } from '@/admin/lib/format'
import { orderItemsDetailed } from '@/admin/lib/analytics'
import { effectiveStatus } from '@/stores/ordersStore'
import { StatusChip } from '@/components/StatusChip'
import { CatalogChips } from '@/admin/components/CatalogChips'
import { StatusHistoryLog } from '@/admin/components/StatusHistoryLog'

// Dashboard order detail opens here as a side panel (drawer) — contrast with
// the dedicated sections, which use a full page (wholesaler-admin-spec.md).
export function OrderDrawer({ order, onClose }) {
  const clients = useClientsStore((s) => s.clients)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = Boolean(order)
  const client = order && clients.find((c) => c.id === order.clientId)
  const seller = client && getSeller(client.sellerId)
  const rows = order ? orderItemsDetailed(order) : []
  const split = order ? orderSplit(order) : null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-30 bg-foreground/40 motion-safe:transition-opacity motion-safe:duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del pedido"
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-[34rem] max-w-[92vw] flex-col bg-background shadow-xl',
          'motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {order && (
          <>
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold">{order.id}</span>
                <StatusChip status={effectiveStatus(order)} />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Info section */}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Pedido" value={order.id} mono />
                <Info label="Fecha" value={fmtDate(order.date)} />
                <Info label="Vendedora" value={seller?.name ?? '—'} />
                <Info label="ID vendedora" value={seller?.id ?? '—'} mono />
                <Info label="Compradora" value={client?.name ?? '—'} />
                <Info label="ID compradora" value={order.clientId} mono />
              </dl>

              <div className="mt-3">
                <CatalogChips order={order} />
              </div>

              {/* Items overview with dispersion (wholesaler / seller split) */}
              <h3 className="mb-2 mt-6 text-sm font-semibold">Artículos y reparto</h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Artículo</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                      <th className="px-3 py-2 text-right font-medium">Mayorista</th>
                      <th className="px-3 py-2 text-right font-medium">Vendedora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map(({ item, product, total, split: s }) => (
                      <tr key={`${item.productId}|${item.colorId}|${item.size}`}>
                        <td className="px-3 py-2">
                          <span className="block font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.id} · T{item.size}
                            {item.qty > 1 && ` · ×${item.qty}`}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{mxn(total)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {mxn(s.wholesaler)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {mxn(s.seller)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/50 font-semibold">
                    <tr>
                      <td className="px-3 py-2 text-left">Total</td>
                      <td className="px-3 py-2 text-right tabular-nums">{mxn(split.total)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{mxn(split.wholesaler)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-primary">{mxn(split.seller)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status history log — the audit trail */}
              <h3 className="mb-3 mt-6 text-sm font-semibold">Historial de estado</h3>
              <StatusHistoryLog history={order.statusHistory} />
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function Info({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('font-medium', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}
