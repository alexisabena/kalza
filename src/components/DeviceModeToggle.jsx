import { Smartphone, Tablet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

// Portfolio device-mode toggle (responsive-spec §1.1 / §6bis). On the framed
// desktop preview it lets a reviewer switch the simulated device between mobile,
// tablet-vertical and tablet-horizontal — overriding data-device on the framed
// preview only, so the SAME adaptive code path that a real tablet (QR) gets is
// shown without a tablet. Rendered by MobileApp only when the real device is a
// desktop, so it stays visible regardless of the simulated class. Mirrors the
// "← Caso de estudio" pill on the opposite corner.
const MODES = [
  { id: 'mobile', icon: Smartphone, key: 'mobile' },
  { id: 'tablet-p', icon: Tablet, key: 'tabletV' },
  { id: 'tablet-l', icon: Tablet, rotate: true, key: 'tabletH' },
]

export function DeviceModeToggle({ mode, setMode }) {
  const t = useT()
  return (
    <div
      role="group"
      aria-label={t.deviceMode.label}
      className="fixed right-6 top-6 z-[60] flex items-center gap-1 rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur"
    >
      {MODES.map(({ id, icon: Icon, rotate, key }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          aria-pressed={mode === id}
          aria-label={t.deviceMode[key]}
          title={t.deviceMode[key]}
          className={cn(
            'flex size-9 items-center justify-center rounded-full text-white/75 transition-colors',
            mode === id ? 'bg-white/20 text-white' : 'hover:bg-white/10'
          )}
        >
          <Icon className={cn('size-4', rotate && 'rotate-90')} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
