import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClientsStore } from '@/stores/clientsStore'
import { useSharesStore } from '@/stores/sharesStore'
import { catalogs } from '@/data/catalogs'
import { getProduct } from '@/data/products'
import { Button } from '@/components/ui/button'

const NEW = 'new'

// Share a catalog (or a single product) with a clienta: pick an existing
// contact or capture a new one, pick the catalog, preview the personalized
// WhatsApp message, send. The send is simulated (no real WhatsApp in demo).
export function ShareCatalogScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const product = params.get('producto') ? getProduct(params.get('producto')) : null

  const { clients, add: addClient } = useClientsStore()
  const addShare = useSharesStore((s) => s.add)

  const [contactId, setContactId] = useState(null)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  // A product share is locked to its own catalog
  const [catalogId, setCatalogId] = useState(product?.catalogId ?? 'cat-001')

  const catalog = catalogs.find((c) => c.id === catalogId)
  const isNew = contactId === NEW
  const contactName = isNew
    ? newName.trim()
    : clients.find((c) => c.id === contactId)?.name ?? ''
  const firstName = contactName.split(' ')[0]
  const ready = isNew ? newName.trim() && newPhone.trim() : Boolean(contactId)

  const handleSend = () => {
    const clientId = isNew ? addClient(newName.trim(), newPhone.trim()).id : contactId
    addShare({ clientId, catalogId, productId: product?.id ?? null })
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-28">
      <section aria-label="Clienta">
        <h2 className="mb-2 font-semibold">¿A quién se lo compartes?</h2>
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <button
                type="button"
                onClick={() => setContactId(client.id)}
                aria-pressed={contactId === client.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left',
                  contactId === client.id && 'border-primary ring-1 ring-primary'
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setContactId(NEW)}
              aria-pressed={isNew}
              className={cn(
                'w-full rounded-xl border border-dashed p-3 text-left font-medium text-primary',
                isNew && 'border-solid border-primary ring-1 ring-primary'
              )}
            >
              + Nueva clienta
            </button>
          </li>
        </ul>

        {isNew && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl bg-muted p-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Nombre
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre de tu clienta"
                className="h-12 rounded-md border bg-background px-3 text-base"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Teléfono
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="33 0000 0000"
                className="h-12 rounded-md border bg-background px-3 text-base"
              />
            </label>
          </div>
        )}
      </section>

      <section aria-label="Catálogo">
        <h2 className="mb-2 font-semibold">{product ? 'Producto' : 'Catálogo'}</h2>
        {product ? (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted font-bold text-primary">
              {product.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                ${product.price.toLocaleString('es-MX')} · {catalog?.brand}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {catalogs.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatalogId(c.id)}
                aria-pressed={c.id === catalogId}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl border bg-card p-3',
                  c.id === catalogId && 'border-primary ring-1 ring-primary'
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg font-bold text-primary">
                  {c.brand.charAt(0)}
                </span>
                <span className="text-sm font-medium">{c.brand}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Vista previa del mensaje">
        <h2 className="mb-2 font-semibold">Así lo verá en WhatsApp</h2>
        <div className="rounded-xl rounded-bl-sm bg-muted p-3">
          <p className="text-sm">
            ¡Hola{firstName ? ` ${firstName}` : ''}! 🧡 Te comparto{' '}
            {product ? `este modelo que me encantó: ${product.name}` : `el nuevo catálogo ${catalog?.brand}`}.
            Échale un ojito y me dices qué te late:
          </p>
          {/* OpenGraph card mock — personalized title per clienta + catalog */}
          <div className="mt-2 overflow-hidden rounded-lg border bg-background">
            <div className="flex aspect-[2/1] items-center justify-center bg-muted text-3xl font-bold text-primary">
              {catalog?.brand.charAt(0)}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-semibold">
                {product
                  ? `${product.name} — ${catalog?.brand}`
                  : `${catalog?.name} · ${catalog?.season}`}
                {firstName && ` para ${firstName}`}
              </p>
              <p className="text-xs text-muted-foreground">kalza.mx</p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button className="w-full" disabled={!ready} onClick={handleSend}>
          <Send aria-hidden="true" /> Enviar por WhatsApp
        </Button>
      </div>
    </div>
  )
}
