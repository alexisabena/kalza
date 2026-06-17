import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { effectiveStatus } from '@/stores/ordersStore'

// The 5-step order lifecycle as a vertical stepper. ONE source shared by the
// buyer order detail, the seller order detail, and the portfolio mockups, so the
// "two confirmations" (steps 1–2) read identically everywhere — congruent by
// construction (portfolio-framework-spec §"Key architectural moves" #1).
//
// Driven by effectiveStatus(order). The seller variant reads statusHistory to
// attribute the staff-approved steps; the buyer variant uses friendly labels and
// never sees approver names.
const STEPS = [
  { id: 'pedido', buyer: 'Pedido realizado', seller: 'Clienta apartó' },
  { id: 'apartado', buyer: 'Apartado para ti', seller: 'Mayorista confirmó' },
  { id: 'pagado', buyer: 'Pagado', seller: 'Pagado' },
  { id: 'recolectado', buyer: 'Recolectado por tu vendedora', seller: 'Recolectado' },
  { id: 'entregado', buyer: 'Entregado', seller: 'Entregado' },
]

const formatApproved = (entry) => {
  if (!entry) return null
  const when = new Date(entry.at).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return entry.approver ? `${entry.approver} · ${when}` : when
}

export function OrderProgress({ order, variant = 'buyer' }) {
  const status = effectiveStatus(order)

  if (status === 'vencido') {
    return (
      <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        {variant === 'buyer'
          ? 'El plazo de pago venció y el apartado se liberó. Puedes volver a pedirlo desde el catálogo.'
          : 'El plazo de pago venció — el apartado se liberó y el pedido se perdió.'}
      </p>
    )
  }

  const reached = STEPS.findIndex((s) => s.id === status)
  const history = order.statusHistory ?? []

  return (
    <ol className="flex flex-col gap-0" aria-label="Progreso del pedido">
      {STEPS.map((step, i) => {
        const done = i <= reached
        // Seller variant surfaces who approved each completed step (audit trail).
        const meta =
          variant === 'seller' && done
            ? formatApproved(history.find((h) => h.status === step.id))
            : null
        return (
          <li key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border-2 text-xs',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn('h-5 w-0.5', i < reached ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
            <div>
              <span
                className={cn(
                  'block pt-0.5 text-sm',
                  done ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step[variant] ?? step.buyer}
              </span>
              {meta && <span className="mt-0.5 block text-xs text-muted-foreground">{meta}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
