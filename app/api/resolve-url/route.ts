import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side short URL resolver.
 * Used by MapPicker to expand maps.app.goo.gl links before parsing coordinates.
 * Only resolves Google Maps domains to prevent SSRF abuse.
 * Usage: GET /api/resolve-url?url=<encoded_url>
 */

// Allowlist — only Google Maps short-link domains
const ALLOWED_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'www.google.com']

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  // SSRF guard — only allow Google Maps domains
  let parsedHost: string
  try {
    parsedHost = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedHost)) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 400 })
  }

  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'SpacesMate/1.0 (wasan.prakitsuwan@gmail.com)',
      },
    })
    return NextResponse.json({ resolved: r.url })
  } catch (err) {
    console.error('resolve-url error:', err)
    return NextResponse.json({ error: 'Failed to resolve URL' }, { status: 500 })
  }
}
