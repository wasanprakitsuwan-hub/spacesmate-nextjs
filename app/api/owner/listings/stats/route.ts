import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAuth, isErr } from '@/lib/auth-guard'

/**
 * GET /api/owner/listings/stats?id=<property id>
 *
 * The owner's own numbers for one listing: totals for 7 days, 30 days and all
 * time, and the last 30 days day by day (missing days filled with zeros, so
 * the chart has no gaps). Owners see only listings they own.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErr(auth)) return auth

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: listing } = await supabase.from('properties').select('id, landlord_id').eq('id', id).maybeSingle()
  if (!listing || listing.landlord_id !== auth.id) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('listing_stats_daily')
    .select('day, views, line_clicks, phone_clicks')
    .eq('property_id', id)
    .order('day', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  // Bangkok calendar days, matching how bump_listing_stat dates each count.
  const today = new Date(Date.now() + 7 * 3600_000)
  const dayStr = (offset: number) => {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const byDay = new Map(rows.map(r => [r.day as string, r]))
  const daily = Array.from({ length: 30 }, (_, i) => {
    const day = dayStr(29 - i)
    const r = byDay.get(day)
    return { day, views: r?.views ?? 0, line: r?.line_clicks ?? 0, phone: r?.phone_clicks ?? 0 }
  })

  const sum = (since: string | null) => rows
    .filter(r => !since || (r.day as string) >= since)
    .reduce((t, r) => ({ views: t.views + r.views, line: t.line + r.line_clicks, phone: t.phone + r.phone_clicks }), { views: 0, line: 0, phone: 0 })

  return NextResponse.json({
    totals: { d7: sum(dayStr(6)), d30: sum(dayStr(29)), all: sum(null) },
    daily,
  })
}
