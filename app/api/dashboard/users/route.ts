import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ── GET — all registered users with listing counts ────────────────────────────
export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch all user profiles
    const { data: profiles, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (profErr) throw profErr

    // Fetch listing counts grouped by landlord_id from properties table
    const { data: listingCounts, error: lcErr } = await supabase
      .from('properties')
      .select('landlord_id, listing_status')

    if (lcErr) throw lcErr

    // Aggregate counts per user
    const countMap: Record<string, { total: number; active: number; pending: number; expired: number }> = {}
    for (const p of listingCounts ?? []) {
      const uid = p.landlord_id
      if (!uid) continue
      if (!countMap[uid]) countMap[uid] = { total: 0, active: 0, pending: 0, expired: 0 }
      countMap[uid].total++
      if (p.listing_status === 'active')   countMap[uid].active++
      if (p.listing_status === 'pending')  countMap[uid].pending++
      if (p.listing_status === 'expired')  countMap[uid].expired++
    }

    const users = (profiles ?? []).map(p => ({
      id:         p.id,
      email:      p.email,
      full_name:  p.full_name,
      role:       p.role ?? 'landlord',
      created_at: p.created_at,
      updated_at: p.updated_at,
      listings:   countMap[p.id] ?? { total: 0, active: 0, pending: 0, expired: 0 },
    }))

    const totalListings = users.reduce((s, u) => s + u.listings.total, 0)

    return NextResponse.json({ users, totalListings })
  } catch (err: any) {
    console.error('dashboard/users GET error:', err)
    return NextResponse.json({ users: [], totalListings: 0, error: err.message }, { status: 500 })
  }
}

// ── PATCH — change a user's role ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json()
    if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 })
    if (!['admin', 'landlord'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('dashboard/users PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
