import { useCatalogStore } from '@/stores/catalogStore'
import { productsByCatalog } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'

// Home — the active catalog as a 2-column masonry grid (DESIGN.md › Catalog grid)
export function CatalogoScreen() {
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const products = productsByCatalog[activeCatalog.id] ?? []

  return (
    <div className="p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        {activeCatalog.name} · {activeCatalog.season}
      </p>
      <div className="columns-2 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
