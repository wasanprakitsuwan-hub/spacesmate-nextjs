import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, isErr } from '@/lib/auth-guard'

// ── Shape mapper: DB snake_case → client camelCase ────────────────────────────
function toPost(r: Record<string, unknown>) {
  return {
    id:           r.id          as string,
    title:        r.title       as string,
    slug:         r.slug        as string,
    category:     (r.category   as string) ?? 'คู่มือผู้เช่า',
    status:       (r.status     as string) ?? 'draft',
    seoScore:     (r.seo_score  as number) ?? 0,
    views:        (r.views      as number) ?? 0,
    date:         ((r.created_at as string) ?? '').split('T')[0],
    author:       (r.author     as string) ?? 'SpacesMate',
    content:      (r.content    as string) ?? '',
    thumbnail:    (r.thumbnail  as string) ?? '',
    thumbnailAlt: (r.thumbnail_alt as string) ?? '',
    metaTitle:    (r.meta_title as string) ?? '',
    metaDesc:     (r.meta_desc  as string) ?? '',
    language:     (r.language   as string) ?? 'th',
    keyword:      (r.keyword    as string) ?? '',
  }
}

// ── GET — fetch all posts (public — no auth required) ─────────────────────────
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ posts: (data ?? []).map(toPost) })
  } catch (err) {
    console.error('blog GET error:', err)
    return NextResponse.json({ posts: [] }, { status: 500 })
  }
}

// ── POST — create a new blog post (admin only) ────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isErr(auth)) return auth

  try {
    const body = await req.json()
    const isPublished = body.status === 'published'

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title:         body.title        ?? '',
        slug:          body.slug         ?? '',
        category:      body.category     ?? 'คู่มือผู้เช่า',
        status:        body.status       ?? 'draft',
        content:       body.content      || null,
        thumbnail:     body.thumbnail    || null,
        thumbnail_alt: body.thumbnailAlt || null,
        meta_title:    body.metaTitle    || null,
        meta_desc:     body.metaDesc     || null,
        language:      body.language     ?? 'th',
        keyword:       body.keyword      || null,
        seo_score:     body.seoScore     ?? 0,
        views:         0,
        author:        body.author       ?? 'SpacesMate',
        published_at:  isPublished ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ post: toPost(data as Record<string, unknown>) })
  } catch (err) {
    console.error('blog POST error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create post'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
