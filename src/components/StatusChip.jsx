import { cn } from '@/lib/utils'

// Share lifecycle + order lifecycle in one map. Text + color, never color
// alone (DESIGN.md › Accessibility).
const statuses = {
  // shares
  'enviado': { label: 'Enviado', cls: 'bg-muted text-muted-foreground' },
  'abierto': { label: 'Abierto', cls: 'border bg-background text-foreground' },
  'carrito': { label: 'En carrito', cls: 'bg-primary/10 text-primary' },
  // orders: pedido → apartado → pagado → recolectado → entregado (vencido = lost)
  'pedido': { label: 'Por confirmar', cls: 'bg-destructive/10 text-destructive' },
  'apartado': { label: 'Apartado', cls: 'bg-primary/10 text-primary' },
  'pagado': { label: 'Pagado', cls: 'bg-success/15 text-success' },
  'recolectado': { label: 'Recolectado', cls: 'bg-success/15 text-success' },
  'entregado': { label: 'Entregado', cls: 'bg-success text-success-foreground' },
  'vencido': { label: 'Vencido', cls: 'bg-muted text-muted-foreground line-through' },
}

export function StatusChip({ status }) {
  const s = statuses[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return (
    <span className={cn('shrink-0 rounded-md px-2 py-1 text-xs font-medium', s.cls)}>
      {s.label}
    </span>
  )
}
