import { create } from 'zustand'

// Three profiles share the app shell; what they see differs (spec.md › Los usuarios):
//   buyer      — cliente final: browses, orders, tracks her pedidos
//   retailer   — vendedora: sells through the catalog (clientes, ingresos)
//   wholesaler — mayorista: income panel
// The build in progress is the buyer view.
export const useSessionStore = create(() => ({
  role: 'buyer',
}))
