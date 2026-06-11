import { create } from 'zustand'
import { catalogs } from '@/data/catalogs'

// Theme switching mechanism — tokens/theming-contract.md
// Setting data-theme on <html> lets the CSS cascade rebrand the whole app.
export const useCatalogStore = create((set) => ({
  catalogs,
  activeCatalog: catalogs[0],
  setCatalog: (catalog) => {
    const root = document.documentElement
    if (catalog.themeId) {
      root.setAttribute('data-theme', catalog.themeId)
    } else {
      root.removeAttribute('data-theme') // falls back to Kalza :root
    }
    set({ activeCatalog: catalog })
  },
}))
