export { mxn } from '@/data/pricing'

// Day-level date from a YYYY-MM-DD string (noon avoids TZ rollover).
export const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// Full timestamp for the audit trail (status history entries are ISO datetimes).
export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// "junio de 2026" → "Junio 2026"
export const fmtMonth = (key) => {
  const s = new Date(`${key}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
