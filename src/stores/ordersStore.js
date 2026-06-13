import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSharesStore } from '@/stores/sharesStore'
import { seedApprovers } from '@/data/staff'

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
//
// statusHistory (v4) records every transition as { status, at, approver } for
// the back-office audit trail. `approver` is the staff admin who made a
// staff-driven change (apartar, hand-off); buyer/seller steps have approver
// null. See wholesaler-admin-spec.md › Staff, tiers & audit trail.

const PAY_WINDOW_HOURS = 48

const hoursFromNow = (h) => new Date(Date.now() + h * 3600_000).toISOString()

const hash = (s) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Seed orders carry only their current status + date; the chronological
// history is derived so timestamps and approvers stay consistent.
const STEP_ORDER = ['pedido', 'apartado', 'pagado', 'recolectado', 'entregado']

// { dayOffset, hour, staff } per step — staff steps get an approver attributed.
const STEP_META = {
  pedido: { day: 0, hour: 10, staff: false },
  apartado: { day: 0, hour: 14, staff: true },
  pagado: { day: 1, hour: 11, staff: false },
  recolectado: { day: 2, hour: 16, staff: true },
  entregado: { day: 3, hour: 13, staff: false },
}

const stepTime = (date, day, hour) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + day)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const buildHistory = (order) => {
  const reached = STEP_ORDER.indexOf(order.status)
  const approver = seedApprovers[hash(order.id) % seedApprovers.length]
  return STEP_ORDER.slice(0, reached + 1).map((status) => {
    const meta = STEP_META[status]
    return {
      status,
      at: stepTime(order.date, meta.day, meta.hour),
      approver: meta.staff ? approver : null,
    }
  })
}

const rawSeed = [
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
  // Marta's clienta (se-02) — gives the wholesaler a second vendedora to attribute
  {
    id: 'o-09',
    clientId: 'c-05',
    date: '2026-06-08',
    status: 'pagado',
    payDeadline: null,
    items: [{ productId: 'e-02', colorId: 'negro-charol', size: '24', qty: 1 }],
    messages: [],
  },
]

const seed = rawSeed.map((o) => ({ ...o, statusHistory: buildHistory(o) }))

// An apartado order past its payment window is lost
export const effectiveStatus = (order) =>
  order.status === 'apartado' && order.payDeadline && Date.now() > Date.parse(order.payDeadline)
    ? 'vencido'
    : order.status

const now = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

// Append a status transition (with audit entry) when the order is in `from`.
const setStatus = (set) => (orderId, from, to, { approver = null, ...extra } = {}) =>
  set((state) => ({
    orders: state.orders.map((o) =>
      o.id === orderId && effectiveStatus(o) === from
        ? {
            ...o,
            status: to,
            ...extra,
            statusHistory: [
              ...(o.statusHistory ?? []),
              { status: to, at: new Date().toISOString(), approver },
            ],
          }
        : o
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
          statusHistory: [{ status: 'pedido', at: new Date().toISOString(), approver: null }],
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        catalogIds.forEach((catalogId) =>
          useSharesStore.getState().advance(clientId, catalogId, 'pedido')
        )
        return order
      },

      // Wholesaler staff confirms availability and sets stock apart — the
      // payment window opens and the confirming admin is recorded.
      reserve: (orderId, approver = null) =>
        setStatus(set)(orderId, 'pedido', 'apartado', {
          payDeadline: hoursFromNow(PAY_WINDOW_HOURS),
          approver,
        }),

      // Buyer commits to payment within the window
      pay: (orderId) => setStatus(set)(orderId, 'apartado', 'pagado', { payDeadline: null }),

      // Seller picks the order up from the wholesaler (handed over by an admin)
      collect: (orderId, approver = null) =>
        setStatus(set)(orderId, 'pagado', 'recolectado', { approver }),

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
      version: 4, // v4 adds statusHistory (audit trail) + approver attribution
      migrate: () => ({ orders: seed }),
    }
  )
)
