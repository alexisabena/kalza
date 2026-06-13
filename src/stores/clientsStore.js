import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The vendedoras' shared contact book. Each clienta belongs to one vendedora
// (sellerId) — that's how the wholesaler attributes orders across his network.
// Phone is the identifier — no accounts.
const seed = [
  { id: 'c-01', name: 'María González', phone: '33 1234 5678', sellerId: 'se-01' },
  { id: 'c-02', name: 'Lupita Ramírez', phone: '33 8765 4321', sellerId: 'se-01' },
  { id: 'c-03', name: 'Carmen Ortiz', phone: '33 2468 1357', sellerId: 'se-01' },
  { id: 'c-04', name: 'Sofía Mendoza', phone: '33 1357 2468', sellerId: 'se-02' },
  { id: 'c-05', name: 'Ana Torres', phone: '33 9876 5432', sellerId: 'se-02' },
]

export const useClientsStore = create(
  persist(
    (set) => ({
      clients: seed,
      add: (name, phone, sellerId) => {
        const client = { id: `c-${Date.now()}`, name, phone, sellerId }
        set((state) => ({ clients: [...state.clients, client] }))
        return client
      },
    }),
    {
      name: 'kalza-clients',
      version: 1, // v1 adds sellerId — reseed
      migrate: () => ({ clients: seed }),
    }
  )
)
