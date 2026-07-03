import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// ── GET — fetch one setting by ?key= or all settings ─────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const key = req.nextUrl.searchParams.get('key')

    if (key) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle()
      if (error) throw error
      return NextResponse.json({ data: data?.value ?? null })
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
    if (error) throw error

    const settings: Record<string, unknown> = {}
    for (const row of data ?? []) {
      settings[row.key] = row.value
    }
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('settings GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// ── PATCH — upsert a setting by key ──────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('settings PATCH error:', detail)
    // Return the actual DB error so the dashboard can show it (dev-friendly)
    return NextResponse.json({ error: 'Failed to save settings', detail }, { status: 500 })
  }
}
