// Master color list — referenced by id from products and inventory.
// One row per color the brand sells; products point at these via colorIds.

export const colors = {
  // Neutrals / leathers
  'nude': { name: 'Nude', hex: '#d9b99b' },
  'negro': { name: 'Negro', hex: '#1f1f1f' },
  'blanco': { name: 'Blanco', hex: '#f5f0e8' },
  'gris': { name: 'Gris', hex: '#9a9a9a' },
  'beige': { name: 'Beige', hex: '#d6c4a8' },
  'cafe': { name: 'Café', hex: '#6b4226' },
  'tan': { name: 'Tan', hex: '#b08550' },
  'camel': { name: 'Camel', hex: '#a5793f' },
  'miel': { name: 'Miel', hex: '#c98a3d' },
  'vino': { name: 'Vino', hex: '#722f37' },
  'rosa-viejo': { name: 'Rosa Viejo', hex: '#c08081' },
  'azul-marino': { name: 'Azul Marino', hex: '#23304a' },

  // Élite — premium finishes
  'negro-charol': { name: 'Negro Charol', hex: '#0d0d0d' },
  'rojo-profundo': { name: 'Rojo Profundo', hex: '#7a1f2b' },
  'cognac': { name: 'Cognac', hex: '#7d4a23' },
  'dorado': { name: 'Dorado', hex: '#b9974e' },
  'plata': { name: 'Plata', hex: '#b8b8c0' },
  'marfil': { name: 'Marfil', hex: '#ece5d8' },
  'champana': { name: 'Champaña', hex: '#d9c39a' },
  'azul-noche': { name: 'Azul Noche', hex: '#1c2438' },
  'gris-carbon': { name: 'Gris Carbón', hex: '#3a3a3e' },
  'chocolate': { name: 'Chocolate', hex: '#4a2f1e' },
  'nude-rosado': { name: 'Nude Rosado', hex: '#d3a896' },

  // Pasos — kids palette
  'azul': { name: 'Azul', hex: '#2f6fde' },
  'rosa': { name: 'Rosa', hex: '#e8639a' },
  'verde': { name: 'Verde', hex: '#4caf50' },
  'naranja': { name: 'Naranja', hex: '#f08a2c' },
  'verde-rana': { name: 'Verde Rana', hex: '#5cb84a' },
  'amarillo': { name: 'Amarillo', hex: '#f3c63a' },
  'multicolor': { name: 'Multicolor', hex: '#9b59b6' },
  'cafe-osito': { name: 'Café Osito', hex: '#8d6748' },
  'lila': { name: 'Lila', hex: '#b38ad6' },
  'coral': { name: 'Coral', hex: '#f0796b' },
}
