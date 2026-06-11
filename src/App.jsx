import { Routes, Route, Navigate } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { CatalogoScreen } from '@/screens/CatalogoScreen'
import { ClientesScreen } from '@/screens/ClientesScreen'
import { PedidosScreen } from '@/screens/PedidosScreen'
import { IngresosScreen } from '@/screens/IngresosScreen'

function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar />
      <main className="pb-[60px] pt-14">
        <Routes>
          <Route path="/" element={<CatalogoScreen />} />
          <Route path="/clientes" element={<ClientesScreen />} />
          <Route path="/pedidos" element={<PedidosScreen />} />
          <Route path="/ingresos" element={<IngresosScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
