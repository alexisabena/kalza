import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSharesStore } from '@/stores/sharesStore'

// Order lifecycle (decision 2026-06-13 — formalized payment):
//   pedido      buyer placed the order; wholesaler confirmation pending
//   apartado    wholesaler confirmed availability and set stock apart;
//               the buyer now has a time window to commit to payment
//   pagado      buyer paid within the window
//   vencido     payment window expired — the order is lost, stock released
//   recolectado seller picked the order up from the wholesaler
//   entregado   delivered to the buyer
//
// Why the window: buyers traditionally shed payments in informal installments
// while the seller fronts the whole order to the wholesaler. The deadline
// formalizes the commitment and protects the seller.
//
// The conversation thread is seller ↔ wholesaler coordination (pickup,
// inventory, buyer relationship) — buyers never see it.

const PAY_WINDOW_HOURS = 48

const hoursFromNow = (h) => new Date(Date.now() + h * 3600_000).toISOString()

const seed = [
  {
    id: 'o-01',
    clientId: 'c-01',
    date: '2026-06-12',
    status: 'pedido',
    payDeadline: null,
    items: [
      { productId: 'e-01', colorId: 'negro', size: '23', qty: 1 },
      { productId: 'e-05', colorId: 'marfil', size: '24', qty: 1 },
    ],
    messages: [
      { from: 'vendedora', text: '¿Tienes la 23 en negro? Es para este sábado', time: '10:32' },
      { from: 'mayorista', text: 'Déjame revisar bodega y te confirmo hoy mismo', time: '10:40' },
    ],
  },
  {
    id: 'o-02',
    clientId: 'c-01',
    date: '2026-06-11',
    status: 'apartado',
    payDeadline: hoursFromNow(40),
    items: [{ productId: 'k-04', colorId: 'cafe', size: '24', qty: 1 }],
    messages: [],
  },
  {
    id: 'o-03',
    clientId: 'c-02',
    date: '2026-06-09',
    status: 'pagado',
    payDeadline: null,
    items: [{ productId: 'k-03', colorId: 'blanco', size: '24', qty: 1 }],
    messages: [
      { from: 'mayorista', text: 'Listo, te lo dejo en mostrador para cuando pases', time: '14:05' },
    ],
  },
  {
    id: 'o-04',
    clientId: 'c-03',
    date: '2026-06-05',
    status: 'entregado',
    payDeadline: null,
    items: [{ productId: 'p-04', colorId: 'verde-rana', size: '17', qty: 2 }],
    messages: [],
  },
  {
    id: 'o-05',
    clientId: 'c-04',
    date: '2026-06-06',
    status: 'apartado',
    payDeadline: '2026-06-09T12:00:00.000Z', // window passed → shows as vencido
    items: [{ productId: 'e-04', colorId: 'dorado', size: '23', qty: 1 }],
    messages: [],
  },
  // Earlier delivered orders so the period selector (month/year) has options.
  // o-06 mixes two catalogs in one order for the same buyer.
  {
    id: 'o-06',
    clientId: 'c-01',
    date: '2026-05-20',
    status: 'entregado',
    payDeadline: null,
    items: [
      { productId: 'k-01', colorId: 'nude', size: '24', qty: 1 },
      { productId: 'e-06', colorId: 'champana', size: '23', qty: 1 },
    ],
    messages: [],
  },
  {
    id: 'o-07',
    clientId: 'c-05',
    date: '2026-05-08',
    status: 'entregado',
    payDeadline: null,
    items: [{ productId: 'p-01', colorId: 'azul', size: '18', qty: 1 }],
    messages: [],
  },
  {
    id: 'o-08',
    clientId: 'c-02',
    date: '2025-11-15',
    status: 'entregado',
    payDeadline: null,
    items: [{ productId: 'k-06', colorId: 'camel', size: '25', qty: 1 }],
    messages: [],
  },
]

// An apartado order past its payment window is lost
export const effectiveStatus = (order) =>
  order.status === 'apartado' && order.payDeadline && Date.now() > Date.parse(order.payDeadline)
    ? 'vencido'
    : order.status

const now = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

const setStatus = (set) => (orderId, from, to, extra = {}) =>
  set((state) => ({
    orders: state.orders.map((o) =>
      o.id === orderId && effectiveStatus(o) === from ? { ...o, status: to, ...extra } : o
    ),
  }))

export const useOrdersStore = create(
  persist(
    (set) => ({
      orders: seed,

      // Buyer places the order — lands in seller's AND wholesaler's pedidos
      place: ({ clientId, items, catalogIds }) => {
        const order = {
          id: `o-${Date.now()}`,
          clientId,
          date: new Date().toISOString().slice(0, 10),
          status: 'pedido',
          payDeadline: null,
          items,
          messages: [],
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        catalogIds.forEach((catalogId) =>
          useSharesStore.getState().advance(clientId, catalogId, 'pedido')
        )
        return order
      },

      // Wholesaler confirms availability and sets stock apart — payment window opens
      reserve: (orderId) =>
        setStatus(set)(orderId, 'pedido', 'apartado', {
          payDeadline: hoursFromNow(PAY_WINDOW_HOURS),
        }),

      // Buyer commits to payment within the window
      pay: (orderId) => setStatus(set)(orderId, 'apartado', 'pagado', { payDeadline: null }),

      // Seller picks the order up from the wholesaler
      collect: (orderId) => setStatus(set)(orderId, 'pagado', 'recolectado'),

      // Seller hands the order to the buyer
      deliver: (orderId) => setStatus(set)(orderId, 'recolectado', 'entregado'),

      addMessage: (orderId, from, text) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, messages: [...o.messages, { from, text, time: now() }] }
              : o
          ),
        })),
    }),
    {
      name: 'kalza-orders',
      version: 2, // v0 vendedora-confirms; v2 adds dated history for Ingresos
      migrate: () => ({ orders: seed }),
    }
  )
)
