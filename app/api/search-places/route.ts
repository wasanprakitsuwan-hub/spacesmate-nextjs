import { NextResponse } from 'next/server'
import { loadPlaceOverrides } from '@/lib/search-places-server'

/**
 * The admin's changes to the search place list, readable without a session.
 *
 * Public on purpose: /search needs it, and it holds only place names and
 * coordinates that the search box shows anyway. Only the changes travel; the
 * built-in station and landmark lists are already in the page bundle.
 */
export const revalidate = 300

export async function GET() {
  const data = await loadPlaceOverrides()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
