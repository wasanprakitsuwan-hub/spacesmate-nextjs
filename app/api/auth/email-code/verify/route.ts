import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { requireAuth, isErr } from '@/lib/auth-guard'
import { createServerClient } from '@/lib/supabase'
import { hashCode, MAX_ATTEMPTS } from '@/lib/email-verify'

/** POST /api/auth/email-code/verify { code } → { ok } or { error: 'wrong' | 'too_many' } */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  let code = ''
  try { code = String((await req.json())?.code ?? '').replace(/\D/g, '') } catch {}
  if (code.length !== 6) return NextResponse.json({ error: 'wrong' }, { status: 400 })

  const supabase = createServerClient()
  const { data: row } = await supabase
    .from('owner_email_verification')
    .select('code_hash, code_expires_at, attempts, verified_at, email')
    .eq('user_id', auth.id)
    .maybeSingle()

  if (row?.verified_at) return NextResponse.json({ ok: true })
  if (!row?.code_hash || !row.code_expires_at || Date.parse(row.code_expires_at) < Date.now()) {
    return NextResponse.json({ error: 'wrong' }, { status: 400 })
  }
  if ((row.attempts ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 })
  }
  // The code was sent to the email the account had then; a changed email
  // needs a new code.
  if (row.email !== auth.email) return NextResponse.json({ error: 'wrong' }, { status: 400 })

  const a = Buffer.from(hashCode(auth.id, code))
  const b = Buffer.from(row.code_hash)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await supabase.from('owner_email_verification')
      .update({ attempts: (row.attempts ?? 0) + 1 })
      .eq('user_id', auth.id)
    return NextResponse.json({ error: 'wrong' }, { status: 400 })
  }

  await supabase.from('owner_email_verification')
    .update({ verified_at: new Date().toISOString(), code_hash: null, code_expires_at: null })
    .eq('user_id', auth.id)
  return NextResponse.json({ ok: true })
}
