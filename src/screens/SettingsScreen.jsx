import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/sessionStore'
import { GATEWAYS } from '@/data/gateways'
import { useT } from '@/i18n'

// Settings — role-based (responsive-spec §5.4). Reached from the drawer for both
// roles. The seller is account-backed (name / email / password / phone + a
// read-only Seller ID), with the email/password/phone *change* flows REPRESENTED
// as tasteful mock states (re-auth, SMS code) — intent shown, nothing wired. The
// buyer has no account (CLAUDE.md: referral link + phone only): just a name and a
// preferred payment gateway that pre-selects at checkout (§5.5).

const inputClass =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

// A small "saved" flash, shown briefly after a (mock) successful change.
function SavedFlash({ show }) {
  const t = useT()
  if (!show) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary motion-safe:animate-in motion-safe:fade-in">
      <Check className="size-3.5" aria-hidden="true" />
      {t.ajustes.saved}
    </span>
  )
}

// Inline-editable text field (used for Name in both roles): tap Edit → input +
// Save/Cancel. No validation flow — the simplest editable field.
function InlineField({ label, value, onSave }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saved, setSaved] = useState(false)

  const commit = () => {
    onSave(draft.trim() || value)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="border-b py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {!editing && (
          <div className="flex items-center gap-3">
            <SavedFlash show={saved} />
            <span className="text-sm font-medium">{value}</span>
            <Button variant="ghost" size="sm" onClick={() => { setDraft(value); setEditing(true) }}>
              {t.ajustes.edit}
            </Button>
          </div>
        )}
      </div>
      {editing && (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className={inputClass}
          />
          <Button size="sm" onClick={commit}>{t.ajustes.save}</Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            {t.ajustes.cancel}
          </Button>
        </div>
      )}
    </div>
  )
}

// A change flow that REPRESENTS a confirmation step (re-auth or SMS) without
// wiring it. `steps` is an ordered list of mock-input fields; the final commit
// just writes the new value and flashes "saved". This is the §5.4 "overkill"
// flow shown as intent.
function GuardedField({ label, value, steps, onCommit }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState(0)
  const [finalValue, setFinalValue] = useState('')
  const [saved, setSaved] = useState(false)

  const reset = () => { setOpen(false); setStage(0); setFinalValue('') }
  const next = () => {
    if (stage < steps.length - 1) return setStage(stage + 1)
    onCommit?.(finalValue)
    reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const step = steps[stage]

  return (
    <div className="border-b py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <SavedFlash show={saved} />
          {!open && <span className="truncate text-sm font-medium">{value}</span>}
          {!open && (
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              {t.ajustes.change}
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-md bg-muted/50 p-3">
          {/* Demo-only intent banner so a reviewer reads the flow as illustrative */}
          <p className="mb-2 text-xs text-muted-foreground">{step.note ?? t.ajustes.reauthNote}</p>
          {step.smsHint && <p className="mb-2 text-xs text-primary">{t.ajustes.smsSent}</p>}
          <input
            type={step.type ?? 'text'}
            placeholder={step.placeholder}
            value={step.capture ? finalValue : undefined}
            onChange={step.capture ? (e) => setFinalValue(e.target.value) : undefined}
            className={inputClass}
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>{t.ajustes.cancel}</Button>
            <Button size="sm" onClick={next}>{step.cta}</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="rounded-xl border bg-card px-4">{children}</div>
    </section>
  )
}

function SellerSettings() {
  const t = useT()
  const { name, email, phone, sellerId, setName, setEmail, setPhone } = useSessionStore()

  return (
    <Section title={t.ajustes.account}>
      <InlineField label={t.ajustes.name} value={name} onSave={setName} />

      <GuardedField
        label={t.ajustes.email}
        value={email}
        onCommit={(v) => v && setEmail(v)}
        steps={[
          { placeholder: t.ajustes.currentPassword, type: 'password', cta: t.ajustes.continue },
          { placeholder: t.ajustes.newEmail, type: 'email', capture: true, cta: t.ajustes.save, note: ' ' },
        ]}
      />

      <GuardedField
        label={t.ajustes.password}
        value="••••••••"
        steps={[
          { placeholder: t.ajustes.currentPassword, type: 'password', cta: t.ajustes.continue },
          { placeholder: t.ajustes.newPassword, type: 'password', cta: t.ajustes.save, note: ' ' },
        ]}
      />

      <GuardedField
        label={t.ajustes.phone}
        value={phone}
        onCommit={(v) => v && setPhone(v)}
        steps={[
          { placeholder: t.ajustes.newPhone, type: 'tel', capture: true, cta: t.ajustes.sendCode, note: ' ' },
          { placeholder: t.ajustes.smsCode, smsHint: true, cta: t.ajustes.verify, note: ' ' },
        ]}
      />

      {/* Read-only — the seller's identity in the wholesaler's network */}
      <div className="flex items-center justify-between border-b py-3 last:border-b-0">
        <span className="text-sm text-muted-foreground">{t.ajustes.sellerId}</span>
        <span className="flex items-center gap-2 text-sm font-medium">
          {sellerId}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {t.ajustes.readonly}
          </span>
        </span>
      </div>
    </Section>
  )
}

function BuyerSettings() {
  const t = useT()
  const { name, preferredGateway, setName, setPreferredGateway } = useSessionStore()

  return (
    <>
      <Section title={t.ajustes.account}>
        <InlineField label={t.ajustes.name} value={name} onSave={setName} />
      </Section>

      <Section title={t.ajustes.preferences}>
        <div className="py-3">
          <p className="text-sm font-medium">{t.ajustes.preferredGateway}</p>
          <p className="mb-3 text-xs text-muted-foreground">{t.ajustes.preferredGatewayHint}</p>
          <div className="flex flex-col gap-2">
            {GATEWAYS.map(({ id }) => {
              const active = preferredGateway === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPreferredGateway(id)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left',
                    active && 'border-primary ring-1 ring-primary'
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{t.gateways[id]}</span>
                    <span className="block text-xs text-muted-foreground">{t.gatewayDesc[id]}</span>
                  </span>
                  {active ? (
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Section>
    </>
  )
}

export function SettingsScreen() {
  const role = useSessionStore((s) => s.role)
  const t = useT()

  return (
    // Centered + width-capped on larger classes so the form stays readable
    // instead of stretching across a tablet.
    <div className="p-4 tablet-p:mx-auto tablet-p:max-w-xl tablet-p:p-6 tablet-l:max-w-2xl">
      {role === 'retailer' ? <SellerSettings /> : <BuyerSettings />}
      <p className="px-1 text-xs text-muted-foreground">{t.ajustes.demoNote}</p>
    </div>
  )
}
