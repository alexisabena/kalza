import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ProductImage } from '@/components/ProductImage'

// Reveal once the card has stayed on screen for `ms`. Fast scrolling cancels
// the timer before it fires, so nothing animates during a fling; once revealed,
// a card stays revealed and never re-animates.
function useDwellReveal(ms = 3000) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (revealed) return
    const el = ref.current
    if (!el) return
    let timer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setRevealed(true), ms)
        } else {
          clearTimeout(timer)
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [revealed, ms])

  return [ref, revealed]
}

export function ProductCard({ product }) {
  const [ref, revealed] = useDwellReveal()

  return (
    <article ref={ref} className="relative mb-2 break-inside-avoid overflow-hidden rounded-lg">
      <Link to={`/producto/${product.id}`} className="block">
        <ProductImage src={product.images[0]} alt={product.name} aspect={product.aspect} />
        {/* Name + price live inside the image, revealed after a 3s dwell.
            Opacity/transform only — cheap to composite, no layout work. */}
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-3 pt-10',
            'opacity-0 motion-safe:translate-y-2 motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out',
            revealed && 'opacity-100 motion-safe:translate-y-0'
          )}
          aria-hidden={!revealed}
        >
          <p className="truncate text-sm text-white/90">{product.name}</p>
          <p className="text-base font-semibold text-white">
            ${product.price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
    </article>
  )
}
