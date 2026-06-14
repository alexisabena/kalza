import { mxn } from '@/admin/lib/format'
import { monthShort } from '@/admin/lib/analytics'

// Lightweight inline SVG line chart — sales per catalog across time.
// No chart dependency in the stack; colors come from CSS vars so the chart
// rebrands with the theme. The top catalog by revenue is drawn in --primary,
// the rest in neutral chart tokens (legend dots disambiguate).
const STROKES = ['var(--primary)', 'var(--chart-3)', 'var(--chart-5)', 'var(--chart-2)']

const W = 680
const H = 280
const PAD = { top: 16, right: 16, bottom: 36, left: 56 }

export function LineChart({ months = [], series = [] }) {
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const maxY = Math.max(1, ...series.flatMap((s) => s.points))
  // Round the axis ceiling to a tidy step.
  const step = niceStep(maxY)
  const ceil = Math.ceil(maxY / step) * step
  const ticks = Array.from({ length: ceil / step + 1 }, (_, i) => i * step)

  const x = (i) =>
    PAD.left + (months.length <= 1 ? plotW / 2 : (i / (months.length - 1)) * plotW)
  const y = (v) => PAD.top + plotH - (v / ceil) * plotH

  if (months.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Aún no hay ingresos para graficar.
      </p>
    )
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Ventas por catálogo en el tiempo"
      >
        {/* y grid + labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--muted-foreground)"
            >
              {t === 0 ? '0' : `$${(t / 1000).toLocaleString('es-MX')}k`}
            </text>
          </g>
        ))}

        {/* x labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={x(i)}
            y={H - 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {monthShort(m)}
          </text>
        ))}

        {/* one polyline + dots per catalog */}
        {series.map((s, si) => {
          const stroke = STROKES[si % STROKES.length]
          const pts = s.points.map((v, i) => `${x(i)},${y(v)}`).join(' ')
          return (
            <g key={s.catalog.id}>
              {months.length > 1 && (
                <polyline
                  points={pts}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={si === 0 ? 2.5 : 1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {s.points.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={si === 0 ? 3.5 : 2.5} fill={stroke} />
              ))}
            </g>
          )
        })}
      </svg>

      {/* legend with per-catalog total */}
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        {series.map((s, si) => (
          <li key={s.catalog.id} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: STROKES[si % STROKES.length] }}
              aria-hidden="true"
            />
            <span className="font-medium">{s.catalog.brand}</span>
            <span className="text-muted-foreground tabular-nums">{mxn(s.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Pick a round-ish step (1/2/5 × 10ⁿ) so ~4–6 gridlines fit under the max.
function niceStep(max) {
  const rough = max / 4
  const mag = 10 ** Math.floor(Math.log10(rough))
  const norm = rough / mag
  const nice = norm >= 5 ? 5 : norm >= 2 ? 2 : 1
  return nice * mag
}
