import { Search } from 'lucide-react'
import { MONTH_NAMES } from '@/admin/lib/format'

const selectCls =
  'h-10 rounded-md border bg-background px-3 text-sm text-foreground'

// Shared list filter bar: free-text/ID search + year + month (DESIGN: every
// dedicated section is a full-page list with search + year/month filters).
// `years` is a list of YYYY strings; month is 1–12 or 'all'.
export function SearchFilters({
  query,
  onQuery,
  placeholder = 'Buscar…',
  year,
  onYear,
  years = [],
  month,
  onMonth,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar"
          className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
        />
      </div>

      {onYear && (
        <select value={year} onChange={(e) => onYear(e.target.value)} aria-label="Año" className={selectCls}>
          <option value="all">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      {onMonth && (
        <select value={month} onChange={(e) => onMonth(e.target.value)} aria-label="Mes" className={selectCls}>
          <option value="all">Todos los meses</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={String(i + 1)}>{name}</option>
          ))}
        </select>
      )}
    </div>
  )
}
