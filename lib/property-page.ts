/**
 * Data loading and metadata for the property pages, shared by both locales.
 *
 * The page itself lives in components/property/PropertyPageBody. Keeping the
 * loader and the metadata builder here means the Thai route, the English route
 * and generateMetadata all read from one implementation.
 */
import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import type { Property } from '@/lib/property-data'
import { getPropertyBySlug } from '@/lib/property-data'
import { createServerClient } from '@/lib/supabase'
import { visibleImages, showsVideo } from '@/lib/packages'
import { PROPERTY_T, TERM_SUFFIX, DEFAULT_TERM_SUFFIX, type Locale } from '@/lib/property-i18n'
import { districtLabel, provinceLabel } from '@/lib/geo-i18n'
import { nearbyStations, stationLabel, distanceLabel, haversineKm } from '@/lib/search-match'

const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}

/** Catch-all segments join into one slug; Next 14 delivers Thai percent-encoded. */
export function joinSlug(segments: string[]): string {
  return segments.map(s => { try { return decodeURIComponent(s) } catch { return s } }).join('/')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDbPropertyRaw(slug: string): Promise<any | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .eq('listing_status', 'active')
      .single()
    return data ?? null
  } catch {
    return null
  }
}

/**
 * Related listings for a database listing — same property type, newest first.
 *
 * This used to come from the static array in lib/property-data, which is legacy
 * demo content: its 14 entries are not in the sitemap, several duplicate a real
 * listing of the same building under a different slug, and every string on them
 * is hardcoded Thai, so the English page rendered "฿4,400/เดือน" on its own
 * cards. Reading the database instead fixes the language, keeps the cards in
 * step with what is actually let, and removes the only internal link path into
 * the orphaned legacy pages.
 *
 * Returns [] on any failure — a missing related strip is not worth a 500.
 */
export async function getRelatedDbListings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  locale: Locale,
  limit = 3,
): Promise<Property[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('listing_status', 'active')
      // Every other public query carries this; without it the strip can show a
      // listing that is past its end date but still flagged active, because
      // listing_status is only corrected when the expiry cron runs.
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .eq('property_type', raw.property_type)
      .neq('slug', raw.slug)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map(r => normalizeDbListing(r, locale))
  } catch {
    return []
  }
}

/**
 * The nearest other live listings to this one, any type, closest first, with
 * the distance from this listing's pin. Replaced "same type, newest" in the
 * 2026 redesign: a renter looking at a room wants the alternatives around it.
 * Listings without a pin, or a page without one, fall back to getRelatedDbListings.
 */
export async function getNearbyDbListings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  locale: Locale,
  limit = 3,
): Promise<{ p: Property; km: number | null }[]> {
  const lat = Number(raw.lat), lng = Number(raw.lng)
  if (!raw.lat || !raw.lng || !isFinite(lat) || !isFinite(lng)) {
    return (await getRelatedDbListings(raw, locale, limit)).map(p => ({ p, km: null }))
  }
  try {
    const { data } = await createServerClient()
      .from('properties')
      .select('*')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .neq('slug', raw.slug)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(2000)
    return (data ?? [])
      // Rooms in the same building have their own block on the page.
      .filter(r => !raw.property_name_id || r.property_name_id !== raw.property_name_id)
      .map(r => ({ r, km: haversineKm(lat, lng, Number(r.lat), Number(r.lng)) }))
      .filter(x => isFinite(x.km))
      .sort((a, b) => a.km - b.km)
      .slice(0, limit)
      .map(x => ({ p: normalizeDbListing(x.r, locale), km: x.km }))
  } catch {
    return []
  }
}

/** Other live listings in the same building (property_name_id), newest first. */
export async function getSameBuildingListings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  locale: Locale,
  limit = 4,
): Promise<Property[]> {
  if (!raw.property_name_id) return []
  try {
    const { data } = await createServerClient()
      .from('properties')
      .select('*')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .eq('property_name_id', raw.property_name_id)
      .neq('slug', raw.slug)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map(r => normalizeDbListing(r, locale))
  } catch {
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeDbListing(raw: any, locale: Locale): Property {
  const t = PROPERTY_T[locale]
  const suffix = TERM_SUFFIX[locale][raw.rental_term] ?? DEFAULT_TERM_SUFFIX[locale]
  return {
    id: 0,
    slug: raw.slug,
    // English pages lead with the owner's English title and fall back to Thai,
    // so a listing never loses its name just because no translation exists.
    title: (locale === 'en'
      ? (raw.title_en || raw.title_th)
      : (raw.title_th || raw.title_en)) || t.untitled,
    excerpt: '',
    priceMin: raw.price_from || 0,
    priceDisplay: raw.price_from
      ? `฿${Number(raw.price_from).toLocaleString('en-US')}${suffix}`
      : t.askForPrice,
    bedrooms: raw.bedrooms || 0,
    bathrooms: raw.bathrooms || 0,
    size: raw.area_sqm ? String(raw.area_sqm) : '',
    address: raw.address_th || '',
    // District and province come from the national list, not the owner's prose,
    // so they can be shown in the reader's language. Unknown values fall back to
    // the stored Thai rather than disappearing.
    neighborhood:
      districtLabel(raw.district, raw.province, locale) ||
      provinceLabel(raw.province, locale) ||
      t.defaultProvince,
    lat: raw.lat ? String(raw.lat) : '',
    lng: raw.lng ? String(raw.lng) : '',
    image: (() => { const imgs = Array.isArray(raw.images) ? raw.images : []; return imgs.find((i: string) => i.startsWith('https://')) ?? imgs.find((i: string) => i.startsWith('/')) ?? ''; })(),
    // Packages are a display entitlement. An owner may store up to the largest
    // allowance whatever they bought; this is where the package they actually
    // hold decides how much of it the public sees — the first N in their own
    // order, so the owner controls the selection by reordering rather than by
    // deleting work.
    images: visibleImages(
      Array.isArray(raw.images) ? raw.images.filter((img: string) => img.startsWith('https://') || img.startsWith('/')) : [],
      raw.package_type,
    ),
    // Held for every package, rendered only for the ones that include it, so an
    // upgrade reveals a video the owner already supplied instead of asking for
    // it again.
    videoUrl: showsVideo(raw.package_type) ? (raw.video_url || '') : '',
    propertyType: DB_TYPE_MAP[raw.property_type] ?? 'Condo',
    listingType: 'Rent',
    amenities: raw.amenities || [],
    featured: false,
    date: raw.created_at || '',
  }
}

/**
 * RichEditor stores HTML. Meta tags and JSON-LD need plain, bounded text —
 * the meta description was shipping the whole description body as raw markup.
 */
export function plainText(html: string | null | undefined, max: number): string {
  if (!html) return ''
  const txt = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  if (txt.length <= max) return txt
  const cut = txt.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…'
}

const LISTING_TYPE: Record<Locale, Record<string, string>> = {
  th: { condo: 'คอนโดให้เช่า', apartment: 'อพาร์ทเม้นท์ให้เช่า', house: 'บ้านเช่า', office: 'ออฟฟิศให้เช่า', coworking: 'โคเวิร์กกิ้งสเปซ' },
  en: { condo: 'Condo for rent', apartment: 'Apartment for rent', house: 'House for rent', office: 'Office for rent', coworking: 'Co-working space' },
}

/**
 * The searchable facts of a listing, in the reader's language: type, rent,
 * size, nearest station with walking distance, district. Leads the meta
 * description because owners' own text is often a few words, or Thai on an
 * English page, and these are the words people actually search with.
 */
function listingFacts(raw: any, locale: Locale): { lead: string; near: string | null } {
  const en = locale === 'en'
  const parts: string[] = []
  const type = LISTING_TYPE[locale][String(raw.property_type || '').toLowerCase()]
  if (type) parts.push(type)
  if (raw.price_from) {
    const suffix = TERM_SUFFIX[locale][raw.rental_term] ?? DEFAULT_TERM_SUFFIX[locale]
    parts.push(`฿${Number(raw.price_from).toLocaleString('en-US')}${suffix}`)
  }
  if (raw.bedrooms) parts.push(en ? `${raw.bedrooms} bed` : `${raw.bedrooms} ห้องนอน`)
  if (raw.area_sqm) parts.push(en ? `${raw.area_sqm} m²` : `${raw.area_sqm} ตร.ม.`)
  const st = raw.lat && raw.lng ? nearbyStations(Number(raw.lat), Number(raw.lng), 2, 1)[0] : undefined
  const near = st ? stationLabel(st.station, locale) : null
  if (st) parts.push(en ? `${distanceLabel(st.km, locale)} to ${near}` : `ห่าง ${near} ${distanceLabel(st.km, locale)}`)
  const district = districtLabel(raw.district, raw.province, locale)
  if (district) parts.push(district)
  return { lead: parts.join(' · '), near }
}

/** Metadata for both locales. */
export async function buildPropertyMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const t = PROPERTY_T[locale]
  // Database first. Static data is legacy demo content, and checking it first
  // let a stale entry shadow a real listing that shared a slug.
  const raw = await getDbPropertyRaw(slug)
  const path = locale === 'en' ? `/en/property/${slug}` : `/property/${slug}`
  const alternates = {
    canonical: path,
    // Full set on both sides: self, twin and x-default (Thai). See lib/hreflang.
    languages: { th: `/property/${slug}`, en: `/en/property/${slug}`, 'x-default': `/property/${slug}` },
  }

  if (!raw) {
    const staticP = getPropertyBySlug(slug)
    if (staticP) {
      return {
        title: staticP.title,
        description: staticP.excerpt,
        openGraph: {
          title: staticP.title,
          description: staticP.excerpt,
          images: staticP.image ? [{ url: staticP.image, alt: staticP.title }] : [DEFAULT_OG_IMAGE],
          type: 'website',
        },
        alternates,
      }
    }
    return { title: t.notFoundTitle }
  }

  const facts = listingFacts(raw, locale)
  let title = (locale === 'en'
    ? (raw.title_en || raw.title_th)
    : (raw.title_th || raw.title_en)) || t.fallbackListingName
  // A bare building name says nothing to a searcher; add the nearest station.
  if (title.length < 30 && facts.near && !title.includes(facts.near)) {
    title = locale === 'en' ? `${title} near ${facts.near}` : `${title} ใกล้ ${facts.near}`
  }
  // Facts first, then the owner's own words. On English pages the owner's Thai
  // is left out rather than mixed in; a short English line takes its place.
  const body = locale === 'en'
    ? (raw.description_en || 'Contact the owner directly on SpacesMate.')
    : (raw.description_th || 'ติดต่อเจ้าของโดยตรงที่ SpacesMate')
  const description = plainText(facts.lead ? `${facts.lead}. ${body}` : body, 160)
  // The listing's own cover photo, so a shared link previews the room itself.
  const imgs: string[] = Array.isArray(raw.images) ? raw.images : []
  const cover = imgs.find(i => i.startsWith('https://')) ?? imgs.find(i => i.startsWith('/'))
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: cover ? [{ url: cover, alt: title }] : [DEFAULT_OG_IMAGE] },
    alternates,
  }
}
