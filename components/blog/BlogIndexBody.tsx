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
import { BLOG_T, CATEGORY_VALUES, categoryLabel, formatBlogDate } from '@/lib/blog-i18n'
import type { Locale } from '@/lib/routes-i18n'

export default async function BlogIndexBody({ locale = 'th' }: { locale?: Locale }) {
  const t = BLOG_T[locale]

  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, category, thumbnail, thumbnail_alt, meta_desc, published_at, language')
    .eq('status', 'published')
    .eq('language', locale)
    .order('published_at', { ascending: false })

  const posts = data ?? []
  const featured = posts[0]
  const rest = posts.slice(1)

  const tabClass = (active: boolean) =>
    `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
      active
        ? 'bg-spacemate-brandDark text-white'
        : 'bg-spacemate-bgLight text-gray-500 hover:text-spacemate-brandDark'
    }`

  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div className="bg-spacemate-brandDark py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-spacemate-brandTeal text-sm font-semibold tracking-widest uppercase mb-3">
            {t.heroEyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-white/60 text-base font-light max-w-xl mx-auto">
            {t.heroSub}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* TH / EN tabs — real routes now, not ?lang= */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/blog" className={tabClass(locale === 'th')}>
            🇹🇭 ภาษาไทย
          </Link>
          <Link href="/en/blog" className={tabClass(locale === 'en')}>
            🇬🇧 English
          </Link>
        </div>

        {/*
          Category chips.

          NOTE: these are decorative. They render as <span>, not <Link>, so
          nothing filters when you click one — and the hover state makes them
          look as though something should. Either wire them to a ?category=
          query or drop them; a control that looks interactive and is not is
          worse than no control. Carried over as-is from the old page so this
          change is a move, not a redesign.
        */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORY_VALUES.map((value, i) => (
            <span
              key={value}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-default select-none ${
                i === 0
                  ? 'bg-spacemate-brandDark text-white'
                  : 'bg-spacemate-bgLight text-gray-500 hover:text-spacemate-brandDark'
              }`}
            >
              {categoryLabel(value, locale)}
            </span>
          ))}
        </div>

        {/* Featured post — newest */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group flex flex-col md:flex-row gap-0 rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 mb-8"
          >
            <div className="md:w-1/2 h-56 md:h-auto overflow-hidden bg-spacemate-bgLight flex-shrink-0">
              <img
                src={featured.thumbnail ?? '/blog/placeholder.jpg'}
                alt={featured.thumbnail_alt ?? featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 p-7 flex flex-col justify-center">
              <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-3 w-fit">
                {categoryLabel(featured.category, locale)}
              </span>
              <h2 className="font-bold text-spacemate-textCharcoal text-xl leading-snug mb-3 group-hover:text-spacemate-brandDark transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{featured.meta_desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {featured.published_at ? formatBlogDate(featured.published_at, locale) : ''}
                </span>
                <span className="text-spacemate-brandTeal text-sm font-semibold">{t.readMore}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid — remaining posts */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-48 overflow-hidden bg-spacemate-bgLight">
                  <img
                    src={post.thumbnail ?? '/blog/placeholder.jpg'}
                    alt={post.thumbnail_alt ?? post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-2.5 py-1 rounded-full mb-3">
                    {categoryLabel(post.category, locale)}
                  </span>
                  <h2 className="font-semibold text-spacemate-textCharcoal text-sm leading-snug mb-3 group-hover:text-spacemate-brandDark transition-colors line-clamp-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.meta_desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {post.published_at ? formatBlogDate(post.published_at, locale) : ''}
                    </span>
                    <span className="text-spacemate-brandTeal text-xs font-medium">{t.readMore}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">{t.empty}</p>
            {/*
              An English reader on an empty index has somewhere to go: the Thai
              blog has articles, and a reader who got here via an English page
              may well read Thai too. Without this the page is a dead end.
            */}
            {locale === 'en' && (
              <Link
                href="/blog"
                className="inline-block mt-4 text-spacemate-brandTeal text-sm font-semibold hover:underline"
              >
                Read the Thai blog →
              </Link>
            )}
          </div>
        )}

        {/* Follow CTA */}
        <div className="mt-14 text-center py-10 rounded-2xl border border-dashed border-spacemate-borderLight">
          <p className="text-gray-400 text-sm">{t.followPrompt}</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="https://www.facebook.com/spacesmateTH" target="_blank" rel="noopener noreferrer"
               className="text-spacemate-brandTeal text-sm font-medium hover:underline">Facebook</a>
            <a href="https://www.instagram.com/spacesmate/" target="_blank" rel="noopener noreferrer"
               className="text-spacemate-brandTeal text-sm font-medium hover:underline">Instagram</a>
          </div>
        </div>

      </div>
    </div>
  )
}
