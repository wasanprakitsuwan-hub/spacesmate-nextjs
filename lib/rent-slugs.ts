/**
 * Slugs, labels and places for the /rent pages — pure, no database or React,
 * so client components, the dashboard and scripts can use them. The pages
 * themselves (listings, wording, indexing) are lib/rent-pages.ts.
 */
import type { PlaceList } from '@/lib/search-places'
import { stationLabel } from '@/lib/search-match'
import { slugify } from '@/lib/slug'
import { STATIONS, type Station } from '@/lib/stations'
import { LANDMARKS, type Landmark } from '@/lib/landmarks'

export type Locale = 'th' | 'en'

export const RADIUS_KM = 2
export const INDEX_MIN = 3

/** Stored property_type values, in the order the type links are shown. */
export const RENT_TYPES = ['condo', 'apartment', 'house', 'office', 'coworking'] as const
export type RentType = typeof RENT_TYPES[number]

/** The slug word for each type. The all-types page uses ห้องเช่า. */
const TYPE_SLUG: Record<RentType | 'all', string> = {
  all: 'ห้องเช่า',
  condo: 'คอนโด',
  apartment: 'อพาร์ทเม้นท์',
  house: 'บ้านเช่า',
  office: 'ออฟฟิศ',
  coworking: 'โคเวิร์กกิ้ง',
}

/** {type} in titles and descriptions — the phrase people search with. */
export const TYPE_PHRASE: Record<Locale, Record<RentType, string>> = {
  th: { condo: 'คอนโดให้เช่า', apartment: 'อพาร์ทเม้นท์ให้เช่า', house: 'บ้านเช่า', office: 'ออฟฟิศให้เช่า', coworking: 'โคเวิร์กกิ้งสเปซ' },
  en: { condo: 'Condos for rent', apartment: 'Apartments for rent', house: 'Houses for rent', office: 'Offices for rent', coworking: 'Co-working space' },
}

/** Short type names for chips and cards. */
export const TYPE_NAME: Record<Locale, Record<RentType, string>> = {
  th: { condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน', office: 'ออฟฟิศ', coworking: 'โคเวิร์กกิ้ง' },
  en: { condo: 'Condo', apartment: 'Apartment', house: 'House', office: 'Office', coworking: 'Co-working' },
}

// ── Places and slugs ─────────────────────────────────────────────────────────

export type RentPlace =
  | { kind: 'station'; id: string; station: Station }
  | { kind: 'landmark'; id: string; landmark: Landmark }

export function rentPlaceKey(p: RentPlace): string {
  return `${p.kind}:${p.id}`
}

export function rentPlacePoint(p: RentPlace): { lat: number; lng: number } {
  return p.kind === 'station' ? p.station : p.landmark
}

/** "BTS อ่อนนุช", "จุฬาลงกรณ์มหาวิทยาลัย" — the {place} placeholder. */
export function rentPlaceLabel(p: RentPlace, locale: Locale): string {
  if (p.kind === 'station') return stationLabel(p.station, locale)
  return locale === 'en' ? p.landmark.en : p.landmark.th
}

const BUILT_IN_STATION = new Map(STATIONS.map(s => [s.id, s]))
const BUILT_IN_LANDMARK = new Map(LANDMARKS.map(l => [l.id, l]))

/**
 * The place half of a slug: bts-อ่อนนุช, จุฬาลงกรณ์มหาวิทยาลัย.
 *
 * Built from the code list's name whenever the place is in it, not from an
 * admin's edit, so renaming a station in /dashboard/places cannot move an
 * indexed URL. Places an admin added have no built-in entry and use their own.
 */
function placeSlugPart(p: RentPlace): string {
  if (p.kind === 'station') {
    const s = BUILT_IN_STATION.get(p.id) ?? p.station
    return `${s.systems[0].toLowerCase()}-${slugify(s.th, 80)}`
  }
  return slugify((BUILT_IN_LANDMARK.get(p.id) ?? p.landmark).th, 80)
}

export function rentSlug(p: RentPlace, type: RentType | null): string {
  return `${TYPE_SLUG[type ?? 'all']}-ใกล้-${placeSlugPart(p)}`
}

/** The Thai path for a page, for LocaleLink and redirects. */
export function rentPath(p: RentPlace, type: RentType | null = null): string {
  return `/rent/${rentSlug(p, type)}`
}

export function rentPlaces(list: PlaceList): RentPlace[] {
  return [
    ...list.stations.map(s => ({ kind: 'station' as const, id: s.id, station: s })),
    ...list.landmarks.map(l => ({ kind: 'landmark' as const, id: l.id, landmark: l })),
  ]
}

/** Every slug → its place and type. A clash keeps the first, stations before landmarks. */
export function slugIndex(places: RentPlace[]): Map<string, { place: RentPlace; type: RentType | null }> {
  const index = new Map<string, { place: RentPlace; type: RentType | null }>()
  for (const place of places) {
    for (const type of [null, ...RENT_TYPES]) {
      const slug = rentSlug(place, type)
      if (!index.has(slug)) index.set(slug, { place, type })
    }
  }
  return index
}

/** Route params arrive percent-encoded; decode once, tolerating a bad escape. */
export function decodeSlug(raw: string): string {
  try { return decodeURIComponent(raw) } catch { return raw }
}

// ── The 16 hand-written /area pages, folded in ───────────────────────────────

/**
 * Old /area slug → the rent page that now holds its keyword. next.config.js
 * 301s each one (both locales), and the rent page shows the old page's
 * hand-written text so nothing written for it is lost. Approved by the
 * Founder on 24 Oct 2026.
 */
export const FOLDED_AREAS: Record<string, { place: string; type: RentType }> = {
  'condo-rent-bts-asok':          { place: 'station:E4',   type: 'condo' },
  'apartment-rent-sukhumvit':     { place: 'station:BL22', type: 'apartment' },
  'condo-rent-bts-ekkamai':       { place: 'station:E7',   type: 'condo' },
  'house-rent-lat-phrao':         { place: 'station:BL15', type: 'house' },
  'condo-rent-bts-thonglor':      { place: 'station:E6',   type: 'condo' },
  'office-rent-silom':            { place: 'station:S2',   type: 'office' },
  'condo-rent-bts-on-nut':        { place: 'station:E9',   type: 'condo' },
  'apartment-rent-ratchada':      { place: 'station:BL16', type: 'apartment' },
  'house-rent-rama-9':            { place: 'station:BL20', type: 'house' },
  'condo-rent-mrt-lat-phrao':     { place: 'station:BL15', type: 'condo' },
  'coworking-rent-sukhumvit':     { place: 'station:BL22', type: 'coworking' },
  'condo-rent-bts-saphan-kwai':   { place: 'station:N7',   type: 'condo' },
  'condo-rent-bts-ari':           { place: 'station:N5',   type: 'condo' },
  'apartment-rent-bang-na':       { place: 'station:E13',  type: 'apartment' },
  'condo-rent-mrt-phahon-yothin': { place: 'station:BL14', type: 'condo' },
  'office-rent-sathorn':          { place: 'station:S3',   type: 'office' },
}

// ── Wording types, shared with the dashboard (client) ───────────────────────

export type TemplateStrings = {
  title_all: string
  title_type: string
  desc_all: string
  desc_type: string
  intro_all: string
  intro_type: string
}
export type RentTemplate = Record<Locale, TemplateStrings>

/** Used for any field the dashboard template leaves empty. */
export const DEFAULT_TEMPLATE: RentTemplate = {
  th: {
    title_all: 'ห้องเช่า คอนโด อพาร์ทเม้นท์ ใกล้{place}',
    title_type: '{type} ใกล้{place}',
    desc_all: 'รวม {count} ประกาศห้องเช่า คอนโด และอพาร์ทเม้นท์ใกล้{place} ในระยะ {radius} กม. ราคาเริ่มต้น ฿{price_from}/เดือน ดูรูป ราคา และติดต่อเจ้าของโดยตรงที่ SpacesMate',
    desc_type: 'รวม {count} ประกาศ{type}ใกล้{place} ในระยะ {radius} กม. ราคาเริ่มต้น ฿{price_from}/เดือน ดูรูป ราคา และติดต่อเจ้าของโดยตรงที่ SpacesMate',
    intro_all: 'ที่พักให้เช่าทุกประเภทในระยะ {radius} กม. จาก{place} เรียงจากใกล้ที่สุด ราคาเริ่มต้น ฿{price_from}/เดือน ทุกประกาศติดต่อเจ้าของได้โดยตรง ไม่มีค่านายหน้า',
    intro_type: '{type}ในระยะ {radius} กม. จาก{place} เรียงจากใกล้ที่สุด ราคาเริ่มต้น ฿{price_from}/เดือน ทุกประกาศติดต่อเจ้าของได้โดยตรง ไม่มีค่านายหน้า',
  },
  en: {
    title_all: 'Rooms, condos and apartments for rent near {place}',
    title_type: '{type} near {place}',
    desc_all: '{count} rentals within {radius} km of {place}, from ฿{price_from}/month. Compare photos and prices, and contact owners directly on SpacesMate.',
    desc_type: '{count} {type_lower} within {radius} km of {place}, from ฿{price_from}/month. Compare photos and prices, and contact owners directly on SpacesMate.',
    intro_all: 'Every rental within {radius} km of {place}, closest first, from ฿{price_from}/month. Contact owners directly, with no agent fee.',
    intro_type: '{type} within {radius} km of {place}, closest first, from ฿{price_from}/month. Contact owners directly, with no agent fee.',
  },
}

/** A per-page override row from seo_pages. */
export type RentOverride = {
  title_th?: string | null
  title_en?: string | null
  meta_description?: string | null
  meta_description_en?: string | null
  intro_th?: string | null
  intro_en?: string | null
  /** One point per line. */
  highlights_th?: string | null
  highlights_en?: string | null
  /** Paragraphs separated by a blank line. */
  body_th?: string | null
  body_en?: string | null
  noindex?: boolean | null
}

export type RentPageSummary = {
  slug: string
  placeKey: string
  placeKind: 'station' | 'landmark'
  placeTh: string
  placeEn: string
  type: RentType | null
  count: number
  indexable: boolean
  override: RentOverride | null
}
