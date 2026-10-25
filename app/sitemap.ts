import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'
import { listDistrictPages } from '@/lib/district-pages'
import { hasEnglishPosts } from '@/lib/blog-links'
import { listRentPages } from '@/lib/rent-pages'
import { getBuildingsWithListings } from '@/lib/buildings'

const SITE = 'https://spacesmate.com'

// Rebuild hourly. Listings change often enough to matter, rarely enough that
// regenerating on every request would be wasteful.
export const revalidate = 3600

/**
 * sitemap.xml
 *
 * There was previously no sitemap and no code generating one. For a directory
 * site that is the most damaging SEO omission available: Google discovers pages
 * by following links, and listing pages have very few inbound links.
 *
 * Everything here is generated from live data rather than a hand-maintained list,
 * so new listings and articles appear without anyone remembering to add them.
 *
 * Deliberately excluded: /dashboard, /owner-dashboard, /login, /reset-password,
 * /list-your-property/success, /list-your-property/cancel — all also disallowed in robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ───────────────────────────────────────────────────────────
  // Every one has an English twin, so each yields two entries carrying the
  // full hreflang set (th, en, x-default = th), matching lib/hreflang.
  // /en/blog joins only once an English article is published; until then it
  // is noindex (app/(en)/en/blog/page.tsx), and a noindex URL in a sitemap is
  // a Search Console error.
  type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  const STATIC: [path: string, freq: Freq, thPriority: number, enPriority: number][] = [
    ['/',                   'daily',   1.0, 0.7],
    ['/search',             'daily',   0.9, 0.7],
    ['/manage',             'monthly', 0.9, 0.7],
    ['/list-your-property', 'monthly', 0.9, 0.6],
    ['/services',           'monthly', 0.7, 0.6],
    ['/blog',               'weekly',  0.7, 0.5],
    ['/faq',                'monthly', 0.5, 0.6],
    ['/guide',              'monthly', 0.6, 0.6],
    ['/about',              'yearly',  0.5, 0.4],
    ['/contact',            'yearly',  0.5, 0.4],
    ['/terms',              'yearly',  0.3, 0.3],
    ['/privacy',            'yearly',  0.3, 0.3],
  ]
  const englishBlog = await hasEnglishPosts()
  const staticPages: MetadataRoute.Sitemap = STATIC.flatMap(([path, changeFrequency, thP, enP]) => {
    const th = path === '/' ? `${SITE}/` : `${SITE}${path}`
    const en = path === '/' ? `${SITE}/en` : `${SITE}/en${path}`
    if (path === '/blog' && !englishBlog) {
      return [{ url: th, changeFrequency, priority: thP, lastModified: now }]
    }
    const alternates = { languages: { th, en, 'x-default': th } }
    return [
      { url: th, changeFrequency, priority: thP, lastModified: now, alternates },
      { url: en, changeFrequency, priority: enP, lastModified: now, alternates },
    ]
  })

  // ── Rent-near-a-place pages, Thai and English ───────────────────────────
  // Station and landmark pages, all types and per type. Only those with
  // INDEX_MIN or more listings: the rest carry robots:noindex until they have
  // stock, and this list regenerates hourly, so a page joins by itself. The 16
  // hand-written /area pages were folded into these and now 301 here.
  const rentPages: MetadataRoute.Sitemap = (await listRentPages())
    .filter(r => r.indexable)
    .flatMap(r => {
      const th = encodeURI(`${SITE}/rent/${r.slug}`)
      const en = encodeURI(`${SITE}/en/rent/${r.slug}`)
      const alternates = { languages: { th, en, 'x-default': th } }
      const priority = r.type ? 0.7 : 0.8
      return [
        { url: th, changeFrequency: 'daily' as const, priority, lastModified: now, alternates },
        { url: en, changeFrequency: 'daily' as const, priority: priority - 0.1, lastModified: now, alternates },
      ]
    })

  // ── District pages, Thai and English ───────────────────────────────────
  // One all-types page per district (/area/ห้องเช่า-<district>) plus one per
  // (district, type), the pages that compete for "เช่าคอนโด บางนา" style queries.
  // Same rule as the rent pages: only those with INDEX_MIN or more listings.
  const districtPages: MetadataRoute.Sitemap = (await listDistrictPages())
    .filter(d => d.indexable)
    .flatMap(d => {
      const th = encodeURI(`${SITE}/area/${d.slug}`)
      const en = encodeURI(`${SITE}/en/area/${d.slug}`)
      const alternates = { languages: { th, en, 'x-default': th } }
      const priority = d.type ? 0.7 : 0.8
      return [
        { url: th, changeFrequency: 'daily' as const, priority, lastModified: now, alternates },
        { url: en, changeFrequency: 'daily' as const, priority: priority - 0.1, lastModified: now, alternates },
      ]
    })

  // ── Building pages ─────────────────────────────────────────────────────────
  // One per building with live inventory. Renters search by building name, so
  // these target the highest-intent queries the site has.
  const buildings = await getBuildingsWithListings()
  const buildingPages: MetadataRoute.Sitemap = buildings.map(b => ({
    url: encodeURI(`${SITE}/building/${b.slug}`),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    lastModified: now,
  }))

  // ── Live data ──────────────────────────────────────────────────────────────
  // A sitemap must never break the build. If Supabase is unavailable we still
  // serve the static and area entries rather than returning nothing at all.
  let propertyPages: MetadataRoute.Sitemap = []
  let blogPages: MetadataRoute.Sitemap = []

  try {
    const supabase = createServerClient()

    const [props, posts] = await Promise.all([
      supabase
        .from('properties')
        .select('slug, updated_at, created_at')
        .eq('listing_status', 'active')
        .limit(5000),
      supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at, created_at')
        .eq('status', 'published')
        .limit(1000),
    ])

    // Supabase resolves with { data, error } rather than throwing, so a bad
    // column name would quietly produce an empty sitemap section. Say so loudly.
    if (props.error) console.error('sitemap: properties query failed —', props.error.message)
    if (posts.error) console.error('sitemap: blog_posts query failed —', posts.error.message)

    propertyPages = (props.data ?? [])
      .filter(p => p.slug)
      .map(p => ({
        // slug may contain a second segment for condo/house (building/condo-id),
        // and Thai characters — encodeURI leaves the slashes intact and encodes
        // the Thai correctly.
        url: encodeURI(`${SITE}/property/${p.slug}`),
        lastModified: new Date(p.updated_at ?? p.created_at ?? now),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            th: encodeURI(`${SITE}/property/${p.slug}`),
            en: encodeURI(`${SITE}/en/property/${p.slug}`),
            'x-default': encodeURI(`${SITE}/property/${p.slug}`),
          },
        },
      }))
      .flatMap(entry => [
        entry,
        {
          ...entry,
          url: entry.url.replace(`${SITE}/property/`, `${SITE}/en/property/`),
          priority: 0.6,
        },
      ])

    blogPages = (posts.data ?? [])
      .filter(b => b.slug)
      .map(b => ({
        url: encodeURI(`${SITE}/blog/${b.slug}`),
        lastModified: new Date(b.updated_at ?? b.published_at ?? b.created_at ?? now),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
  } catch (err) {
    console.error('sitemap: live data unavailable, serving static entries only', err)
  }

  return [...staticPages, ...rentPages, ...districtPages, ...buildingPages, ...propertyPages, ...blogPages]
}
