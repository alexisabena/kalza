import { productsByCatalog } from '@/data/products'
import { mxn } from '@/data/pricing'
import { cn } from '@/lib/utils'

// A small phone mockup whose colors, radius and font come entirely from CSS
// vars. Wrapping it in [data-theme="…"] re-themes everything through the
// cascade — the same mechanism the real app uses, shown live in the case study.
export function PhoneMockup({ catalog, className }) {
  const products = (productsByCatalog[catalog.id] ?? []).slice(0, 4)

  return (
    <div
      data-theme={catalog.themeId || undefined}
      className={cn(
        'font-sans w-[244px] shrink-0 overflow-hidden rounded-[2.2rem] border-[6px] border-foreground/90 bg-background shadow-xl',
        className
      )}
    >
      {/* top bar */}
      <div className="flex h-11 items-center justify-center border-b">
        <span className="text-sm font-bold text-primary">{catalog.brand}</span>
      </div>

      {/* catalog grid */}
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {products.map((p, i) => (
          <div key={p.id} className="overflow-hidden rounded-lg bg-muted">
            <div className={cn('w-full', i % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square')}>
              <div className="flex size-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary/40">
                {catalog.brand.charAt(0)}
              </div>
            </div>
            <div className="p-1.5">
              <p className="truncate text-[10px] font-medium text-foreground">{p.name}</p>
              <p className="text-[11px] font-semibold text-primary">{mxn(p.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* cta */}
      <div className="px-2.5 pb-3">
        <div className="flex h-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
          Apartar
        </div>
      </div>
    </div>
  )
}
