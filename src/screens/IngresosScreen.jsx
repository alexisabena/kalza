import { catalogs } from '@/data/catalogs'

// Mock monthly revenue per catalog (MXN). Top catalogs by revenue get a
// line each; one total summary figure — both views in the same screen
// (open-questions.md › Income summary layout).
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
const revenue = {
  'cat-001': [4200, 4800, 5100, 4600, 5400, 6100],
  'cat-002': [2800, 3500, 3900, 4400, 5200, 5900],
  'cat-003': [1900, 2400, 2100, 2600, 3100, 3400],
}

const mxn = (n) => `$${n.toLocaleString('es-MX')}`

const W = 320
const H = 150
const PAD = 8

function LineChart({ series, max }) {
  const x = (i) => PAD + (i * (W - PAD * 2)) / (months.length - 1)
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Ingresos mensuales por catálogo"
      className="w-full"
    >
      {series.map(({ catalogId, data }, idx) => {
        const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
        const stroke = `var(--chart-${idx + 1})`
        const last = data.length - 1
        return (
          <g key={catalogId}>
            <polyline
              points={points}
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* end-of-line indicator */}
            <circle cx={x(last)} cy={y(data[last])} r="4" fill={stroke} />
          </g>
        )
      })}
    </svg>
  )
}

export function IngresosScreen() {
  // Top catalogs by accumulated revenue (spec says top 5; demo has 3)
  const ranked = catalogs
    .map((c) => ({
      catalogId: c.id,
      brand: c.brand,
      data: revenue[c.id] ?? [],
      total: (revenue[c.id] ?? []).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const grandTotal = ranked.reduce((sum, r) => sum + r.total, 0)
  const max = Math.max(...ranked.flatMap((r) => r.data))

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-2xl font-bold">Ingresos</h1>

      {/* Total summary figure */}
      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm text-muted-foreground">Total del semestre</p>
        <p className="text-3xl font-bold text-primary">{mxn(grandTotal)}</p>
      </div>

      {/* Top catalogs by revenue */}
      <section aria-label="Ingresos por catálogo">
        <h2 className="mb-2 font-semibold">Por catálogo</h2>
        <div className="rounded-xl border p-3">
          <LineChart series={ranked} max={max} />
          <div className="mt-1 flex justify-between px-1 text-xs text-muted-foreground">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {ranked.map((r, idx) => (
            <li key={r.catalogId} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: `var(--chart-${idx + 1})` }}
                aria-hidden="true"
              />
              <span className="flex-1">{r.brand}</span>
              <span className="font-semibold">{mxn(r.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
