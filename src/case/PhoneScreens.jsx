import { useEffect, useState } from 'react'
import { Check, Send, Link2 } from 'lucide-react'
import { productsByCatalog } from '@/data/products'
import { mxn } from '@/data/pricing'
import { cn } from '@/lib/utils'
import { useCascadeReveal } from '@/lib/useCascadeReveal'
import { ProductImage } from '@/components/ProductImage'
import { useLang } from '@/case/LanguageContext'

// A phone frame whose color, radius and font come from CSS vars. Wrapping it in
// [data-theme="…"] re-themes everything through the cascade — the real app's
// mechanism, shown live. `screen` selects which mock screen to render.
export function PhoneFrame({ catalog, screen, orderStep = 1, className, children }) {
  return (
    <div
      data-theme={catalog.themeId || undefined}
      className={cn(
        'font-sans w-[248px] shrink-0 overflow-hidden rounded-[2.4rem] border-[7px] border-foreground/90 bg-background shadow-2xl',
        className
      )}
    >
      <div className="flex h-11 items-center justify-center border-b">
        <span className="text-sm font-bold text-primary">{catalog.brand}</span>
      </div>
      <div className="relative h-[420px] overflow-hidden">
        {children ?? (
          screen === 'share' ? (
            <ShareScreen />
          ) : screen === 'order' ? (
            <OrderScreen current={orderStep} />
          ) : (
            <CatalogScreen catalog={catalog} />
          )
        )}
      </div>
    </div>
  )
}

export { CatalogScreen }

// Mirrors the real home (CatalogoScreen): real photos, CSS-columns masonry, and
// the same top-to-bottom price-plate cascade — so the landing/story catalog reads
// like the shipping app, not a separate placeholder grid.
function CatalogScreen({ catalog }) {
  const { t } = useLang()
  const products = productsByCatalog[catalog.id] ?? []

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable, fully populated — the preview reads like a real catalog you
          can browse, not a 4-item teaser. Scrollbar hidden for the device look. */}
      <div className="flex-1 overflow-y-auto p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Keyed by catalog so the cascade replays when the brand/theme switches. */}
        <MockGrid key={catalog.id} products={products} />
      </div>
      {/* Gradient lifts the button off the scrolling photos — layering + distance
          so the CTA reads as a fixed bar, not floating on the imagery. */}
      <div className="relative z-10 -mt-6 bg-gradient-to-t from-background via-background to-transparent px-2.5 pb-3 pt-7">
        <div className="flex h-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
          {t.phone.reserve}
        </div>
      </div>
    </div>
  )
}

function MockGrid({ products }) {
  const [start, setStart] = useState(false)

  // Kick the cascade shortly after the screen appears (fresh mount → starts false).
  useEffect(() => {
    const id = setTimeout(() => setStart(true), 280)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="columns-2 gap-2">
      {products.map((p) => (
        <MockCard key={p.id} product={p} start={start} />
      ))}
    </div>
  )
}

function MockCard({ product, start }) {
  const [ref, delay] = useCascadeReveal(start, { perPx: 0.6, max: 480 })
  return (
    <div ref={ref} className="relative mb-2 break-inside-avoid overflow-hidden rounded-lg">
      <ProductImage src={product.images[0]} alt={product.name} aspect={product.aspect} />
      <div
        style={{ transitionDelay: `${delay}ms` }}
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent p-1.5 pt-6',
          'opacity-0 motion-safe:translate-y-1 motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out',
          start && 'opacity-100 motion-safe:translate-y-0'
        )}
        aria-hidden={!start}
      >
        <p className="truncate text-[9px] font-medium text-primary-foreground/90">{product.name}</p>
        <p className="text-[10px] font-semibold text-primary-foreground">{mxn(product.price)}</p>
      </div>
    </div>
  )
}

function ShareScreen() {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col gap-3 p-3.5">
      <p className="text-xs font-semibold">{t.phone.shareTitle}</p>
      <div className="flex items-center gap-2.5 rounded-lg border p-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
          {t.phone.shareName.charAt(0)}
        </span>
        <span className="text-xs font-medium">{t.phone.shareName}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5 text-[11px]">
        <Link2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-muted-foreground">{t.phone.shareLink}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-success">
        <Check className="size-3.5" aria-hidden="true" /> {t.phone.shareCopied}
      </div>
      <div className="mt-auto flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
        <Send className="size-3.5" aria-hidden="true" /> {t.phone.shareSend}
      </div>
    </div>
  )
}

function OrderScreen({ current = 1 }) {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <p className="text-xs font-semibold">{t.phone.orderTitle}</p>
      {/* Re-fade the progress when the status changes — communicates the update */}
      <ol key={current} className="flex flex-col gap-0 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
        {t.phone.steps.map((label, i) => {
          const done = i <= current
          return (
            <li key={label} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border text-[9px]',
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                </span>
                {i < t.phone.steps.length - 1 && (
                  <span className={cn('h-5 w-px', i < current ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
              <span className={cn('pt-0.5 text-[11px]', done ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
      {current === 1 && (
        <div className="mt-auto rounded-lg border border-primary bg-primary/5 p-2.5 text-[10px] text-foreground">
          {t.phone.payNote}
        </div>
      )}
    </div>
  )
}
