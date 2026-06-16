import { Link } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import qrcode from 'qrcode-generator'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useLang } from '@/case/LanguageContext'
import { PhoneFrame } from '@/case/PhoneScreens'

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
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border bg-background shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="grid items-center gap-6 p-6 sm:grid-cols-2 sm:p-8">
          {/* phone mockup */}
          <div className="flex justify-center">
            <PhoneFrame catalog={catalogs[0]} screen="catalog" className="scale-90 sm:scale-100" />
          </div>

          {/* QR + actions */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{t.qr.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.qr.hint}</p>
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
    </div>
  )
}
