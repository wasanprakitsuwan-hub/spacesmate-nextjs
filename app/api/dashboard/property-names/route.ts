import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'
import { inThailand } from '@/lib/search-places'

/**
 * The optional search fields: coordinates (both or neither, inside Thailand),
 * aliases and the show-in-search switch. Only keys present in the body are
 * returned, so a rename from an older client leaves them untouched.
 */
function placeFields(b: Record<string, unknown>): { fields: Record<string, unknown> } | { error: string } {
  const fields: Record<string, unknown> = {}
  if ('lat' in b || 'lng' in b) {
    const empty = (v: unknown) => v === null || v === undefined || v === ''
    if (empty(b.lat) && empty(b.lng)) { fields.lat = null; fields.lng = null }
    else {
      const lat = Number(b.lat), lng = Number(b.lng)
      if (!isFinite(lat) || !isFinite(lng) || !inThailand(lat, lng)) return { error: 'พิกัดไม่ถูกต้อง' }
      fields.lat = lat; fields.lng = lng
    }
  }
  if (Array.isArray(b.aliases)) {
    const a = b.aliases.map(x => String(x).trim()).filter(Boolean).slice(0, 20)
    fields.aliases = a.length ? a : null
  }
  if ('hidden' in b) fields.hidden = !!b.hidden
  return { fields }
}

// GET /api/dashboard/property-names — list all property names (public for autocomplete)
// POST /api/dashboard/property-names — add new name (admin+)
// PATCH /api/dashboard/property-names — update name (admin+)
// DELETE /api/dashboard/property-names?id=xxx — delete (super_admin only)

/**
 * GUARDED. The listing form's autocomplete reads /api/property-names instead —
 * a deliberately public route serving names and slugs only. Keeping this one
 * guarded means every handler under /api/dashboard requires a session, which is
 * what makes the audit in the commit message worth trusting.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('property_names')
      .select('id, name_th, name_en, slug, lat, lng, aliases, hidden, created_at, updated_at')
      .order('name_th', { ascending: true })

    if (error) throw error
    return NextResponse.json({ names: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ names: [], error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { name_th, name_en } = body
    if (!name_th?.trim()) return NextResponse.json({ error: 'name_th required' }, { status: 400 })
    const pf = placeFields(body)
    if ('error' in pf) return NextResponse.json({ error: pf.error }, { status: 400 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('property_names')
      .insert({ name_th: name_th.trim(), name_en: name_en?.trim() || null, ...pf.fields })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'ชื่อนี้มีอยู่แล้ว' }, { status: 409 })
      throw error
    }
    return NextResponse.json({ name: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { id, name_th, name_en } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!name_th?.trim()) return NextResponse.json({ error: 'name_th required' }, { status: 400 })
    const pf = placeFields(body)
    if ('error' in pf) return NextResponse.json({ error: pf.error }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('property_names')
      .update({ name_th: name_th.trim(), name_en: name_en?.trim() || null, ...pf.fields, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  if (auth.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('property_names').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
