import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'

// A small desktop-window mockup of the wholesaler back-office, used in the
// story to show the order being confirmed by staff. Brand-neutral (Kalza base).
export function BackofficeMockup({ className }) {
  const { t } = useLang()
  return (
    <div className={cn('w-[360px] shrink-0 overflow-hidden rounded-xl border bg-background shadow-2xl', className)}>
      {/* window chrome */}
      <div className="flex h-8 items-center gap-1.5 border-b bg-muted/60 px-3">
        <span className="size-2.5 rounded-full bg-foreground/20" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-foreground/20" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-foreground/20" aria-hidden="true" />
        <span className="ml-2 text-[11px] font-semibold text-primary">{t.phone.boTitle}</span>
      </div>

      <div className="flex">
        {/* mini sidebar */}
        <div className="hidden w-24 shrink-0 flex-col gap-1.5 border-r p-2.5 sm:flex">
          {['Dashboard', t.phone.orderTitle, '·', '·'].map((label, i) => (
            <span
              key={i}
              className={cn(
                'truncate rounded px-2 py-1 text-[10px]',
                i === 1 ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          ))}
        </div>

        {/* order detail */}
        <div className="flex-1 p-3.5">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t.phone.boNewOrder}
          </p>
          <div className="mb-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold">o-01</span>
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                {t.phone.steps[0]}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t.phone.boSeller}: <span className="font-medium text-foreground">Rosa Martínez</span>
            </p>
            <div className="mt-2 space-y-1">
              <Row name="Stiletto Medianoche" price="$899" />
              <Row name="Mule Elegante" price="$749" />
            </div>
          </div>
          <div className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary text-[11px] font-semibold text-primary-foreground">
            <Check className="size-3.5" aria-hidden="true" /> {t.phone.boConfirm}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ name, price }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="truncate text-foreground">{name}</span>
      <span className="tabular-nums text-muted-foreground">{price}</span>
    </div>
  )
}
