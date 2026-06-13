import { orderCatalogs } from '@/admin/lib/analytics'

// One chip per catalog represented in an order (Dashboard table + detail).
// Text + neutral surface — color identity belongs to the brand themes, not
// to admin chrome (DESIGN.md › no hardcoded colors, status text never color-only).
export function CatalogChips({ order }) {
  const cats = orderCatalogs(order)
  return (
    <div className="flex flex-wrap gap-1">
      {cats.map((c) => (
        <span
          key={c.id}
          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {c.brand}
        </span>
      ))}
    </div>
  )
}
