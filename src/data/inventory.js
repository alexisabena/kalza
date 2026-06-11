import { products } from '@/data/products'
import { sizeRuns } from '@/data/sizes'

// Inventory table — stock per (product, color, size).
// Mock data is generated deterministically so every reload shows the same
// availability, including some sold-out combos (qty 0 → talla agotada).
const hash = (s) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// { productId: { colorId: { size: qty } } }
export const inventory = Object.fromEntries(
  products.map((product) => [
    product.id,
    Object.fromEntries(
      product.colorIds.map((colorId) => [
        colorId,
        Object.fromEntries(
          sizeRuns[product.sizeRun].map((size) => [
            size,
            hash(`${product.id}|${colorId}|${size}`) % 7, // 0–6 piezas
          ])
        ),
      ])
    ),
  ])
)

export const getStock = (productId, colorId, size) =>
  inventory[productId]?.[colorId]?.[size] ?? 0

// Sizes of the product's run that have stock in the given color
export const availableSizes = (productId, colorId) => {
  const byColor = inventory[productId]?.[colorId] ?? {}
  return Object.entries(byColor)
    .filter(([, qty]) => qty > 0)
    .map(([size]) => size)
}
