import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// GET /api/dashboard/property-names — list all property names (public for autocomplete)
// POST /api/dashboard/property-names — add new name (admin+)
// PATCH /api/dashboard/property-names — update name (admin+)
// DELETE /api/dashboard/property-names?id=xxx — delete (super_admin only)

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('property_names')
      .select('id, name_th, name_en, created_at, updated_at')
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
    const { name_th, name_en } = await req.json()
    if (!name_th?.trim()) return NextResponse.json({ error: 'name_th required' }, { status: 400 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('property_names')
      .insert({ name_th: name_th.trim(), name_en: name_en?.trim() || null })
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
    const { id, name_th, name_en } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!name_th?.trim()) return NextResponse.json({ error: 'name_th required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('property_names')
      .update({ name_th: name_th.trim(), name_en: name_en?.trim() || null, updated_at: new Date().toISOString() })
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
