// Mock active orders for the retailer's Pedidos screen.
// Status lifecycle: por-confirmar (clienta confirmed, vendedora pending —
// step 2 of the double confirmation) → confirmado → pagado → entregado.
export const orders = [
  {
    id: 'o-01',
    clientId: 'c-01',
    date: '2026-06-10',
    status: 'por-confirmar',
    items: [
      { productId: 'e-01', colorId: 'negro', size: '23', qty: 1 },
      { productId: 'e-05', colorId: 'marfil', size: '24', qty: 1 },
    ],
    messages: 2,
  },
  {
    id: 'o-02',
    clientId: 'c-03',
    date: '2026-06-09',
    status: 'confirmado',
    items: [{ productId: 'p-04', colorId: 'verde-rana', size: '17', qty: 2 }],
    messages: 0,
  },
  {
    id: 'o-03',
    clientId: 'c-02',
    date: '2026-06-07',
    status: 'pagado',
    items: [{ productId: 'k-03', colorId: 'blanco', size: '24', qty: 1 }],
    messages: 1,
  },
]
