import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * The building-name registry, readable without a session.
 *
 * WHY IT LIVES HERE AND NOT UNDER /api/dashboard
 *   BuildingAutocomplete renders inside SharedListingForm, which is used by the
 *   public /submit page and the owner dashboard as well as by admins. It needs
 *   this list, so the list has to be readable without an admin token.
 *
 *   It used to read /api/dashboard/property-names, which meant one handler under
 *   /api/dashboard could not be guarded — and a rule with one exception is not a
 *   rule you can audit against. Now every handler under /api/dashboard requires
 *   a session, and the public need is served from a public path where being open
 *   is the stated intent rather than an oversight.
 *
 * WHAT IT EXPOSES
 *   Building names and slugs only. These already appear on public listing pages,
 *   so nothing here is disclosed that a visitor cannot already see. No owner,
 *   contact, address or price data — and it must stay that way.
 */

export const revalidate = 300

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('property_names')
      .select('id, name_th, name_en, slug')
      .order('name_th', { ascending: true })

    if (error) throw error

    return NextResponse.json({ names: data ?? [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    console.error('[property-names]', err instanceof Error ? err.message : String(err))
    // The autocomplete degrades to a free-text field, so an empty list is a
    // survivable answer — but it is logged rather than silently returned.
    return NextResponse.json({ names: [] }, { status: 500 })
  }
}
