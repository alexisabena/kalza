import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { TouchCursor } from '@/components/TouchCursor'
import { useDeviceClass } from '@/lib/useDeviceClass'
import { useSessionStore } from '@/stores/sessionStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { useT } from '@/i18n'
import { CatalogoScreen } from '@/screens/CatalogoScreen'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { ProductDetailScreen } from '@/screens/ProductDetailScreen'
import { CartScreen } from '@/screens/CartScreen'
import { ShareCatalogScreen } from '@/screens/ShareCatalogScreen'
import { OrderDetailScreen } from '@/screens/OrderDetailScreen'
import { ClientesScreen } from '@/screens/ClientesScreen'
import { PedidosScreen } from '@/screens/PedidosScreen'
import { IngresosScreen } from '@/screens/IngresosScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { CheckoutScreen } from '@/screens/CheckoutScreen'
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

// Ambient desktop backdrop per catalog — flips with the active brand so swapping
// catalogs re-themes the stage too. (Future: a looping video per catalog; an
// image stands in until those assets land — see portfolio-framework-spec.md §F.)
const BACKDROPS = {
  'cat-001': '/images/products/kalza/k-03-2.webp',
  'cat-002': '/images/products/elite/e-03-2.webp',
  'cat-003': '/images/products/pasos/p-03-2.webp',
}

// The mobile-first app: buyer + vendedora, in the phone frame.
function MobileApp() {
  const { pathname } = useLocation()
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const backdrop = BACKDROPS[activeCatalog.id] ?? BACKDROPS['cat-001']
  const t = useT()
  // Single source of truth for the responsive layer: writes data-device on
  // <html> from matchMedia (width+orientation+pointer) and keeps it live. Every
  // tablet-p/tablet-l/desk variant keys off that attribute (responsive-spec §4).
  // The portfolio device-mode toggle will pass an override here in a later step.
  useDeviceClass()
  // Focused views — no bottom nav, back button instead
  const immersive =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') || // note the slash: /pedidos is a tab, /pedido/:id is not
    pathname === '/carrito' ||
    pathname === '/compartir' ||
    pathname === '/ajustes' ||
    pathname.startsWith('/pago/')

  // On desktop the app is reviewed as a real device (à la Xcode/Swift previews):
  // a phone with a bezel, inset and front-and-center on a blurred backdrop — not
  // a stretched layout. The phone's `transform` makes it the containing block for
  // all the fixed chrome inside (top/bottom bars, drawer, lightbox), so they bind
  // to the device automatically; the content scrolls inside it. Below lg this all
  // melts away to the plain full-screen mobile app. (Studio standard — see
  // portfolio-framework-spec.md › Locked Decision #5 + §F.)
  return (
    <div className="desk:flex desk:min-h-dvh desk:items-center desk:justify-center desk:bg-neutral-900 desk:p-6 desk:cursor-none">
      {/* Blurred ambient backdrop — the phone sits on a stage (desktop only).
          Crossfades when the catalog changes (keyed by backdrop src). */}
      <div aria-hidden="true" className="fixed inset-0 hidden desk:block">
        <div
          key={backdrop}
          className="size-full scale-110 bg-cover bg-center blur-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 bg-neutral-950/45" />
      </div>

      {/* Desktop review affordance — back to the case study. */}
      <Link
        to="/"
        aria-label={t.caseStudy}
        className="fixed left-6 top-6 z-[60] hidden items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-black/60 desk:flex"
      >
        {/* Optical alignment: nudge the arrow's stem onto the text's x-height
            axis (2px down at this size) — items-center alone leaves it high. */}
        <ArrowLeft className="size-4 translate-y-[2px]" aria-hidden="true" />
        {t.caseStudy}
      </Link>

      {/* max-w-md keeps the canonical phone column; tablet classes relax it so a
          real tablet fills its width (tablet-p large phone; tablet-l lets the
          catalog letterbox itself). desk re-pins to the 420px device frame. */}
      <div className="relative mx-auto min-h-dvh w-full max-w-md bg-background tablet-p:max-w-none tablet-l:max-w-none desk:h-[min(860px,calc(100dvh-3rem))] desk:min-h-0 desk:w-[420px] desk:max-w-none desk:overflow-hidden desk:rounded-[2.75rem] desk:border-[12px] desk:border-neutral-900 desk:shadow-2xl desk:[transform:translateZ(0)]">
        <TopBar />
        <main className={`desk:h-full desk:overflow-y-auto ${immersive ? 'pt-14' : 'pb-[60px] pt-14'}`}>
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
            <Route path="/ajustes" element={<SettingsScreen />} />
            <Route path="/pago/:id" element={<CheckoutScreen />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
        {!immersive && <BottomNav />}
      </div>

      {/* Outside the device transform so it tracks viewport coordinates. */}
      <TouchCursor />
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
