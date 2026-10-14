/**
 * Data loading and metadata for the property pages, shared by both locales.
 *
 * The page itself lives in components/property/PropertyPageBody. Keeping the
 * loader and the metadata builder here means the Thai route, the English route
 * and generateMetadata all read from one implementation.
 */
import type { Metadata } from 'next'
import type { Property } from '@/lib/property-data'
import { getPropertyBySlug } from '@/lib/property-data'
import { createServerClient } from '@/lib/supabase'
import { visibleImages, showsVideo } from '@/lib/packages'
import { PROPERTY_T, TERM_SUFFIX, DEFAULT_TERM_SUFFIX, type Locale } from '@/lib/property-i18n'
import { districtLabel, provinceLabel } from '@/lib/geo-i18n'

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

/** Metadata for both locales. */
export async function buildPropertyMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const t = PROPERTY_T[locale]
  // Database first. Static data is legacy demo content, and checking it first
  // let a stale entry shadow a real listing that shared a slug.
  const raw = await getDbPropertyRaw(slug)
  const path = locale === 'en' ? `/en/property/${slug}` : `/property/${slug}`
  const other = locale === 'en' ? `/property/${slug}` : `/en/property/${slug}`
  const alternates = {
    canonical: path,
    languages: locale === 'en' ? { th: other } : { en: other },
  }

  if (!raw) {
    const staticP = getPropertyBySlug(slug)
    if (staticP) {
      return {
        title: `${staticP.title} | SpacesMate`,
        description: staticP.excerpt,
        openGraph: {
          title: staticP.title,
          description: staticP.excerpt,
          images: staticP.image ? [{ url: staticP.image, alt: staticP.title }] : [],
          type: 'website',
        },
        alternates,
      }
    }
    return { title: t.notFoundTitle }
  }

  const title = (locale === 'en'
    ? (raw.title_en || raw.title_th)
    : (raw.title_th || raw.title_en)) || t.fallbackListingName
  // Description follows the same fallback as the page body: show the owner's
  // English if they wrote it, otherwise their Thai rather than nothing.
  const body = locale === 'en' ? (raw.description_en || raw.description_th) : raw.description_th
  const description = plainText(body, 160)
  return {
    title: `${title} | SpacesMate`,
    description,
    openGraph: { title, description, type: 'website' },
    alternates,
  }
}
