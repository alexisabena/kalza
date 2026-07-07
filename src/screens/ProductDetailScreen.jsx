import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Check, Share2, ChevronLeft, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore, selectCount } from '@/stores/cartStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSharesStore } from '@/stores/sharesStore'
import { getProduct } from '@/data/products'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { getStock } from '@/data/inventory'
import { ProductImage } from '@/components/ProductImage'
import { Lightbox } from '@/components/Lightbox'
import { useDragScroll } from '@/lib/useDragScroll'
import { useLoopCarousel } from '@/lib/useLoopCarousel'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'

const AUTOPLAY_MS = 3500

// Full-width carousel with scroll-snap. Auto-advances on a timer and loops; the
// first manual swipe/scroll stops autoplay for good (the viewer took over). A
// progress bar tracks the timer per slide. Tapping a photo opens the lightbox.
// Slides whose image file doesn't exist yet are dropped.
function Carousel({ images, alt, t }) {
  const [failed, setFailed] = useState(() => new Set())
  const [auto, setAuto] = useState(true)
  const [lightboxAt, setLightboxAt] = useState(null)
  const slides = images.filter((src) => !failed.has(src))
  const { ref: trackRef, display, active, onScroll, next } = useLoopCarousel(slides)
  useDragScroll(trackRef)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Advance while autoplay is on (looping handled by useLoopCarousel). A user
  // gesture (below) turns it off.
  useEffect(() => {
    if (!auto || reduced || slides.length < 2) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [auto, reduced, slides.length, next])

  const markFailed = (src) => setFailed((prev) => new Set(prev).add(src))

  if (slides.length === 0) {
    return <ProductImage src="" alt={alt} className="aspect-[4/5]" />
  }

  return (
    // tablet-l: the carousel becomes the full-height left column (§5.3) — the
    // slides drop their 4/5 aspect box and fill the column height instead.
    <div className="relative tablet-l:h-full">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={() => setAuto(false)}
        onWheel={() => setAuto(false)}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] tablet-l:h-full"
      >
        {display.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxAt(active)}
            aria-label={t.product.enlargePhoto(alt)}
            className="w-full shrink-0 snap-center cursor-zoom-in tablet-l:h-full"
          >
            <img
              src={src}
              alt={t.product.photoAlt(alt, i + 1)}
              onError={() => markFailed(src)}
              draggable={false}
              className="aspect-[4/5] w-full select-none bg-muted object-cover tablet-l:aspect-auto tablet-l:h-full"
            />
          </button>
        ))}
      </div>

      {/* Autoplay progress — restarts per slide (keyed by active), hides once the
          viewer takes over. */}
      {slides.length > 1 && auto && !reduced && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-primary-foreground/20">
          <div
            key={active}
            className="carousel-progress h-full bg-primary-foreground/80"
            style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
          />
        </div>
      )}

      {lightboxAt !== null && (
        <Lightbox
          images={slides}
          alt={alt}
          initialIndex={lightboxAt}
          onClose={() => setLightboxAt(null)}
        />
      )}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {slides.map((src, i) => (
            <span
              key={src}
              className={cn(
                'size-1.5 rounded-full bg-primary-foreground/50 transition-all',
                i === active && 'w-3 bg-primary-foreground'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = getProduct(id)
  const addToCart = useCartStore((s) => s.add)
  const cartCount = useCartStore(selectCount)
  const role = useSessionStore((s) => s.role)
  const t = useT()

  const [colorId, setColorId] = useState(product?.colorIds[0])
  const [size, setSize] = useState(null)
  const [added, setAdded] = useState(false)
  // Increments on each add — re-keys the CTA so the bump animation replays.
  const [bump, setBump] = useState(0)
  const addedTimer = useRef()

  useEffect(() => () => clearTimeout(addedTimer.current), [])

  const handleAdd = () => {
    addToCart(product.id, colorId, size)
    // The vendedora sees her share move to "en carrito"
    useSharesStore
      .getState()
      .advance(useSessionStore.getState().buyerClientId, product.catalogId, 'carrito')
    setAdded(true)
    setBump((n) => n + 1)
    clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setAdded(false), 1500)
  }

  if (!product) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">{t.product.notAvailable}</p>
      </div>
    )
  }

  const run = sizeRuns[product.sizeRun]

  const selectColor = (nextColorId) => {
    setColorId(nextColorId)
    // A size sold out in the new color can't stay selected
    if (size && getStock(product.id, nextColorId, size) === 0) setSize(null)
  }

  return (
    // tablet-l: two columns — full-height carousel left, info + CTA right
    // (§5.3). Phone / tablet-p keep the single-column stack (fluid scale only).
    <div className="pb-24 tablet-l:grid tablet-l:h-[calc(100dvh-3.5rem)] tablet-l:grid-cols-2 tablet-l:overflow-hidden tablet-l:pb-0">
      <div className="tablet-l:h-full tablet-l:overflow-hidden">
        <Carousel images={product.images} alt={product.name} t={t} />
      </div>

      {/* Right column on tablet-l: its own scroller with the CTA pinned to its
          bottom (not the viewport). On phone/tablet-p it's just the normal flow. */}
      <div className="tablet-l:flex tablet-l:h-full tablet-l:min-h-0 tablet-l:flex-col">
        {/* Back + cart live at the top of the right column on tablet-l. (The
            global top bar still carries them until the nav-reflow step empties
            it on tablet-l; this is the home they move to.) */}
        <div className="hidden items-center justify-between border-b px-2 py-2 tablet-l:flex">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t.topbar.back}
            className="flex size-11 items-center justify-center text-foreground"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          {role === 'buyer' && (
            <Link
              to="/carrito"
              aria-label={t.topbar.cartAria(cartCount)}
              className="relative flex size-11 items-center justify-center text-foreground"
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

      <div className="flex flex-col gap-5 p-4 tablet-l:min-h-0 tablet-l:flex-1 tablet-l:overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="mt-1 text-2xl font-semibold text-primary">
            ${product.price.toLocaleString('es-MX')}
          </p>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <section aria-label={t.product.colorLabel}>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            {t.product.colorLabel}: <span className="text-foreground">{colors[colorId].name}</span>
          </h2>
          <div className="flex gap-3">
            {product.colorIds.map((cid) => (
              <button
                key={cid}
                type="button"
                onClick={() => selectColor(cid)}
                aria-label={colors[cid].name}
                aria-pressed={cid === colorId}
                className={cn(
                  'size-9 rounded-full border-2 border-border',
                  cid === colorId && 'border-primary ring-2 ring-primary/30'
                )}
                style={{ backgroundColor: colors[cid].hex }}
              />
            ))}
          </div>
        </section>

        <section aria-label={t.product.sizeLabel}>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">{t.product.sizeLabel}</h2>
          <div className="flex flex-wrap gap-2">
            {run.map((s) => {
              const out = getStock(product.id, colorId, s) === 0
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  className={cn(
                    'h-12 min-w-12 rounded-md border px-3 text-base',
                    s === size && 'border-primary bg-primary text-primary-foreground',
                    out && 'text-muted-foreground/50 line-through'
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {size && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t.product.stockAvailable(getStock(product.id, colorId, size), colors[colorId].name)}
            </p>
          )}
        </section>
      </div>

      {/* Primary CTA — detail view has no bottom nav, so it owns the bottom edge.
          Phone/tablet-p: fixed to the viewport bottom (max-w-md centered). tablet-l:
          un-fix and sit at the bottom of the RIGHT column (§5.3). The vendedora
          shares the item with a clienta; the buyer adds to cart. */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] tablet-l:static tablet-l:mx-0 tablet-l:max-w-none">
        {role === 'retailer' ? (
          <Button className="w-full" onClick={() => navigate(`/compartir?producto=${product.id}`)}>
            <Share2 aria-hidden="true" /> {t.product.shareWithClient}
          </Button>
        ) : (
          <Button
            key={bump}
            className={cn('w-full', bump > 0 && 'add-bump')}
            disabled={!size}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <Check aria-hidden="true" /> {t.product.addedToCart}
              </>
            ) : size ? (
              t.product.addToCart
            ) : (
              t.product.chooseSize
            )}
          </Button>
        )}
      </div>
      </div>
    </div>
  )
}
