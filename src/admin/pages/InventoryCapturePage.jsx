import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  ImagePlus,
  X,
  Save,
  ChevronDown,
  CircleCheck,
  CircleAlert,
  TriangleAlert,
} from 'lucide-react'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { useInventoryStore } from '@/stores/inventoryStore'
import { fileToDataUrl } from '@/admin/lib/image'
import { mxn } from '@/admin/lib/format'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/admin/components/PageHeader'
import { Button } from '@/components/ui/button'

const SIZE_RUNS = Object.keys(sizeRuns)
const COLOR_IDS = Object.keys(colors)
const inputCls = 'h-10 w-full rounded-md border bg-background px-3 text-sm'
const MAX_IMAGES = 4

let draftSeq = 0
const makeDraft = () => ({
  _id: `d-${++draftSeq}`,
  name: '',
  description: '',
  catalogId: catalogs[0].id,
  sizeRun: SIZE_RUNS[0],
  price: '',
  colors: [], // [{ colorId, stock, images: [] }]
})

// Completeness of one product draft.
// Error: missing title / description / price / colors, or a color without stock.
// Warning: a color has no images yet. OK: everything filled + every color imaged.
function productStatus(p) {
  const errors = []
  if (!p.name.trim()) errors.push('título')
  if (!p.description.trim()) errors.push('descripción')
  if (Number(p.price) <= 0) errors.push('precio')
  if (p.colors.length === 0) errors.push('colores')
  else if (p.colors.some((c) => String(c.stock).trim() === '' || Number(c.stock) < 0))
    errors.push('stock')

  const warnings = []
  if (p.colors.length > 0 && p.colors.some((c) => c.images.length === 0)) warnings.push('imágenes')

  return { errors, warnings, level: errors.length ? 'error' : warnings.length ? 'warning' : 'ok' }
}

// Single-product capture, stacked as accordions so several items can be
// captured in one pass. The relationship is producto → color → stock + imágenes.
export function InventoryCapturePage() {
  const addProducts = useInventoryStore((s) => s.addProducts)
  const navigate = useNavigate()

  const [products, setProducts] = useState(() => [makeDraft()])
  const [openIds, setOpenIds] = useState(() => new Set([products[0]._id]))
  const [imageModal, setImageModal] = useState(null) // { pid, ci }
  const [infoOpen, setInfoOpen] = useState(false)

  const patchProduct = (pid, patch) =>
    setProducts((ps) => ps.map((p) => (p._id === pid ? { ...p, ...patch } : p)))

  const addProduct = () => {
    const draft = makeDraft()
    setProducts((ps) => [...ps, draft])
    setOpenIds((s) => new Set(s).add(draft._id))
  }
  const removeProduct = (pid) => {
    setProducts((ps) => ps.filter((p) => p._id !== pid))
    setOpenIds((s) => {
      const next = new Set(s)
      next.delete(pid)
      return next
    })
  }
  const toggleOpen = (pid) =>
    setOpenIds((s) => {
      const next = new Set(s)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })

  // Per-color helpers operate on a given product.
  const addColor = (pid) =>
    patchColors(pid, (cs) => {
      const taken = new Set(cs.map((c) => c.colorId))
      const next = COLOR_IDS.find((id) => !taken.has(id))
      return next ? [...cs, { colorId: next, stock: '', images: [] }] : cs
    })
  const updateColor = (pid, ci, patch) =>
    patchColors(pid, (cs) => cs.map((c, i) => (i === ci ? { ...c, ...patch } : c)))
  const removeColor = (pid, ci) => patchColors(pid, (cs) => cs.filter((_, i) => i !== ci))
  const patchColors = (pid, fn) =>
    setProducts((ps) => ps.map((p) => (p._id === pid ? { ...p, colors: fn(p.colors) } : p)))

  const statuses = products.map(productStatus)
  const canSave = products.length > 0 && statuses.every((s) => s.level !== 'error')

  const save = () => {
    if (!canSave) return
    addProducts(
      products.map((p) => ({
        name: p.name,
        description: p.description,
        catalogId: p.catalogId,
        price: p.price,
        sizeRun: p.sizeRun,
        colors: p.colors,
      }))
    )
    navigate('/admin/inventory')
  }

  const modalColor =
    imageModal && products.find((p) => p._id === imageModal.pid)?.colors[imageModal.ci]

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Inventario', to: '/admin/inventory' }, { label: 'Nuevos artículos' }]}
        title="Nuevos artículos"
      >
        <Button variant="outline" onClick={() => setInfoOpen(true)}>
          Importar de archivo
        </Button>
        <Button onClick={save} disabled={!canSave}>
          <Save aria-hidden="true" /> Guardar {products.length > 1 && `(${products.length})`}
        </Button>
      </PageHeader>

      <div className="flex max-w-4xl flex-col gap-3">
        {products.map((product, i) => (
          <ProductAccordion
            key={product._id}
            product={product}
            index={i + 1}
            status={statuses[i]}
            open={openIds.has(product._id)}
            canRemove={products.length > 1}
            onToggle={() => toggleOpen(product._id)}
            onPatch={(patch) => patchProduct(product._id, patch)}
            onRemove={() => removeProduct(product._id)}
            onAddColor={() => addColor(product._id)}
            onUpdateColor={(ci, patch) => updateColor(product._id, ci, patch)}
            onRemoveColor={(ci) => removeColor(product._id, ci)}
            onOpenImages={(ci) => setImageModal({ pid: product._id, ci })}
          />
        ))}

        <Button variant="outline" onClick={addProduct} className="self-start">
          <Plus aria-hidden="true" /> Agregar producto
        </Button>
      </div>

      {modalColor && (
        <ImageModal
          row={modalColor}
          onClose={() => setImageModal(null)}
          onChange={(images) => updateColor(imageModal.pid, imageModal.ci, { images })}
        />
      )}
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}
    </div>
  )
}

const STATUS = {
  ok: { icon: CircleCheck, cls: 'bg-success/15 text-success' },
  warning: { icon: TriangleAlert, cls: 'bg-primary/10 text-primary' },
  error: { icon: CircleAlert, cls: 'bg-destructive/10 text-destructive' },
}

function StatusBadge({ status }) {
  const { icon: Icon, cls } = STATUS[status.level]
  const label =
    status.level === 'error'
      ? `Falta: ${status.errors.join(', ')}`
      : status.level === 'warning'
        ? 'Imágenes pendientes'
        : 'Listo'
  return (
    <span className={cn('flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium', cls)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

function ProductAccordion({
  product,
  index,
  status,
  open,
  canRemove,
  onToggle,
  onPatch,
  onRemove,
  onAddColor,
  onUpdateColor,
  onRemoveColor,
  onOpenImages,
}) {
  const taken = new Set(product.colors.map((c) => c.colorId))
  const nextColor = COLOR_IDS.find((id) => !taken.has(id))

  return (
    <section className={cn('overflow-hidden rounded-xl border', open && 'border-primary/40')}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {product.name.trim() || `Producto ${index}`}
            </span>
            <span className="block text-xs text-muted-foreground">
              {catalogs.find((c) => c.id === product.catalogId)?.brand}
              {product.colors.length > 0 && ` · ${product.colors.length} ${product.colors.length === 1 ? 'color' : 'colores'}`}
            </span>
          </span>
        </button>
        <StatusBadge status={status} />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Quitar producto"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="border-t p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <input className={inputCls} value={product.name} onChange={(e) => onPatch({ name: e.target.value })} placeholder="Nombre del artículo" />
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={product.description}
                onChange={(e) => onPatch({ description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </Field>
            <Field label="Catálogo">
              <select className={inputCls} value={product.catalogId} onChange={(e) => onPatch({ catalogId: e.target.value })}>
                {catalogs.map((c) => (
                  <option key={c.id} value={c.id}>{c.brand}</option>
                ))}
              </select>
            </Field>
            <Field label="Corrida">
              <select className={inputCls} value={product.sizeRun} onChange={(e) => onPatch({ sizeRun: e.target.value })}>
                {SIZE_RUNS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Precio">
              <CurrencyInput value={product.price} onChange={(v) => onPatch({ price: v })} />
            </Field>
          </div>

          <div className="mt-6 mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Colores</h3>
            <Button variant="outline" size="sm" onClick={onAddColor} disabled={!nextColor}>
              <Plus aria-hidden="true" /> Agregar color
            </Button>
          </div>

          {product.colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Agrega los colores. Por cada color defines su stock y sus imágenes.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {product.colors.map((row, ci) => (
                <li key={ci} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="size-5 shrink-0 rounded-full border" style={{ backgroundColor: colors[row.colorId]?.hex }} aria-hidden="true" />
                  <select
                    className="h-10 w-40 rounded-md border bg-background px-2 text-sm"
                    value={row.colorId}
                    onChange={(e) => onUpdateColor(ci, { colorId: e.target.value })}
                    aria-label="Color"
                  >
                    {COLOR_IDS.map((id) => (
                      <option key={id} value={id} disabled={taken.has(id) && id !== row.colorId}>
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
                      onChange={(e) => onUpdateColor(ci, { stock: e.target.value })}
                      placeholder="0"
                      aria-label={`Stock de ${colors[row.colorId]?.name}`}
                    />
                  </label>

                  <div className="flex items-center gap-1">
                    {row.images.map((src, ii) => (
                      <img key={ii} src={src} alt="" className="size-9 rounded border object-cover" />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenImages(ci)}
                    className={cn(row.images.length === 0 && 'border-primary/50 text-primary')}
                  >
                    <ImagePlus aria-hidden="true" />
                    {row.images.length > 0 ? `Imágenes (${row.images.length})` : 'Imágenes'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => onRemoveColor(ci)}
                    aria-label="Quitar color"
                    className="ml-auto flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
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

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />

      <div className="flex justify-end">
        <Button onClick={onClose}>Listo</Button>
      </div>
    </Modal>
  )
}

function InfoModal({ onClose }) {
  return (
    <Modal onClose={onClose} title="Cómo capturar artículos">
      <ol className="mb-5 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>Captura el <strong className="text-foreground">producto</strong>: nombre, descripción, catálogo, corrida y precio.</li>
        <li>Agrega los <strong className="text-foreground">colores</strong> en que se vende.</li>
        <li>Por cada color, define su <strong className="text-foreground">stock</strong> y sube sus <strong className="text-foreground">imágenes</strong>.</li>
        <li>Agrega más productos con “Agregar producto”. La etiqueta de cada uno indica si está listo, si le falta un dato o si tiene imágenes pendientes.</li>
        <li>Guarda. Solo se guardan los productos sin errores.</li>
      </ol>
      <p className="mb-5 text-sm text-muted-foreground">
        La relación es <strong className="text-foreground">producto → color → stock e imágenes</strong>.
        La carga masiva por hoja de cálculo se hará en una fase posterior; por ahora la captura es
        manual.
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

// Peso input, standard es-MX format ($ + comma thousands, no decimals) to match
// mxn() used across the back-office. Text right-aligned, MXN suffix, stores a
// plain integer number.
function CurrencyInput({ value, onChange }) {
  const [raw, setRaw] = useState(() =>
    value === '' || value == null || Number.isNaN(Number(value)) ? '' : String(Math.trunc(value))
  )

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    setRaw(digits)
    onChange(digits === '' ? '' : Number(digits))
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={raw === '' ? '' : mxn(Number(raw))}
        onChange={handleChange}
        placeholder="$0"
        className="h-10 w-full rounded-md border bg-background pl-3 pr-14 text-right text-sm tabular-nums"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        MXN
      </span>
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
