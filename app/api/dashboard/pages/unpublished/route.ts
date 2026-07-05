import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/pages/unpublished
// Returns list of unpublished page paths for middleware enforcement.
// Public endpoint (no auth needed) — returns paths only, no sensitive data.
// Cached 60s via Next.js cache.

export const revalidate = 60 // ISR-style: revalidate every 60 seconds

export async function GET() {
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
