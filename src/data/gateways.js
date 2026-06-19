// Payment rails offered at buyer checkout (responsive-spec §5.5). Labels and
// taglines live in i18n (t.gateways / t.gatewayDesc) so they go through useT();
// this holds only the structural bits the checkout flow branches on:
//   instant — wallet/card rails that settle immediately (→ pagado)
//   cash    — OXXO Pay: a digital ficha (18-digit ref + barcode) paid in cash;
//             with OXXO Pay the payment reflects in real time (at a commission)
//   bnpl    — a trato: buy-now-pay-later in fortnightly (quincenal) installments
// The 2019 app was deliberately cash-only — these are its stage-3 roadmap vision
// (OXXO Pay = cash bridge for unbanked buyers; a trato = formalized installments).
export const GATEWAYS = [
  { id: 'mercadopago', kind: 'instant' },
  { id: 'paypal', kind: 'instant' },
  { id: 'tarjeta', kind: 'instant' },
  { id: 'oxxo', kind: 'cash' },
  { id: 'atrato', kind: 'bnpl' },
]

export const GATEWAY_IDS = GATEWAYS.map((g) => g.id)
export const gatewayById = Object.fromEntries(GATEWAYS.map((g) => [g.id, g]))
