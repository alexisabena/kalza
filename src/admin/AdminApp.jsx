import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminSidebar } from '@/admin/AdminSidebar'
import { DashboardPage } from '@/admin/pages/DashboardPage'
import { OrdersPage } from '@/admin/pages/OrdersPage'
import { OrderDetailPage } from '@/admin/pages/OrderDetailPage'
import { IncomePage } from '@/admin/pages/IncomePage'
import { SellersPage } from '@/admin/pages/SellersPage'
import { SellerDetailPage } from '@/admin/pages/SellerDetailPage'
import { BuyersPage } from '@/admin/pages/BuyersPage'
import { BuyerDetailPage } from '@/admin/pages/BuyerDetailPage'
import { InventoryPage } from '@/admin/pages/InventoryPage'
import { InventoryCapturePage } from '@/admin/pages/InventoryCapturePage'
import { InventoryItemDetailPage } from '@/admin/pages/InventoryItemDetailPage'
import { UserAccessPage } from '@/admin/pages/UserAccessPage'

// The wholesaler back-office — a separate desktop surface (sidebar nav, full
// width), not the mobile buyer/seller frame. Always renders the Kalza base
// theme: it belongs to the mayorista, not to any catalog brand, so we clear any
// data-theme the mobile catalog switcher may have set.
export function AdminApp() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
  }, [])

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-8">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="sellers/:id" element={<SellerDetailPage />} />
          <Route path="buyers" element={<BuyersPage />} />
          <Route path="buyers/:id" element={<BuyerDetailPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/new" element={<InventoryCapturePage />} />
          <Route path="inventory/:id" element={<InventoryItemDetailPage />} />
          <Route path="access" element={<UserAccessPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
