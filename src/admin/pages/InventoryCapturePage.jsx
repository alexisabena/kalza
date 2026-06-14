import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ImagePlus, X, Save } from 'lucide-react'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { useInventoryStore } from '@/stores/inventoryStore'
import { fileToDataUrl } from '@/admin/lib/image'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'
import { Button } from '@/components/ui/button'

const SIZE_RUNS = Object.keys(sizeRuns)
const COLOR_IDS = Object.keys(colors)
const inputCls = 'h-10 w-full rounded-md border bg-background px-3 text-sm'
const MAX_IMAGES = 4

// Single-product capture: one product (name, description, catalog, corrida,
// price), then per chosen color a stock quantity and a set of images uploaded
// through a modal. Bulk import is intentionally out of scope (see info modal).
export function InventoryCapturePage() {
  const addProducts = useInventoryStore((s) => s.addProducts)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [catalogId, setCatalogId] = useState(catalogs[0].id)
  const [sizeRun, setSizeRun] = useState(SIZE_RUNS[0])
  const [price, setPrice] = useState('')
  const [rows, setRows] = useState([]) // [{ colorId, stock, images: [] }]

  const [imageModal, setImageModal] = useState(null) // row index or null
  const [infoOpen, setInfoOpen] = useState(false)

  const used = new Set(rows.map((r) => r.colorId))
  const nextColor = COLOR_IDS.find((id) => !used.has(id))

  // Compute the next unused color from current state so rapid adds never dupe.
  const addColor = () =>
    setRows((rs) => {
      const taken = new Set(rs.map((r) => r.colorId))
      const next = COLOR_IDS.find((id) => !taken.has(id))
      return next ? [...rs, { colorId: next, stock: '', images: [] }] : rs
    })
  const updateRow = (i, patch) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i))

  const ready =
    name.trim() && Number(price) > 0 && rows.length > 0 && rows.every((r) => r.colorId)

  const save = () => {
    if (!ready) return
    addProducts([{ name, description, catalogId, price, sizeRun, colors: rows }])
    navigate('/admin/inventory')
  }

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: 'Nuevo artículo' }]}
        title="Nuevo artículo"
      >
        <Button variant="outline" onClick={() => setInfoOpen(true)}>
          ¿Cómo funciona?
        </Button>
        <Button onClick={save} disabled={!ready}>
          <Save aria-hidden="true" /> Guardar
        </Button>
      </PageHeader>

      <div className="grid max-w-4xl gap-6">
        {/* Producto */}
        <section className="rounded-xl border p-5">
          <h2 className="mb-4 font-semibold">Producto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del artículo" />
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del producto"
              />
            </Field>
            <Field label="Catálogo">
              <select className={inputCls} value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
                {catalogs.map((c) => (
                  <option key={c.id} value={c.id}>{c.brand}</option>
                ))}
              </select>
            </Field>
            <Field label="Corrida">
              <select className={inputCls} value={sizeRun} onChange={(e) => setSizeRun(e.target.value)}>
                {SIZE_RUNS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Precio">
              <input type="number" min="0" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </Field>
          </div>
        </section>

        {/* Colores: stock + imágenes por color */}
        <section className="rounded-xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Colores</h2>
            <Button variant="outline" size="sm" onClick={addColor} disabled={!nextColor}>
              <Plus aria-hidden="true" /> Agregar color
            </Button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Agrega los colores de este artículo. Por cada color defines su stock y sus imágenes.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {rows.map((row, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-3">
                  <span
                    className="size-5 shrink-0 rounded-full border"
                    style={{ backgroundColor: colors[row.colorId]?.hex }}
                    aria-hidden="true"
                  />
                  <select
                    className="h-10 w-40 rounded-md border bg-background px-2 text-sm"
                    value={row.colorId}
                    onChange={(e) => updateRow(i, { colorId: e.target.value })}
                    aria-label="Color"
                  >
                    {COLOR_IDS.map((id) => (
                      <option key={id} value={id} disabled={used.has(id) && id !== row.colorId}>
                        {colors[id].name}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Stock</span>
                    <input
                      type="number"
                      min="0"
                      className="h-10 w-24 rounded-md border bg-background px-2 text-sm"
                      value={row.stock}
                      onChange={(e) => updateRow(i, { stock: e.target.value })}
                      placeholder="0"
                      aria-label={`Stock de ${colors[row.colorId]?.name}`}
                    />
                  </label>

                  {/* uploaded thumbnails for this color */}
                  <div className="flex items-center gap-1">
                    {row.images.map((src, ii) => (
                      <img
                        key={ii}
                        src={src}
                        alt=""
                        className="size-9 rounded border object-cover"
                      />
                    ))}
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setImageModal(i)}>
                    <ImagePlus aria-hidden="true" />
                    {row.images.length > 0 ? `Imágenes (${row.images.length})` : 'Imágenes'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Quitar color"
                    className="ml-auto flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {imageModal !== null && (
        <ImageModal
          row={rows[imageModal]}
          onClose={() => setImageModal(null)}
          onChange={(images) => updateRow(imageModal, { images })}
        />
      )}
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}
    </div>
  )
}

// Per-color image upload modal — uploads become small thumbnails in the row.
function ImageModal({ row, onClose, onChange }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const remaining = MAX_IMAGES - row.images.length

  const onFiles = async (e) => {
    const files = [...e.target.files].slice(0, remaining)
    if (files.length === 0) return
    setBusy(true)
    try {
      const urls = await Promise.all(files.map((f) => fileToDataUrl(f)))
      onChange([...row.images, ...urls].slice(0, MAX_IMAGES))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeAt = (idx) => onChange(row.images.filter((_, i) => i !== idx))

  return (
    <Modal onClose={onClose} title={`Imágenes · ${colors[row.colorId]?.name ?? ''}`}>
      <p className="mb-4 text-sm text-muted-foreground">
        Sube hasta {MAX_IMAGES} imágenes para este color. La primera se usa como portada.
      </p>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {row.images.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt="" className="aspect-square w-full rounded-md border object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                Portada
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <ImagePlus className="size-5" aria-hidden="true" />
            <span className="text-xs">{busy ? 'Subiendo…' : 'Agregar'}</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      <div className="flex justify-end">
        <Button onClick={onClose}>Listo</Button>
      </div>
    </Modal>
  )
}

function InfoModal({ onClose }) {
  return (
    <Modal onClose={onClose} title="Cómo capturar un artículo">
      <ol className="mb-5 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>Captura el <strong className="text-foreground">producto</strong>: nombre, descripción, catálogo, corrida y precio.</li>
        <li>Agrega los <strong className="text-foreground">colores</strong> en que se vende.</li>
        <li>Por cada color, define su <strong className="text-foreground">stock</strong> y sube sus <strong className="text-foreground">imágenes</strong>.</li>
        <li>Guarda. El artículo queda ligado a su catálogo y aparece en el inventario.</li>
      </ol>
      <p className="mb-5 text-sm text-muted-foreground">
        La relación es <strong className="text-foreground">producto → color → stock e imágenes</strong>.
        La carga masiva por hoja de cálculo se hará en una fase posterior; por ahora la captura es
        manual, uno por uno.
      </p>
      <div className="flex justify-end">
        <Button onClick={onClose}>Entendido</Button>
      </div>
    </Modal>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg rounded-xl border bg-background p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, className }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
