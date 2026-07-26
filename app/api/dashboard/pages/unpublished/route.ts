import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/pages/unpublished
// Returns list of unpublished page paths for middleware enforcement.
// Public endpoint (no auth needed) — returns paths only, no sensitive data.
// Cached 60s via Next.js cache.

export const revalidate = 60 // ISR-style: revalidate every 60 seconds

export async function GET(req: NextRequest) {
  // This is the one route middleware calls on every request, so it cannot use
  // requireAdmin — guarding it would take the site down. Instead it accepts a
  // shared secret, and only enforces it when INTERNAL_API_SECRET is configured.
  // Unset, behaviour is unchanged; set it in Vercel and middleware starts sending
  // it, closing the endpoint to the public.
  const expected = process.env.INTERNAL_API_SECRET
  if (expected && req.headers.get('x-internal-secret') !== expected) {
    return NextResponse.json({ paths: [] }, { status: 403 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('site_pages')
      .select('path')
      .eq('status', 'unpublished')

    if (error) throw error

    const paths = (data ?? []).map((r: { path: string }) => r.path)
    return NextResponse.json({ paths }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch {
    // On error, return empty (fail open — don't block pages on DB error)
    return NextResponse.json({ paths: [] })
  }
}
