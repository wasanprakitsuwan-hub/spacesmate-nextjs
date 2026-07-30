import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Public read of a small, named set of site settings.
 *
 * WHY THIS EXISTS
 *   /api/dashboard/settings reads any key out of site_settings with the
 *   service-role client. It needs to be admin-only. But one setting — the
 *   amenity list — is legitimately needed by people who are not admins: the
 *   public /submit form and the owner dashboard both render it in the listing
 *   form. Simply locking the dashboard route would make fetchAmenities() fall
 *   back to DEFAULT_AMENITIES for those users, which is the quiet kind of
 *   breakage: the form still renders, so nobody notices that the list an admin
 *   edits in Settings has silently stopped applying — exactly the bug
 *   lib/amenities.ts was written to fix.
 *
 *   So the public need gets its own door, opened only for keys named here.
 *
 * ADDING A KEY IS A SECURITY DECISION
 *   Everything in site_settings is world-readable the moment its key appears in
 *   PUBLIC_KEYS. Before adding one, check what is actually stored under it —
 *   email templates, SMTP details, API credentials and anything resembling a
 *   token do not belong on this list.
 */

const PUBLIC_KEYS = new Set([
  'amenities',      // rendered in the listing form by non-admin users
])

export const revalidate = 60

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  // Refuse unknown keys rather than falling through to a read. The response is
  // deliberately the same shape as a successful one so a caller that ignores
  // status codes still gets null instead of a partial object.
  if (!PUBLIC_KEYS.has(key)) {
    return NextResponse.json({ data: null, error: 'not a public setting' }, { status: 403 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ data: data?.value ?? null }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('[settings/public]', err instanceof Error ? err.message : String(err))
    // Callers fall back to their own defaults on null, so failing soft here is
    // correct — but it is logged, not swallowed.
    return NextResponse.json({ data: null }, { status: 500 })
  }
}
