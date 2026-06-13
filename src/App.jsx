import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { useSessionStore } from '@/stores/sessionStore'
import { CatalogoScreen } from '@/screens/CatalogoScreen'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { ProductDetailScreen } from '@/screens/ProductDetailScreen'
import { CartScreen } from '@/screens/CartScreen'
import { ShareCatalogScreen } from '@/screens/ShareCatalogScreen'
import { OrderDetailScreen } from '@/screens/OrderDetailScreen'
import { ClientesScreen } from '@/screens/ClientesScreen'
import { PedidosScreen } from '@/screens/PedidosScreen'
import { IngresosScreen } from '@/screens/IngresosScreen'

// Home by profile: buyer = catalog, retailer = dashboard of shares,
// wholesaler = incoming orders (his job here is confirming and setting apart).
function Home() {
  const role = useSessionStore((s) => s.role)
  if (role === 'retailer') return <DashboardScreen />
  if (role === 'wholesaler') return <PedidosScreen />
  return <CatalogoScreen />
}

function App() {
  const { pathname } = useLocation()
  // Focused views — no bottom nav, back button instead
  const immersive =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') || // note the slash: /pedidos is a tab, /pedido/:id is not
    pathname === '/carrito' ||
    pathname === '/compartir'

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar />
      <main className={immersive ? 'pt-14' : 'pb-[60px] pt-14'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<CatalogoScreen />} />
          <Route path="/producto/:id" element={<ProductDetailScreen />} />
          <Route path="/carrito" element={<CartScreen />} />
          <Route path="/compartir" element={<ShareCatalogScreen />} />
          <Route path="/clientes" element={<ClientesScreen />} />
          <Route path="/pedidos" element={<PedidosScreen />} />
          <Route path="/pedido/:id" element={<OrderDetailScreen />} />
          <Route path="/ingresos" element={<IngresosScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!immersive && <BottomNav />}
    </div>
  )
}

export default App
