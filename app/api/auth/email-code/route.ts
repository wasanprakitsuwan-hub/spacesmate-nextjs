import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { createServerClient } from '@/lib/supabase'
import { sendEmailCode } from '@/lib/email'
import { isOwnerVerified, newCode, hashCode, CODE_TTL_MS, RESEND_GAP_MS } from '@/lib/email-verify'

/**
 * GET  /api/auth/email-code  → { verified, email }
 * POST /api/auth/email-code  → emails a fresh 6-digit code (one a minute)
 *
 * See lib/email-verify for why this exists. The code goes to the account's
 * own email, never to an address from the request.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth
  return NextResponse.json({ verified: await isOwnerVerified(auth.id), email: auth.email })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth
  if (!auth.email) return NextResponse.json({ error: 'no_email' }, { status: 400 })
  if (await isOwnerVerified(auth.id)) return NextResponse.json({ ok: true, verified: true })

  const supabase = createServerClient()
  const { data: row } = await supabase
    .from('owner_email_verification')
    .select('sent_at')
    .eq('user_id', auth.id)
    .maybeSingle()
  if (row?.sent_at && Date.now() - Date.parse(row.sent_at) < RESEND_GAP_MS) {
    const wait = Math.ceil((RESEND_GAP_MS - (Date.now() - Date.parse(row.sent_at))) / 1000)
    return NextResponse.json({ error: 'too_soon', retry_after: wait }, { status: 429 })
  }

  const code = newCode()
  const now = new Date()
  const { error } = await supabase.from('owner_email_verification').upsert({
    user_id: auth.id,
    email: auth.email,
    code_hash: hashCode(auth.id, code),
    code_expires_at: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
    attempts: 0,
    sent_at: now.toISOString(),
  })
  if (error) {
    console.error('[email-code] store failed:', error.message)
    return NextResponse.json({ error: 'store_failed' }, { status: 500 })
  }

  const sent = await sendEmailCode(auth.email, code)
  if (!sent) return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  return NextResponse.json({ ok: true, email: auth.email })
}
