/**
 * SpacesMate analytics: one helper for every event.
 *
 * trackEvent() sends the same event to:
 *   - GA4, through gtag (Consent Mode decides what Google may store)
 *   - the Meta pixel, for the events in META_MAP, only if the pixel was
 *     loaded, which happens only with marketing consent
 *   - Vercel Web Analytics, as a cookieless custom event
 *
 * Never pass a name, phone number, email or LINE ID. As a safety net, keys
 * that look like personal data are dropped before anything is sent.
 */
import { track as vercelTrack } from '@vercel/analytics'
import '@/lib/tracking-config'   // Window typings

const META_MAP: Record<string, string> = {
  listing_submit:     'Lead',
  manage_lead_submit: 'Lead',
  sign_up:            'CompleteRegistration',
  purchase:           'Purchase',
  line_click:         'Contact',
}

const PII_KEY = /(^|_)(name|first_name|last_name|full_name|phone|tel|email|line_id|contact_line|contact_phone|contact_name)$/i

type Params = Record<string, unknown>

export function trackEvent(eventName: string, params: Params = {}) {
  if (typeof window === 'undefined') return

  const p: Params = { page_path: window.location.pathname }
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || PII_KEY.test(k)) continue
    p[k] = v
  }

  // GA4. window.gtag exists only on the live site (see ConsentDefaults).
  window.gtag?.('event', eventName, p)

  // Meta. window.fbq exists only once marketing consent was given.
  const meta = META_MAP[eventName]
  if (meta && window.fbq) {
    const fb: Params = { content_name: eventName }
    if (typeof p.value === 'number') fb.value = p.value
    if (typeof p.currency === 'string') fb.currency = p.currency
    window.fbq('track', meta, fb)
  }

  // Vercel accepts flat string / number / boolean values only.
  if (window.__smTrack) {
    const flat: Record<string, string | number | boolean> = {}
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') flat[k] = v
    }
    try { vercelTrack(eventName, flat) } catch { /* never break the page for analytics */ }
  }
}

/** Alias matching the tracking spec's name. */
export const track = trackEvent
