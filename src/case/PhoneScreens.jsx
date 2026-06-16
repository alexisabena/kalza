import { Check, Send, Link2 } from 'lucide-react'
import { productsByCatalog } from '@/data/products'
import { mxn } from '@/data/pricing'
import { cn } from '@/lib/utils'
import { useLang } from '@/case/LanguageContext'

// A phone frame whose color, radius and font come from CSS vars. Wrapping it in
// [data-theme="…"] re-themes everything through the cascade — the real app's
// mechanism, shown live. `screen` selects which mock screen to render.
export function PhoneFrame({ catalog, screen, orderStep = 1, className }) {
  return (
    <div
      data-theme={catalog.themeId || undefined}
      className={cn(
        'font-sans w-[248px] shrink-0 overflow-hidden rounded-[2.4rem] border-[7px] border-foreground/90 bg-background shadow-2xl',
        className
      )}
    >
      <div className="flex h-11 items-center justify-center border-b">
        <span className="text-sm font-bold text-primary">{catalog.brand}</span>
      </div>
      <div className="h-[420px] overflow-hidden">
        {screen === 'share' ? (
          <ShareScreen />
        ) : screen === 'order' ? (
          <OrderScreen current={orderStep} />
        ) : (
          <CatalogScreen catalog={catalog} />
        )}
      </div>
    </div>
  )
}

function CatalogScreen({ catalog }) {
  const { t } = useLang()
  const products = (productsByCatalog[catalog.id] ?? []).slice(0, 4)
  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-2 content-start gap-2 p-2.5">
        {products.map((p, i) => (
          <div key={p.id} className="overflow-hidden rounded-lg bg-muted">
            <div className={cn('w-full', i % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square')}>
              <div className="flex size-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary/40">
                {catalog.brand.charAt(0)}
              </div>
            </div>
            <div className="p-1.5">
              <p className="truncate text-[10px] font-medium text-foreground">{p.name}</p>
              <p className="text-[11px] font-semibold text-primary">{mxn(p.price)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-2.5 pb-3">
        <div className="flex h-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
          {t.phone.reserve}
        </div>
      </div>
    </div>
  )
}

function ShareScreen() {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col gap-3 p-3.5">
      <p className="text-xs font-semibold">{t.phone.shareTitle}</p>
      <div className="flex items-center gap-2.5 rounded-lg border p-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
          {t.phone.shareName.charAt(0)}
        </span>
        <span className="text-xs font-medium">{t.phone.shareName}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5 text-[11px]">
        <Link2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-muted-foreground">{t.phone.shareLink}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-success">
        <Check className="size-3.5" aria-hidden="true" /> {t.phone.shareCopied}
      </div>
      <div className="mt-auto flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
        <Send className="size-3.5" aria-hidden="true" /> {t.phone.shareSend}
      </div>
    </div>
  )
}

function OrderScreen({ current = 1 }) {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <p className="text-xs font-semibold">{t.phone.orderTitle}</p>
      {/* Re-fade the progress when the status changes — communicates the update */}
      <ol key={current} className="flex flex-col gap-0 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
        {t.phone.steps.map((label, i) => {
          const done = i <= current
          return (
            <li key={label} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border text-[9px]',
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                </span>
                {i < t.phone.steps.length - 1 && (
                  <span className={cn('h-5 w-px', i < current ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
              <span className={cn('pt-0.5 text-[11px]', done ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
      {current === 1 && (
        <div className="mt-auto rounded-lg border border-primary bg-primary/5 p-2.5 text-[10px] text-foreground">
          {t.phone.payNote}
        </div>
      )}
    </div>
  )
}
