import { useParams } from 'react-router-dom'
import { getProduct } from '@/data/products'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { getStock } from '@/data/inventory'
import { mxn } from '@/admin/lib/format'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'

export function InventoryItemDetailPage() {
  const { id } = useParams()
  const product = getProduct(id)

  if (!product) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: 'No encontrado' }]} title="Artículo no encontrado" />
      </div>
    )
  }

  const catalog = catalogs.find((c) => c.id === product.catalogId)
  const sizes = sizeRuns[product.sizeRun] ?? []

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: product.name }]}
        title={product.name}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="ID" value={product.id} mono />
        <Card label="Catálogo" value={catalog?.brand ?? '—'} />
        <Card label="Precio" value={mxn(product.price)} primary />
        <Card label="Corrida" value={product.sizeRun} />
      </div>

      <p className="mb-6 max-w-prose text-sm text-muted-foreground">{product.description}</p>

      {/* Stock matrix: color × size */}
      <section className="overflow-hidden rounded-xl border">
        <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Existencias por color y talla</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Color</th>
                {sizes.map((s) => (
                  <th key={s} className="px-3 py-2 text-center font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {product.colorIds.map((cid) => (
                <tr key={cid}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-3.5 rounded-full border"
                        style={{ backgroundColor: colors[cid]?.hex }}
                        aria-hidden="true"
                      />
                      {colors[cid]?.name ?? cid}
                    </span>
                  </td>
                  {sizes.map((s) => {
                    const qty = getStock(product.id, cid, s)
                    return (
                      <td
                        key={s}
                        className={cn(
                          'px-3 py-2.5 text-center tabular-nums',
                          qty === 0 ? 'text-muted-foreground/50' : 'font-medium'
                        )}
                      >
                        {qty}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Card({ label, value, primary, mono }) {
  return (
    <div className={cn('rounded-xl border p-4', primary && 'border-primary/40 bg-primary/5')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-bold', mono && 'font-mono')}>{value}</p>
    </div>
  )
}
