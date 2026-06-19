import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Three profiles share the app shell; what they see differs (spec.md › Los usuarios):
//   buyer      — cliente final: browses, orders, tracks her pedidos
//   retailer   — vendedora: dashboard of shared catalogs, orders, ingresos
//   wholesaler — mayorista: income panel
// The drawer has a demo switcher so the portfolio can flip between profiles.
export const useSessionStore = create(
  persist(
    (set) => ({
      role: 'buyer',
      name: 'Rosa', // the vendedora's name (retailer profile)
      sellerId: 'se-01', // the retailer profile is Rosa Martínez (sellers.js)
      buyerClientId: 'c-01', // demo: the buyer profile is María (clientsStore)
      // Editable profile fields surfaced by the Settings page (responsive-spec
      // §5.4). Seller is account-backed (email/phone); the buyer has no account,
      // only a name + a preferred payment gateway that pre-selects at checkout.
      email: 'rosa@kalza.mx',
      phone: '+52 33 1234 5678',
      preferredGateway: 'mercadopago',
      setRole: (role) => set({ role }),
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setPhone: (phone) => set({ phone }),
      setPreferredGateway: (preferredGateway) => set({ preferredGateway }),
    }),
    { name: 'kalza-session' }
  )
)
