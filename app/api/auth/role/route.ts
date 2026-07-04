import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

// GET /api/auth/role
// Returns the role of the currently authenticated user.
// Uses service role to bypass RLS — safe because we verify the JWT first.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ role: null }, { status: 401 })

    // Verify the token and get the user via anon client
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: { user }, error: userErr } = await anonClient.auth.getUser(token)
    if (userErr || !user) return NextResponse.json({ role: null }, { status: 401 })

    // Use service role to read the profile — bypasses any RLS policies
    const service = createServerClient()
    const { data: profile } = await service
      .from('user_profiles')
      .select('role, status, full_name, phone, active_package, package_expires_at')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      role:               profile?.role               ?? null,
      status:             profile?.status             ?? 'active',
      userId:             user.id,
      full_name:          profile?.full_name           ?? null,
      phone:              profile?.phone               ?? null,
      active_package:     profile?.active_package      ?? null,
      package_expires_at: profile?.package_expires_at  ?? null,
    })
  } catch (err: any) {
    return NextResponse.json({ role: null, error: err.message }, { status: 500 })
  }
}
