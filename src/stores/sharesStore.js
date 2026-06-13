import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Every catalog (or single product) the vendedora has shared, with how far
// the clienta got. Status lifecycle:
//   enviado → abierto → carrito → pedido → pagado → entregado
const seed = [
  { id: 's-01', clientId: 'c-01', catalogId: 'cat-002', productId: null, date: '2026-06-08', status: 'pedido' },
  { id: 's-02', clientId: 'c-02', catalogId: 'cat-001', productId: null, date: '2026-06-09', status: 'carrito' },
  { id: 's-03', clientId: 'c-03', catalogId: 'cat-003', productId: null, date: '2026-06-05', status: 'entregado' },
  { id: 's-04', clientId: 'c-04', catalogId: 'cat-001', productId: null, date: '2026-06-10', status: 'abierto' },
  { id: 's-05', clientId: 'c-05', catalogId: 'cat-002', productId: null, date: '2026-06-10', status: 'enviado' },
  { id: 's-06', clientId: 'c-01', catalogId: 'cat-003', productId: 'p-01', date: '2026-05-28', status: 'pagado' },
]

// A share only moves forward through its lifecycle, never back
const RANK = { enviado: 0, abierto: 1, carrito: 2, pedido: 3, pagado: 4, entregado: 5 }

export const useSharesStore = create(
  persist(
    (set) => ({
      shares: seed,

      advance: (clientId, catalogId, status) =>
        set((state) => ({
          shares: state.shares.map((s) =>
            s.clientId === clientId &&
            s.catalogId === catalogId &&
            RANK[status] > RANK[s.status]
              ? { ...s, status }
              : s
          ),
        })),
      add: ({ clientId, catalogId, productId = null }) =>
        set((state) => ({
          shares: [
            {
              id: `s-${Date.now()}`,
              clientId,
              catalogId,
              productId,
              date: new Date().toISOString().slice(0, 10),
              status: 'enviado',
            },
            ...state.shares,
          ],
        })),
    }),
    { name: 'kalza-shares' }
  )
)
