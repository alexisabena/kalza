import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart line key — one line per product+color+size combination
const lineKey = (productId, colorId, size) => `${productId}|${colorId}|${size}`

export const useCartStore = create(
  persist(
    (set) => ({
      // [{ key, productId, colorId, size, qty }]
      items: [],

      add: (productId, colorId, size) =>
        set((state) => {
          const key = lineKey(productId, colorId, size)
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { key, productId, colorId, size, qty: 1 }] }
        }),

      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      clear: () => set({ items: [] }),
    }),
    { name: 'kalza-cart' }
  )
)

export const selectCount = (state) =>
  state.items.reduce((sum, i) => sum + i.qty, 0)
