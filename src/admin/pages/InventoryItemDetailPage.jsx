import { useParams } from 'react-router-dom'
import { getProduct } from '@/data/products'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { getStock } from '@/data/inventory'
import { useInventoryStore, capturedStock, getCaptured } from '@/stores/inventoryStore'
import { mxn } from '@/admin/lib/format'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'

const catalogBrand = (id) => catalogs.find((c) => c.id === id)?.brand ?? '—'

export function InventoryItemDetailPage() {
  const { id } = useParams()
  const captured = useInventoryStore((s) => s.captured)
  const item = getCaptured(captured, id)
  const product = getProduct(id)

  if (!item && !product) {
    return (
      <div>
        <PageHeader crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: 'No encontrado' }]} title="Artículo no encontrado" />
      </div>
    )
  }

  // Captured items carry per-color stock + images; base products carry a
  // deterministic color x size matrix.
  return item ? <CapturedDetail item={item} /> : <BaseDetail product={product} />
}

function CapturedDetail({ item }) {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: item.name }]}
        title={item.name}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="ID" value={item.id} mono />
        <Card label="Catálogo" value={catalogBrand(item.catalogId)} />
        <Card label="Precio" value={mxn(item.price)} primary />
        <Card label="Stock total" value={capturedStock(item)} />
      </div>

      {item.description && (
        <p className="mb-6 max-w-prose text-sm text-muted-foreground">{item.description}</p>
      )}

      <section className="overflow-hidden rounded-xl border">
        <h2 className="border-b bg-muted/40 px-5 py-3 font-semibold">Colores</h2>
        <ul className="divide-y">
          {item.colors.map((c) => (
            <li key={c.colorId} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="size-4 rounded-full border"
                  style={{ backgroundColor: colors[c.colorId]?.hex }}
                  aria-hidden="true"
                />
                {colors[c.colorId]?.name ?? c.colorId}
              </span>
              <span className="text-sm text-muted-foreground">
                Stock: <span className={cn('tabular-nums', c.stock === 0 && 'text-destructive')}>{c.stock}</span>
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                {c.images.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Sin imágenes</span>
                ) : (
                  c.images.map((src, i) => (
                    <img key={i} src={src} alt="" className="size-12 rounded border object-cover" />
                  ))
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function BaseDetail({ product }) {
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
