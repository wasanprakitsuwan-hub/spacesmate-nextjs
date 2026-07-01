import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// ── GET — fetch all location requests (admin only) ───────────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('location_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) throw error

    // Map snake_case DB cols → camelCase for the client
    const requests = (data ?? []).map(r => ({
      id:          r.id,
      text:        r.text,
      type:        r.type,
      submittedBy: r.submitted_by ?? '',
      submittedAt: (r.submitted_at ?? '').split('T')[0],
      status:      r.status,
    }))

    return NextResponse.json({ requests })
  } catch (err) {
    console.error('location-requests GET error:', err)
    return NextResponse.json({ requests: [] }, { status: 500 })
  }
}

// ── PATCH — approve or reject a request ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('location_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('location-requests PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}

// ── POST — submit a new location/project request (public) ────────────────────
export async function POST(req: NextRequest) {
  try {
    const { text, type, submitted_by } = await req.json()
    if (!text || !type) {
      return NextResponse.json({ error: 'text and type are required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('location_requests')
      .insert({ text, type, submitted_by: submitted_by ?? null, status: 'pending' })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('location-requests POST error:', err)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
