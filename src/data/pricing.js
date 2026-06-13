import { getProduct } from '@/data/products'

// The buyer pays the catalog price. That payment is split: the vendedora
// earns her selling margin, the mayorista keeps the wholesale base.
// Mocked as a flat rate; a real system would set it per catalog/brand.
export const SELLER_MARGIN = 0.25 // 25% to the seller, 75% to the wholesaler

export const orderTotal = (order) =>
  order.items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0)

// { total, seller, wholesaler } for any amount
export const splitAmount = (total) => {
  const seller = Math.round(total * SELLER_MARGIN)
  return { total, seller, wholesaler: total - seller }
}

export const itemTotal = (item) => (getProduct(item.productId)?.price ?? 0) * item.qty

export const orderSplit = (order) => splitAmount(orderTotal(order))

export const mxn = (n) => `$${n.toLocaleString('es-MX')}`
