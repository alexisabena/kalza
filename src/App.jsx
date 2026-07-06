import { useState } from 'react'
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { FloatingNav } from '@/components/FloatingNav'
import { TouchCursor } from '@/components/TouchCursor'
import { DeviceModeToggle } from '@/components/DeviceModeToggle'
import { useDeviceClass, useRealDeviceClass } from '@/lib/useDeviceClass'
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
import { StoryPage } from '@/case/StoryPage'

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

// Per device-mode bezel dimensions for the framed desktop preview (§7). The
// stage is decoupled from the simulated content class: the frame shows whenever
// the REAL device is a desktop, while the toggle's mode resizes the bezel AND
// overrides the content class so the same adaptive code path renders inside.
const FRAME = {
  mobile: 'h-[min(860px,calc(100dvh-3rem))] w-[420px] rounded-[2.75rem] border-[12px]',
  'tablet-p': 'h-[calc(100dvh-3rem)] w-[min(720px,calc(100vw-3rem))] rounded-[2rem] border-[14px]',
  'tablet-l': 'h-[min(820px,calc(100dvh-3rem))] w-[min(1180px,calc(100vw-3rem))] rounded-[2rem] border-[14px]',
}
const MODE_TO_DEVICE = { mobile: 'phone', 'tablet-p': 'tablet-p', 'tablet-l': 'tablet-l' }

// The mobile-first app: buyer + vendedora, in the phone frame.
function MobileApp() {
  const { pathname } = useLocation()
  const activeCatalog = useCatalogStore((s) => s.activeCatalog)
  const backdrop = BACKDROPS[activeCatalog.id] ?? BACKDROPS['cat-001']
  const t = useT()

  // Whether to show the §F desktop stage depends on the REAL hardware (a desktop
  // with a mouse), NOT the simulated class — so the stage + toggle persist while
  // the reviewer previews a tablet inside the frame.
  const onDesktop = useRealDeviceClass() === 'desk'
  const [mode, setMode] = useState('mobile')
  // On the desktop stage the toggle drives the content class; on a real device we
  // follow matchMedia. This single source of truth writes data-device on <html>.
  useDeviceClass(onDesktop ? MODE_TO_DEVICE[mode] : undefined)

  // Focused views — no bottom nav, back button instead
  const immersive =
    pathname.startsWith('/producto') ||
    pathname.startsWith('/pedido/') || // note the slash: /pedidos is a tab, /pedido/:id is not
    pathname === '/carrito' ||
    pathname === '/compartir' ||
    pathname === '/ajustes' ||
    pathname.startsWith('/pago/')

  // On desktop the app is reviewed as a real device (à la Xcode/Swift previews):
  // a device with a bezel, inset and front-and-center on a blurred backdrop — not
  // a stretched layout. The bezel's `transform` makes it the containing block for
  // all the fixed chrome inside (top/bottom bars, drawer, lightbox), so they bind
  // to the device automatically; the content scrolls inside it. On a real phone/
  // tablet this melts away to the plain full-screen app. The bezel resizes per
  // device mode (FRAME) and the change animates. (Studio standard — see
  // portfolio-framework-spec.md › Locked Decision #5 + §F.)
  return (
    <div className={onDesktop ? 'flex min-h-dvh cursor-none items-center justify-center bg-foreground p-6' : ''}>
      {onDesktop && (
        <>
          {/* Blurred ambient backdrop — the device sits on a stage. Crossfades
              when the catalog changes (keyed by backdrop src). */}
          <div aria-hidden="true" className="fixed inset-0">
            <div
              key={backdrop}
              className="size-full scale-110 bg-cover bg-center blur-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="absolute inset-0 bg-foreground/45" />
          </div>

          {/* Back to the case study (left) + device-mode toggle (right) */}
          <Link
            to="/"
            aria-label={t.caseStudy}
            className="fixed left-6 top-6 z-[60] flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-foreground/40 px-4 py-2 text-sm font-medium text-primary-foreground/90 backdrop-blur transition-colors hover:bg-foreground/60"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t.caseStudy}
          </Link>
          <DeviceModeToggle mode={mode} setMode={setMode} />
        </>
      )}

      {/* The device column. On a real phone/tablet: a plain full-width column
          (tablet classes relax the max-w-md cap). On the desktop stage: a bezel
          sized per mode, animating between sizes. */}
      <div
        className={
          onDesktop
            ? `relative mx-auto min-h-0 overflow-hidden border-foreground bg-background shadow-2xl [transform:translateZ(0)] motion-safe:transition-[width,height,border-radius] motion-safe:[transition-duration:var(--dur-frame)] motion-safe:[transition-timing-function:var(--ease-frame)] ${FRAME[mode]}`
            : 'relative mx-auto min-h-dvh w-full max-w-md bg-background tablet-p:max-w-none tablet-l:max-w-none'
        }
      >
        <TopBar />
        <main className={`${onDesktop ? 'h-full overflow-y-auto' : ''} ${immersive ? 'pt-14' : 'pb-[60px] pt-14 tablet-l:pb-24'}`}>
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
        {/* Phone/tablet-p/desk show BottomNav; tablet-l shows the floating nav
            instead (each gates itself via the device-class variants). */}
        {!immersive && <BottomNav />}
        {!immersive && <FloatingNav />}
      </div>

      {/* Outside the device transform so it tracks viewport coordinates. Shown on
          the desktop stage (any simulated mode), where a mouse stands in for touch. */}
      {onDesktop && <TouchCursor />}
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
      <Route path="/story" element={<StoryPage />} />
      <Route path="/*" element={<MobileApp />} />
    </Routes>
  )
}

export default App
