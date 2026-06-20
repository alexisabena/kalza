import { useEffect, useState } from 'react'

// Single source of truth for the responsive "device class" (responsive-spec §4).
// We target named *device classes* — width + orientation + pointer — not raw
// width breakpoints. The class is written to `data-device` on <html>; every
// responsive variant (tablet-p / tablet-l / desk, wired in theme-base.css) keys
// off that attribute, so real devices (matchMedia) and the portfolio
// device-mode toggle (an override) drive the exact same CSS. See §6bis.
//
// NOTE: a tiny pre-paint seed in index.html mirrors computeDeviceClass() to
// avoid a flash of the wrong layout on load — keep the two in sync if the
// media queries below change.

export const DEVICE_CLASSES = ['phone', 'tablet-p', 'tablet-l', 'desk']

// Width + orientation + pointer → one of four classes. Order matters: the
// desktop review frame wins on a fine pointer (mouse); tablets (coarse pointer)
// split by orientation; everything else is the canonical phone. A wide tablet
// in landscape (e.g. iPad Pro 1366px, pointer: coarse) therefore lands in
// tablet-l, not the desktop frame — the whole point of §3.
export function computeDeviceClass() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'phone'
  const mm = (q) => window.matchMedia(q).matches
  if (mm('(min-width: 1024px) and (pointer: fine)')) return 'desk'
  if (mm('(min-width: 1024px) and (orientation: landscape) and (pointer: coarse)')) return 'tablet-l'
  if (mm('(min-width: 768px) and (orientation: portrait) and (pointer: coarse)')) return 'tablet-p'
  return 'phone'
}

// Writes `data-device` on <html> and keeps it live on resize / orientation /
// pointer changes. Pass an `override` (the portfolio device-mode toggle) to
// force a class on the framed preview regardless of the real viewport; pass
// null/undefined to follow the real device. Returns the class currently applied.
export function useDeviceClass(override) {
  const [real, setReal] = useState(computeDeviceClass)

  useEffect(() => {
    const update = () => setReal(computeDeviceClass())
    // resize covers width + orientation; a pointer media listener catches the
    // rarer case of the input device changing (e.g. attaching a mouse).
    window.addEventListener('resize', update)
    const ptr = window.matchMedia('(pointer: coarse)')
    ptr.addEventListener('change', update)
    update()
    return () => {
      window.removeEventListener('resize', update)
      ptr.removeEventListener('change', update)
    }
  }, [])

  const applied = override ?? real

  useEffect(() => {
    document.documentElement.setAttribute('data-device', applied)
  }, [applied])

  return applied
}

// Read-only subscriber to the live data-device attribute, for components that
// aren't the writer (e.g. the catalog crossfading its grid when the class
// changes). Observes <html> so it updates on real-device changes AND the
// portfolio toggle's override.
export function useDeviceAttr() {
  const [device, setDevice] = useState(
    () => (typeof document === 'undefined' ? 'phone' : document.documentElement.getAttribute('data-device') || 'phone')
  )
  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDevice(root.getAttribute('data-device') || 'phone')
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(root, { attributes: true, attributeFilter: ['data-device'] })
    return () => obs.disconnect()
  }, [])
  return device
}
