/**
 * District landing pages — /area/<slug> and /en/area/<slug>.
 *
 * The sibling of lib/rent-pages: same layout (RentPageBody), same indexing
 * rule, same dashboard. Where rent pages take listings within a radius of a
 * point, district pages take listings whose `district` field names the
 * district, which is how renters search too ("เช่าคอนโด วัฒนา").
 *
 * SLUGS
 *   Per type, unchanged from lib/areas, because Google already has them:
 *     /area/เช่าคอนโด-วัฒนา
 *   All types, new on 25 Oct 2026:
 *     /area/ห้องเช่า-วัฒนา
 *   A district exists if it is one of Bangkok's 50 or any listing names it, so
 *   a Bangkok district page never 404s when its last listing expires; it goes
 *   noindex instead.
 *
 * INDEXING
 *   INDEX_MIN listings, as for rent pages. lib/areas used to make a page, and
 *   index it, from a single listing.
 */
import { cache } from 'react'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import { createServerClient } from '@/lib/supabase'
import { slugify } from '@/lib/slug'
import { haversineKm } from '@/lib/search-match'
import { districtEn } from '@/lib/geo-i18n'
import { DISTRICT_EN_BY_PAIR } from '@/lib/thai-districts.generated'
import { areaSlug, stripDistrictPrefix } from '@/lib/areas'
import {
  SITE, INDEX_MIN, RENT_TYPES, TYPE_NAME, TYPE_PHRASE, TYPE_ALT_TH, DEFAULT_DISTRICT_TEMPLATE, decodeSlug,
  loadRentPlaces, loadPinnedListings, loadOverrides, loadTemplateFor, fillTemplate, vars,
  rentPlacePoint, rentPlaceLabel, rentPath,
  type LandingView, type LandingListing, type RentLink, type Locale, type RentType, type RentPageSummary,
} from '@/lib/rent-pages'
import { defaultRentContent, splitLines, splitParagraphs } from '@/lib/rent-content'

export const DISTRICT_TEMPLATE_KEY = 'district_page_template'
const loadDistrictTemplate = () => loadTemplateFor(DISTRICT_TEMPLATE_KEY, DEFAULT_DISTRICT_TEMPLATE)

type DistrictListing = Omit<LandingListing, 'km'> & { province: string | null; lat: number | null; lng: number | null }

export type District = {
  /** Bare Thai name, no เขต prefix: the grouping key, as lib/areas used. */
  key: string
  labelTh: string
  labelEn: string
  listings: DistrictListing[]
  /** Average of the pinned listings, for "nearby"; null with none pinned. */
  centre: { lat: number; lng: number } | null
}

const BANGKOK = 'กรุงเทพมหานคร'

/** Every active, unexpired listing with a district. One read per request. */
const loadDistrictListings = cache(async (): Promise<DistrictListing[]> => {
  try {
    const { data, error } = await createServerClient()
      .from('properties')
      .select('slug, title_th, title_en, property_type, price_from, district, province, images, bedrooms, area_sqm, lat, lng')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .not('district', 'is', null)
      .limit(5000)
    if (error) {
      console.error('[district-pages] listings —', error.message)
      return []
    }
    return (data ?? [])
      .filter(r => r.slug && String(r.district ?? '').trim())
      .map(r => ({
        ...r,
        property_type: String(r.property_type ?? '').toLowerCase(),
        price_from: Number(r.price_from) || 0,
        lat: r.lat == null ? null : Number(r.lat),
        lng: r.lng == null ? null : Number(r.lng),
      }) as DistrictListing)
  } catch (err) {
    console.error('[district-pages] listings —', err instanceof Error ? err.message : String(err))
    return []
  }
})

/** Bangkok's 50 districts plus any district a listing names, busiest first. */
export const loadDistricts = cache(async (): Promise<District[]> => {
  const listings = await loadDistrictListings()
  const map = new Map<string, District>()
  const ensure = (key: string, province: string | null) => {
    let d = map.get(key)
    if (!d) {
      d = { key, labelTh: key, labelEn: districtEn(key, province) ?? key, listings: [], centre: null }
      map.set(key, d)
    }
    return d
  }
  for (const k of Object.keys(DISTRICT_EN_BY_PAIR)) {
    const [prov, name] = k.split('|')
    if (prov === BANGKOK) ensure(name, BANGKOK)
  }
  for (const l of listings) {
    const key = stripDistrictPrefix(String(l.district))
    if (key) ensure(key, l.province).listings.push(l)
  }
  for (const d of Array.from(map.values())) {
    const pinned = d.listings.filter(l => l.lat !== null && l.lng !== null && isFinite(l.lat) && isFinite(l.lng))
    if (pinned.length) {
      d.centre = {
        lat: pinned.reduce((s, l) => s + (l.lat as number), 0) / pinned.length,
        lng: pinned.reduce((s, l) => s + (l.lng as number), 0) / pinned.length,
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.listings.length - a.listings.length)
})

export function districtSlug(d: Pick<District, 'key'>, type: RentType | null): string {
  return type ? areaSlug(d.key, type) : slugify(`ห้องเช่า-${d.key}`, 80)
}

function countsByType(listings: { property_type: string }[]): Record<RentType, number> {
  const out = Object.fromEntries(RENT_TYPES.map(t => [t, 0])) as Record<RentType, number>
  for (const l of listings) if (l.property_type in out) out[l.property_type as RentType]++
  return out
}

const resolveSlug = cache(async (raw: string) => {
  const slug = decodeSlug(raw)
  for (const d of await loadDistricts()) {
    for (const type of [null, ...RENT_TYPES]) if (districtSlug(d, type) === slug) return { slug, district: d, type }
  }
  return null
})

function median(sorted: number[]): number {
  return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : 0
}

function buildFaq(listings: DistrictListing[], label: string, type: RentType | null, locale: Locale, stations: string[]) {
  if (!listings.length) return []
  const prices = listings.map(l => l.price_from).filter(p => p > 0).sort((a, b) => a - b)
  const fmt = (n: number) => n.toLocaleString('en-US')
  const out: { q: string; a: string }[] = []
  if (locale === 'en') {
    const what = type ? TYPE_PHRASE.en[type].toLowerCase() : 'rentals'
    if (prices.length) out.push({
      q: `How much is rent in ${label}?`,
      a: `On SpacesMate, ${what} in ${label} start at ฿${fmt(prices[0])} a month, with a typical asking rent of ฿${fmt(median(prices))} across ${listings.length} listing${listings.length === 1 ? '' : 's'}.`,
    })
    if (stations.length) out.push({
      q: `Which train stations serve ${label}?`,
      a: `Stations with rentals around ${label} include ${stations.slice(0, 4).join(', ')}.`,
    })
    out.push({ q: 'Do I pay an agent fee?', a: 'No. Listings on SpacesMate are posted by owners or their managers, and you contact them directly.' })
  } else {
    const what = type ? `${TYPE_NAME.th[type]} (${TYPE_ALT_TH[type]})` : 'ที่พักให้เช่า'
    if (prices.length) out.push({
      q: `ค่าเช่าในเขต${label} เริ่มต้นเท่าไหร่?`,
      a: `${what}ในเขต${label}บน SpacesMate เริ่มต้น ฿${fmt(prices[0])}/เดือน ราคากลางอยู่ที่ ฿${fmt(median(prices))}/เดือน จากทั้งหมด ${listings.length} ประกาศ`,
    })
    if (stations.length) out.push({
      q: `เขต${label}มีรถไฟฟ้าสถานีไหนบ้าง?`,
      a: `สถานีที่มีที่พักให้เช่าในย่าน${label} เช่น ${stations.slice(0, 4).join(' ')}`,
    })
    out.push({ q: 'ต้องเสียค่านายหน้าหรือไม่?', a: 'ไม่ต้อง ประกาศบน SpacesMate ลงโดยเจ้าของหรือผู้ดูแลอาคาร คุณติดต่อได้โดยตรง' })
  }
  return out
}

export type DistrictView = LandingView & { district: District }

export const loadDistrictPage = cache(async (rawSlug: string, locale: Locale): Promise<DistrictView | null> => {
  const hit = await resolveSlug(rawSlug)
  if (!hit) return null
  const { slug, district, type } = hit
  const [template, overrides, districts, places, pinned] = await Promise.all([
    loadDistrictTemplate(), loadOverrides(), loadDistricts(), loadRentPlaces(), loadPinnedListings(),
  ])

  const all = district.listings
  const picked = (type ? all.filter(l => l.property_type === type) : all)
    .slice().sort((a, b) => (a.price_from || Infinity) - (b.price_from || Infinity))
  const listings: LandingListing[] = picked.map(({ province: _p, lat: _a, lng: _b, ...l }) => ({ ...l, km: null }))
  const prices = picked.map(l => l.price_from).filter(p => p > 0)
  const priceFrom = prices.length ? Math.min(...prices) : null

  const label = locale === 'en' ? district.labelEn : district.labelTh
  const v = vars(label, type, locale, listings.length, priceFrom)
  const t = template[locale]
  const o = overrides.get(slug) ?? {}
  const pick = (s: string | null | undefined) => (typeof s === 'string' && s.trim() ? s.trim() : '')
  const empty = locale === 'en'
    ? { desc: `Find rentals in ${label} on SpacesMate. Contact owners directly, with no agent fee.`, intro: `Nothing is listed in ${label} yet. Try the nearby areas below.` }
    : { desc: `ค้นหาที่พักให้เช่าในเขต${label} ที่ SpacesMate ติดต่อเจ้าของโดยตรง ไม่มีค่านายหน้า`, intro: `ยังไม่มีประกาศในเขต${label} ลองดูทำเลใกล้เคียงด้านล่าง` }

  const title = pick(locale === 'en' ? o.title_en : o.title_th) || fillTemplate(type ? t.title_type : t.title_all, v)
  const description = pick(locale === 'en' ? o.meta_description_en : o.meta_description)
    || (listings.length ? fillTemplate(type ? t.desc_type : t.desc_all, v) : empty.desc)
  const intro = pick(locale === 'en' ? o.intro_en : o.intro_th)
    || (listings.length ? fillTemplate(type ? t.intro_type : t.intro_all, v) : empty.intro)

  const byType = countsByType(all)
  const typeLinks = [
    { type: null, path: `/area/${districtSlug(district, null)}`, label: locale === 'en' ? 'All types' : 'ทุกประเภท', count: all.length },
    ...RENT_TYPES.filter(rt => byType[rt] > 0).map(rt => ({ type: rt, path: `/area/${districtSlug(district, rt)}`, label: TYPE_NAME[locale][rt], count: byType[rt] })),
  ]

  // Nearby: stations and landmarks with stock around the district's listings,
  // then the closest other districts. Links the two page families together.
  const nearby: RentLink[] = []
  const stationNames: string[] = []
  if (district.centre) {
    const c = district.centre
    const near = places
      .map(p => ({ p, km: haversineKm(c.lat, c.lng, rentPlacePoint(p).lat, rentPlacePoint(p).lng) }))
      .filter(x => x.km <= 2.5)
      .sort((a, b) => a.km - b.km)
    for (const { p } of near) {
      const pt = rentPlacePoint(p)
      const n = pinned.filter(l => (!type || l.property_type === type) && haversineKm(pt.lat, pt.lng, l.lat, l.lng) <= 2).length
      if (!n) continue
      if (p.kind === 'station') stationNames.push(rentPlaceLabel(p, locale))
      if (nearby.length < 8) nearby.push({ path: rentPath(p, type), label: rentPlaceLabel(p, locale), count: n })
    }
    const others = districts
      .filter(d => d.key !== district.key && d.centre)
      .map(d => ({ d, km: haversineKm(c.lat, c.lng, d.centre!.lat, d.centre!.lng) }))
      .sort((a, b) => a.km - b.km)
    for (const { d } of others) {
      if (nearby.length >= 12) break
      const n = type ? d.listings.filter(l => l.property_type === type).length : d.listings.length
      if (n) nearby.push({ path: `/area/${districtSlug(d, type)}`, label: locale === 'en' ? d.labelEn : `เขต${d.labelTh}`, count: n })
    }
  }

  const placeKey = `district:${district.key}`
  const fallback = defaultRentContent(placeKey, type)
  const ownHighlights = splitLines(locale === 'en' ? o.highlights_en : o.highlights_th)
  const ownBody = splitParagraphs(locale === 'en' ? o.body_en : o.body_th)

  return {
    slug, basePath: '/area', district, type,
    searchHref: `/search?q=${encodeURIComponent(district.labelTh)}`,
    placeLabel: locale === 'en' ? district.labelEn : `เขต${district.labelTh}`,
    title, description, intro, listings, priceFrom,
    indexable: listings.length >= INDEX_MIN && o.noindex !== true,
    typeLinks, nearby,
    faq: [...buildFaq(picked, label, type, locale, stationNames), ...(fallback?.faq[locale] ?? [])],
    highlights: ownHighlights.length ? ownHighlights : (fallback ? fallback.highlights[locale] : []),
    body: ownBody.length ? ownBody : (fallback ? fallback.body[locale] : []),
  }
})

/** Every district page with its count, for the sitemap and the dashboard. */
export async function listDistrictPages(): Promise<RentPageSummary[]> {
  const [districts, overrides] = await Promise.all([loadDistricts(), loadOverrides()])
  const out: RentPageSummary[] = []
  const seen = new Set<string>()
  for (const d of districts) {
    const byType = countsByType(d.listings)
    for (const type of [null, ...RENT_TYPES]) {
      const slug = districtSlug(d, type)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)
      const count = type ? byType[type] : d.listings.length
      const o = overrides.get(slug) ?? null
      out.push({
        slug, path: `/area/${slug}`, placeKey: `district:${d.key}`, placeKind: 'district',
        placeTh: `เขต${d.labelTh}`, placeEn: d.labelEn,
        type, count, indexable: count >= INDEX_MIN && o?.noindex !== true, override: o,
      })
    }
  }
  return out
}

export async function buildDistrictMetadata(rawSlug: string, locale: Locale) {
  const view = await loadDistrictPage(rawSlug, locale)
  if (!view) return { title: locale === 'en' ? 'Page not found' : 'ไม่พบหน้า', robots: { index: false, follow: true } }
  const path = `/area/${encodeURI(view.slug)}`
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
