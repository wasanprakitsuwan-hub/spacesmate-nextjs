import type { MetadataRoute } from 'next'
import { AREA_KEYWORDS } from '@/lib/constants'
import { createServerClient } from '@/lib/supabase'
import { getGeneratedAreas } from '@/lib/areas'

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
 * /submit/success, /submit/cancel — all also disallowed in robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ───────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,         changeFrequency: 'daily',   priority: 1.0,  lastModified: now },
    { url: `${SITE}/search`,   changeFrequency: 'daily',   priority: 0.9,  lastModified: now },
    { url: `${SITE}/manage`,   changeFrequency: 'monthly', priority: 0.9,  lastModified: now },
    { url: `${SITE}/submit`,   changeFrequency: 'monthly', priority: 0.9,  lastModified: now },
    { url: `${SITE}/pricing`,  changeFrequency: 'monthly', priority: 0.8,  lastModified: now },
    { url: `${SITE}/services`, changeFrequency: 'monthly', priority: 0.7,  lastModified: now },
    { url: `${SITE}/blog`,     changeFrequency: 'weekly',  priority: 0.7,  lastModified: now },
    { url: `${SITE}/about`,    changeFrequency: 'yearly',  priority: 0.5,  lastModified: now },
    { url: `${SITE}/contact`,  changeFrequency: 'yearly',  priority: 0.5,  lastModified: now },
    { url: `${SITE}/faq`,      changeFrequency: 'monthly', priority: 0.5,  lastModified: now },
    { url: `${SITE}/terms`,    changeFrequency: 'yearly',  priority: 0.3,  lastModified: now },
    { url: `${SITE}/privacy`,  changeFrequency: 'yearly',  priority: 0.3,  lastModified: now },
  ]

  // ── Area landing pages, Thai and English ───────────────────────────────────
  const areaPages: MetadataRoute.Sitemap = AREA_KEYWORDS.flatMap(a => ([
    { url: `${SITE}/area/${a.slug}`,    changeFrequency: 'weekly' as const, priority: 0.8, lastModified: now },
    { url: `${SITE}/en/area/${a.slug}`, changeFrequency: 'weekly' as const, priority: 0.6, lastModified: now },
  ]))

  // ── Data-driven area pages ─────────────────────────────────────────────────
  // One per (district, property type) with live inventory. These are the pages
  // that actually compete for "เช่าคอนโด บางนา" style queries.
  const generated = await getGeneratedAreas()
  const generatedAreaPages: MetadataRoute.Sitemap = generated.map(a => ({
    url: encodeURI(`${SITE}/area/${a.slug}`),
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
      }))

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

  return [...staticPages, ...areaPages, ...generatedAreaPages, ...propertyPages, ...blogPages]
}
