// Mock product database — keyed by catalog id (see catalogs.js)
// Images live in /public/images/products/<brand-slug>/<product-id>.jpg
// aspect drives the masonry card height (see assets-needed.md for target dimensions).
// Until an image file exists, the ProductCard renders a placeholder.

export const productsByCatalog = {
  // Kalza — everyday women's shoes, warm and approachable
  'cat-001': [
    {
      id: 'k-01',
      name: 'Balerina Clásica',
      price: 349,
      colors: [
        { name: 'Nude', hex: '#d9b99b' },
        { name: 'Negro', hex: '#1f1f1f' },
      ],
      sizes: ['22', '23', '24', '25', '26', '27'],
      image: '/images/products/kalza/k-01.jpg',
      aspect: '4/5',
    },
    {
      id: 'k-02',
      name: 'Sandalia Verano',
      price: 299,
      colors: [
        { name: 'Miel', hex: '#c98a3d' },
        { name: 'Blanco', hex: '#f5f0e8' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/kalza/k-02.jpg',
      aspect: '3/4',
    },
    {
      id: 'k-03',
      name: 'Tenis Casual Lona',
      price: 499,
      colors: [
        { name: 'Blanco', hex: '#f5f0e8' },
        { name: 'Gris', hex: '#9a9a9a' },
      ],
      sizes: ['22', '23', '24', '25', '26', '27'],
      image: '/images/products/kalza/k-03.jpg',
      aspect: '2/3',
    },
    {
      id: 'k-04',
      name: 'Bota Corta Otoño',
      price: 649,
      colors: [
        { name: 'Café', hex: '#6b4226' },
        { name: 'Negro', hex: '#1f1f1f' },
      ],
      sizes: ['23', '24', '25', '26', '27'],
      image: '/images/products/kalza/k-04.jpg',
      aspect: '4/5',
    },
    {
      id: 'k-05',
      name: 'Huarache Artesanal',
      price: 389,
      colors: [
        { name: 'Tan', hex: '#b08550' },
        { name: 'Vino', hex: '#722f37' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/kalza/k-05.jpg',
      aspect: '1/1',
    },
    {
      id: 'k-06',
      name: 'Mocasín Comfort',
      price: 429,
      colors: [
        { name: 'Camel', hex: '#a5793f' },
        { name: 'Azul Marino', hex: '#23304a' },
      ],
      sizes: ['22', '23', '24', '25', '26', '27'],
      image: '/images/products/kalza/k-06.jpg',
      aspect: '2/3',
    },
    {
      id: 'k-07',
      name: 'Sandalia de Plataforma',
      price: 459,
      colors: [
        { name: 'Beige', hex: '#d6c4a8' },
        { name: 'Negro', hex: '#1f1f1f' },
      ],
      sizes: ['22', '23', '24', '25'],
      image: '/images/products/kalza/k-07.jpg',
      aspect: '3/4',
    },
    {
      id: 'k-08',
      name: 'Zapato de Piso Diario',
      price: 379,
      colors: [
        { name: 'Rosa Viejo', hex: '#c08081' },
        { name: 'Negro', hex: '#1f1f1f' },
      ],
      sizes: ['22', '23', '24', '25', '26', '27'],
      image: '/images/products/kalza/k-08.jpg',
      aspect: '4/5',
    },
  ],

  // Élite — premium women's line, dark and refined
  'cat-002': [
    {
      id: 'e-01',
      name: 'Stiletto Medianoche',
      price: 899,
      colors: [
        { name: 'Negro', hex: '#141414' },
        { name: 'Vino', hex: '#5e2129' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/elite/e-01.jpg',
      aspect: '2/3',
    },
    {
      id: 'e-02',
      name: 'Pump de Charol',
      price: 849,
      colors: [
        { name: 'Negro Charol', hex: '#0d0d0d' },
        { name: 'Rojo Profundo', hex: '#7a1f2b' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/elite/e-02.jpg',
      aspect: '4/5',
    },
    {
      id: 'e-03',
      name: 'Botín de Piel',
      price: 1199,
      colors: [
        { name: 'Negro', hex: '#141414' },
        { name: 'Cognac', hex: '#7d4a23' },
      ],
      sizes: ['23', '24', '25', '26', '27'],
      image: '/images/products/elite/e-03.jpg',
      aspect: '3/4',
    },
    {
      id: 'e-04',
      name: 'Sandalia de Tacón Dorada',
      price: 799,
      colors: [
        { name: 'Dorado', hex: '#b9974e' },
        { name: 'Plata', hex: '#b8b8c0' },
      ],
      sizes: ['22', '23', '24', '25'],
      image: '/images/products/elite/e-04.jpg',
      aspect: '2/3',
    },
    {
      id: 'e-05',
      name: 'Mule Elegante',
      price: 749,
      colors: [
        { name: 'Marfil', hex: '#ece5d8' },
        { name: 'Negro', hex: '#141414' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/elite/e-05.jpg',
      aspect: '1/1',
    },
    {
      id: 'e-06',
      name: 'Tacón Bajo Satinado',
      price: 699,
      colors: [
        { name: 'Champaña', hex: '#d9c39a' },
        { name: 'Azul Noche', hex: '#1c2438' },
      ],
      sizes: ['22', '23', '24', '25', '26', '27'],
      image: '/images/products/elite/e-06.jpg',
      aspect: '4/5',
    },
    {
      id: 'e-07',
      name: 'Bota Alta de Gamuza',
      price: 1399,
      colors: [
        { name: 'Gris Carbón', hex: '#3a3a3e' },
        { name: 'Chocolate', hex: '#4a2f1e' },
      ],
      sizes: ['23', '24', '25', '26'],
      image: '/images/products/elite/e-07.jpg',
      aspect: '2/3',
    },
    {
      id: 'e-08',
      name: 'Slingback Clásico',
      price: 829,
      colors: [
        { name: 'Negro', hex: '#141414' },
        { name: 'Nude Rosado', hex: '#d3a896' },
      ],
      sizes: ['22', '23', '24', '25', '26'],
      image: '/images/products/elite/e-08.jpg',
      aspect: '3/4',
    },
  ],

  // Pasos — children's shoes, bright and playful
  'cat-003': [
    {
      id: 'p-01',
      name: 'Tenis Luces LED',
      price: 399,
      colors: [
        { name: 'Azul', hex: '#2f6fde' },
        { name: 'Rosa', hex: '#e8639a' },
      ],
      sizes: ['15', '16', '17', '18', '19', '20', '21'],
      image: '/images/products/pasos/p-01.jpg',
      aspect: '4/5',
    },
    {
      id: 'p-02',
      name: 'Sandalia Dino',
      price: 249,
      colors: [
        { name: 'Verde', hex: '#4caf50' },
        { name: 'Naranja', hex: '#f08a2c' },
      ],
      sizes: ['15', '16', '17', '18', '19'],
      image: '/images/products/pasos/p-02.jpg',
      aspect: '1/1',
    },
    {
      id: 'p-03',
      name: 'Tenis Escolar Blanco',
      price: 329,
      colors: [{ name: 'Blanco', hex: '#f7f7f5' }],
      sizes: ['16', '17', '18', '19', '20', '21'],
      image: '/images/products/pasos/p-03.jpg',
      aspect: '3/4',
    },
    {
      id: 'p-04',
      name: 'Bota de Lluvia Rana',
      price: 279,
      colors: [
        { name: 'Verde Rana', hex: '#5cb84a' },
        { name: 'Amarillo', hex: '#f3c63a' },
      ],
      sizes: ['15', '16', '17', '18', '19', '20'],
      image: '/images/products/pasos/p-04.jpg',
      aspect: '2/3',
    },
    {
      id: 'p-05',
      name: 'Zapato Escolar Negro',
      price: 359,
      colors: [{ name: 'Negro', hex: '#1f1f1f' }],
      sizes: ['16', '17', '18', '19', '20', '21'],
      image: '/images/products/pasos/p-05.jpg',
      aspect: '4/5',
    },
    {
      id: 'p-06',
      name: 'Tenis Velcro Arcoíris',
      price: 349,
      colors: [
        { name: 'Multicolor', hex: '#9b59b6' },
        { name: 'Rosa', hex: '#e8639a' },
      ],
      sizes: ['15', '16', '17', '18', '19', '20'],
      image: '/images/products/pasos/p-06.jpg',
      aspect: '3/4',
    },
    {
      id: 'p-07',
      name: 'Pantufla Osito',
      price: 199,
      colors: [
        { name: 'Café Osito', hex: '#8d6748' },
        { name: 'Gris', hex: '#9a9a9a' },
      ],
      sizes: ['15', '16', '17', '18', '19'],
      image: '/images/products/pasos/p-07.jpg',
      aspect: '1/1',
    },
    {
      id: 'p-08',
      name: 'Sandalia Mariposa',
      price: 259,
      colors: [
        { name: 'Lila', hex: '#b38ad6' },
        { name: 'Coral', hex: '#f0796b' },
      ],
      sizes: ['15', '16', '17', '18', '19', '20'],
      image: '/images/products/pasos/p-08.jpg',
      aspect: '2/3',
    },
  ],
}
