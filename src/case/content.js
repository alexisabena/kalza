// Bilingual content for the portfolio template. English is the default.
// Product and brand names are not translated. Phone-UI strings live under
// `phone` so the mockups switch language too.

export const content = {
  en: {
    nav: { caseStudy: 'Case study', story: 'The story' },
    hero: {
      eyebrow: 'Case study · Digita Studio',
      title: 'Kalza — every seller’s own storefront',
      lead: 'A legacy shoe manufacturer in Jalisco sold through a nationwide network of catalog resellers. When the pandemic made the paper catalog impossible, we digitalized their sales model without tearing the social fabric that made it work.',
      ctaApp: 'Open the app',
      ctaAdmin: 'Back-office',
      yearLabel: 'Original year',
      year: '2019',
      roleLabel: 'Role',
      role: 'Design + build',
      stackLabel: 'Stack',
      stack: 'React · Vite · Zustand',
      themeHint: 'Switch catalog — the whole app re-brands:',
    },
    reto: {
      eyebrow: 'The challenge',
      title: 'A social model, suddenly impossible',
      body: 'The paper catalog was never just a brochure — it was an excuse to knock on a door, sit in a friend’s kitchen and talk. Sellers built their income on that relationship. The pandemic cut it overnight. Moving the sale online without making it cold or corporate was the real design problem.',
    },
    solucion: {
      eyebrow: 'The solution',
      title: 'An app that is her store, not the brand’s',
      cards: [
        { title: 'Referral link, no account', body: 'She shares a personal link with each client. No email, no password — the phone is the identity. The lowest possible friction.' },
        { title: 'Multi-step confirmation', body: 'The client reserves, the wholesaler confirms and sets stock aside, the client pays within a window. Double confirmation formalizes the informal sale without feeling rigid.' },
        { title: 'The catalog as an event', body: 'Each new season is lived as an event, not a content update — recreating the excitement of the paper catalog.' },
      ],
    },
    theming: {
      eyebrow: 'The technical achievement',
      title: 'One app, many brands — the theme switches at runtime',
      body: 'Kalza distributes catalogs from several brands, each with its own identity. Selecting a catalog sets data-theme on the root and the CSS cascade re-brands the whole app: color, radius and typography. Zero color logic in JS, zero flicker.',
      themes: {
        'cat-001': 'Warm, close, trustworthy',
        'cat-002': 'Sober, premium, after-dark',
        'cat-003': 'Bright, playful, for kids',
      },
      fontLabel: 'Typeface',
      radiusLabel: 'Radius',
    },
    flujo: {
      eyebrow: 'The flow',
      title: 'Multi-step confirmation, to protect whoever takes the risk',
      body: 'The seller fronts the whole order to the wholesaler while the client sometimes pays in installments. The payment window formalizes the commitment and protects her. The client only sees a progress stepper; inventory and pickup coordination live in a thread between seller and wholesaler.',
    },
    superficies: {
      eyebrow: 'The architecture',
      title: 'Two surfaces, two form factors',
      app: {
        title: 'Mobile app — client + seller',
        body: 'The face of the product. The client browses and reserves; the seller shares catalogs, tracks her clients’ orders and sees her income. One seller among many across the country.',
        cta: 'Open the app',
      },
      admin: {
        title: 'Back-office — wholesaler',
        body: 'A desktop run by staff, with a log of who approved each order. Orders, income, sellers, buyers and inventory for the whole network, with per-color item capture.',
        cta: 'Open the back-office',
      },
    },
    footer: {
      brandLine: 'Portfolio case based on a real 2019 project · Digita Studio',
      cta: 'Open the app',
    },
    story: {
      eyebrow: 'The story',
      title: 'Rosa has sold shoes to her neighborhood for fifteen years',
      lead: 'This is how a paper catalog became an app — without losing the conversation that made it work.',
      beats: [
        { screen: 'catalog', title: 'It started at the kitchen table', body: 'Rosa would arrive with the new catalog, flip through it with a friend, and write the order on a notepad. The product was never the shoe — it was the visit.' },
        { screen: 'share', title: 'Then the doors closed', body: 'In 2020 there were no visits. So we gave Rosa a link. She sends it on WhatsApp like she’d hand over the catalog, and her client opens a store that feels like Rosa’s — because it is.' },
        { screen: 'theme', title: 'Each catalog, its own world', body: 'When Rosa switches to the elegant catalog, the whole app changes its skin — darker, sharper, another typeface. The kids’ one turns bright and round. One app, many brands.' },
        { screen: 'order', title: 'A deal that protects her', body: 'Her client reserves; the wholesaler sets the stock aside; her client commits to pay within a window. Rosa fronts the order, so the app makes sure the commitment is real before she does.' },
      ],
      close: { title: 'The visit, now digital', body: 'The physical catalog came back too. Both live side by side — because the point was never paper or pixels. It was Rosa, and the door she knocks on.' },
    },
    phone: {
      reserve: 'Reserve',
      shareTitle: 'Share catalog',
      shareName: 'Lupita Ramírez',
      shareLink: 'kalza.mx/r/rosa',
      shareCopied: 'Link copied',
      shareSend: 'Send on WhatsApp',
      orderTitle: 'Order',
      steps: ['Ordered', 'Reserved', 'Paid', 'Collected', 'Delivered'],
      payNote: 'Pay before Sat 8:00 PM',
    },
  },

  es: {
    nav: { caseStudy: 'Caso de estudio', story: 'La historia' },
    hero: {
      eyebrow: 'Caso de estudio · Digita Studio',
      title: 'Kalza — la tienda personal de cada vendedora',
      lead: 'Una fabricante de calzado de Jalisco vendía por catálogo físico a través de una red nacional de vendedoras. Cuando la pandemia volvió imposible el catálogo de papel, digitalizamos su modelo de venta sin romper el tejido social que lo hacía funcionar.',
      ctaApp: 'Ver la app',
      ctaAdmin: 'Back-office',
      yearLabel: 'Año original',
      year: '2019',
      roleLabel: 'Rol',
      role: 'Diseño + desarrollo',
      stackLabel: 'Stack',
      stack: 'React · Vite · Zustand',
      themeHint: 'Cambia de catálogo — toda la app se re-marca:',
    },
    reto: {
      eyebrow: 'El reto',
      title: 'Un modelo social, de pronto imposible',
      body: 'El catálogo de papel no era solo un folleto: era una excusa para tocar puertas, sentarse en la cocina de una amiga y platicar. Las vendedoras construían su ingreso sobre esa relación. La pandemia lo cortó de tajo. Llevar la venta a lo digital sin volverla fría ni corporativa era el verdadero problema de diseño.',
    },
    solucion: {
      eyebrow: 'La solución',
      title: 'Una app que es la tienda de ella, no la de la marca',
      cards: [
        { title: 'Link de referido, sin cuenta', body: 'Comparte un enlace personal con cada clienta. Sin correo, sin contraseña — el teléfono es la identidad. La fricción más baja posible.' },
        { title: 'Confirmación en varios pasos', body: 'La clienta aparta, el mayorista confirma y separa stock, la clienta paga dentro de una ventana. La doble confirmación formaliza la venta informal sin sentirse rígida.' },
        { title: 'El catálogo como evento', body: 'Cada temporada nueva se vive como un acontecimiento, no como una actualización de contenido — replicando la emoción del catálogo de papel.' },
      ],
    },
    theming: {
      eyebrow: 'El logro técnico',
      title: 'Una app, varias marcas — el tema cambia en tiempo real',
      body: 'Kalza distribuye catálogos de varias marcas, cada una con su identidad. Al seleccionar un catálogo, se fija data-theme en la raíz y la cascada de CSS re-marca toda la app: color, radio y tipografía. Cero lógica de color en JS, cero parpadeo.',
      themes: {
        'cat-001': 'Cálido, cercano, de confianza',
        'cat-002': 'Sobrio, premium, de noche',
        'cat-003': 'Brillante, lúdico, para niños',
      },
      fontLabel: 'Tipografía',
      radiusLabel: 'Radio',
    },
    flujo: {
      eyebrow: 'El flujo',
      title: 'Confirmación multi-paso, para proteger a quien arriesga',
      body: 'La vendedora financia el pedido completo al mayorista mientras la clienta a veces paga en abonos. La ventana de pago formaliza el compromiso y la protege. La clienta solo ve un avance por pasos; la coordinación de inventario y recolección vive en un hilo entre vendedora y mayorista.',
    },
    superficies: {
      eyebrow: 'La arquitectura',
      title: 'Dos superficies, dos formatos',
      app: {
        title: 'App móvil — clienta + vendedora',
        body: 'La cara del producto. La clienta navega y aparta; la vendedora comparte catálogos, sigue los pedidos de sus clientas y ve su ingreso. Una vendedora es una de muchas en todo el país.',
        cta: 'Abrir la app',
      },
      admin: {
        title: 'Back-office — mayorista',
        body: 'Un escritorio operado por staff, con bitácora de quién aprobó cada pedido. Pedidos, ingresos, vendedoras, compradoras e inventario de toda la red, con captura de artículos por color.',
        cta: 'Abrir el back-office',
      },
    },
    footer: {
      brandLine: 'Caso de portafolio basado en un proyecto real de 2019 · Digita Studio',
      cta: 'Ver la app',
    },
    story: {
      eyebrow: 'La historia',
      title: 'Rosa lleva quince años vendiendo zapatos en su colonia',
      lead: 'Así un catálogo de papel se volvió una app — sin perder la conversación que lo hacía funcionar.',
      beats: [
        { screen: 'catalog', title: 'Empezaba en la mesa de la cocina', body: 'Rosa llegaba con el catálogo nuevo, lo hojeaba con una amiga y anotaba el pedido en una libreta. El producto nunca fue el zapato — era la visita.' },
        { screen: 'share', title: 'Luego se cerraron las puertas', body: 'En 2020 no hubo visitas. Así que le dimos a Rosa un enlace. Lo manda por WhatsApp como entregaría el catálogo, y su clienta abre una tienda que se siente de Rosa — porque lo es.' },
        { screen: 'theme', title: 'Cada catálogo, su propio mundo', body: 'Cuando Rosa cambia al catálogo elegante, toda la app cambia de piel — más oscura, más afilada, otra tipografía. El de niños se vuelve brillante y redondo. Una app, varias marcas.' },
        { screen: 'order', title: 'Un trato que la protege', body: 'Su clienta aparta; el mayorista separa el stock; su clienta se compromete a pagar dentro de una ventana. Rosa financia el pedido, así que la app se asegura de que el compromiso sea real antes que ella.' },
      ],
      close: { title: 'La visita, ahora digital', body: 'El catálogo físico también regresó. Ambos conviven — porque el punto nunca fue el papel ni los pixeles. Era Rosa, y la puerta que toca.' },
    },
    phone: {
      reserve: 'Apartar',
      shareTitle: 'Compartir catálogo',
      shareName: 'Lupita Ramírez',
      shareLink: 'kalza.mx/r/rosa',
      shareCopied: 'Link copiado',
      shareSend: 'Enviar por WhatsApp',
      orderTitle: 'Pedido',
      steps: ['Pedido', 'Apartado', 'Pagado', 'Recolectado', 'Entregado'],
      payNote: 'Paga antes del sáb 8:00 PM',
    },
  },
}
