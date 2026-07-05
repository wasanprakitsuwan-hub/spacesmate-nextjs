import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// GET /api/dashboard/pages — all pages (exclude deleted)
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .neq('status', 'deleted')
      .order('group_name', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ pages: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ pages: [], error: err.message }, { status: 500 })
  }
}

// PATCH /api/dashboard/pages — update a page by id
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('site_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/dashboard/pages?id=xxx — soft delete (status = deleted)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('site_pages')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/dashboard/pages/unpublished — list of paths that are unpublished
// Used by middleware to block access. Public endpoint (no auth) — returns paths only.
export async function HEAD() {
  // Used by middleware to check cache freshness
  return NextResponse.json({}, { status: 200 })
}
