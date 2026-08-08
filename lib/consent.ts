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

/**
 * A stable random id for this browser, so a later withdrawal can be tied to the
 * consent it withdraws.
 *
 * Deliberately random and stored beside the consent itself: it identifies the
 * DECISION, not the person. It is never sent anywhere except with a consent
 * record, and links to nothing else.
 */
function subjectRef(): string {
  const KEY = 'sm_consent_ref'
  try {
    let ref = window.localStorage.getItem(KEY)
    if (!ref) { ref = crypto.randomUUID(); window.localStorage.setItem(KEY, ref) }
    return ref
  } catch {
    return crypto.randomUUID()   // not persisted; still better than nothing
  }
}

/**
 * Send the decision to the server so it can be evidenced.
 *
 * Fire-and-forget. The visitor's choice takes effect in their browser
 * regardless — a logging failure must never stop someone refusing cookies.
 */
function recordServerSide(c: Consent, action: 'granted' | 'withdrawn') {
  try {
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        kind: 'cookies',
        action,
        subject_ref: subjectRef(),
        notice_version: c.version,
        granted: { analytics: c.analytics, marketing: c.marketing },
      }),
    }).catch(() => {})
  } catch { /* the choice still stands locally */ }
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
  // A decision that grants nothing is still a decision worth evidencing — being
  // able to show that someone REFUSED is the more useful half of the record.
  recordServerSide(consent, (choice.analytics || choice.marketing) ? 'granted' : 'withdrawn')

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
