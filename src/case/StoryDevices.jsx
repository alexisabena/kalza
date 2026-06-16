import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mxn } from '@/data/pricing'
import { useLang } from '@/case/LanguageContext'
import { CatalogScreen } from '@/case/PhoneScreens'

// A tap/press indicator over a control.
export function TapPulse({ className }) {
  return (
    <div className={cn('pointer-events-none absolute z-20 flex items-center justify-center', className)}>
      <span className="absolute size-10 rounded-full bg-primary/40 case-ripple" />
      <span className="size-5 rounded-full border-2 border-primary bg-primary/30 case-pop" />
    </div>
  )
}

export function SuccessCheck({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className="case-pop" role="img" aria-label="ok">
      <circle cx="22" cy="22" r="20" fill="var(--success)" />
      <path
        d="M13 22.5 L19.5 29 L31 16.5"
        fill="none"
        stroke="var(--success-foreground)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="case-check-path"
      />
    </svg>
  )
}

function DoneOverlay({ label }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm">
      <SuccessCheck />
      <span className="text-sm font-semibold text-success">{label}</span>
    </div>
  )
}

// Buyer phone: catalog + Reserve (kind 'reserve') or order + Pay (kind 'pay').
// phase 0 idle · 1 tap · 2 done.
export function BuyerScreen({ catalog, kind, phase }) {
  const { t } = useLang()

  if (kind === 'pay') {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <p className="text-xs font-semibold">{t.phone.orderTitle}</p>
        <div className="rounded-lg border p-3 text-[11px]">
          <Line name="Stiletto Medianoche" price={899} />
          <Line name="Mule Elegante" price={749} />
          <div className="mt-1.5 flex justify-between border-t pt-1.5 font-semibold">
            <span>Total</span>
            <span className="text-primary">{mxn(1648)}</span>
          </div>
        </div>
        <div className="rounded-lg border border-primary bg-primary/5 p-2.5 text-[10px]">{t.phone.payNote}</div>
        <div className="relative mt-auto">
          <div className="flex h-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            {t.phone.payCta} {mxn(1648)}
          </div>
          {phase === 1 && <TapPulse className="inset-0 m-auto" />}
        </div>
        {phase >= 2 && <DoneOverlay label={t.phone.steps[2]} />}
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <CatalogScreen catalog={catalog} />
      {phase === 1 && <TapPulse className="bottom-5 left-1/2 -translate-x-1/2" />}
      {phase >= 2 && <DoneOverlay label={t.phone.steps[1]} />}
    </div>
  )
}

// Seller phone: the reservation needs both confirmations (buyer + wholesaler),
// then payment. checks = { buyer, bo, pay }.
export function SellerScreen({ checks }) {
  const { t } = useLang()
  const reserved = checks.buyer && checks.bo
  const statusLabel = checks.pay ? t.phone.steps[2] : reserved ? t.phone.reservedSet : t.phone.waiting
  const statusDone = reserved || checks.pay

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">{t.phone.orderTitle}</p>
        <span className="font-mono text-[10px] text-muted-foreground">o-01</span>
      </div>
      <div className="rounded-lg border p-2.5 text-[11px]">
        <Line name="Stiletto Medianoche" price={899} />
        <Line name="Mule Elegante" price={749} />
      </div>

      <ul className="flex flex-col gap-2.5">
        <CheckRow done={checks.buyer} label={t.phone.checkBuyer} />
        <CheckRow done={checks.bo} label={t.phone.checkBo} />
        <CheckRow done={checks.pay} label={t.phone.checkPay} />
      </ul>

      <div
        className={cn(
          'mt-auto flex items-center justify-center gap-2 rounded-lg p-2.5 text-xs font-semibold',
          statusDone ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
        )}
      >
        {statusDone && <Check className="size-4" aria-hidden="true" />}
        {statusLabel}
      </div>
    </div>
  )
}

function CheckRow({ done, label }) {
  return (
    <li className="flex items-center gap-2.5 text-[11px]">
      {done ? (
        <span key="done" className="case-pop flex size-5 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="size-3" aria-hidden="true" />
        </span>
      ) : (
        <span className="size-5 rounded-full border border-dashed border-muted-foreground/40" aria-hidden="true" />
      )}
      <span className={done ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
    </li>
  )
}

function Line({ name, price }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="truncate text-foreground">{name}</span>
      <span className="tabular-nums text-muted-foreground">{mxn(price)}</span>
    </div>
  )
}
