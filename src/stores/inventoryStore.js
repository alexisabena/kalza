import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Items captured through the back-office single-product flow. The base catalog
// lives in data/products.js (static); captured items are appended here. Mock —
// no backend, so images live in the store as downscaled data URLs.
//
// Shape: { id, name, description, catalogId, price, sizeRun,
//          colors: [{ colorId, stock, images: [dataUrl] }], captured }
// Stock and images are tracked per color; the listing cover is the first image
// of the first color that has one.
export const useInventoryStore = create(
  persist(
    (set) => ({
      captured: [],

      addProducts: (items) =>
        set((state) => ({
          captured: [
            ...items.map((it, i) => ({
              id: it.id || `n-${Date.now()}-${i}`,
              name: it.name.trim(),
              description: (it.description || '').trim(),
              catalogId: it.catalogId,
              price: Number(it.price) || 0,
              sizeRun: it.sizeRun || 'mujer',
              colors: (it.colors || []).map((c) => ({
                colorId: c.colorId,
                stock: Number(c.stock) || 0,
                images: (c.images || []).filter(Boolean),
              })),
              captured: true,
            })),
            ...state.captured,
          ],
        })),

      removeProduct: (id) =>
        set((state) => ({ captured: state.captured.filter((c) => c.id !== id) })),
    }),
    {
      name: 'kalza-inventory',
      version: 3, // v3: images moved per color
      migrate: () => ({ captured: [] }),
    }
  )
)

export const capturedStock = (item) => item.colors.reduce((s, c) => s + c.stock, 0)
export const capturedColorIds = (item) => item.colors.map((c) => c.colorId)
export const capturedCover = (item) =>
  item.colors.find((c) => c.images?.length)?.images[0] ?? null
export const getCaptured = (captured, id) => captured.find((c) => c.id === id)
