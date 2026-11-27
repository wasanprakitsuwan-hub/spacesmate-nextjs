/**
 * Has this owner proved their email? Checked before the first payment.
 *
 * WHY THE CHECK MOVED HERE
 *   Supabase "Confirm email" made owners click a link before they could save
 *   anything. In Facebook's in-app browser that link opens elsewhere, the new
 *   session lands in a different browser, and the draft they typed is gone.
 *   With that switch off, owners sign up and save at once; the proof of email
 *   is asked for only before money changes hands (/checkout), as a 6-digit
 *   code typed back into the same page. SM299 makes the first payment ฿0, so
 *   payment alone proves nothing.
 *
 * AN OWNER COUNTS AS VERIFIED WHEN ANY OF THESE HOLDS
 *   · they entered a code (owner_email_verification.verified_at)
 *   · they signed in with Google, which only hands over verified addresses
 *   · Supabase confirmed the email by link: email_confirmed_at is set AND a
 *     confirmation was sent. With "Confirm email" off Supabase confirms
 *     automatically and sends nothing, so confirmation_sent_at stays empty
 *     for those accounts and they are asked for a code. Everyone who signed
 *     up before the switch passes on this rule, so nobody existing is asked.
 *
 * Fails open (verified) if the lookup itself errors, e.g. the migration has
 * not run: blocking every payment over a missing table costs more than one
 * unverified ฿0 purchase.
 */
import { createHash, randomInt } from 'node:crypto'
import { createServerClient } from '@/lib/supabase'

export const CODE_TTL_MS = 15 * 60_000
export const RESEND_GAP_MS = 60_000
export const MAX_ATTEMPTS = 5

export function hashCode(userId: string, code: string) {
  return createHash('sha256').update(`${userId}:${code}`).digest('hex')
}

export function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

type AdminUser = {
  email?: string
  email_confirmed_at?: string | null
  confirmation_sent_at?: string | null
  app_metadata?: { provider?: string; providers?: string[] }
  identities?: { provider?: string }[] | null
}

export function providerVerified(u: AdminUser): boolean {
  const providers = [
    u.app_metadata?.provider,
    ...(u.app_metadata?.providers ?? []),
    ...(u.identities ?? []).map(i => i.provider),
  ]
  if (providers.includes('google')) return true
  return !!(u.email_confirmed_at && u.confirmation_sent_at)
}

export async function isOwnerVerified(userId: string): Promise<boolean> {
  if (userId === 'automation') return true
  try {
    const supabase = createServerClient()
    const { data: row, error } = await supabase
      .from('owner_email_verification')
      .select('verified_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (!error && row?.verified_at) return true

    const { data, error: uErr } = await supabase.auth.admin.getUserById(userId)
    if (uErr || !data?.user) return true   // fail open, see above
    if (providerVerified(data.user as AdminUser)) return true

    // Table missing (migration not run yet) and the account is not otherwise
    // proven: fail open rather than refuse every payment.
    if (error) return true
    return false
  } catch {
    return true
  }
}
