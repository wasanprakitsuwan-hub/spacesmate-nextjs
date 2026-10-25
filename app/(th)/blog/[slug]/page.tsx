import Link from 'next/link'
import { sanitizeHtml } from '@/lib/sanitize'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { BLOG_CONTENT } from '@/lib/blog-content'
import { BLOG_T, formatBlogDate } from '@/lib/blog-i18n'
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
  const { html: bodyHtml, mentioned } = await linkPlaces(rewriteLegacyLinks(sanitizeHtml(content)), lang)

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

  return (
    <div className="bg-white min-h-screen">

      {/* JSON-LD structured data — Article schema for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero image */}
      <div className="w-full h-64 md:h-96 overflow-hidden bg-spacemate-bgLight relative">
        <img
          src={post.thumbnail ?? '/blog/placeholder.jpg'}
          alt={post.thumbnail_alt ?? postTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(2,64,46,0.25))' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`${home}/blog`} className="hover:text-spacemate-brandDark transition-colors">{t.crumb}</Link>
          <span>/</span>
          <span className="text-spacemate-brandDark font-medium line-clamp-1">{postTitle}</span>
        </div>

        {/* Category badge */}
        <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-3 py-1.5 rounded-full mb-4">
          {post.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-5 leading-snug tracking-tight">
          {postTitle}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-gray-400 text-sm mb-8 pb-8 border-b border-spacemate-borderLight">
          <span className="msym" style={{ fontSize: 16, color: '#048c73' }}>calendar_today</span>
          <span>{post.published_at ? formatBlogDate(post.published_at, lang) : ''}</span>
          <span>·</span>
          <span>{post.author ?? 'SpacesMate'}</span>
        </div>

        {/* Full content */}
        <div
          className="blog-content text-gray-700 leading-relaxed text-base"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Rentals in the places the article mentions: the blog's link into the listing pages. */}
        {mentioned.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl border border-spacemate-borderLight bg-spacemate-bgLight">
            <h2 className="text-lg font-bold text-spacemate-brandDark mb-4">{t.areaBox}</h2>
            <div className="flex flex-wrap gap-2">
              {mentioned.map(m => (
                <Link
                  key={m.path}
                  href={`${home}${m.path}`}
                  className="inline-flex items-center gap-2 bg-white border border-spacemate-borderLight rounded-full px-4 py-2 text-sm font-medium text-spacemate-brandDark hover:border-spacemate-brandTeal hover:text-spacemate-brandTeal transition-colors"
                >
                  {m.label}
                  <span className="text-xs text-gray-400">{t.listings(m.count)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA block */}
        <div
          className="mt-14 p-7 rounded-2xl text-white"
          style={{ background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}
        >
          <div className="flex items-start gap-4">
            <span className="msym text-4xl text-spacemate-brandTeal flex-shrink-0">handshake</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{t.ctaTitle}</h3>
              <p className="text-white/70 text-sm mb-4">{t.ctaSub}</p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`${home}/services`}
                  className="inline-block text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:brightness-110"
                  style={{ background: '#d97f11' }}
                >
                  {t.ctaManage}
                </Link>
                <Link
                  href={`${home}/list-your-property`}
                  className="inline-block text-white/80 font-medium text-sm px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-all"
                >
                  {t.ctaList}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related / other posts — always show when there's anything to read */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-spacemate-brandDark">
                {related.some(r => r.category === post.category) ? t.related : t.otherPosts}
              </h2>
              <Link href={`${home}/blog`} className="text-sm text-spacemate-brandTeal font-medium hover:underline">
                {t.seeAll}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden bg-spacemate-bgLight">
                    <img
                      src={p.thumbnail ?? '/blog/placeholder.jpg'}
                      alt={p.thumbnail_alt ?? cleanPostTitle(p.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    {p.category !== post.category && (
                      <span className="inline-block text-[10px] font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2 py-0.5 rounded-full mb-1.5">
                        {p.category}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-spacemate-brandDark leading-snug line-clamp-3 group-hover:text-spacemate-brandTeal transition-colors">
                      {cleanPostTitle(p.title)}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      {p.published_at ? formatBlogDate(p.published_at, lang) : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Blog content styles */}
      <style>{`
        .blog-content p { margin-bottom: 1.25rem; }
        .blog-content h2 { font-size: 1.35rem; font-weight: 700; color: #02402e; margin: 2rem 0 0.85rem; }
        .blog-content h3 { font-size: 1.1rem; font-weight: 600; color: #231f20; margin: 1.5rem 0 0.6rem; }
        .blog-content ul, .blog-content ol { padding-left: 1.4rem; margin-bottom: 1.25rem; }
        .blog-content li { margin-bottom: 0.4rem; }
        .blog-content strong, .blog-content b { color: #231f20; font-weight: 600; }
        .blog-content a { color: #048c73; text-decoration: underline; }
        .blog-content img { border-radius: 12px; margin: 1.5rem 0; max-width: 100%; }
        .blog-content blockquote { border-left: 3px solid #048c73; padding-left: 1rem; color: #64748b; font-style: italic; margin: 1.5rem 0; }
        .blog-content hr { border: none; border-top: 1px solid #eef0ef; margin: 2rem 0; }
      `}</style>
    </div>
  )
}
