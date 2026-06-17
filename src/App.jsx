import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { TouchCursor } from '@/components/TouchCursor'
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
import { AdminApp } from '@/admin/AdminApp'
import { CaseStudyPage } from '@/case/CaseStudyPage'

// Home by profile: buyer = catalog, retailer = dashboard of shares.
// The wholesaler is no longer a mobile profile — he has his own desktop
// back-office at /admin (see AdminApp).
function Home() {
  const role = useSessionStore((s) => s.role)
  if (role === 'retailer') return <DashboardScreen />
  return <CatalogoScreen />
}

// The mobile-first app: buyer + vendedora, in the phone frame.
function MobileApp() {
  const { pathname } = useLocation()
  // Focused views — no bottom nav, back button instead
  const immersive =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') || // note the slash: /pedidos is a tab, /pedido/:id is not
    pathname === '/carrito' ||
    pathname === '/compartir'

  // On desktop the app is a real mobile experience, not a stretched one: a
  // centered phone-width column on a neutral backdrop (like devtools' mobile
  // view). The fixed bars below center themselves to the same max-w-md, so they
  // align with this column instead of spanning the whole desktop width.
  // (Standard for the case-study template — see portfolio-framework-spec.md.)
  return (
    <div className="lg:flex lg:min-h-dvh lg:justify-center lg:bg-neutral-900">
      <div className="relative mx-auto min-h-dvh w-full max-w-md bg-background lg:cursor-none lg:shadow-2xl">
        <TouchCursor />
        <TopBar />
        <main className={immersive ? 'pt-14' : 'pb-[60px] pt-14'}>
          <Routes>
            <Route path="/app" element={<Home />} />
            <Route path="/catalogo" element={<CatalogoScreen />} />
            <Route path="/producto/:id" element={<ProductDetailScreen />} />
            <Route path="/carrito" element={<CartScreen />} />
            <Route path="/compartir" element={<ShareCatalogScreen />} />
            <Route path="/clientes" element={<ClientesScreen />} />
            <Route path="/pedidos" element={<PedidosScreen />} />
            <Route path="/pedido/:id" element={<OrderDetailScreen />} />
            <Route path="/ingresos" element={<IngresosScreen />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
        {!immersive && <BottomNav />}
      </div>
    </div>
  )
}

// Two surfaces, one repo: the desktop back-office (its own shell) and the
// mobile app (phone frame). Split at the root so /admin never inherits the
// max-w-md frame or the bottom nav.
function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/" element={<CaseStudyPage />} />
      <Route path="/*" element={<MobileApp />} />
    </Routes>
  )
}

export default App
