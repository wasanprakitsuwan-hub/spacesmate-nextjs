/**
 * Acceptance of the Terms of Use and Privacy Policy at sign-up, recorded in
 * consent_records (kind 'signup_terms') so it can be shown under PDPA s.19.
 *
 * Three ways in, one record:
 *   · email sign-up — the tick travels in the account's user metadata and is
 *     recorded the first time the owner signs in (GET /api/consent/signup);
 *   · Google — OAuth carries no metadata, so the tick waits in sessionStorage
 *     and is posted when the owner lands (flushPendingTerms);
 *   · anyone signed in with no record — Google from the login tab, accounts
 *     older than this — is asked once by TermsGate.
 *
 * Marketing is a separate, optional tick. PDPA does not allow it to ride on
 * acceptance of the terms.
 */

/** Bump when the terms or privacy notice change materially; everyone is asked again. */
export const TERMS_VERSION = 1

const PENDING_KEY = 'sm_terms_pending'

/** Signup metadata for supabase.auth.signUp({ options: { data } }). */
export function termsMetadata(marketing: boolean) {
  return {
    terms_version: TERMS_VERSION,
    terms_accepted_at: new Date().toISOString(),
    marketing_opt_in: marketing,
  }
}

/** Before a Google redirect: remember the tick until the owner lands. */
export function savePendingTerms(marketing: boolean) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ marketing })) } catch {}
}

/** After landing signed in: post a remembered tick, if any. */
export async function flushPendingTerms(token: string): Promise<void> {
  let pending: { marketing?: boolean } | null = null
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return
    sessionStorage.removeItem(PENDING_KEY)
    pending = JSON.parse(raw)
  } catch { return }
  await postTerms(token, !!pending?.marketing, 'signup_google')
}

export async function postTerms(token: string, marketing: boolean, source: string): Promise<boolean> {
  try {
    const res = await fetch('/api/consent/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ marketing, source }),
    })
    return res.ok
  } catch {
    return false
  }
}
