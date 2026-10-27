import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { createServerClient } from '@/lib/supabase'

/**
 * Dashboard figures, all from `properties` — the live listings.
 *
 * The overview used to report a second population too: `submissions`, the
 * review queue of the retired public /ลงประกาศ form. Listings now publish
 * themselves on payment, so that queue only held old rejected rows and its
 * "รออนุมัติ" counts described a process the site no longer has. Removed
 * 27 Oct 2026 along with /dashboard/enquiries.
 *
 * ERRORS ARE NOT ZEROS
 *   supabase-js does not throw on a failed query — it returns { data, error }.
 *   Every query below is checked, and one failure fails the whole response. A
 *   dashboard that cannot read its data should say so, not quietly claim the
 *   business has nothing in it.
 */

/** Unwrap a Supabase result, turning a returned error into a thrown one. */
function must<T>(label: string, res: { data?: T; count?: number | null; error: unknown }) {
  if (res.error) {
    const msg = (res.error as { message?: string })?.message ?? String(res.error)
    throw new Error(`${label}: ${msg}`)
  }
  return res
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const supabase = createServerClient()

    const now = Date.now()
    // "This month" is the Bangkok calendar month, as on the revenue page.
    const bkk = new Date(now + 7 * 3600000)
    const monthStart = Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), 1) - 7 * 3600000

    // One read, counted in code, so the numbers cannot disagree with each other.
    const all = must('properties', await supabase
      .from('properties')
      .select('id, slug, title_th, property_type, listing_status, landlord_id, expires_at, created_at')
      .order('created_at', { ascending: false }))

    const rows = (all.data ?? []) as Array<{
      id: string
      slug: string | null
      title_th: string | null
      property_type: string | null
      listing_status: string | null
      landlord_id: string | null
      expires_at: string | null
      created_at: string | null
    }>

    const listingsByType: Record<string, number> = {}
    const owners = new Set<string>()
    let active = 0, expiringSoon = 0, newThisMonth = 0

    for (const r of rows) {
      const exp = r.expires_at ? new Date(r.expires_at).getTime() : null
      const live = r.listing_status === 'active' && (exp === null || exp > now)
      if (r.created_at && new Date(r.created_at).getTime() >= monthStart) newThisMonth++
      if (!live) continue
      active++
      const key = String(r.property_type ?? '').toLowerCase() || 'other'
      listingsByType[key] = (listingsByType[key] || 0) + 1
      if (r.landlord_id) owners.add(r.landlord_id)
      if (exp !== null && exp - now < 7 * 86400000) expiringSoon++
    }

    return NextResponse.json({
      activeListings: active,
      listingsByType,
      uniqueUsers: owners.size,
      expiringSoon,
      newThisMonth,
      recentListings: rows.slice(0, 6),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[dashboard/stats]', message)
    // Deliberately no zero-filled payload here. Returning a complete-looking
    // object on failure is what let this screen show fiction for weeks.
    return NextResponse.json(
      { error: 'ไม่สามารถอ่านข้อมูลสถิติได้', detail: message },
      { status: 500 },
    )
  }
}
