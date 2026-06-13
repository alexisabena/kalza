// Back-office staff — the people who operate the wholesaler admin.
// Two tiers (wholesaler-admin-spec.md › Staff, tiers & audit trail):
//   admin       — operators; their name is the "approver" in an order's
//                 status history (who confirmed/changed it).
//   super-admin — everything an admin does, plus the User Access page
//                 (grant/revoke admin access). That page is super-admin-only.
// `access: false` = invited but not yet active (granted from User Access).
export const seedStaff = [
  { id: 'st-01', name: 'Alejandra Ruiz', email: 'alejandra@kalza.mx', tier: 'super-admin', access: true },
  { id: 'st-02', name: 'Beatriz Soto', email: 'beatriz@kalza.mx', tier: 'admin', access: true },
  { id: 'st-03', name: 'Daniel Fuentes', email: 'daniel@kalza.mx', tier: 'admin', access: true },
  { id: 'st-04', name: 'Mónica Lara', email: 'monica@kalza.mx', tier: 'admin', access: false },
]

// Admins available to attribute seed-order transitions to (the approvers that
// appear in status history). Super admin operates too, so all active staff.
export const seedApprovers = ['st-02', 'st-03', 'st-01']
