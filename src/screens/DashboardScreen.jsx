import { Link } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { useSharesStore } from '@/stores/sharesStore'
import { useClientsStore } from '@/stores/clientsStore'
import { catalogs } from '@/data/catalogs'
import { getProduct } from '@/data/products'
import { StatusChip } from '@/components/StatusChip'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

// Retailer home — every catalog she's shared and how far each clienta got.
export function DashboardScreen() {
  const { name, sellerId } = useSessionStore()
  const allShares = useSharesStore((s) => s.shares)
  const clients = useClientsStore((s) => s.clients)

  const clientName = (id) => clients.find((c) => c.id === id)?.name ?? 'Clienta'
  const clientSeller = (id) => clients.find((c) => c.id === id)?.sellerId
  const catalogOf = (id) => catalogs.find((c) => c.id === id)

  // Only the catalogs this vendedora shared with her own clientas
  const shares = allShares.filter((s) => clientSeller(s.clientId) === sellerId)

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <h1 className="text-2xl font-bold">Hola, {name}</h1>
        <p className="text-sm text-muted-foreground">Así van tus catálogos compartidos.</p>
      </div>

      <Link to="/compartir" className={cn(buttonVariants(), 'w-full')}>
        <Share2 aria-hidden="true" /> Compartir catálogo
      </Link>

      <section aria-label="Catálogos compartidos">
        <ul className="divide-y">
          {shares.map((share) => {
            const catalog = catalogOf(share.catalogId)
            const product = share.productId ? getProduct(share.productId) : null
            return (
              <li key={share.id} className="flex items-center gap-3 py-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-primary">
                  {clientName(share.clientId).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{clientName(share.clientId)}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {product ? product.name : catalog?.brand} · {formatDate(share.date)}
                  </p>
                </div>
                <StatusChip status={share.status} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
