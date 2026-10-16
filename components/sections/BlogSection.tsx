// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. Hrefs with no English page — /manage, /blog,
// /building, the account surfaces — pass through unchanged. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { createServerClient } from '@/lib/supabase'
import { SITE_T, TH_MONTHS, EN_MONTHS, type Locale } from '@/lib/site-i18n'

/**
 * Thai dates carry the Buddhist year, English dates the Gregorian one. Printing
 * 2569 to an English reader reads as a typo, not as a calendar.
 */
function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  return locale === 'en'
    ? `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    : `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

export default async function BlogSection({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  const posts = data ?? []

  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 24px 56px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>{t.blogHeading}</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>{t.blogSub}</p>
        </div>
        <Link href="/blog" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', textDecoration: 'none' }}>
          {t.blogViewAll}
        </Link>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-grid3">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="sm-blog-card"
            style={{
              background: '#fff',
              border: '1px solid #eef0ef',
              borderRadius: 18,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all .25s',
              boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)',
              display: 'block',
              textDecoration: 'none',
            }}
          >
            {/* Image */}
            <div style={{ height: 180, overflow: 'hidden', background: '#f4f8f6', position: 'relative' }}>
              <img
                src={post.thumbnail ?? '/blog/placeholder.jpg'}
                alt={post.thumbnail_alt ?? post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
                className="sm-blog-img"
              />
              <span style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(255,255,255,0.93)',
                color: '#02402e', fontSize: 11.5, fontWeight: 600,
                padding: '5px 12px', borderRadius: 20, backdropFilter: 'blur(4px)',
              }}>
                {post.category}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: 18 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.45, color: '#231f20' }} className="sm-blog-title">
                {post.title}
              </h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.meta_desc}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                  {post.published_at ? formatDate(post.published_at, locale) : ''}
                </span>
                <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>{t.blogReadMore}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .sm-blog-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-blog-card:hover .sm-blog-img { transform: scale(1.06); }
        .sm-blog-card:hover .sm-blog-title { color: #02402e !important; }
        @media (max-width: 900px) {
          .sm-grid3 { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .sm-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
