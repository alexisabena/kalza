import { getProduct } from '@/data/products'
import { catalogs } from '@/data/catalogs'
import { itemTotal, splitAmount } from '@/data/pricing'
import { effectiveStatus } from '@/stores/ordersStore'

// Income is recognized once the buyer has paid (pagado → recolectado → entregado).
export const EARNED = new Set(['pagado', 'recolectado', 'entregado'])
export const isEarned = (order) => EARNED.has(effectiveStatus(order))

const catalogOf = (id) => catalogs.find((c) => c.id === id)

// Total pieces in an order.
export const orderPieces = (order) => order.items.reduce((n, i) => n + i.qty, 0)

// Unique catalogs represented in an order → drives the catalog chips.
export const orderCatalogs = (order) => {
  const ids = new Set()
  order.items.forEach((i) => {
    const p = getProduct(i.productId)
    if (p) ids.add(p.catalogId)
  })
  return [...ids].map(catalogOf).filter(Boolean)
}

// Per-item detail with the wholesaler/seller split — used in expand + detail.
export const orderItemsDetailed = (order) =>
  order.items
    .map((item) => {
      const product = getProduct(item.productId)
      if (!product) return null
      const total = itemTotal(item)
      return {
        item,
        product,
        catalog: catalogOf(product.catalogId),
        total,
        split: splitAmount(total),
      }
    })
    .filter(Boolean)

// Income recognized today / this month / this year, plus the matching counts.
export const incomeKpis = (orders, todayISO) => {
  const earned = orders.filter(isEarned)
  const sum = (predicate) =>
    earned
      .filter((o) => predicate(o.date))
      .reduce((acc, o) => acc + orderTotalOf(o), 0)
  return {
    year: sum((d) => d.startsWith(todayISO.slice(0, 4))),
    month: sum((d) => d.startsWith(todayISO.slice(0, 7))),
    today: sum((d) => d === todayISO),
  }
}

const orderTotalOf = (order) =>
  order.items.reduce((sum, i) => sum + itemTotal(i), 0)

// Monthly income per catalog across the earned orders — feeds the line chart.
// Returns { months: ['2025-11', …], series: [{ catalog, points: [n, …], total }] }.
export const monthlySeriesByCatalog = (orders) => {
  const earned = orders.filter(isEarned)
  const months = [...new Set(earned.map((o) => o.date.slice(0, 7)))].sort()

  const series = catalogs.map((catalog) => {
    const points = months.map((m) =>
      earned
        .filter((o) => o.date.slice(0, 7) === m)
        .reduce(
          (sum, o) =>
            sum +
            o.items
              .filter((i) => getProduct(i.productId)?.catalogId === catalog.id)
              .reduce((s, i) => s + itemTotal(i), 0),
          0
        )
    )
    return { catalog, points, total: points.reduce((a, b) => a + b, 0) }
  })

  // Top catalogs by revenue first (spec: indicators for the top catalogs).
  series.sort((a, b) => b.total - a.total)
  return { months, series }
}

// es-MX "junio de 2026" → "Jun 2026" style short label for chart axes.
export const monthShort = (key) => {
  const s = new Date(`${key}-01T12:00:00`).toLocaleDateString('es-MX', {
    month: 'short',
    year: '2-digit',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
