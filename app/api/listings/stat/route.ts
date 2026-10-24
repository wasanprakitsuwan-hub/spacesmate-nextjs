import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Count one view or contact click on a public listing — ListingStatBeacon.
 *
 * Public by necessity: visitors have no session. What keeps the numbers
 * honest enough for an owner's dashboard:
 *   · known crawlers are dropped by user agent (they are most raw traffic)
 *   · only active listings count
 *   · the browser counts a view once per tab session (see the beacon)
 * It is not fraud-proof and does not need to be: nothing is billed on it.
 */
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless|python|curl|wget|axios|node-fetch/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 })

  let body: { id?: string; kind?: string }
  try { body = JSON.parse(await req.text()) } catch { return new NextResponse(null, { status: 400 }) }
  const { id, kind } = body
  if (!id || !UUID.test(id) || !['view', 'line', 'phone'].includes(kind ?? '')) {
    return new NextResponse(null, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { data: listing } = await supabase
      .from('properties')
      .select('id')
      .eq('id', id)
      .eq('listing_status', 'active')
      .maybeSingle()
    if (!listing) return new NextResponse(null, { status: 204 })

    const { error } = await supabase.rpc('bump_listing_stat', { p_property: id, p_kind: kind })
    if (error) console.error('[listing-stat]', error.message)
  } catch (err) {
    console.error('[listing-stat]', err instanceof Error ? err.message : String(err))
  }
  // Never an error to the visitor's browser: a lost count is not their problem.
  return new NextResponse(null, { status: 204 })
}
