/**
 * The owner listing funnel: the Facebook ad landing page and the listing form.
 *
 * WHY A FUNNEL MODE
 *   Owners arrive from a Facebook ad, inside Facebook's own in-app browser.
 *   Every link in the full site navbar (search, blog, management, the language
 *   toggle) is a way out of the one thing they came to do. Single-purpose
 *   headers are the norm for host sign-up flows (Airbnb host, Zillow Rental
 *   Manager), so these routes get the logo and a login link only, no footer
 *   and no floating LINE button (it would sit on the sticky CTA).
 *
 * Paths are Thai paths; ConditionalSiteLayout maps /en/... onto them first.
 */

export const FUNNEL_ROUTES = ['/list-your-property/fb', '/list-your-property/new']

export function isFunnelPath(thaiPath: string): boolean {
  return FUNNEL_ROUTES.includes(thaiPath)
}

/**
 * True inside an app's built-in browser (Facebook, Messenger, Instagram, LINE).
 *
 * Google refuses OAuth sign-in in these embedded browsers (the
 * "disallowed_useragent" error), so offering Google there only produces an
 * error page. The account sheet leads with email in them instead.
 */
export function isInAppBrowser(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|Instagram|\bLine\//i.test(ua)
}

// ── First-party ad source ──────────────────────────────────────────────────────
//
// Which campaign brought an owner, saved with their listing, so the Founder can
// count listings per ad without relying on Meta or on cookie consent.
//
// Only campaign-level UTM values are kept for everyone: they describe the ad,
// not the person. fbclid is a per-click identifier Meta can tie to a profile,
// so it is kept only once the visitor has given marketing consent.

export const ATTRIBUTION_KEY = 'sm_attribution'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const MAX_AGE_MS = 30 * 24 * 3600_000

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing?: string
  landed_at?: string
  fbclid?: string
}

/** Call on the landing page. A visit with new UTM values replaces the old ones. */
export function captureAttribution(marketingConsent: boolean) {
  try {
    const qs = new URLSearchParams(window.location.search)
    const next: Attribution = {}
    for (const k of UTM_KEYS) {
      const v = qs.get(k)
      if (v) next[k] = v.slice(0, 120)
    }
    const fbclid = qs.get('fbclid')
    const hasNew = Object.keys(next).length > 0
    const prev = readAttribution()
    if (!hasNew && prev) {
      if (marketingConsent && fbclid && !prev.fbclid) {
        localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ ...prev, fbclid: fbclid.slice(0, 255) }))
      }
      return
    }
    if (!hasNew && !fbclid) return
    next.landing = window.location.pathname
    next.landed_at = new Date().toISOString()
    if (marketingConsent && fbclid) next.fbclid = fbclid.slice(0, 255)
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next))
  } catch { /* storage blocked: nothing to keep */ }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY)
    if (!raw) return null
    const a = JSON.parse(raw) as Attribution
    if (a.landed_at && Date.now() - Date.parse(a.landed_at) > MAX_AGE_MS) {
      localStorage.removeItem(ATTRIBUTION_KEY)
      return null
    }
    return a
  } catch {
    return null
  }
}

/** Removes the per-click id when marketing consent is withdrawn. */
export function dropClickId() {
  const a = readAttribution()
  if (!a?.fbclid) return
  delete a.fbclid
  try { localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(a)) } catch {}
}

// ── Listing draft kept in the browser ─────────────────────────────────────────
//
// Logged-out owners can fill the whole form. It is written to localStorage as
// they type, so closing Facebook, switching to the email app or losing signal
// costs nothing. localStorage rather than sessionStorage: a session store dies
// with the tab, and in-app browsers drop tabs freely.

export const PENDING_LISTING_KEY = 'spacesmate_pending_listing'
const DRAFT_MAX_AGE_MS = 14 * 24 * 3600_000

export type StoredDraft<T> = { form: T; step: number; savedAt: string }

export function saveLocalDraft<T>(form: T, step: number) {
  try {
    const v: StoredDraft<T> = { form, step, savedAt: new Date().toISOString() }
    localStorage.setItem(PENDING_LISTING_KEY, JSON.stringify(v))
  } catch { /* quota or blocked storage: the form still works */ }
}

export function readLocalDraft<T>(): StoredDraft<T> | null {
  try {
    // The old login-wall stash lived in sessionStorage as a bare form object.
    const legacy = sessionStorage.getItem(PENDING_LISTING_KEY)
    if (legacy) {
      sessionStorage.removeItem(PENDING_LISTING_KEY)
      const form = JSON.parse(legacy) as T
      return { form, step: 1, savedAt: new Date().toISOString() }
    }
    const raw = localStorage.getItem(PENDING_LISTING_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as StoredDraft<T>
    if (!v || typeof v !== 'object' || !v.form) return null
    if (Date.now() - Date.parse(v.savedAt) > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(PENDING_LISTING_KEY)
      return null
    }
    return v
  } catch {
    return null
  }
}

export function clearLocalDraft() {
  try { localStorage.removeItem(PENDING_LISTING_KEY) } catch {}
  try { sessionStorage.removeItem(PENDING_LISTING_KEY) } catch {}
}
