import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The vendedora's contact book. Seeded with mock clientas; sharing with a
// new contact adds her here (phone is the identifier — no accounts).
const seed = [
  { id: 'c-01', name: 'María González', phone: '33 1234 5678' },
  { id: 'c-02', name: 'Lupita Ramírez', phone: '33 8765 4321' },
  { id: 'c-03', name: 'Carmen Ortiz', phone: '33 2468 1357' },
  { id: 'c-04', name: 'Sofía Mendoza', phone: '33 1357 2468' },
  { id: 'c-05', name: 'Ana Torres', phone: '33 9876 5432' },
]

export const useClientsStore = create(
  persist(
    (set) => ({
      clients: seed,
      add: (name, phone) => {
        const client = { id: `c-${Date.now()}`, name, phone }
        set((state) => ({ clients: [...state.clients, client] }))
        return client
      },
    }),
    { name: 'kalza-clients' }
  )
)
