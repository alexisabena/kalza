import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save } from 'lucide-react'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { useInventoryStore } from '@/stores/inventoryStore'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'
import { Button } from '@/components/ui/button'

const SIZE_RUNS = Object.keys(sizeRuns)

const blankRow = () => ({
  name: '',
  catalogId: catalogs[0].id,
  price: '',
  sizeRun: SIZE_RUNS[0],
  colorIds: [],
  stock: '',
})

const inputCls = 'h-9 w-full rounded-md border bg-background px-2 text-sm'

// Bulk "capture new items" flow (wholesaler-admin-spec.md › Inventory) — a
// multi-item draft grid, distinct from single-item edit. Each row is one new
// article; Guardar appends the valid rows to the inventory store (mock).
export function InventoryCapturePage() {
  const addBatch = useInventoryStore((s) => s.addBatch)
  const navigate = useNavigate()
  const [rows, setRows] = useState([blankRow(), blankRow()])

  const update = (i, patch) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, blankRow()])
  const removeRow = (i) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs))

  const toggleColor = (i, cid) =>
    setRows((rs) =>
      rs.map((r, idx) =>
        idx === i
          ? {
              ...r,
              colorIds: r.colorIds.includes(cid)
                ? r.colorIds.filter((x) => x !== cid)
                : [...r.colorIds, cid],
            }
          : r
      )
    )

  // A row counts as ready once it has a name, a price and at least one color.
  const isReady = (r) => r.name.trim() && Number(r.price) > 0 && r.colorIds.length > 0
  const readyRows = rows.filter(isReady)

  const save = () => {
    if (readyRows.length === 0) return
    addBatch(readyRows)
    navigate('/admin/inventory')
  }

  // Color palette is large; scope swatches to the row's catalog isn't modeled,
  // so offer all colors and let the operator pick.
  const colorEntries = Object.entries(colors)

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: 'Capturar artículos' }]}
        title="Capturar artículos"
      >
        <Button variant="outline" onClick={addRow}>
          <Plus aria-hidden="true" /> Agregar fila
        </Button>
        <Button onClick={save} disabled={readyRows.length === 0}>
          <Save aria-hidden="true" /> Guardar {readyRows.length > 0 && `(${readyRows.length})`}
        </Button>
      </PageHeader>

      <p className="mb-4 text-sm text-muted-foreground">
        Captura varios artículos a la vez. Una fila se guarda cuando tiene nombre, precio y al
        menos un color.
      </p>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl border p-4',
              isReady(row) ? 'border-primary/40' : 'border-border'
            )}
          >
            <div className="grid gap-3 sm:grid-cols-[2fr_1.2fr_0.8fr_1fr_auto]">
              <Field label="Nombre">
                <input
                  className={inputCls}
                  value={row.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Nombre del artículo"
                />
              </Field>
              <Field label="Catálogo">
                <select
                  className={inputCls}
                  value={row.catalogId}
                  onChange={(e) => update(i, { catalogId: e.target.value })}
                >
                  {catalogs.map((c) => (
                    <option key={c.id} value={c.id}>{c.brand}</option>
                  ))}
                </select>
              </Field>
              <Field label="Precio">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={row.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder="0"
                />
              </Field>
              <Field label="Corrida">
                <select
                  className={inputCls}
                  value={row.sizeRun}
                  onChange={(e) => update(i, { sizeRun: e.target.value })}
                >
                  {SIZE_RUNS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Stock">
                <input
                  type="number"
                  min="0"
                  className={cn(inputCls, 'w-20')}
                  value={row.stock}
                  onChange={(e) => update(i, { stock: e.target.value })}
                  placeholder="0"
                />
              </Field>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">Colores</span>
                <div className="flex max-w-2xl flex-wrap gap-1.5">
                  {colorEntries.map(([cid, c]) => {
                    const on = row.colorIds.includes(cid)
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => toggleColor(i, cid)}
                        aria-pressed={on}
                        title={c.name}
                        className={cn(
                          'flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs',
                          on ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                        )}
                      >
                        <span
                          className="size-3 rounded-full border"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden="true"
                        />
                        {on && <span className="text-foreground">{c.name}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Quitar fila"
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
