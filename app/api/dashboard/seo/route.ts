import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// GET /api/dashboard/seo — all SEO pages
// POST /api/dashboard/seo — add a page
// PATCH /api/dashboard/seo — update status/fields

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .order('area_type', { ascending: true })
      .order('slug', { ascending: true })

    if (error) throw error
    return NextResponse.json({ pages: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ pages: [], error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { slug, title_th, title_en, meta_description, area_type, status, has_content, page_score, notes } = body
    if (!slug?.trim()) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('seo_pages')
      .insert({
        slug: slug.trim(),
        title_th: title_th?.trim() || null,
        title_en: title_en?.trim() || null,
        meta_description: meta_description?.trim() || null,
        area_type: area_type || 'district',
        status: status || 'planned',
        has_content: has_content ?? false,
        page_score: page_score ?? null,
        notes: notes?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      throw error
    }
    return NextResponse.json({ page: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('seo_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
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

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('seo_pages')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
