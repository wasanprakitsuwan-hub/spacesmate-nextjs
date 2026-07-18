import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// POST /api/dashboard/users/resend-confirmation
// Body: { id: string }
// Resends the email confirmation link for a user who never confirmed their email.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()

    // Look up the user's email
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (profErr || !profile?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use Supabase Auth REST API directly to resend signup confirmation OTP
    // (supabase.auth.admin.generateLink requires a password for type:'signup';
    //  the /auth/v1/resend endpoint works without one)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/resend`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        body: JSON.stringify({ type: 'signup', email: profile.email }),
      }
    )

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.message ?? `Supabase resend failed (${res.status})`)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('resend-confirmation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
