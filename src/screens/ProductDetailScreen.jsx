import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSharesStore } from '@/stores/sharesStore'
import { getProduct } from '@/data/products'
import { colors } from '@/data/colors'
import { sizeRuns } from '@/data/sizes'
import { getStock } from '@/data/inventory'
import { ProductImage } from '@/components/ProductImage'
import { Lightbox } from '@/components/Lightbox'
import { Button } from '@/components/ui/button'

const AUTOPLAY_MS = 3500

// Full-width carousel with scroll-snap. Auto-advances on a timer and loops; the
// first manual swipe/scroll stops autoplay for good (the viewer took over). A
// progress bar tracks the timer per slide. Tapping a photo opens the lightbox.
// Slides whose image file doesn't exist yet are dropped.
function Carousel({ images, alt }) {
  const [failed, setFailed] = useState(() => new Set())
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [lightboxAt, setLightboxAt] = useState(null)
  const trackRef = useRef(null)
  const slides = images.filter((src) => !failed.has(src))

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Advance + loop while autoplay is on. A user gesture (below) turns it off.
  useEffect(() => {
    if (!auto || reduced || slides.length < 2) return
    const id = setInterval(() => {
      const t = trackRef.current
      if (!t) return
      const next = (Math.round(t.scrollLeft / t.clientWidth) + 1) % slides.length
      t.scrollTo({ left: next * t.clientWidth, behavior: 'smooth' })
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [auto, reduced, slides.length])

  const markFailed = (src) => setFailed((prev) => new Set(prev).add(src))

  const handleScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget
    setActive(Math.round(scrollLeft / clientWidth))
  }

  if (slides.length === 0) {
    return <ProductImage src="" alt={alt} className="aspect-[4/5]" />
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={() => setAuto(false)}
        onWheel={() => setAuto(false)}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none]"
      >
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxAt(i)}
            aria-label={`Ampliar foto ${i + 1} de ${alt}`}
            className="w-full shrink-0 snap-center cursor-zoom-in"
          >
            <img
              src={src}
              alt={`${alt} — foto ${i + 1}`}
              onError={() => markFailed(src)}
              className="aspect-[4/5] w-full bg-muted object-cover"
            />
          </button>
        ))}
      </div>

      {/* Autoplay progress — restarts per slide (keyed by active), hides once the
          viewer takes over. */}
      {slides.length > 1 && auto && !reduced && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-white/20">
          <div
            key={active}
            className="carousel-progress h-full bg-white/80"
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
                'size-1.5 rounded-full bg-white/50 transition-all',
                i === active && 'w-3 bg-white'
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
  const role = useSessionStore((s) => s.role)

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
        <p className="text-muted-foreground">Este producto ya no está disponible.</p>
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
    <div className="pb-24">
      <Carousel images={product.images} alt={product.name} />

      <div className="flex flex-col gap-5 p-4">
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="mt-1 text-2xl font-semibold text-primary">
            ${product.price.toLocaleString('es-MX')}
          </p>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <section aria-label="Color">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Color: <span className="text-foreground">{colors[colorId].name}</span>
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

        <section aria-label="Talla">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Talla (MX)</h2>
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
              {getStock(product.id, colorId, size)} disponibles en {colors[colorId].name}
            </p>
          )}
        </section>
      </div>

      {/* Sticky CTA — detail view has no bottom nav, so it owns the bottom edge.
          The vendedora shares the item with a clienta; the buyer adds to cart. */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {role === 'retailer' ? (
          <Button className="w-full" onClick={() => navigate(`/compartir?producto=${product.id}`)}>
            <Share2 aria-hidden="true" /> Compartir con clienta
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
                <Check aria-hidden="true" /> Agregado al carrito
              </>
            ) : size ? (
              'Agregar al carrito'
            ) : (
              'Elige tu talla'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
