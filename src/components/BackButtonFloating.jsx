import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

// The one back-button shape for tablet-l immersive screens (product detail,
// order detail, checkout, orders list) — matches Figma's BackButtonFloating
// component (decided 2026-07-08: this shape wins everywhere, the old
// unstyled self-start variant is retired). `className` controls placement
// (absolute overlay on an image vs. self-start in normal content flow); the
// circle itself — bg-background, shadow-lg, size-11 — never changes.
export function BackButtonFloating({ onClick, className }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t.topbar.back}
      className={cn(
        'hidden size-11 items-center justify-center rounded-full bg-background text-foreground shadow-lg tablet-l:flex',
        className
      )}
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
    </button>
  )
}
