import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { products } from '@/data/products'
import { inventory } from '@/data/inventory'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import {
  useInventoryStore,
  capturedStock,
  capturedColorIds,
  capturedCover,
} from '@/stores/inventoryStore'
import { mxn } from '@/admin/lib/format'
import { PageHeader } from '@/admin/components/PageHeader'
import { Button } from '@/components/ui/button'

const catalogBrand = (id) => catalogs.find((c) => c.id === id)?.brand ?? '—'

// Total stock across every (color, size) of a base product.
const baseStock = (productId) =>
  Object.values(inventory[productId] ?? {}).reduce(
    (sum, byColor) => sum + Object.values(byColor).reduce((s, q) => s + q, 0),
    0
  )

export function InventoryPage() {
  const captured = useInventoryStore((s) => s.captured)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState('all')

  const rows = useMemo(() => {
    const base = products.map((p) => ({
      id: p.id,
      name: p.name,
      catalogId: p.catalogId,
      price: p.price,
      colorIds: p.colorIds,
      stock: baseStock(p.id),
      cover: null,
      captured: false,
    }))
    const capturedRows = captured.map((c) => ({
      id: c.id,
      name: c.name,
      catalogId: c.catalogId,
      price: c.price,
      colorIds: capturedColorIds(c),
      stock: capturedStock(c),
      cover: capturedCover(c),
      captured: true,
    }))
    const all = [...capturedRows, ...base]
    const q = query.trim().toLowerCase()
    return all.filter(
      (r) =>
        (catalog === 'all' || r.catalogId === catalog) &&
        (r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    )
  }, [captured, query, catalog])

  return (
    <div>
      <PageHeader crumbs={[{ label: 'Inventario' }]} title="Inventario">
        <Button onClick={() => navigate('/admin/inventory/new')}>
          <Plus aria-hidden="true" /> Capturar artículos
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o ID…"
            aria-label="Buscar"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={catalog}
          onChange={(e) => setCatalog(e.target.value)}
          aria-label="Catálogo"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">Todos los catálogos</option>
          {catalogs.map((c) => (
            <option key={c.id} value={c.id}>{c.brand}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">ID</th>
              <th className="px-5 py-2.5 text-left font-medium">Artículo</th>
              <th className="px-5 py-2.5 text-left font-medium">Catálogo</th>
              <th className="px-5 py-2.5 text-left font-medium">Colores</th>
              <th className="px-5 py-2.5 text-right font-medium">Precio</th>
              <th className="px-5 py-2.5 text-right font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {r.cover ? (
                      <img src={r.cover} alt="" className="size-9 shrink-0 rounded border object-cover" />
                    ) : (
                      <span className="size-9 shrink-0 rounded border bg-muted" aria-hidden="true" />
                    )}
                    <span>
                      <Link to={`/admin/inventory/${r.id}`} className="font-medium text-primary hover:underline">
                        {r.name}
                      </Link>
                      {r.captured && (
                        <span className="ml-2 rounded bg-success/15 px-1.5 py-0.5 text-[11px] font-medium text-success">
                          Nuevo
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">{catalogBrand(r.catalogId)}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-1">
                    {r.colorIds.map((cid) => (
                      <span
                        key={cid}
                        title={colors[cid]?.name ?? cid}
                        className="size-3.5 rounded-full border"
                        style={{ backgroundColor: colors[cid]?.hex }}
                        aria-label={colors[cid]?.name ?? cid}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums">{mxn(r.price)}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">
                  <span className={r.stock === 0 ? 'text-destructive' : ''}>{r.stock}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Sin artículos.</p>
        )}
      </div>
    </div>
  )
}
