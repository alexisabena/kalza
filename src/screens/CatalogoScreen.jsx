import { useCatalogStore } from '@/stores/catalogStore'
import { productsByCatalog } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'

// Home — the active catalog as a masonry grid (DESIGN.md › Catalog grid).
// Each card reveals its price plate after dwelling on screen (usePriceReveal);
// re-keying the grid by catalog id remounts the cards on a brand switch, so the
// reveal replays (the DSM showcase moment).
//
// Responsive (responsive-spec §5.1):
// · phone        — 2 cols, base padding/gutter (canonical).
// · tablet-p     — pure fluid scale: still 2 cols, but the wider viewport + more
//                  padding/gutter make the images read like a large phone.
// · tablet-l     — reflow: 3 cols, slightly scaled up, and the whole grid is
//                  letterboxed (max-w + mx-auto) so neutral side strips frame it.
export function CatalogoScreen() {
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const products = productsByCatalog[activeCatalog.id] ?? []

  return (
    <div className="p-4 tablet-p:p-6 tablet-l:mx-auto tablet-l:max-w-4xl tablet-l:px-6">
      <p className="mb-3 text-sm text-muted-foreground">
        {activeCatalog.name} · {activeCatalog.season}
      </p>
      <div
        key={activeCatalog.id}
        className="columns-2 gap-2 tablet-p:gap-4 tablet-l:columns-3 tablet-l:gap-3"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
