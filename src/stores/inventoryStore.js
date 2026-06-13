import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Items captured through the back-office bulk "capture new items" flow.
// The base catalog lives in data/products.js (static); newly captured items are
// appended here so the Inventory list reflects them. Mock — no backend.
export const useInventoryStore = create(
  persist(
    (set) => ({
      captured: [],

      // Append a batch of draft rows as new inventory items.
      addBatch: (rows) =>
        set((state) => ({
          captured: [
            ...state.captured,
            ...rows.map((r, i) => ({
              id: `n-${Date.now()}-${i}`,
              name: r.name.trim(),
              catalogId: r.catalogId,
              price: Number(r.price) || 0,
              colorIds: r.colorIds,
              sizeRun: r.sizeRun,
              stock: Number(r.stock) || 0,
              captured: true,
            })),
          ],
        })),
    }),
    { name: 'kalza-inventory', version: 1 }
  )
)
