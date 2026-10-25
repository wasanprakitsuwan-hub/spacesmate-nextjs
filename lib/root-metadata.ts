/**
 * The root metadata each locale's root layout exports.
 *
 * The `title.template` is the one that suffixes every page title with
 * "| SpacesMate" — see scripts/check-titles.mjs for why that matters and how
 * often it has been got wrong.
 *
 * WHAT CHANGES PER LOCALE
 *   The defaults. These are what a page inherits when it sets nothing of its
 *   own, and every /en route used to inherit the Thai ones. Pages that set
 *   their own title and description already override them; `keywords` and
 *   `openGraph.locale` nothing overrode, so English pages shipped Thai
 *   keywords and og:locale th_TH. That was flagged in
 *   scripts/check-en-coverage.mjs as a known gap and this is the fix.
 */
import type { Metadata } from 'next'

export type Locale = 'th' | 'en'

const SITE = 'https://spacesmate.com'

export function rootMetadata(locale: Locale): Metadata {
  const isEn = locale === 'en'

  return {
    // Without this, relative canonical and hreflang URLs resolve against the
    // Vercel deployment URL instead of the real domain.
    metadataBase: new URL(SITE),
    title: {
      default: isEn
        ? 'SpacesMate — Rent an Apartment, Condo or Office in Bangkok'
        : 'SpacesMate — ค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า',
      template: '%s | SpacesMate',
    },
    description: isEn
      ? 'SpacesMate — find apartments, condos, houses, co-working space and offices to rent across Bangkok. Verified listings, contact owners directly, no hidden fees.'
      : 'SpacesMate — แพลตฟอร์มค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศ ประกาศที่ผ่านการยืนยัน ไม่มีค่าใช้จ่ายซ่อน',
    keywords: isEn
      ? ['Bangkok rental', 'condo for rent Bangkok', 'apartment for rent Bangkok', 'house for rent Bangkok', 'office space Bangkok', 'SpacesMate']
      : ['เช่าคอนโด', 'เช่าอพาร์ทเม้นท์', 'บ้านเช่า', 'Bangkok rental', 'SpacesMate', 'ที่พักกรุงเทพ'],
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_US' : 'th_TH',
      url: isEn ? `${SITE}/en` : SITE,
      siteName: 'SpacesMate',
      images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },

    // Google Search Console ownership, rendered server-side on every page.
    //
    // Deliberately NOT verified via the Google Analytics or Tag Manager methods:
    // GTM here loads only after cookie consent (components/consent/Analytics.tsx),
    // and Google's verifier does not accept cookies — it would see a page with no
    // container and fail. A static token in <head> is independent of consent and
    // carries no tracking, so it is unconditional.
    //
    // Do not remove. Google re-checks periodically and silently unverifies the
    // property if the tag disappears, taking the Search Console history with it.
    //
    // It must be in BOTH root layouts. Verification is per-page, not per-site,
    // so dropping it from one group unverifies every page in that group.
    verification: { google: 'KCDukdwBq8l045pDIYzH4VxLAvUzL7RwvAfBDnifJdw' },
  }
}
