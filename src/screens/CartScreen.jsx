import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { useSessionStore } from '@/stores/sessionStore'
import { getProduct } from '@/data/products'
import { catalogs } from '@/data/catalogs'
import { colors } from '@/data/colors'
import { ProductImage } from '@/components/ProductImage'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const mxn = (n) => `$${n.toLocaleString('es-MX')}`

// Mock checkout math — prices include IVA (MX retail convention)
const SHIPPING = 99
const FREE_SHIPPING_FROM = 1499
const IVA_RATE = 0.16

function CartLine({ item, onRemove }) {
  const product = getProduct(item.productId)
  if (!product) return null

  return (
    <li className="flex items-center gap-3 py-3">
      <ProductImage
        src={product.images[0]}
        alt={product.name}
        className="aspect-square w-16 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {colors[item.colorId].name} · Talla {item.size}
          {item.qty > 1 && ` · ${item.qty} pzas`}
        </p>
      </div>
      <p className="font-semibold text-primary">{mxn(product.price * item.qty)}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${product.name}`}
        className="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  )
}

export function CartScreen() {
  const { items, remove, clear } = useCartStore()
  const place = useOrdersStore((s) => s.place)
  const buyerClientId = useSessionStore((s) => s.buyerClientId)
  const navigate = useNavigate()

  // Step 1 of the double confirmation: the clienta confirms her intent.
  // The vendedora confirms on her side before the order is real.
  const handlePlace = () => {
    const catalogIds = [...new Set(items.map((i) => getProduct(i.productId)?.catalogId))]
    place({
      clientId: buyerClientId,
      items: items.map(({ productId, colorId, size, qty }) => ({ productId, colorId, size, qty })),
      catalogIds,
    })
    clear()
    navigate('/pedidos')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <ShoppingBag className="size-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link to="/" className={cn(buttonVariants(), 'px-6')}>
          Ver el catálogo
        </Link>
      </div>
    )
  }

  // Group lines by the catalog their product belongs to
  const groups = catalogs
    .map((catalog) => ({
      catalog,
      lines: items.filter((i) => getProduct(i.productId)?.catalogId === catalog.id),
    }))
    .filter((g) => g.lines.length > 0)

  const subtotal = items.reduce(
    (sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty,
    0
  )
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING
  const total = subtotal + shipping
  const ivaIncluded = Math.round((subtotal * IVA_RATE) / (1 + IVA_RATE))

  return (
    <div className="flex flex-col gap-6 p-4 pb-10">
      {/* Selections grouped by catalog */}
      {groups.map(({ catalog, lines }) => (
        <section key={catalog.id} aria-label={catalog.brand}>
          <h2 className="border-b pb-2 text-sm font-semibold text-muted-foreground">
            {catalog.brand} · {catalog.name}
          </h2>
          <ul className="divide-y">
            {lines.map((item) => (
              <CartLine key={item.key} item={item} onRemove={() => remove(item.key)} />
            ))}
          </ul>
        </section>
      ))}

      {/* Cart summary */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">{mxn(total)}</span>
      </div>

      {/* Purchase details — revealed as you scroll past the summary */}
      <section aria-label="Detalles de compra" className="rounded-xl bg-muted p-4">
        <h2 className="mb-3 font-semibold">Detalles de compra</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{mxn(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd>{shipping === 0 ? 'Gratis' : mxn(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">IVA incluido (16%)</dt>
            <dd>{mxn(ivaIncluded)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total a pagar</dt>
            <dd className="text-primary">{mxn(total)}</dd>
          </div>
        </dl>
        {shipping > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Envío gratis a partir de {mxn(FREE_SHIPPING_FROM)}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <Button className="w-full" onClick={handlePlace}>Apartar pedido</Button>
          <Button variant="secondary" className="w-full">Pagar</Button>
        </div>
      </section>
    </div>
  )
}
