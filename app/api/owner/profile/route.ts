import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

/**
 * Owner profile — phone number, and the name when the profile page sends it.
 *
 * WHY THIS IS A SERVER ROUTE AND NOT A CLIENT UPDATE
 *   user_profiles has RLS enabled and no visible UPDATE policy for the owning
 *   user. A client-side `.update()` against it does not error — it simply
 *   matches zero rows and reports success. That silent-write failure is the
 *   exact pattern that has already cost this project real bugs (rental charges,
 *   contact_line), so the write goes through the service role where it either
 *   works or says why.
 *
 * The user id comes from the verified token, never from the request body — the
 * caller cannot write to somebody else's profile.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()

    // Digits and a leading + only. Thai mobiles are 10 digits; allow a little
    // room either side for landlines and +66 international form.
    const clean = String(body.phone ?? '').replace(/[^\d+]/g, '')
    if (clean.length < 9 || clean.length > 15) {
      return NextResponse.json({ error: 'เบอร์โทรไม่ถูกต้อง' }, { status: 400 })
    }

    // The profile page sends the name as well; the dashboard prompt does not.
    const update: Record<string, string> = { phone: clean, updated_at: new Date().toISOString() }
    if (typeof body.full_name === 'string') {
      const name = body.full_name.trim().slice(0, 100)
      if (!name) return NextResponse.json({ error: 'กรุณากรอกชื่อ' }, { status: 400 })
      update.full_name = name
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('user_profiles')
      .update(update)
      .eq('id', auth.id)

    if (error) {
      console.error('[owner/profile] phone update failed —', error.message)
      return NextResponse.json({ error: 'บันทึกไม่สำเร็จ' }, { status: 500 })
    }

    return NextResponse.json({ success: true, phone: clean })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[owner/profile] error —', msg)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
