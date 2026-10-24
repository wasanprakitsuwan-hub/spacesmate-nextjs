import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { TERMS_VERSION } from '@/lib/terms-consent'

/**
 * Has this account accepted the current Terms of Use and Privacy Policy?
 *
 * GET  → { accepted }. An email sign-up carries its tick in user metadata; the
 *        first GET turns that into a consent_records row, so the evidence is
 *        server-side rather than a field the user can edit later.
 * POST → records acceptance (Google sign-up, or the TermsGate prompt).
 *
 * Fails open. If the table cannot be read, the answer is "accepted": a broken
 * consent log must not lock every owner out of their dashboard. The failure is
 * logged loudly instead.
 */

type Granted = { terms: true; privacy: true; marketing: boolean; source: string }

async function hasRecord(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('consent_records')
    .select('notice_version')
    .eq('kind', 'signup_terms')
    .eq('user_id', userId)
    .eq('action', 'granted')
    .gte('notice_version', TERMS_VERSION)
    .limit(1)
  if (error) {
    console.error('[consent/signup] read failed —', error.message)
    return null
  }
  return (data?.length ?? 0) > 0
}

async function record(supabase: ReturnType<typeof createServerClient>, userId: string, granted: Granted): Promise<boolean> {
  const { error } = await supabase.from('consent_records').insert({
    kind: 'signup_terms',
    subject_ref: userId,
    user_id: userId,
    notice_version: TERMS_VERSION,
    granted,
    action: 'granted',
  })
  if (error) console.error('[consent/signup] insert failed —', error.message)
  return !error
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  const supabase = createServerClient()
  const has = await hasRecord(supabase, auth.id)
  if (has !== false) return NextResponse.json({ accepted: true })

  // Ticked on the email sign-up form → record it now.
  const { data } = await supabase.auth.admin.getUserById(auth.id)
  const meta = (data?.user?.user_metadata ?? {}) as Record<string, unknown>
  if (Number(meta.terms_version) >= TERMS_VERSION) {
    await record(supabase, auth.id, {
      terms: true, privacy: true, marketing: meta.marketing_opt_in === true, source: 'signup_email',
    })
    return NextResponse.json({ accepted: true })
  }

  return NextResponse.json({ accepted: false })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  const body = await req.json().catch(() => ({}))
  const source = ['signup_google', 'terms_gate'].includes(body.source) ? body.source : 'terms_gate'

  const supabase = createServerClient()
  if (await hasRecord(supabase, auth.id)) return NextResponse.json({ recorded: true })

  const ok = await record(supabase, auth.id, { terms: true, privacy: true, marketing: body.marketing === true, source })
  // 200 either way: the person has accepted in front of us, and a logging
  // failure (already in the server log) must not keep them behind the prompt.
  return NextResponse.json({ recorded: ok })
}
