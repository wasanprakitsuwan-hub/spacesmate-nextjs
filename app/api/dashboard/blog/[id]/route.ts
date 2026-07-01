import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// ── PATCH — update a blog post (admin only) ───────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that were explicitly sent
    if (body.title        !== undefined) update.title         = body.title
    if (body.slug         !== undefined) update.slug          = body.slug
    if (body.category     !== undefined) update.category      = body.category
    if (body.content      !== undefined) update.content       = body.content  || null
    if (body.thumbnail    !== undefined) update.thumbnail     = body.thumbnail || null
    if (body.thumbnailAlt !== undefined) update.thumbnail_alt = body.thumbnailAlt || null
    if (body.metaTitle    !== undefined) update.meta_title    = body.metaTitle || null
    if (body.metaDesc     !== undefined) update.meta_desc     = body.metaDesc  || null
    if (body.seoScore     !== undefined) update.seo_score     = body.seoScore
    if (body.status !== undefined) {
      update.status = body.status
      // Set published_at the first time a post goes live
      if (body.status === 'published') update.published_at = new Date().toISOString()
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('blog_posts')
      .update(update)
      .eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('blog PATCH error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to update post'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ── DELETE — delete a blog post (admin only) ──────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('blog DELETE error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to delete post'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
