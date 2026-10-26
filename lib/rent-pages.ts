/**
 * "Rent near a place" landing pages — /rent/<slug> and /en/rent/<slug>.
 *
 * One page per station or landmark (ห้องเช่า-ใกล้-bts-อ่อนนุช), plus one per
 * place × property type (คอนโด-ใกล้-bts-อ่อนนุช). Every page is the same
 * template, filled from three sources:
 *
 *   1. The place registry — lib/stations.ts and lib/landmarks.ts as edited in
 *      /dashboard/places (mergePlaces). A place added there gets pages here
 *      with nothing else to do.
 *   2. Live listings within RADIUS_KM of the place, the same radius search the
 *      homepage university tiles and /search use.
 *   3. Wording from /dashboard/rent-pages: one template per locale with
 *      {place} {type} {count} {price_from} {radius} placeholders
 *      (site_settings key 'rent_page_template'), and per-page overrides on the
 *      seo_pages row whose slug is the page slug.
 *
 * INDEXING
 *   Every slug resolves, so a link never 404s as inventory comes and goes. A
 *   page is indexed, and listed in the sitemap, only with INDEX_MIN or more
 *   listings (district pages in lib/district-pages follow the same rule): a cluster
 *   of empty near-identical pages drags the whole domain down. A page crosses
 *   the line by itself the moment it has stock, and an admin can still force
 *   noindex per page.
 *
 * SLUGS
 *   Thai keywords, the same slug in both locales — the /area precedent, and
 *   what RentHub ranks with. lib/routes-i18n prefixes /rent/ unconditionally,
 *   which is safe because both locales resolve exactly the same slug set.
 */
import { cache } from 'react'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { createServerClient } from '@/lib/supabase'
import { mergePlaces } from '@/lib/search-places'
import { loadPlaceOverrides } from '@/lib/search-places-server'
import { haversineKm } from '@/lib/search-match'
import {
  RADIUS_KM, INDEX_MIN, RENT_TYPES, TYPE_PHRASE, TYPE_NAME, FOLDED_AREAS,
  rentPlaceKey, rentPlacePoint, rentPlaceLabel, rentSlug, rentPath, rentPlaces, slugIndex, decodeSlug,
  DEFAULT_TEMPLATE, TYPE_ALT_TH,
  type Locale, type RentPlace, type RentType, type RentTemplate, type TemplateStrings, type RentOverride, type RentPageSummary,
} from '@/lib/rent-slugs'

export * from '@/lib/rent-slugs'
import { defaultRentContent, splitLines, splitParagraphs } from '@/lib/rent-content'

export const SITE = 'https://spacesmate.com'
export const TEMPLATE_KEY = 'rent_page_template'

/** The place list as the admin left it. One read per request. */
export const loadRentPlaces = cache(async (): Promise<RentPlace[]> => {
  const { overrides } = await loadPlaceOverrides()
  return rentPlaces(mergePlaces(overrides))
})

// ── Listings ─────────────────────────────────────────────────────────────────

export type RentListing = {
  slug: string
  title_th: string
  title_en: string | null
  property_type: string
  price_from: number
  district: string | null
  images: string[] | null
  bedrooms: number | null
  area_sqm: number | null
  lat: number
  lng: number
}

/** Every active, unexpired listing with a map pin. One read per request. */
export const loadPinnedListings = cache(async (): Promise<RentListing[]> => {
  try {
    const { data, error } = await createServerClient()
      .from('properties')
      .select('slug, title_th, title_en, property_type, price_from, district, images, bedrooms, area_sqm, lat, lng')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(5000)
    if (error) {
      console.error('[rent-pages] listings —', error.message)
      return []
    }
    return (data ?? [])
      .map(r => ({ ...r, lat: Number(r.lat), lng: Number(r.lng), price_from: Number(r.price_from) || 0 }) as RentListing)
      .filter(l => l.slug && isFinite(l.lat) && isFinite(l.lng))
  } catch (err) {
    console.error('[rent-pages] listings —', err instanceof Error ? err.message : String(err))
    return []
  }
})

export type NearListing = RentListing & { km: number }

function listingsNear(place: RentPlace, listings: RentListing[]): NearListing[] {
  const pt = rentPlacePoint(place)
  return listings
    .map(l => ({ ...l, km: haversineKm(pt.lat, pt.lng, l.lat, l.lng) }))
    .filter(l => l.km <= RADIUS_KM)
    .sort((a, b) => a.km - b.km)
}

// ── Wording: template and per-page overrides ─────────────────────────────────
// TemplateStrings, DEFAULT_TEMPLATE and RentOverride live in rent-slugs so the
// dashboard (client) can import them.

/** Wording for a page with no listings yet, where {count} and {price_from} would read as nonsense. */
const EMPTY_COPY: Record<Locale, { desc: string; intro: string }> = {
  th: {
    desc: 'ค้นหา{subject}ใกล้{place} ในระยะ {radius} กม. ที่ SpacesMate ติดต่อเจ้าของโดยตรง ไม่มีค่านายหน้า',
    intro: 'ยังไม่มีประกาศในระยะ {radius} กม. จาก{place} ลองดูทำเลใกล้เคียงด้านล่าง หรือค้นหาด้วยระยะที่กว้างขึ้น',
  },
  en: {
    desc: 'Find {subject} near {place}, within {radius} km, on SpacesMate. Contact owners directly, with no agent fee.',
    intro: 'Nothing is listed within {radius} km of {place} yet. Try the nearby places below, or search a wider radius.',
  },
}

export function mergeTemplate(stored: unknown, defaults: RentTemplate = DEFAULT_TEMPLATE): RentTemplate {
  const out: RentTemplate = { th: { ...defaults.th }, en: { ...defaults.en } }
  if (!stored || typeof stored !== 'object') return out
  for (const locale of ['th', 'en'] as Locale[]) {
    const s = (stored as Record<string, unknown>)[locale]
    if (!s || typeof s !== 'object') continue
    for (const key of Object.keys(out[locale]) as (keyof TemplateStrings)[]) {
      const v = (s as Record<string, unknown>)[key]
      if (typeof v === 'string' && v.trim()) out[locale][key] = v.trim()
    }
  }
  return out
}

export function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m)).replace(/\s{2,}/g, ' ').trim()
}

/** A stored template (site_settings key) merged over its defaults. */
export const loadTemplateFor = cache(async (key: string, defaults: RentTemplate): Promise<RentTemplate> => {
  try {
    const { data, error } = await createServerClient()
      .from('site_settings').select('value').eq('key', key).maybeSingle()
    if (error) throw error
    return mergeTemplate(data?.value, defaults)
  } catch (err) {
    console.error('[rent-pages] template —', err instanceof Error ? err.message : String(err))
    return mergeTemplate(null, defaults)
  }
})
const loadTemplate = () => loadTemplateFor(TEMPLATE_KEY, DEFAULT_TEMPLATE)

/**
 * Per-page overrides: the seo_pages row whose slug is the page slug. Read with
 * select('*') so the page still renders, on the template, if the columns
 * added by the 20261025a migration are not there yet.
 */

export const loadOverrides = cache(async (): Promise<Map<string, RentOverride>> => {
  try {
    const { data, error } = await createServerClient()
      .from('seo_pages').select('*').not('place_key', 'is', null)
    if (error) throw error
    return new Map((data ?? []).map(r => [r.slug as string, r as RentOverride]))
  } catch (err) {
    console.error('[rent-pages] overrides —', err instanceof Error ? err.message : String(err))
    return new Map()
  }
})

// ── The page ─────────────────────────────────────────────────────────────────

export type RentLink = { path: string; label: string; count: number }

/** A listing as a landing page shows it; km is null on district pages. */
export type LandingListing = {
  slug: string
  title_th: string
  title_en: string | null
  property_type: string
  price_from: number
  district: string | null
  images: string[] | null
  bedrooms: number | null
  area_sqm: number | null
  km: number | null
}

/** What RentPageBody renders: a rent-near page or a district page. */
export type LandingView = {
  slug: string
  /** '/rent' or '/area' — the Thai path prefix. */
  basePath: '/rent' | '/area'
  /** /search pre-set to this page's place, for the empty state. */
  searchHref: string
  type: RentType | null
  placeLabel: string
  title: string
  description: string
  intro: string
  priceFrom: number | null
  indexable: boolean
  /** Type pages for this place with listings, for the chips under the h1. */
  typeLinks: (RentLink & { type: RentType | null })[]
  /** Other places within 3 km with listings, closest first. */
  nearby: RentLink[]
  /** Short answers built from the live numbers, plus any hand-written ones. */
  faq: { q: string; a: string }[]
  /** "Why people rent here" points and the area write-up; empty when none. */
  highlights: string[]
  body: string[]
  listings: LandingListing[]
}

export type RentView = LandingView & { place: RentPlace; listings: NearListing[] }

function typeLower(type: RentType): string {
  return TYPE_PHRASE.en[type].toLowerCase()
}

export function vars(placeLabel: string, type: RentType | null, locale: Locale, count: number, priceFrom: number | null) {
  return {
    place: placeLabel,
    type_short: type ? TYPE_NAME[locale][type] : '',
    type: type ? TYPE_PHRASE[locale][type] : '',
    type_lower: type ? typeLower(type) : '',
    count: String(count),
    price_from: priceFrom ? priceFrom.toLocaleString('en-US') : '',
    radius: String(RADIUS_KM),
    subject: type
      ? (locale === 'en' ? typeLower(type) : TYPE_NAME.th[type])
      : (locale === 'en' ? 'rooms, condos and apartments for rent' : 'ห้องเช่า คอนโด อพาร์ทเม้นท์'),
  }
}

function buildFaq(view: { listings: NearListing[]; placeLabel: string; type: RentType | null }, locale: Locale) {
  const { listings, placeLabel, type } = view
  if (!listings.length) return []
  const prices = listings.map(l => l.price_from).filter(p => p > 0).sort((a, b) => a - b)
  const median = prices.length ? prices[Math.floor((prices.length - 1) / 2)] : 0
  const nearest = listings[0]
  const fmt = (n: number) => n.toLocaleString('en-US')
  const what = type ? (locale === 'en' ? typeLower(type) : TYPE_NAME.th[type]) : (locale === 'en' ? 'rentals' : 'ที่พักให้เช่า')
  const out: { q: string; a: string }[] = []
  if (locale === 'en') {
    if (prices.length) out.push({
      q: `How much is rent near ${placeLabel}?`,
      a: `On SpacesMate, ${what} within ${RADIUS_KM} km of ${placeLabel} start at ฿${fmt(prices[0])} a month, with a typical asking rent of ฿${fmt(median)} across ${listings.length} listing${listings.length === 1 ? '' : 's'}.`,
    })
    out.push({
      q: `What is the closest rental to ${placeLabel}?`,
      a: `${nearest.title_en || nearest.title_th}, about ${nearest.km < 1 ? `${Math.round(nearest.km * 1000)} m` : `${nearest.km.toFixed(1)} km`} away, from ฿${fmt(nearest.price_from)} a month.`,
    })
    out.push({
      q: 'Do I pay an agent fee?',
      a: 'No. Listings on SpacesMate are posted by owners or their managers, and you contact them directly.',
    })
  } else {
    if (prices.length) out.push({
      q: `ค่าเช่าใกล้${placeLabel} เริ่มต้นเท่าไหร่?`,
      a: `${what}${type ? ` (${TYPE_ALT_TH[type]})` : ''}บน SpacesMate ในระยะ ${RADIUS_KM} กม. จาก${placeLabel} เริ่มต้น ฿${fmt(prices[0])}/เดือน ราคากลางอยู่ที่ ฿${fmt(median)}/เดือน จากทั้งหมด ${listings.length} ประกาศ`,
    })
    out.push({
      q: `ที่พักที่ใกล้${placeLabel}ที่สุดคือที่ไหน?`,
      a: `${nearest.title_th} ห่างประมาณ ${nearest.km < 1 ? `${Math.round(nearest.km * 1000)} ม.` : `${nearest.km.toFixed(1)} กม.`} ราคาเริ่มต้น ฿${fmt(nearest.price_from)}/เดือน`,
    })
    out.push({
      q: 'ต้องเสียค่านายหน้าหรือไม่?',
      a: 'ไม่ต้อง ประกาศบน SpacesMate ลงโดยเจ้าของหรือผู้ดูแลอาคาร คุณติดต่อได้โดยตรง',
    })
  }
  return out
}

function countsByType(listings: NearListing[]): Record<RentType, number> {
  const out = Object.fromEntries(RENT_TYPES.map(t => [t, 0])) as Record<RentType, number>
  for (const l of listings) if (l.property_type in out) out[l.property_type as RentType]++
  return out
}

/**
 * Everything a rent page renders, or null for an unknown slug. cache() shares
 * one resolution between generateMetadata and the page body.
 */
export const loadRentPage = cache(async (rawSlug: string, locale: Locale): Promise<RentView | null> => {
  const slug = decodeSlug(rawSlug)
  const places = await loadRentPlaces()
  const hit = slugIndex(places).get(slug)
  if (!hit) return null
  const { place, type } = hit

  const [all, template, overrides] = await Promise.all([loadPinnedListings(), loadTemplate(), loadOverrides()])
  const nearAll = listingsNear(place, all)
  const listings = type ? nearAll.filter(l => l.property_type === type) : nearAll
  const prices = listings.map(l => l.price_from).filter(p => p > 0)
  const priceFrom = prices.length ? Math.min(...prices) : null

  const v = vars(rentPlaceLabel(place, locale), type, locale, listings.length, priceFrom)
  const t = template[locale]
  const o = overrides.get(slug) ?? {}
  const pick = (s: string | null | undefined) => (typeof s === 'string' && s.trim() ? s.trim() : '')

  const title = pick(locale === 'en' ? o.title_en : o.title_th) || fillTemplate(type ? t.title_type : t.title_all, v)
  const description = pick(locale === 'en' ? o.meta_description_en : o.meta_description)
    || fillTemplate(listings.length ? (type ? t.desc_type : t.desc_all) : EMPTY_COPY[locale].desc, v)
  const intro = pick(locale === 'en' ? o.intro_en : o.intro_th)
    || fillTemplate(listings.length ? (type ? t.intro_type : t.intro_all) : EMPTY_COPY[locale].intro, v)

  const byType = countsByType(nearAll)
  const typeLinks = [
    { type: null, path: rentPath(place, null), label: locale === 'en' ? 'All types' : 'ทุกประเภท', count: nearAll.length },
    ...RENT_TYPES.filter(rt => byType[rt] > 0).map(rt => ({ type: rt, path: rentPath(place, rt), label: TYPE_NAME[locale][rt], count: byType[rt] })),
  ]

  // Neighbouring places with stock, so a thin page still leads somewhere and
  // the cluster links itself together the way RentHub's station pages do.
  const here = rentPlacePoint(place)
  const nearby = places
    .filter(p => rentPlaceKey(p) !== rentPlaceKey(place))
    .map(p => ({ p, km: haversineKm(here.lat, here.lng, rentPlacePoint(p).lat, rentPlacePoint(p).lng) }))
    .filter(x => x.km <= 3)
    .map(x => {
      const near = listingsNear(x.p, all)
      const n = type ? near.filter(l => l.property_type === type).length : near.length
      return { km: x.km, link: { path: rentPath(x.p, type), label: rentPlaceLabel(x.p, locale), count: n } }
    })
    .filter(x => x.link.count > 0)
    .sort((a, b) => a.km - b.km)
    .slice(0, 12)
    .map(x => x.link)

  // Write-up: the page's own override, else the drafted or carried-over text.
  const fallback = defaultRentContent(rentPlaceKey(place), type)
  const ownHighlights = splitLines(locale === 'en' ? o.highlights_en : o.highlights_th)
  const ownBody = splitParagraphs(locale === 'en' ? o.body_en : o.body_th)
  const highlights = ownHighlights.length ? ownHighlights : (fallback ? fallback.highlights[locale] : [])
  const body = ownBody.length ? ownBody : (fallback ? fallback.body[locale] : [])

  const placeLabel = rentPlaceLabel(place, locale)
  return {
    slug, basePath: '/rent' as const, place, type, placeLabel, title, description, intro, listings, priceFrom,
    searchHref: `/search?${place.kind === 'station' ? `station=${place.id}` : `landmark=${encodeURIComponent(place.id)}`}&r=5`,
    indexable: listings.length >= INDEX_MIN && o.noindex !== true,
    typeLinks, nearby,
    faq: [...buildFaq({ listings, placeLabel, type }, locale), ...(fallback?.faq[locale] ?? [])],
    highlights, body,
  }
})

// ── Every page, for the sitemap, the homepage and the dashboard ─────────────


/** Every page with its live count. Listings × places, done in memory. */
export async function listRentPages(): Promise<RentPageSummary[]> {
  const [places, all, overrides] = await Promise.all([loadRentPlaces(), loadPinnedListings(), loadOverrides()])
  const seen = new Set<string>()
  const out: RentPageSummary[] = []
  for (const place of places) {
    const near = listingsNear(place, all)
    const byType = countsByType(near)
    for (const type of [null, ...RENT_TYPES]) {
      const slug = rentSlug(place, type)
      if (seen.has(slug)) continue
      seen.add(slug)
      const count = type ? byType[type] : near.length
      const o = overrides.get(slug) ?? null
      out.push({
        slug, path: `/rent/${slug}`, placeKey: rentPlaceKey(place), placeKind: place.kind,
        placeTh: rentPlaceLabel(place, 'th'), placeEn: rentPlaceLabel(place, 'en'),
        type, count, indexable: count >= INDEX_MIN && o?.noindex !== true, override: o,
      })
    }
  }
  return out
}

/** The old /area slug folded into this rent page, if any — for its hand-written text. */

/** Metadata for both locales. Shares loadRentPage's cache() entry with the body. */
export async function buildRentMetadata(rawSlug: string, locale: Locale) {
  const view = await loadRentPage(rawSlug, locale)
  if (!view) return { title: locale === 'en' ? 'Page not found' : 'ไม่พบหน้า', robots: { index: false, follow: true } }
  const path = `/rent/${encodeURI(view.slug)}`
  const th = `${SITE}${path}`
  const en = `${SITE}/en${path}`
  return {
    title: view.title,
    description: view.description,
    openGraph: { title: `${view.title} | SpacesMate`, description: view.description, type: 'website' as const, images: [DEFAULT_OG_IMAGE], url: locale === 'en' ? en : th },
    alternates: { canonical: locale === 'en' ? en : th, languages: { th, en, 'x-default': th } },
    robots: view.indexable ? { index: true, follow: true } : { index: false, follow: true },
  }
}
