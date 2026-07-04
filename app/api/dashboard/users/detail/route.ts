import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// GET /api/dashboard/users/detail?id=xxx
// Returns full user profile + all their listings with package/expiry detail
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()

    // Fetch user profile
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, full_name, phone, role, status, active_package, package_expires_at, created_at, updated_at')
      .eq('id', id)
      .single()

    if (profErr || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch all listings for this user with full detail
    const { data: listings, error: listErr } = await supabase
      .from('properties')
      .select('id, title_th, title_en, slug, property_type, listing_status, package_type, created_at, expires_at, address_district, address_province')
      .eq('landlord_id', id)
      .order('created_at', { ascending: false })

    if (listErr) throw listErr

    return NextResponse.json({
      profile: {
        ...profile,
        display_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.full_name || profile.email,
      },
      listings: listings ?? [],
    })
  } catch (err: any) {
    console.error('dashboard/users/detail GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
