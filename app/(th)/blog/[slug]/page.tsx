import Link from 'next/link'
import { sanitizeHtml } from '@/lib/sanitize'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { BLOG_CONTENT } from '@/lib/blog-content'
import { BLOG_T, categoryLabel, formatBlogDate } from '@/lib/blog-i18n'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { cleanPostTitle, linkPlaces, postDescription, rewriteLegacyLinks } from '@/lib/blog-links'

export const revalidate = 300
export const dynamicParams = true

// Slug → WP post ID (for static content fallback)
const SLUG_TO_WP_ID: Record<string, number> = {
  'thi-pak-yan-dusit': 19865,
  'asangha-ploy-chao-2026': 19855,
  'panha-ploy-chao-condo': 19847,
  'vithi-lueak-phu-chao': 19633,
  'update-kotmai-asangha-2026': 19628,
  'ploy-chao-asangha-5-things': 19520,
  'long-prakat-asangha': 19486,
  'ha-hong-pak-spacesmate': 19385,
  'jadkan-asangha-spacesmate': 19331,
}

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

/**
 * Every article lives at /blog/<slug> whatever its language (see lib/routes-i18n),
 * so the page takes its copy, schema language and og:locale from the post's own
 * `language` rather than from the route.
 */
type PostLang = 'th' | 'en'
const langOf = (v: unknown): PostLang => (v === 'en' ? 'en' : 'th')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_desc, thumbnail, thumbnail_alt, published_at, updated_at, content, language')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: BLOG_T.th.notFound }
  const lang = langOf(post.language)
  const t = BLOG_T[lang]

  /**
   * Strip a brand suffix the author typed in.
   *
   * meta_title is written by hand in the blog admin, and SEO habit says to end
   * a title with the brand — so rows in blog_posts carry "| SpacesMate" and the
   * root layout's template adds a second one. Every post has been rendering
   *
   *     <post title> | SpacesMate | SpacesMate
   *
   * Stripping here rather than cleaning the rows, because the admin editor will
   * keep accepting it and the next author will type it again.
   *
   * A title that names the brand anywhere else ("… ด้วย SpacesMate") is used
   * as it is, without the template, or it would read "SpacesMate | SpacesMate".
   */
  const pageTitle  = cleanPostTitle(post.meta_title ?? post.title)
  const title      = /spacesmate/i.test(pageTitle) ? { absolute: pageTitle } : pageTitle
  const pageDesc   = postDescription(post.meta_desc, post.content ?? '', t.fallbackDesc)
  const canonicalUrl = `https://spacesmate.com/blog/${params.slug}`
  const ogImage = post.thumbnail
    // No width/height: the generated thumbnails are 1536x1024, and declaring
    // 1200x630 told Facebook and LINE the wrong aspect. Omitting them lets each
    // platform read the real dimensions from the file.
    ? [{ url: post.thumbnail, alt: post.thumbnail_alt ?? post.title }]
    : [{ url: 'https://spacesmate.com/og-image.jpg' }]

  return {
    title,
    description: pageDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: ogImage,
      type: 'article',
      url: canonicalUrl,
      siteName: 'SpacesMate',
      locale: lang === 'en' ? 'en_GB' : 'th_TH',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? post.published_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: post.thumbnail ? [post.thumbnail] : ['https://spacesmate.com/og-image.jpg'],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, content, published_at, updated_at, author, language')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const lang = langOf(post.language)
  const t = BLOG_T[lang]
  const home = lang === 'en' ? '/en' : ''
  const postTitle = cleanPostTitle(post.title)

  // Content: use DB field if populated, else fall back to static BLOG_CONTENT
  const wpId = SLUG_TO_WP_ID[post.slug]
  const content = post.content ?? (wpId ? BLOG_CONTENT[wpId] : '') ?? `<p>${t.noContent}</p>`
  // Sanitise first, then add our own links: they are built from page paths,
  // never from the article text.
  const { html: linkedHtml, mentioned } = await linkPlaces(rewriteLegacyLinks(sanitizeHtml(content)), lang)

  // "In this article": each <h2> gets an id so the side list can jump to it.
  const toc: { id: string; label: string }[] = []
  const bodyHtml = linkedHtml.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_m, attrs: string | undefined, inner: string) => {
    const id = `sec-${toc.length + 1}`
    const label = inner.replace(/<[^>]+>/g, '').replace(/^\s*\d+[.)]\s*/, '').trim()
    if (label) toc.push({ id, label })
    const rest = (attrs ?? '').replace(/\sid=("[^"]*"|'[^']*')/i, '')
    return `<h2 id="${id}"${rest}>${inner}</h2>`
  })

  // Related posts — same category first, top up with recent posts if < 3 found
  const { data: sameCatData } = await supabase
    .from('blog_posts')
    .select('slug, title, thumbnail, thumbnail_alt, published_at, category')
    .eq('status', 'published')
    .eq('category', post.category)
    .neq('slug', post.slug)
    .order('published_at', { ascending: false })
    .limit(3)

  let related = sameCatData ?? []

  // If we have fewer than 3 same-category posts, fill with recent posts from other categories
  if (related.length < 3) {
    const existingSlugs = [post.slug, ...related.map(r => r.slug)]
    const { data: recentData } = await supabase
      .from('blog_posts')
      .select('slug, title, thumbnail, thumbnail_alt, published_at, category')
      .eq('status', 'published')
      .not('slug', 'in', `(${existingSlugs.map(s => `"${s}"`).join(',')})`)
      .order('published_at', { ascending: false })
      .limit(3 - related.length)
    related = [...related, ...(recentData ?? [])]
  }

  // Build JSON-LD Article schema for rich snippets
  const metaDesc = postDescription(post.meta_desc, content, t.fallbackDesc)
  const postUrl = `https://spacesmate.com/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: postTitle,
    description: metaDesc,
    image: post.thumbnail
      ? [post.thumbnail]
      : ['https://spacesmate.com/og-image.jpg'],
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: {
      '@type': 'Organization',
      name: post.author ?? 'SpacesMate',
      url: 'https://spacesmate.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SpacesMate',
      url: 'https://spacesmate.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://spacesmate.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: post.category,
    inLanguage: lang,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'SpacesMate', item: `https://spacesmate.com${home || '/'}` },
      { '@type': 'ListItem', position: 2, name: t.crumb, item: `https://spacesmate.com${home}/blog` },
      { '@type': 'ListItem', position: 3, name: postTitle, item: postUrl },
    ],
  }

  const shareUrl = encodeURIComponent(postUrl)

  return (
    <div style={{ background: C.paper, padding: '28px 16px 72px' }}>

      {/* JSON-LD structured data — Article schema for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="sm-bp-grid" style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: 48, alignItems: 'start' }}>
        <article style={{ minWidth: 0 }}>
          <nav aria-label="breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            <Link href={`${home}/blog`} style={{ color: C.teal, textDecoration: 'none' }}>{t.crumb}</Link>
            {post.category && <><span style={{ margin: '0 6px', color: C.faint }}>/</span>{categoryLabel(post.category, lang)}</>}
          </nav>

          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 600, color: C.green, margin: '0 0 12px', lineHeight: 1.35 }}>{postTitle}</h1>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 22px' }}>
            {[post.category ? categoryLabel(post.category, lang) : '', post.published_at ? formatBlogDate(post.published_at, lang) : '', post.author ?? 'SpacesMate'].filter(Boolean).join(' · ')}
          </p>

          <div style={{ aspectRatio: '16 / 9', borderRadius: RADIUS, overflow: 'hidden', background: C.line2, marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnail ?? '/blog/placeholder.jpg'} alt={post.thumbnail_alt ?? postTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          <div className="blog-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          {/* Rentals in the places the article mentions: the blog's link into the listing pages. */}
          {mentioned.length > 0 && (
            <div style={{ marginTop: 36, padding: 20, borderRadius: RADIUS, border: `1px solid ${C.line}`, background: C.white }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.green, margin: '0 0 12px' }}>{t.areaBox}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {mentioned.map(m => (
                  <Link key={m.path} href={`${home}${m.path}`} className="sm-chip-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 14px', fontSize: 14, color: C.green, textDecoration: 'none', background: C.white }}>
                    {m.label}<span style={{ fontSize: 12.5, color: C.muted }}>{t.listings(m.count)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 36, padding: '24px 24px', borderRadius: RADIUS, background: C.green }}>
            <h3 style={{ fontSize: 19, fontWeight: 600, color: C.white, margin: '0 0 6px' }}>{t.ctaTitle}</h3>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 15, margin: '0 0 16px', lineHeight: 1.6 }}>{t.ctaSub}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href={`${home}/list-your-property`} style={btnStyle('light')}>{t.ctaList}</Link>
              <Link href={`${home}/manage`} style={{ ...btnStyle('ghost'), background: 'transparent', color: C.white, borderColor: 'rgba(255,255,255,.45)' }}>{t.ctaManage}</Link>
            </div>
          </div>
        </article>

        <aside className="sm-bp-aside" style={{ position: 'sticky', top: 88 }}>
          {toc.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 8px' }}>{t.toc}</p>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: `1px solid ${C.line}` }}>
                {toc.map(h => (
                  <li key={h.id}><a href={`#${h.id}`} className="sm-row-link" style={{ display: 'block', padding: '5px 0 5px 12px', fontSize: 14, color: C.ink, textDecoration: 'none', lineHeight: 1.45 }}>{h.label}</a></li>
                ))}
              </ol>
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 8px' }}>{t.share}</p>
          <div style={{ display: 'flex', gap: 14, fontSize: 14 }}>
            <a href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>LINE</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none' }}>Facebook</a>
          </div>
        </aside>
      </div>

      {/* Related / other posts, with images. Always shown when there is anything to read. */}
      {related.length > 0 && (
        <section style={{ maxWidth: 1120, margin: '48px auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.green, margin: 0 }}>
              {related.some(r => r.category === post.category) ? t.related : t.otherPosts}
            </h2>
            <Link href={`${home}/blog`} style={{ fontSize: 14.5, color: C.teal, textDecoration: 'none' }}>{t.seeAll}</Link>
          </div>
          <div className="sm-bp-rel" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 }}>
            {related.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="sm-card" style={{ display: 'block', background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS, overflow: 'hidden', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '16 / 10', background: C.line2 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail ?? '/blog/placeholder.jpg'} alt={p.thumbnail_alt ?? cleanPostTitle(p.title)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 13, color: C.muted }}>
                    {[p.category ? categoryLabel(p.category, lang) : '', p.published_at ? formatBlogDate(p.published_at, lang) : ''].filter(Boolean).join(' · ')}
                  </p>
                  <p className="sm-card-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.green, lineHeight: 1.45 }}>{cleanPostTitle(p.title)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Blog content styles */}
      <style>{`
        .blog-content { font-size: 17px; line-height: 1.85; color: ${C.ink}; }
        .blog-content p { margin-bottom: 1.25rem; }
        .blog-content h2 { font-size: 1.4rem; font-weight: 600; color: ${C.green}; margin: 2.2rem 0 0.85rem; scroll-margin-top: 88px; line-height: 1.4; }
        .blog-content h3 { font-size: 1.15rem; font-weight: 600; color: ${C.ink}; margin: 1.6rem 0 0.6rem; }
        .blog-content ul, .blog-content ol { padding-left: 1.4rem; margin-bottom: 1.25rem; }
        .blog-content li { margin-bottom: 0.4rem; }
        .blog-content strong, .blog-content b { color: #231f20; font-weight: 600; }
        .blog-content a { color: ${C.teal}; text-decoration: underline; }
        .blog-content img { border-radius: ${RADIUS}px; margin: 1.5rem 0; max-width: 100%; height: auto; }
        .blog-content blockquote { border-left: 3px solid ${C.teal}; padding-left: 1rem; color: ${C.muted}; margin: 1.5rem 0; }
        .blog-content hr { border: none; border-top: 1px solid ${C.line}; margin: 2rem 0; }
        @media (max-width: 960px) { .sm-bp-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 24px !important; } .sm-bp-aside { position: static !important; } .sm-bp-rel { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 640px) { .sm-bp-rel { grid-template-columns: minmax(0, 1fr) !important; } }
      `}</style>
    </div>
  )
}
