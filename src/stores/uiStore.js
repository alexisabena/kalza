import { create } from 'zustand'

// Ephemeral UI state for the mobile shell (not persisted). Lifted out of TopBar
// so the tablet-landscape floating nav can drive the SAME catalog drawer and the
// catalog quick-switch bar (responsive-spec §5.2): on tablet-l the hamburger no
// longer opens the side drawer — it toggles a second floating bar with the 3
// catalogs — while a "more" affordance still opens the full drawer.
export const useUiStore = create((set) => ({
  drawerOpen: false,
  catalogBarOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  toggleCatalogBar: () => set((s) => ({ catalogBarOpen: !s.catalogBarOpen })),
  setCatalogBarOpen: (catalogBarOpen) => set({ catalogBarOpen }),
}))
