import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ProductImage } from '@/components/ProductImage'
import { usePriceReveal } from '@/lib/usePriceReveal'

// One masonry card. The name + price plate lives inside the image and reveals
// once the card has dwelled on screen — see usePriceReveal. Opacity/transform
// only, so it's cheap to composite.
export function ProductCard({ product }) {
  const [ref, revealed] = usePriceReveal()

  return (
    <article ref={ref} className="relative mb-2 break-inside-avoid overflow-hidden rounded-lg">
      <Link to={`/producto/${product.id}`} className="block">
        <ProductImage src={product.images[0]} alt={product.name} aspect={product.aspect} />
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
