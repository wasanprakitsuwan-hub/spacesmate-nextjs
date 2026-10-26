// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { createServerClient } from '@/lib/supabase'
import { SITE_T, TH_MONTHS, EN_MONTHS, type Locale } from '@/lib/site-i18n'
import { C, RADIUS, WRAP, h2Style } from '@/lib/ui'
import { bangkokDate } from '@/lib/bangkok-date'

/**
 * Thai dates carry the Buddhist year, English dates the Gregorian one. Printing
 * 2569 to an English reader reads as a typo, not as a calendar.
 */
function formatDate(iso: string, locale: Locale): string {
  const d = bangkokDate(iso)
  if (!d) return ''
  return locale === 'en'
    ? `${d.day} ${EN_MONTHS[d.month]} ${d.year}`
    : `${d.day} ${TH_MONTHS[d.month]} ${d.year + 543}`
}

export default async function BlogSection({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, published_at')
    .eq('status', 'published')
    /**
     * Filter by language. Without this the English home page rendered three
     * Thai article cards — Thai headline, Thai excerpt, Thai category chip —
     * under an English "Latest articles" heading, linking to Thai pages. The
     * dates were formatted in English, which made it look deliberate.
     *
     * Only the heading and the dates were ever locale-aware here; the posts
     * themselves never were, because this component predates the blog having a
     * `language` column at all.
     */
    .eq('language', locale)
    .order('published_at', { ascending: false })
    .limit(3)

  const posts = data ?? []

  /**
   * Nothing to show, so show nothing.
   *
   * blog_posts holds zero English rows, so /en would otherwise get a heading, a
   * subheading, a "View all" link and then an empty grid — which reads as a
   * page that failed to load rather than a blog that has not been written yet.
   * /en/blog says so in words; the home page just stays quiet.
   */
  if (posts.length === 0) return null

  return (
    <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '72px 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={h2Style(26)}>{t.blogHeading}</h2>
        <Link href="/blog" style={{ color: C.teal, fontSize: 15, textDecoration: 'none' }}>{t.blogViewAll}</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px 32px' }}>
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="sm-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 22, color: C.ink, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnail ?? '/blog/placeholder.jpg'} alt={post.thumbnail_alt ?? post.title} loading="lazy"
              style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: RADIUS, display: 'block', marginBottom: 6, background: C.line }} />
            <span style={{ fontSize: 13, color: C.muted }}>
              {[post.category, post.published_at ? formatDate(post.published_at, locale) : ''].filter(Boolean).join(' · ')}
            </span>
            <span className="sm-card-title" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5 }}>{post.title}</span>
            {post.meta_desc && (
              <span style={{ fontSize: 14, lineHeight: 1.7, color: C.muted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.meta_desc}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
