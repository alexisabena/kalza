import { useState } from 'react'
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
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('w-full bg-muted object-cover', aspect && aspectClass[aspect], className)}
    />
  )
}
