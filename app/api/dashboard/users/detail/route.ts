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

    // Fetch user profile — query both column names for compatibility
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, full_name, phone, role, status, package_type, package_expires_at, stripe_subscription_id, created_at, updated_at')
      .eq('id', id)
      .single()

    if (profErr || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch all listings for this user with full detail
    const { data: listings, error: listErr } = await supabase
      .from('properties')
      .select('id, title_th, title_en, slug, property_type, listing_status, package_type, created_at, expires_at, district, province')
      .eq('landlord_id', id)
      .order('created_at', { ascending: false })

    if (listErr) throw listErr

    // Derive package: user_profiles.package_type is source of truth.
    // Fallback: use most recent active listing's package_type if profile field is null
    // (happens when Stripe webhook profile sync missed the user or ran before profile existed)
    const profilePackage = (profile as any).package_type ?? null
    const derivedPackage = profilePackage ?? (() => {
      const withPkg = (listings ?? []).filter((l: any) => l.package_type)
      const active  = withPkg.find((l: any) => l.listing_status === 'active')
      return active?.package_type ?? withPkg[0]?.package_type ?? null
    })()

    // Derive expiry: same fallback logic
    const profileExpiry = (profile as any).package_expires_at ?? null
    const derivedExpiry = profileExpiry ?? (() => {
      const withExpiry = (listings ?? []).filter((l: any) => l.expires_at && l.package_type)
      const active     = withExpiry.find((l: any) => l.listing_status === 'active')
      return active?.expires_at ?? withExpiry[0]?.expires_at ?? null
    })()

    return NextResponse.json({
      profile: {
        ...profile,
        // Expose as active_package for frontend compatibility
        active_package:    derivedPackage,
        package_expires_at: derivedExpiry,
        display_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.full_name || profile.email,
      },
      listings: (listings ?? []).map((l: any) => ({
        ...l,
        // Map to frontend interface field names
        address_district: l.district ?? null,
        address_province: l.province ?? null,
      })),
    })
  } catch (err: any) {
    console.error('dashboard/users/detail GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
