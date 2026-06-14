import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Store, LayoutDashboard } from 'lucide-react'
import { catalogs } from '@/data/catalogs'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PhoneMockup } from '@/case/PhoneMockup'

// The order lifecycle, shown as a stepper in the case study.
const LIFECYCLE = [
  ['Pedido', 'La clienta aparta desde el catálogo'],
  ['Apartado', 'El mayorista confirma y separa el stock — abre la ventana de pago'],
  ['Pagado', 'La clienta paga dentro de la ventana, o el apartado se libera'],
  ['Recolectado', 'La vendedora recoge el pedido con el mayorista'],
  ['Entregado', 'La vendedora entrega a su clienta'],
]

const THEME_NOTES = {
  'cat-001': { font: 'Plus Jakarta Sans', radius: '0.2rem', desc: 'Cálido, cercano, de confianza' },
  'cat-002': { font: 'DM Sans', radius: '0.1rem', desc: 'Sobrio, premium, de noche' },
  'cat-003': { font: 'Montserrat', radius: '0.75rem', desc: 'Brillante, lúdico, para niños' },
}

export function CaseStudyPage() {
  // Keep the page chrome on the Kalza base theme; mockups scope their own.
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
  }, [])

  const [activeId, setActiveId] = useState(catalogs[0].id)
  const active = catalogs.find((c) => c.id === activeId)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Caso de estudio · Digita Studio
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Kalza — la tienda personal de cada vendedora
          </h1>
          <p className="mt-5 max-w-prose text-lg text-muted-foreground">
            Una fabricante de calzado de Jalisco vendía por catálogo físico a través de una red
            nacional de vendedoras. Cuando la pandemia volvió imposible el catálogo de papel,
            digitalizamos su modelo de venta sin romper el tejido social que lo hacía funcionar.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app" className={cn(buttonVariants(), 'px-5')}>
              <Store aria-hidden="true" /> Ver la app
            </Link>
            <Link to="/admin" className={cn(buttonVariants({ variant: 'outline' }), 'px-5')}>
              <LayoutDashboard aria-hidden="true" /> Back-office
            </Link>
          </div>

          <dl className="mt-10 flex gap-8 text-sm">
            <div>
              <dt className="text-muted-foreground">Año original</dt>
              <dd className="font-semibold">2019</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rol</dt>
              <dd className="font-semibold">Diseño + desarrollo</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stack</dt>
              <dd className="font-semibold">React · Vite · Zustand</dd>
            </div>
          </dl>
        </div>

        {/* live re-theming demo */}
        <div className="flex flex-col items-center gap-6">
          <PhoneMockup catalog={active} />
          <div className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Al cambiar de catálogo, toda la app se re-marca:
            </p>
            <div className="flex justify-center gap-2">
              {catalogs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  aria-pressed={c.id === activeId}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    c.id === activeId ? 'border-foreground bg-foreground text-background' : 'hover:bg-muted'
                  )}
                >
                  {c.brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contexto ─────────────────────────────────────────── */}
      <Section eyebrow="El reto" title="Un modelo social, de pronto imposible">
        <p>
          El catálogo físico no era solo un folleto: era una excusa para tocar puertas, sentarse en
          la cocina de una amiga y platicar. Las vendedoras construían su ingreso sobre esa relación.
          La pandemia lo cortó de tajo. Llevar la venta a lo digital sin volverla fría ni corporativa
          era el verdadero problema de diseño.
        </p>
      </Section>

      {/* ── La idea ──────────────────────────────────────────── */}
      <Section eyebrow="La solución" title="Una app que es la tienda de ella, no la de la marca">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card title="Link de referido, sin cuenta">
            La vendedora comparte un enlace personal con cada clienta. Sin correo, sin contraseña —
            el teléfono es la identidad. La fricción más baja posible.
          </Card>
          <Card title="Confirmación en varios pasos">
            La clienta aparta, el mayorista confirma y separa stock, la clienta paga dentro de una
            ventana. La doble confirmación formaliza la venta informal sin sentirse rígida.
          </Card>
          <Card title="El catálogo como evento">
            Cada temporada nueva se vive como un acontecimiento, no como una actualización de
            contenido — replicando la emoción del catálogo de papel.
          </Card>
        </div>
      </Section>

      {/* ── DSM / theming ────────────────────────────────────── */}
      <Section
        eyebrow="El logro técnico"
        title="Una app, varias marcas — el tema cambia en tiempo real"
      >
        <p className="mb-8">
          Kalza distribuye catálogos de varias marcas, cada una con su identidad. Al seleccionar un
          catálogo, Zustand fija <code className="rounded bg-muted px-1">data-theme</code> en la raíz
          y la cascada de CSS re-marca toda la app: color, radio y tipografía. Cero lógica de color
          en JS, cero parpadeo.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {catalogs.map((c) => {
            const note = THEME_NOTES[c.id]
            return (
              <div key={c.id} data-theme={c.themeId || undefined} className="font-sans rounded-xl border p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="size-9 rounded-lg bg-primary" aria-hidden="true" />
                  <span className="text-lg font-bold text-primary">{c.brand}</span>
                </div>
                <p className="text-sm text-muted-foreground">{note.desc}</p>
                <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><dt>Tipografía</dt><dd className="font-medium text-foreground">{note.font}</dd></div>
                  <div className="flex justify-between"><dt>Radio</dt><dd className="font-medium text-foreground">{note.radius}</dd></div>
                </dl>
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── Lifecycle ────────────────────────────────────────── */}
      <Section
        eyebrow="El flujo"
        title="Confirmación multi-paso, para proteger a quien arriesga"
      >
        <p className="mb-8">
          La vendedora financia el pedido completo al mayorista mientras la clienta a veces paga en
          abonos. La ventana de pago formaliza el compromiso y la protege. La clienta solo ve un
          avance por pasos; la coordinación de inventario y recolección vive en un hilo entre
          vendedora y mayorista.
        </p>
        <ol className="grid gap-3 sm:grid-cols-5">
          {LIFECYCLE.map(([label, desc], i) => (
            <li key={label} className="rounded-xl border p-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Two surfaces ─────────────────────────────────────── */}
      <Section eyebrow="La arquitectura" title="Dos superficies, dos formatos">
        <div className="grid gap-6 sm:grid-cols-2">
          <SurfaceCard
            icon={Store}
            title="App móvil — clienta + vendedora"
            to="/app"
            cta="Abrir la app"
          >
            La cara del producto. La clienta navega y aparta; la vendedora comparte catálogos,
            sigue los pedidos de sus clientas y ve su ingreso. Una vendedora es una de muchas en
            todo el país.
          </SurfaceCard>
          <SurfaceCard
            icon={LayoutDashboard}
            title="Back-office — mayorista"
            to="/admin"
            cta="Abrir el back-office"
          >
            Un escritorio operado por staff, con bitácora de quién aprobó cada pedido. Pedidos,
            ingresos, vendedoras, compradoras e inventario de toda la red, con captura de artículos
            por color.
          </SurfaceCard>
        </div>
      </Section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold text-primary">Kalza</p>
            <p className="text-sm text-muted-foreground">
              Caso de portafolio basado en un proyecto real de 2019 · Digita Studio
            </p>
          </div>
          <Link to="/app" className={cn(buttonVariants(), 'px-5')}>
            Ver la app <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  )
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        <h2 className="mb-6 max-w-3xl text-2xl font-bold sm:text-3xl">{title}</h2>
        <div className="max-w-prose text-muted-foreground [&_p]:leading-relaxed">{children}</div>
      </div>
    </section>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border p-5">
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function SurfaceCard({ icon: Icon, title, children, to, cta }) {
  return (
    <div className="flex flex-col rounded-xl border p-6">
      <Icon className="mb-3 size-6 text-primary" aria-hidden="true" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-5 flex-1 text-sm text-muted-foreground">{children}</p>
      <Link to={to} className={cn(buttonVariants({ variant: 'outline' }), 'self-start px-4')}>
        {cta} <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  )
}
