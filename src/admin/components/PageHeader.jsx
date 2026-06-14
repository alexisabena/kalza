import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// Breadcrumb + title block shared by every full-page admin section.
// `crumbs`: [{ label, to? }] — the last one is the current page (no link).
export function PageHeader({ crumbs = [], title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav aria-label="Ruta" className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
              {c.to ? (
                <Link to={c.to} className="hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
