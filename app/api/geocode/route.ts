import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side proxy for Nominatim geocoding.
 * Avoids CORS issues and lets us set a proper User-Agent header.
 * Usage: GET /api/geocode?q=<address>
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '5')
    url.searchParams.set('countrycodes', 'th')
    url.searchParams.set('accept-language', 'th')

    const r = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SpacesMate/1.0 (wasan.prakitsuwan@gmail.com)',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // cache for 60s
    })

    if (!r.ok) {
      return NextResponse.json({ results: [] })
    }

    const data = await r.json()
    const results = data.map((item: any) => ({
      lat:          item.lat,
      lon:          item.lon,
      display_name: item.display_name,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Geocode proxy error:', err)
    return NextResponse.json({ results: [] })
  }
}
