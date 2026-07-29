import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { createServerClient } from '@/lib/supabase'

/**
 * Dashboard figures.
 *
 * TWO POPULATIONS, KEPT APART
 *   `properties`  — real live listings on the site. This is the business.
 *   `submissions` — the queue from the public /ลงประกาศ form, awaiting review.
 *
 *   These used to be mixed inside a single card: the "ประกาศตามประเภท" heading
 *   showed a submissions total above bars drawn from properties, so the bars
 *   never added up to the number printed beside them. Anything derived from
 *   properties now lives in `listings`, anything from the review queue in
 *   `queue`, and no card reads from both.
 *
 * ERRORS ARE NOT ZEROS
 *   supabase-js does not throw on a failed query — it returns { data, error }.
 *   The previous version destructured only `count`, so a permission error or a
 *   renamed column produced count = null, became 0 through `?? 0`, and was
 *   reported to the dashboard as fact. Every query below is checked, and one
 *   failure fails the whole response. A dashboard that cannot read its data
 *   should say so, not quietly claim the business has nothing in it.
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

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // ── The review queue (submissions) ───────────────────────────────────────
    const [qTotal, qPending, qApproved, qRejected, qThisMonth, qTypes, qRecent] = await Promise.all([
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('submissions').select('type'),
      supabase.from('submissions')
        .select('id, title, type, status, contact_name, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    must('submissions total',    qTotal)
    must('submissions pending',  qPending)
    must('submissions approved', qApproved)
    must('submissions rejected', qRejected)
    must('submissions month',    qThisMonth)
    must('submissions types',    qTypes)
    must('submissions recent',   qRecent)

    // ── The live site (properties) ───────────────────────────────────────────
    // One read, counted in code. Three separate count queries over the same
    // rows would be three chances for the numbers to disagree with each other.
    const live = must('properties', await supabase
      .from('properties')
      .select('id, property_type, landlord_id, updated_at, created_at')
      .eq('listing_status', 'active'))

    const rows = (live.data ?? []) as Array<{
      property_type: string | null
      landlord_id: string | null
      updated_at: string | null
      created_at: string | null
    }>

    // DB stores lowercase; the dashboard renders capitalised keys.
    const DISPLAY: Record<string, string> = {
      condo: 'Condo', apartment: 'Apartment', house: 'House',
      office: 'Office', coworking: 'Coworking',
    }

    const listingsByType: Record<string, number> = {}
    const owners = new Set<string>()
    let staleCount = 0

    for (const r of rows) {
      const key = DISPLAY[String(r.property_type ?? '').toLowerCase()] ?? 'Other'
      listingsByType[key] = (listingsByType[key] || 0) + 1

      if (r.landlord_id) owners.add(r.landlord_id)

      // Never edited since creation still counts as stale once it is old
      // enough — falling back to created_at stops a listing that was posted and
      // then forgotten from looking permanently fresh.
      const touched = r.updated_at ?? r.created_at
      if (touched && new Date(touched) < sixMonthsAgo) staleCount++
    }

    const queueByType: Record<string, number> = {}
    for (const r of (qTypes.data ?? []) as Array<{ type: string | null }>) {
      const t = r.type || 'Other'
      queueByType[t] = (queueByType[t] || 0) + 1
    }

    return NextResponse.json({
      // Live listings
      activeListings: rows.length,
      listingsByType,
      staleCount,
      uniqueUsers: owners.size,

      // Review queue
      total:     qTotal.count ?? 0,
      pending:   qPending.count ?? 0,
      approved:  qApproved.count ?? 0,
      rejected:  qRejected.count ?? 0,
      thisMonth: qThisMonth.count ?? 0,
      byType:    queueByType,
      recentActivity: qRecent.data ?? [],
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
