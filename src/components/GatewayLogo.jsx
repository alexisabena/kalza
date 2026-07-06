import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

// Payment-rail logos, normalized to a consistent chip so they sit uniformly in
// the checkout + Settings selectors regardless of each brand's native aspect
// ratio (responsive-spec §5.5). Brand marks live in public/images/gateways/
// (Mercado Pago / PayPal / OXXO Pay as SVG, a trato rasterized); "tarjeta" is a
// generic rail, so it falls back to a card icon.
const LOGOS = {
  mercadopago: '/images/gateways/mercadopago.svg',
  paypal: '/images/gateways/paypal.svg',
  oxxo: '/images/gateways/oxxo.svg',
  atrato: '/images/gateways/atrato.png',
}

export function GatewayLogo({ id, className }) {
  const src = LOGOS[id]
  return (
    <span
      className={cn(
        // bg-white is a functional exception, not a token gap: payment-brand
        // marks (Mercado Pago, PayPal, etc.) ship on white plates regardless of
        // the active catalog theme, same rationale as the QR code in QrAppModal.
        // eslint-disable-next-line no-restricted-syntax
        'flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white p-1.5',
        className
      )}
    >
      {src ? (
        <img src={src} alt="" aria-hidden="true" className="max-h-full max-w-full object-contain" />
      ) : (
        <CreditCard className="size-5 text-muted-foreground" aria-hidden="true" />
      )}
    </span>
  )
}
