/**
 * Cookie consent — the stored decision.
 *
 * WHY THIS EXISTS
 *   Google Tag Manager was injected on every page of spacesmate.com
 *   unconditionally, before the visitor had been asked anything. Under the PDPA
 *   analytics and advertising cookies need consent: they are genuinely optional
 *   and the visitor gains nothing from them.
 *
 * THE APPROACH
 *   GTM is not loaded at all until consent is given. The alternative — loading
 *   it with Google Consent Mode defaults set to denied — still lets Google
 *   receive cookieless pings, and "we sent them less data than we could have"
 *   is a weaker position to defend than "we sent nothing".
 *
 *   Necessary cookies are not offered as a choice, because they are not one:
 *   they are the session and security cookies without which the site cannot
 *   work. Presenting them as a toggle the visitor cannot meaningfully refuse
 *   would be theatre.
 *
 * VERSIONING
 *   `VERSION` is stamped into every stored decision. If the categories change
 *   or a new tag is added, raising it invalidates old decisions and re-asks.
 *   A consent given for one set of purposes is not consent for a different set.
 */

export const CONSENT_KEY = 'sm_consent'
export const CONSENT_VERSION = 1

export type Consent = {
  version:   number
  analytics: boolean
  marketing: boolean
  /** ISO timestamp of the decision. Kept because consent must be evidenced. */
  decidedAt: string
}

/** The decision, or null when nobody has decided yet. */
export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent

    // A decision made against an older set of categories is not a decision
    // about the current set. Treat it as unanswered rather than assume.
    if (parsed?.version !== CONSENT_VERSION) return null

    return parsed
  } catch {
    // Corrupt value, or storage blocked entirely (Safari private browsing).
    // Unanswered is the safe reading: it withholds tracking rather than
    // assuming permission.
    return null
  }
}

export function writeConsent(choice: { analytics: boolean; marketing: boolean }): Consent {
  const consent: Consent = {
    version:   CONSENT_VERSION,
    analytics: choice.analytics,
    marketing: choice.marketing,
    decidedAt: new Date().toISOString(),
  }
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch {
    // Storage unavailable. The banner will reappear next visit, which is
    // annoying but correct — better than tracking someone whose refusal we
    // cannot remember.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }))
  return consent
}

/** Clears the decision so the banner reappears. Used by "cookie settings". */
export function resetConsent(): void {
  try { window.localStorage.removeItem(CONSENT_KEY) } catch { /* nothing to clear */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }))
}

/**
 * Fired whenever the decision changes, so the tag loader can react without a
 * page reload. Consent withdrawn mid-session must take effect immediately —
 * that is the whole point of withdrawal.
 */
export const CONSENT_EVENT = 'sm:consent'

export function onConsentChange(fn: (c: Consent | null) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent).detail ?? null)
  window.addEventListener(CONSENT_EVENT, handler)
  return () => window.removeEventListener(CONSENT_EVENT, handler)
}

/** Should tracking tags be loaded at all? */
export function trackingAllowed(c: Consent | null): boolean {
  return !!c && (c.analytics || c.marketing)
}
