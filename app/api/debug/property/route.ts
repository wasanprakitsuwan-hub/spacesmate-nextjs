import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Debug endpoint — hit with ?slug=บ้านใน-รัชดา-ซอย5-efa24722
// Returns exactly what Supabase has for that slug (ignores listing_status)
export async function GET(req: NextRequest) {
  const rawSlug = req.nextUrl.searchParams.get('slug') || ''
  const decoded = decodeURIComponent(rawSlug)

  const supabase = createServerClient()

  // Query 1: exact slug match, no status filter
  const { data: bySlug, error: e1 } = await supabase
    .from('properties')
    .select('id, slug, listing_status, title_th, expires_at, updated_at')
    .eq('slug', decoded)
    .maybeSingle()

  // Query 2: by title_th keyword (partial, to find the listing regardless of slug)
  const { data: byTitle, error: e2 } = await supabase
    .from('properties')
    .select('id, slug, listing_status, title_th, expires_at, updated_at')
    .ilike('title_th', '%รัชดา%')
    .limit(5)

  return NextResponse.json({
    rawSlug,
    decoded,
    bySlug: bySlug ?? null,
    error1: e1?.message ?? null,
    byTitle: byTitle ?? [],
    error2: e2?.message ?? null,
  })
}
