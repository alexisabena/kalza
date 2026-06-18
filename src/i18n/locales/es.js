// Spanish — the source of truth (the app's primary language). English overlays
// this; any key missing from en.js falls back to the Spanish here.
export const es = {
  caseStudy: 'Caso de estudio',
  nav: { catalogo: 'Catálogo', inicio: 'Inicio', pedidos: 'Pedidos', ingresos: 'Ingresos' },
  topbar: {
    cart: 'Mi carrito',
    share: 'Compartir',
    back: 'Regresar',
    menu: 'Abrir menú',
    cartAria: (n) => `Mi carrito, ${n} artículos`,
  },
  drawer: {
    title: 'Catálogos',
    close: 'Cerrar menú',
    active: 'Activo',
    profile: 'Perfil (demo)',
    // Masculine generic in the functional UI — inclusive of all sellers/buyers
    // (the narrative keeps "vendedoras"; decision 2026-06-17). EN is neutral.
    buyer: 'Comprador',
    retailer: 'Vendedor',
    backoffice: 'Back-office (Mayorista)',
    caseStudy: 'Volver al caso de estudio',
    language: 'Idioma',
  },
}
