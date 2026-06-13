// The wholesaler distributes through a network of vendedoras. Each clienta
// (buyer) is served by one vendedora (clientsStore › sellerId).
export const sellers = [
  { id: 'se-01', name: 'Rosa Martínez' },
  { id: 'se-02', name: 'Marta Hernández' },
]

export const getSeller = (id) => sellers.find((s) => s.id === id)
