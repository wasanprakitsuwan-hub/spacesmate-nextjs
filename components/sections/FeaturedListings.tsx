// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import Image from 'next/image'
import { Property } from '@/lib/property-data'
import { createServerClient } from '@/lib/supabase'
import { SITE_T, CARD_TERM_SUFFIX, CARD_DEFAULT_SUFFIX, type Locale } from '@/lib/site-i18n'
import { districtLabel, provinceLabel } from '@/lib/geo-i18n'

const TYPE_KEYS: Record<string, 'apartment' | 'condoShort' | 'office' | 'coSpace'> = {
  Apartment: 'apartment', Condo: 'condoShort', Office: 'office', 'Co-Working': 'coSpace',
}
const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
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

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The six cards, loaded on the server.
 *
 * This used to fetch /api/listings/public from the browser, which meant the
 * links to those six listings were never in the HTML the server sent. A crawler
 * reads that HTML and follows its links; it got sixteen area links and not one
 * property link, so every listing was discovered through the sitemap alone —
 * a weaker signal than being linked from the home page. GeneratedAreaLinks is a
 * server component for exactly this reason and says so in its own comment.
 *
 * Columns are listed rather than selected with *, so the home page does not
 * start shipping full description bodies inside its HTML.
 *
 * Fair Rotation still rotates. A server shuffle would freeze if the page were
 * statically generated, but createServerClient passes cache: 'no-store' to
 * every query, which opts both home routes out of prerendering — they render
 * fresh per request, and the cards are reshuffled each time.
 */
async function loadListings(locale: Locale): Promise<Property[]> {
  try {
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('properties')
      .select('id,slug,title_th,title_en,description_th,property_type,price_from,price_to,bedrooms,bathrooms,area_sqm,floor,address_th,district,sub_district,province,lat,lng,amenities,rental_term,created_at,images')
      .eq('listing_status', 'active')
      // A listing can sit past its end date with listing_status still 'active'
      // until the expiry cron catches it, so every public query carries this.
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return shuffle((data ?? []).map(l => adaptDbListing(l, locale))).slice(0, 6)
  } catch {
    return []
  }
}

export default async function FeaturedListings({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const displayed = await loadListings(locale)

  return (
    <section style={{ background: '#f7f9f8', padding: '56px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.4px', color: '#02402e' }}>{t.latestHeading}</h2>
            <p style={{ color: '#64748b', fontSize: 15, margin: 0, fontWeight: 300 }}>{t.latestSub}</p>
          </div>
          <Link href="/search" style={{ color: '#048c73', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>
            {t.viewAllArrow}
          </Link>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="sm-feat-grid">
          {displayed.map((p) => {
            const bedroomLabel = p.bedrooms === 0 ? t.studio : t.bedroomsValue(p.bedrooms)
            const grad = GRADS[p.propertyType] || GRADS.default
            return (
              <Link key={p.slug} href={locale === 'en' ? `/en/property/${p.slug}` : `/property/${p.slug}`} className="sm-feat-card"
                style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', display: 'block', textDecoration: 'none', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)' }}>
                {/* Image */}
                <div style={{ height: 185, background: grad, position: 'relative', overflow: 'hidden' }}>
                  {p.image && (
                    <Image src={p.image} alt={p.title} fill
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                      className="sm-feat-img"
                      style={{ objectFit: 'cover', transition: 'transform .3s' }} />
                  )}
                  <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6 }}>
                    {t[TYPE_KEYS[p.propertyType]] ?? p.propertyType}
                  </span>
                </div>
                {/* Content */}
                <div style={{ padding: 16 }}>
                  <p style={{ color: '#048c73', fontSize: 12, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}
                  </p>
                  <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, color: '#231f20', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="sm-feat-title">
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f3f5f4', paddingTop: 10, marginBottom: 10, fontSize: 11, color: '#7a8a85' }}>
                    <span>{bedroomLabel}</span>
                    {p.bathrooms > 0 && <span>{t.bathroomsValue(p.bathrooms)}</span>}
                    {p.size && <span>{t.sqm(p.size)}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#d97f11' }}>{p.priceDisplay}</span>
                    <span style={{ color: '#048c73', fontSize: 12.5, fontWeight: 600 }}>{t.viewDetail}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/search"
            style={{ display: 'inline-block', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 28px', borderRadius: 24, textDecoration: 'none' }}>
            {t.viewAll}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .sm-feat-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .sm-feat-grid { grid-template-columns: 1fr !important; } }
        .sm-feat-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-feat-card:hover .sm-feat-img { transform: scale(1.06) !important; }
        .sm-feat-card:hover .sm-feat-title { color: #02402e !important; }
      `}</style>
    </section>
  )
}
