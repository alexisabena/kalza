import { Link } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import qrcode from 'qrcode-generator'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useLang } from '@/case/LanguageContext'

// Inline SVG QR (no canvas). Black on white for reliable scanning — a
// functional exception to the no-hardcoded-color rule.
function Qr({ value, size = 168 }) {
  const qr = qrcode(0, 'M')
  qr.addData(value)
  qr.make()
  const count = qr.getModuleCount()
  const cell = size / count
  const rects = []
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) rects.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} />)
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" role="img" aria-label="QR">
      <rect width={size} height={size} fill="#fff" />
      <g fill="#111">{rects}</g>
    </svg>
  )
}

export function QrAppModal({ onClose }) {
  const { t } = useLang()
  const url = `${window.location.origin}/app`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.qr.title}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold">{t.qr.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.qr.hint}</p>
          {/* bg-white is part of the same QR contrast exception noted above. */}
          {/* eslint-disable-next-line no-restricted-syntax */}
          <div className="mt-4 inline-block rounded-xl border bg-white p-3">
            <Qr value={url} />
          </div>
          <p className="mt-3 truncate font-mono text-xs text-muted-foreground">{url}</p>
          <Link to="/app" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 px-4')}>
            {t.qr.openHere} <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
