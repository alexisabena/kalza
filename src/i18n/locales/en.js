// English overlay. Partial is fine — missing keys fall back to es.js, so the app
// is never broken mid-translation.
export const en = {
  caseStudy: 'Case study',
  nav: { catalogo: 'Catalog', inicio: 'Home', pedidos: 'Orders', ingresos: 'Income' },
  topbar: {
    cart: 'My cart',
    share: 'Share',
    back: 'Back',
    menu: 'Open menu',
    cartAria: (n) => `My cart, ${n} items`,
  },
  drawer: {
    title: 'Catalogs',
    close: 'Close menu',
    active: 'Active',
    profile: 'Profile (demo)',
    buyer: 'Buyer',
    retailer: 'Seller',
    backoffice: 'Back-office (Wholesaler)',
    caseStudy: 'Back to case study',
    language: 'Language',
  },
}
