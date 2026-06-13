import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSharesStore } from '@/stores/sharesStore'

// Orders + their conversation thread.
// Status lifecycle: por-confirmar (clienta confirmed — step 1 of the double
// confirmation) → confirmado (vendedora confirmed — step 2) → pagado → entregado.
const seed = [
  {
    id: 'o-01',
    clientId: 'c-01',
    date: '2026-06-10',
    status: 'por-confirmar',
    items: [
      { productId: 'e-01', colorId: 'negro', size: '23', qty: 1 },
      { productId: 'e-05', colorId: 'marfil', size: '24', qty: 1 },
    ],
    messages: [
      { from: 'clienta', text: '¿Me lo apartas? La talla 23 porfa 🙏', time: '10:32' },
      { from: 'clienta', text: 'El stiletto es para la boda de mi prima', time: '10:33' },
    ],
  },
  {
    id: 'o-02',
    clientId: 'c-03',
    date: '2026-06-09',
    status: 'confirmado',
    items: [{ productId: 'p-04', colorId: 'verde-rana', size: '17', qty: 2 }],
    messages: [],
  },
  {
    id: 'o-03',
    clientId: 'c-02',
    date: '2026-06-07',
    status: 'pagado',
    items: [{ productId: 'k-03', colorId: 'blanco', size: '24', qty: 1 }],
    messages: [
      { from: 'vendedora', text: 'Ya quedó pagado, te aviso cuando llegue 🧡', time: '14:05' },
    ],
  },
]

const now = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

export const useOrdersStore = create(
  persist(
    (set) => ({
      orders: seed,

      // Step 1: the clienta confirms her intent — order awaits the vendedora
      place: ({ clientId, items, catalogIds }) => {
        const order = {
          id: `o-${Date.now()}`,
          clientId,
          date: new Date().toISOString().slice(0, 10),
          status: 'por-confirmar',
          items,
          messages: [],
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        // The share that led here moves forward in its lifecycle
        catalogIds.forEach((catalogId) =>
          useSharesStore.getState().advance(clientId, catalogId, 'pedido')
        )
        return order
      },

      // Step 2: the vendedora confirms — only now the order is real
      confirm: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.status === 'por-confirmar'
              ? { ...o, status: 'confirmado' }
              : o
          ),
        })),

      addMessage: (orderId, from, text) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, messages: [...o.messages, { from, text, time: now() }] }
              : o
          ),
        })),
    }),
    { name: 'kalza-orders' }
  )
)
