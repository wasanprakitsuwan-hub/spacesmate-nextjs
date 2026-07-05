/**
 * SpacesMate Analytics — push events to GTM dataLayer
 * GTM routes each event to GA4 and Facebook Pixel automatically.
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    fbq: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  // Push to GTM dataLayer → triggers GA4 event tag + FB Pixel custom event tag
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...params })
}
