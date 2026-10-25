/**
 * The blog index, shared by /blog and /en/blog.
 *
 * WHY THIS REPLACED ?lang=en
 *   The index used to live entirely in app/blog/page.tsx and switch locale on a
 *   query string: /blog for Thai, /blog?lang=en for English. That worked for a
 *   reader who clicked the tab, and for nobody else. A query string is not a
 *   route, so:
 *
 *     · the navbar's "บทความ" link sent English readers to the Thai index
 *     · /blog?lang=en and /blog shared one canonical URL, so Google indexed
 *       only the Thai version — the English index was invisible to search
 *     · no hreflang pair could be declared between them
 *     · the language toggle could not see it, since lib/routes-i18n keys on paths
 *
 *   /en/blog is a real route. It costs one more file and fixes all four.
 *
 * CATEGORY CHIPS now filter (BlogGrid, client side). They used to be decorative
 * spans that looked clickable and did nothing.
 *
 * LINKS ARE DELIBERATELY NOT LocaleLink HERE
 *   Two kinds of href on this page must not be rewritten by locale:
 *
 *   1. The TH/EN tabs, which exist precisely to cross locales. Prefixing them
 *      would make the Thai tab on /en/blog point back at /en/blog.
 *   2. The article links. There is no /en/blog/[slug] yet (see the note in
 *      lib/routes-i18n), so every article lives at /blog/<slug> whatever
 *      language it is written in. A locale-aware link would resolve to a 404.
 *
 *   Posts are filtered by `language`, so a reader on /en/blog only ever sees
 *   English posts and only ever follows links to English articles.
 */
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { BLOG_T } from '@/lib/blog-i18n'
import type { Locale } from '@/lib/routes-i18n'
import { C, WRAP } from '@/lib/ui'
import BlogGrid, { type BlogCard } from '@/components/blog/BlogGrid'

export default async function BlogIndexBody({ locale = 'th' }: { locale?: Locale }) {
  const t = BLOG_T[locale]

  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, published_at, language')
    .eq('status', 'published')
    .eq('language', locale)
    .order('published_at', { ascending: false })

  const posts = (data ?? []) as BlogCard[]
  const tab = (active: boolean): React.CSSProperties => ({
    fontSize: 14, textDecoration: 'none', padding: '4px 0',
    color: active ? C.green : C.muted, fontWeight: active ? 600 : 400,
    borderBottom: `2px solid ${active ? C.green : 'transparent'}`,
  })

  return (
    <div style={{ background: C.paper, padding: '40px 16px 72px' }}>
      <div style={{ maxWidth: WRAP, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 600, color: C.green, margin: '0 0 6px' }}>{t.heroTitle}</h1>
            <p style={{ fontSize: 16, color: C.muted, margin: 0 }}>{t.heroSub}</p>
          </div>
          {/* TH / EN: real routes, not ?lang= (see the note above). */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/blog" style={tab(locale === 'th')}>ภาษาไทย</Link>
            <Link href="/en/blog" style={tab(locale === 'en')}>English</Link>
          </div>
        </div>

        {posts.length > 0 ? (
          <BlogGrid posts={posts} locale={locale} />
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ color: C.muted, fontSize: 15, margin: 0 }}>{t.empty}</p>
            {/* An English reader on an empty index still has somewhere to go. */}
            {locale === 'en' && (
              <Link href="/blog" style={{ display: 'inline-block', marginTop: 12, color: C.teal, fontSize: 15, textDecoration: 'none' }}>Read the Thai blog →</Link>
            )}
          </div>
        )}

        <p style={{ marginTop: 48, textAlign: 'center', color: C.muted, fontSize: 14.5 }}>
          {t.followPrompt}{' '}
          <a href="https://www.facebook.com/spacesmateTH" target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>Facebook</a>
          {' · '}
          <a href="https://www.instagram.com/spacesmate/" target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>Instagram</a>
        </p>
      </div>
    </div>
  )
}
