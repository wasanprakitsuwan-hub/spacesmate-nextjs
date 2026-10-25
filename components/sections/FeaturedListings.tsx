// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { Property } from '@/lib/property-data'
import { createServerClient } from '@/lib/supabase'
import FeaturedGrid, { type FeaturedCard } from '@/components/sections/FeaturedGrid'
import { SITE_T, CARD_TERM_SUFFIX, CARD_DEFAULT_SUFFIX, type Locale } from '@/lib/site-i18n'
import { districtLabel, provinceLabel } from '@/lib/geo-i18n'
import { nearestStation, stationLabel, distanceLabel } from '@/lib/search-match'
import type { RailSystem } from '@/lib/stations'
import { C, RADIUS, WRAP, h2Style } from '@/lib/ui'

/** The colour bar beside "Near BTS …" on a card. */
function lineColor(system: RailSystem): string {
  return system === 'BTS' ? C.bts : system === 'MRT' ? C.mrt : '#C8102E'
}

const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptDbListing(l: any, locale: Locale): Property {
  const t = SITE_T[locale]
  const suffix = CARD_TERM_SUFFIX[locale][l.rental_term] ?? CARD_DEFAULT_SUFFIX[locale]
  return {
    id: 0,
    slug: l.slug,
    // The owner's own words, in their language where they supplied one.
    title: (locale === 'en' ? (l.title_en || l.title_th) : (l.title_th || l.title_en)) || t.untitled,
    excerpt: l.description_th || '',
    priceMin: l.price_from || 0,
    priceDisplay: l.price_from
      ? `฿${Number(l.price_from).toLocaleString('en-US')}${suffix}`
      : t.askForPrice,
    bedrooms: l.bedrooms || 0,
    bathrooms: l.bathrooms || 0,
    size: l.area_sqm ? String(l.area_sqm) : '',
    address: l.address_th || '',
    neighborhood:
      districtLabel(l.district, l.province, locale) ||
      provinceLabel(l.province, locale) ||
      t.defaultProvince,
    lat: l.lat ? String(l.lat) : '',
    lng: l.lng ? String(l.lng) : '',
    image: (() => { const imgs = Array.isArray(l.images) ? l.images : []; return imgs.find((i: string) => i.startsWith('https://')) ?? imgs.find((i: string) => i.startsWith('/')) ?? ''; })(),
    propertyType: DB_TYPE_MAP[l.property_type] ?? 'Condo',
    listingType: 'Rent',
    amenities: l.amenities || [],
    featured: false,
    date: l.created_at || '',
  }
}

/**
 * Every live listing, newest first, loaded on the server.
 *
 * This used to fetch /api/listings/public from the browser, which meant the
 * links to those six listings were never in the HTML the server sent. A crawler
 * reads that HTML and follows its links; it got sixteen area links and not one
 * property link, so every listing was discovered through the sitemap alone —
 * a weaker signal than being linked from the home page. The HTML still carries
 * the eight newest, so that stays true.
 *
 * Columns are listed rather than selected with *, and only what a card shows is
 * passed on, so the home page does not ship description bodies in its HTML.
 *
 * Fair Rotation moved to the browser (FeaturedGrid) on 25 Oct 2026. It used to
 * shuffle here, which only worked because cache:'no-store' rebuilt the home page
 * on every request — and that rebuild was the blank gap visitors saw on load.
 * The page is now cached (see the note atop app/(th)/page.tsx), so a shuffle here
 * would freeze for everyone for a minute at a time.
 */
async function loadPool(locale: Locale): Promise<FeaturedCard[]> {
  const t = SITE_T[locale]
  try {
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('properties')
      .select('slug,title_th,title_en,property_type,price_from,price_to,bedrooms,bathrooms,area_sqm,district,province,rental_term,created_at,images,lat,lng')
      .eq('listing_status', 'active')
      // A listing can sit past its end date with listing_status still 'active'
      // until the expiry cron catches it, so every public query carries this.
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(l => {
      const p = adaptDbListing(l, locale)
      // "Near BTS Udom Suk 600 m" reads better than a district name, and is what
      // renters search by. Listings more than 3 km from any station fall back to
      // the district.
      const near = nearestStation(Number(l.lat), Number(l.lng))
      const from = Number(l.price_from) || 0
      const to = Number(l.price_to) || 0
      return {
        slug: p.slug, title: p.title,
        price: from ? `฿${from.toLocaleString('en-US')}${to > from ? ` – ${to.toLocaleString('en-US')}` : ''}` : t.askForPrice,
        priceSuffix: from ? (CARD_TERM_SUFFIX[locale][l.rental_term] ?? CARD_DEFAULT_SUFFIX[locale]) : '',
        place: near ? `${t.near(stationLabel(near.station, locale))} ${distanceLabel(near.km, locale)}` : p.neighborhood,
        lineColor: near ? lineColor(near.station.systems[0]) : C.line,
        image: p.image, propertyType: p.propertyType,
      }
    })
  } catch {
    return []
  }
}

export default async function FeaturedListings({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const pool = await loadPool(locale)
  if (pool.length === 0) return null

  return (
    <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '56px 24px 72px', borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <h2 style={h2Style(26)}>{t.latestHeading}</h2>
        <Link href="/search" style={{ fontSize: 15, color: C.teal, textDecoration: 'none' }}>{t.viewAllCount(pool.length)}</Link>
      </div>

      <FeaturedGrid pool={pool} locale={locale} />

      <style>{`
        /* The split second before FeaturedGrid has picked this visitor's cards:
           the shells hold the layout, contents stay hidden so nothing jumps. */
        .sm-feat-pending .sm-card > * { visibility: hidden; }
        .sm-feat-pending .sm-card { background: ${C.line2}; border-radius: ${RADIUS}px; }
      `}</style>
      {/* No JavaScript, no reshuffle: show the server's cards as they are. */}
      <noscript><style>{`.sm-feat-pending .sm-card > * { visibility: visible !important; } .sm-feat-pending .sm-card { background: none !important; }`}</style></noscript>
    </section>
  )
}
