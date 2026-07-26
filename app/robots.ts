import type { MetadataRoute } from 'next'

const SITE = 'https://spacesmate.com'

/**
 * robots.txt
 *
 * There was previously no robots.txt at all — /robots.txt returned an empty 200,
 * which crawlers read as a valid empty file. That left no way to point at a
 * sitemap, and no way to keep crawl budget off the admin and API surface.
 *
 * Bare domain only: www permanently redirects to it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',              // no crawlable content, and some routes are costly
          '/dashboard',         // admin
          '/owner-dashboard',   // landlord area
          '/login',
          '/reset-password',
          '/submit/success',    // post-payment, per-session, no value indexed
          '/submit/cancel',
          '/not-found',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
