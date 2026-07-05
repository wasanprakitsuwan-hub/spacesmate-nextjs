import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// ── GET — users list, filtered by callerRole ──────────────────────────────────
// super_admin  → sees all users (super_admin, admin, landlord)
// admin        → sees only landlord users
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const supabase    = createServerClient()
    // Role comes from verified JWT — never trust client query params
    const callerRole  = auth.role

    // Build query — super_admin sees everyone, admin sees only landlords
    let query = supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, full_name, phone, role, status, package_type, package_expires_at, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (callerRole === 'admin') {
      query = query.eq('role', 'landlord')
    }

    const { data: profiles, error: profErr } = await query
    if (profErr) throw profErr

    // Fetch listing counts + package from properties
    const { data: listings, error: lcErr } = await supabase
      .from('properties')
      .select('landlord_id, listing_status, package_type, created_at')

    if (lcErr) throw lcErr

    // Aggregate per user — counts + most recent package
    const aggMap: Record<string, {
      total: number; active: number; pending: number; expired: number; package: string | null; lastListing: string | null
    }> = {}

    for (const p of listings ?? []) {
      const uid = p.landlord_id
      if (!uid) continue
      if (!aggMap[uid]) aggMap[uid] = { total: 0, active: 0, pending: 0, expired: 0, package: null, lastListing: null }
      aggMap[uid].total++
      if (p.listing_status === 'active')  aggMap[uid].active++
      if (p.listing_status === 'pending') aggMap[uid].pending++
      if (p.listing_status === 'expired') aggMap[uid].expired++
      // Track most recent package
      if (!aggMap[uid].lastListing || p.created_at > aggMap[uid].lastListing!) {
        aggMap[uid].lastListing = p.created_at
        aggMap[uid].package     = p.package_type ?? null
      }
    }

    const users = (profiles ?? []).map(p => {
      // Derive display name: prefer first+last, fallback to full_name
      const displayName = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name || null
      const agg = aggMap[p.id] ?? { total: 0, active: 0, pending: 0, expired: 0, package: null }
      return {
        id:                  p.id,
        email:               p.email,
        first_name:          p.first_name        ?? null,
        last_name:           p.last_name         ?? null,
        full_name:           displayName,
        phone:               p.phone             ?? null,
        role:                p.role              ?? 'landlord',
        status:              p.status            ?? 'active',
        package:             agg.package,
        package_type:        (p as any).package_type        ?? null,
        package_expires_at:  (p as any).package_expires_at ?? null,
        created_at:          p.created_at,
        updated_at:          p.updated_at,
        listings:            { total: agg.total, active: agg.active, pending: agg.pending, expired: agg.expired },
      }
    })

    const totalListings = users.reduce((s, u) => s + u.listings.total, 0)
    return NextResponse.json({ users, totalListings, callerRole })
  } catch (err: any) {
    console.error('dashboard/users GET error:', err)
    return NextResponse.json({ users: [], totalListings: 0, error: err.message }, { status: 500 })
  }
}

// ── DELETE — permanently remove a user (super_admin only) ────────────────────
// Steps: (1) unpublish their listings, (2) delete user_profile row,
//         (3) delete Supabase Auth record. Cannot delete own account.
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  if (auth.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (id === auth.id) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })

    const supabase = createServerClient()

    // 1. Unpublish all listings owned by this user
    await supabase
      .from('properties')
      .update({ listing_status: 'inactive' })
      .eq('landlord_id', id)

    // 2. Delete the user_profile row
    await supabase.from('user_profiles').delete().eq('id', id)

    // 3. Hard-delete from Supabase Auth (requires service role)
    const { error: authErr } = await supabase.auth.admin.deleteUser(id)
    if (authErr) throw authErr

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('dashboard/users DELETE error:', err)
    return NextResponse.json({ error: err.message ?? 'Delete failed' }, { status: 500 })
  }
}

// ── PATCH — update user profile fields ───────────────────────────────────────
// Fields: first_name, last_name, phone, role (super_admin only for role)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { id, first_name, last_name, phone, role, status, package_type, package_expires_at } = body
    // Role authorization from verified JWT — never trust client body
    const callerRole = auth.role

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Validate role changes
    const validRoles = ['landlord', 'admin', 'super_admin']
    if (role !== undefined) {
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      // Only super_admin can change roles
      if (callerRole !== 'super_admin') {
        return NextResponse.json({ error: 'Insufficient permissions to change role' }, { status: 403 })
      }
    }

    // Validate status changes — super_admin only
    if (status !== undefined) {
      if (!['active', 'suspended'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      if (callerRole !== 'super_admin') {
        return NextResponse.json({ error: 'Insufficient permissions to change status' }, { status: 403 })
      }
      // Cannot suspend yourself
      if (id === auth.id) {
        return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
      }
    }

    const supabase = createServerClient()

    // Validate package changes — super_admin only
    if ((package_type !== undefined || package_expires_at !== undefined) && callerRole !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions to change package' }, { status: 403 })
    }

    // Build update payload — only include provided fields
    const updates: Record<string, string> = {}
    if (first_name          !== undefined) updates.first_name          = first_name
    if (last_name           !== undefined) updates.last_name           = last_name
    if (phone               !== undefined) updates.phone               = phone
    if (role                !== undefined) updates.role                = role
    if (status              !== undefined) updates.status              = status
    if (package_type        !== undefined) updates.package_type        = package_type
    if (package_expires_at  !== undefined) updates.package_expires_at  = package_expires_at

    // Also keep full_name in sync
    if (first_name !== undefined || last_name !== undefined) {
      // Fetch current values to fill in missing parts
      const { data: cur } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', id)
        .single()
      const fn = first_name ?? cur?.first_name ?? ''
      const ln = last_name  ?? cur?.last_name  ?? ''
      updates.full_name = [fn, ln].filter(Boolean).join(' ') || updates.full_name
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('dashboard/users PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
