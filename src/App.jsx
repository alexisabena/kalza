import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { CatalogoScreen } from '@/screens/CatalogoScreen'
import { ProductDetailScreen } from '@/screens/ProductDetailScreen'
import { CartScreen } from '@/screens/CartScreen'
import { ClientesScreen } from '@/screens/ClientesScreen'
import { PedidosScreen } from '@/screens/PedidosScreen'
import { IngresosScreen } from '@/screens/IngresosScreen'

function App() {
  const { pathname } = useLocation()
  // Detail and cart are focused views — no bottom nav, back button instead
  const immersive = pathname.startsWith('/producto') || pathname === '/carrito'

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar />
      <main className={immersive ? 'pt-14' : 'pb-[60px] pt-14'}>
        <Routes>
          <Route path="/" element={<CatalogoScreen />} />
          <Route path="/producto/:id" element={<ProductDetailScreen />} />
          <Route path="/carrito" element={<CartScreen />} />
          <Route path="/clientes" element={<ClientesScreen />} />
          <Route path="/pedidos" element={<PedidosScreen />} />
          <Route path="/ingresos" element={<IngresosScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!immersive && <BottomNav />}
    </div>
  )
}

export default App
