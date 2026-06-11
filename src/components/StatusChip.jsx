import { cn } from '@/lib/utils'

// Share lifecycle + order lifecycle in one map. Text + color, never color
// alone (DESIGN.md › Accessibility).
const statuses = {
  // shares
  'enviado': { label: 'Enviado', cls: 'bg-muted text-muted-foreground' },
  'abierto': { label: 'Abierto', cls: 'border bg-background text-foreground' },
  'carrito': { label: 'En carrito', cls: 'bg-primary/10 text-primary' },
  'pedido': { label: 'Pedido', cls: 'bg-primary text-primary-foreground' },
  'pagado': { label: 'Pagado', cls: 'bg-success/15 text-success' },
  'entregado': { label: 'Entregado', cls: 'bg-success text-success-foreground' },
  // orders
  'por-confirmar': { label: 'Por confirmar', cls: 'bg-destructive/10 text-destructive' },
  'confirmado': { label: 'Confirmado', cls: 'bg-primary/10 text-primary' },
}

export function StatusChip({ status }) {
  const s = statuses[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return (
    <span className={cn('shrink-0 rounded-md px-2 py-1 text-xs font-medium', s.cls)}>
      {s.label}
    </span>
  )
}
