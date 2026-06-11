// Mock catalog data — shape defined in tokens/theming-contract.md
// themeId: null = Kalza default (:root), otherwise maps to [data-theme="<themeId>"]

export const catalogs = [
  {
    id: 'cat-001',
    name: 'Catálogo Primavera',
    brand: 'Kalza',
    themeId: null,
    season: 'Primavera 2026',
    coverImage: null,
  },
  {
    id: 'cat-002',
    name: 'Colección Élite',
    brand: 'Élite',
    themeId: 'brand-elegant',
    season: 'Otoño 2026',
    coverImage: null,
  },
  {
    id: 'cat-003',
    name: 'Pasos Verano',
    brand: 'Pasos',
    themeId: 'brand-kids',
    season: 'Verano 2026',
    coverImage: null,
  },
]
