import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

// Share lifecycle + order lifecycle in one map. Text + color, never color
// alone (DESIGN.md › Accessibility).
const classes = {
  // shares
  'enviado': 'bg-muted text-muted-foreground',
  'abierto': 'border bg-background text-foreground',
  'carrito': 'bg-primary/10 text-primary',
  // orders: pedido → apartado → pagado → recolectado → entregado (vencido = lost)
  'pedido': 'bg-destructive/10 text-destructive',
  'apartado': 'bg-primary/10 text-primary',
  'pagado': 'bg-success/15 text-success',
  'recolectado': 'bg-success/15 text-success',
  'entregado': 'bg-success text-success-foreground',
  'vencido': 'bg-muted text-muted-foreground line-through',
}

export function StatusChip({ status }) {
  const t = useT()
  const label = t.statusChip[status] ?? status
  const cls = classes[status] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={cn('shrink-0 rounded-md px-2 py-1 text-xs font-medium', cls)}>
      {label}
    </span>
  )
}
