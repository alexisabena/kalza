import { useState, useCallback } from 'react'
import { Footprints } from 'lucide-react'
import { cn } from '@/lib/utils'

// Masonry card heights come from data, but Tailwind needs literal class names.
export const aspectClass = {
  '4/5': 'aspect-[4/5]',
  '3/4': 'aspect-[3/4]',
  '2/3': 'aspect-[2/3]',
  '1/1': 'aspect-square',
}

// Renders the image, or a placeholder until the file exists at the expected path.
export function ProductImage({ src, alt, aspect, className }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Graceful reload: the aspect box (below) reserves layout so nothing jumps,
  // and the bitmap is decoded before it fades in — no pop/flash as images load
  // or rescale across device classes (responsive-spec §6bis). A ref callback
  // also catches images already complete from cache (onLoad may not refire).
  const reveal = useCallback((img) => {
    if (!img) return
    if (img.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])
  const onLoad = (e) => {
    const img = e.currentTarget
    if (img.decode) img.decode().then(() => setLoaded(true), () => setLoaded(true))
    else setLoaded(true)
  }

  // An empty src never fires onError, so treat it as failed up front
  if (failed || !src) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center bg-muted',
          aspect && aspectClass[aspect],
          className
        )}
      >
        <Footprints className="size-8 text-muted-foreground/50" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      ref={reveal}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={() => setFailed(true)}
      className={cn(
        'w-full bg-muted object-cover',
        // decode-then-fade — opacity flips on load (instant under reduced motion,
        // since only the transition is motion-safe gated)
        'opacity-0 motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-out',
        loaded && 'opacity-100',
        aspect && aspectClass[aspect],
        className
      )}
    />
  )
}
