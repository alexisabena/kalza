import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedStaff } from '@/data/staff'

// The back-office is operated by staff. The current staff member drives the
// audit trail (their name becomes the approver on confirmations) and the
// sidebar (only a super-admin sees User Access).
//
// The demo can switch the acting staff member to present both tiers.
export const useStaffStore = create(
  persist(
    (set) => ({
      staff: seedStaff,
      currentStaffId: 'st-01', // Alejandra (super-admin) so User Access is visible

      setCurrent: (id) => set({ currentStaffId: id }),

      // User Access (super-admin only) — invite, then grant/revoke access.
      invite: (name, email) =>
        set((state) => ({
          staff: [
            ...state.staff,
            { id: `st-${Date.now()}`, name, email, tier: 'admin', access: false },
          ],
        })),

      setAccess: (id, access) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, access } : s)),
        })),
    }),
    {
      name: 'kalza-staff',
      version: 1,
      migrate: () => ({ staff: seedStaff, currentStaffId: 'st-01' }),
    }
  )
)

export const getStaffName = (staff, id) => staff.find((s) => s.id === id)?.name ?? null
