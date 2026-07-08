import { create } from 'zustand'

// Ephemeral UI state for the mobile shell (not persisted). Lifted out of TopBar
// so the tablet-landscape floating nav can drive the SAME catalog drawer as
// the hamburger in the top bar (both open the full CatalogDrawer).
export const useUiStore = create((set) => ({
  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}))
