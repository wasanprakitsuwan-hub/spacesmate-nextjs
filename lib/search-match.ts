/**
 * Search matching for /search — places (stations, districts), keyword parsing
 * and fuzzy matching. Pure functions, no React, so the rules can be reasoned
 * about and tested on their own.
 *
 * WHY CLIENT-SIDE
 *   /search loads every active listing once and filters in the browser. At
 *   today's inventory that is the fastest option and needs no new
 *   infrastructure. If inventory grows into the thousands, this logic moves
 *   into a Postgres function; the rules here are the spec for it.
 */

import { STATIONS, STATION_BY_ID, type Station } from '@/lib/stations'
import { DISTRICT_EN_BY_PAIR } from '@/lib/thai-districts.generated'
import { stripDistrictPrefix } from '@/lib/geo-i18n'
import { DEFAULT_AMENITIES } from '@/lib/amenities'

export type Locale = 'th' | 'en'

// ── Distance ─────────────────────────────────────────────────────────────────

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Nearest station to a point, or null when none is within `maxKm`. A listing
 * 6 km from the nearest line is not "near BTS" anything, and saying so would be
 * the kind of claim a tenant checks on a map and stops trusting us over.
 */
export function nearestStation(lat: number, lng: number, maxKm = 3): { station: Station; km: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  let best: { station: Station; km: number } | null = null
  for (const s of STATIONS) {
    const km = haversineKm(lat, lng, s.lat, s.lng)
    if (!best || km < best.km) best = { station: s, km }
  }
  return best && best.km <= maxKm ? best : null
}

export function stationLabel(s: Station, locale: Locale): string {
  return `${s.systems.join('/')} ${locale === 'en' ? s.en : s.th}`
}

/** "450 m" under a kilometre, "1.2 km" above — how people say walking distance. */
export function distanceLabel(km: number, locale: Locale): string {
  if (km < 1) return `${Math.max(50, Math.round(km * 1000 / 50) * 50)} ${locale === 'en' ? 'm' : 'ม.'}`
  return `${km.toFixed(1)} ${locale === 'en' ? 'km' : 'กม.'}`
}

// ── Normalising text ─────────────────────────────────────────────────────────

/**
 * Lower-case, drop spaces and punctuation, and fold the common Thai spelling
 * slips (เเ typed for แ). "On Nut", "onnut" and "On-Nut" all become "onnut".
 */
export function norm(s: string): string {
  return String(s ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/เเ/g, 'แ')
    .replace(/[\s\-_.,/()'"’]+/g, '')
}

/** Edit distance, capped: returns cap+1 as soon as it is exceeded. */
function editDistance(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > cap) return cap + 1
    prev = cur
  }
  return prev[b.length]
}

/**
 * Does `term` appear in `hay`, allowing one typo for longer Latin words?
 * Thai is matched exactly: it has no spaces to split words on, and a one-letter
 * edit in Thai often makes a different place name.
 */
function fuzzyIncludes(hay: string, term: string): boolean {
  if (!term) return true
  if (hay.includes(term)) return true
  if (term.length < 5 || !/^[a-z0-9]+$/.test(term)) return false
  const allowed = term.length >= 8 ? 2 : 1
  for (let i = 0; i + term.length - allowed <= hay.length; i++) {
    for (const len of [term.length - 1, term.length, term.length + 1]) {
      if (len < 1 || i + len > hay.length) continue
      if (editDistance(hay.slice(i, i + len), term, allowed) <= allowed) return true
    }
  }
  return false
}

// ── Synonyms ─────────────────────────────────────────────────────────────────

/** Different words people type for the same property type. Keys are Property['propertyType']. */
const TYPE_WORDS: Record<string, string[]> = {
  Condo:      ['คอนโด', 'คอนโดมิเนียม', 'condo', 'condominium'],
  Apartment:  ['อพาร์ทเม้นท์', 'อพาร์ตเมนต์', 'อพาร์ทเมนท์', 'อพาร์ทเมนต์', 'apartment', 'apt', 'หอพัก', 'หอ', 'ห้องเช่า', 'บ้าน', 'house'],
  Office:     ['ออฟฟิศ', 'ออฟฟิส', 'สำนักงาน', 'office'],
  'Co-Working': ['โคเวิร์กกิ้ง', 'โคเวิร์คกิ้ง', 'coworking', 'cowork'],
}

/** Extra words that mean an amenity, beyond its Thai and English names. */
const AMENITY_WORDS: Record<string, string[]> = {
  'เลี้ยงสัตว์ได้': ['pet', 'pets', 'petfriendly', 'สัตว์เลี้ยง', 'หมา', 'แมว'],
  'สระว่ายน้ำ':   ['pool', 'swimming', 'สระ'],
  'ห้องออกกำลังกาย (GYM)': ['gym', 'fitness', 'ฟิตเนส', 'ยิม'],
  'ที่จอดรถ':     ['parking', 'carpark', 'จอดรถ'],
  'เฟอร์นิเจอร์พร้อมอยู่': ['furnished', 'fullyfurnished'],
}

/**
 * Thai ↔ English spellings of roads and neighbourhoods people search by, beyond
 * station names (those come from lib/stations). An owner writes "สุขุมวิท" in
 * the address; a tenant types "sukhumvit"; both should meet.
 */
const PLACE_ALIASES: string[][] = [
  ['สุขุมวิท', 'sukhumvit'], ['สีลม', 'silom'], ['สาทร', 'sathorn', 'sathon'],
  ['พระราม9', 'rama9', 'ramaix'], ['พระราม4', 'rama4'], ['พระราม3', 'rama3'],
  ['รัชดา', 'ratchada', 'ratchadaphisek'], ['ลาดพร้าว', 'ladprao', 'latphrao'],
  ['ทองหล่อ', 'thonglor', 'thonglo', 'thonglo'], ['เอกมัย', 'ekkamai', 'ekamai'],
  ['อารีย์', 'ari', 'aree'], ['พหลโยธิน', 'phahonyothin', 'phaholyothin'],
  ['อ่อนนุช', 'onnut'], ['บางนา', 'bangna'], ['พร้อมพงษ์', 'phromphong', 'phrompong'],
  ['อโศก', 'asok', 'asoke'], ['รามคำแหง', 'ramkhamhaeng'], ['ห้วยขวาง', 'huaikhwang', 'huaykwang'],
  ['จตุจักร', 'chatuchak', 'jatujak'], ['เพชรบุรี', 'phetchaburi', 'petchaburi'],
  ['เพลินจิต', 'ploenchit', 'phloenchit'], ['ชิดลม', 'chidlom', 'chitlom'], ['สยาม', 'siam'],
  ['ราชเทวี', 'ratchathewi'], ['บางซื่อ', 'bangsue'], ['วงเวียนใหญ่', 'wongwianyai'],
  ['ประตูน้ำ', 'pratunam'], ['พญาไท', 'phayathai'], ['สะพานควาย', 'saphankhwai', 'saphankwai'],
  ['อุดมสุข', 'udomsuk'], ['แบริ่ง', 'bearing'], ['ศรีนครินทร์', 'srinakarin', 'srinagarindra'],
  ['บางกะปิ', 'bangkapi'], ['ลาดกระบัง', 'latkrabang', 'ladkrabang'], ['นนทบุรี', 'nonthaburi'],
]

const STATION_ALIASES: string[][] = STATIONS.map(s => [norm(s.th), norm(s.en)])

const AMENITY_EN_TO_TH: Record<string, string> = Object.fromEntries(
  DEFAULT_AMENITIES.map(a => [norm(a.name_en), a.name_th]),
)

// ── Places: stations and districts ───────────────────────────────────────────

export type Place =
  | { kind: 'station'; station: Station }
  | { kind: 'district'; th: string; en: string }

const BKK_DISTRICTS: { th: string; en: string }[] = Object.entries(DISTRICT_EN_BY_PAIR)
  .filter(([pair]) => pair.startsWith('กรุงเทพมหานคร|'))
  .map(([pair, en]) => ({ th: pair.split('|')[1], en }))

/** Other spellings of a station's English name, e.g. Asok → asoke. */
function aliasesFor(enNorm: string): string[] {
  const group = PLACE_ALIASES.find(g => g.includes(enNorm))
  return group ? group.filter(w => w !== enNorm) : []
}

export function placeKey(p: Place): string {
  return p.kind === 'station' ? `station:${p.station.id}` : `district:${p.th}`
}

export function placeLabel(p: Place, locale: Locale): string {
  if (p.kind === 'station') return stationLabel(p.station, locale)
  return locale === 'en' ? p.en : `เขต${p.th}`
}

/** URL form: ?station=E4 or ?district=บางนา. */
export function placeFromParams(station: string | null, district: string | null): Place | null {
  if (station && STATION_BY_ID[station]) return { kind: 'station', station: STATION_BY_ID[station] }
  if (district) {
    const bare = stripDistrictPrefix(district)
    const d = BKK_DISTRICTS.find(x => x.th === bare)
    if (d) return { kind: 'district', ...d }
  }
  return null
}

/**
 * Places matching what has been typed so far, best first: names that start
 * with the text before names that merely contain it, stations before districts.
 */
export function suggestPlaces(q: string, limit = 8): Place[] {
  const n = norm(q).replace(/^(bts|mrt|arl|เขต)/, '')
  if (!n) return []
  // One- and two-letter input matches the start of a name only; anything
  // looser lists half the network.
  const loose = n.length >= 3
  const scored: { place: Place; score: number }[] = []
  const candidates: { place: Place; names: string[]; base: number }[] = [
    ...STATIONS.map(s => ({ place: { kind: 'station' as const, station: s }, names: [norm(s.th), norm(s.en), ...aliasesFor(norm(s.en))], base: 0 })),
    ...BKK_DISTRICTS.map(d => ({ place: { kind: 'district' as const, ...d }, names: [norm(d.th), norm(d.en)], base: 1 })),
  ]
  for (const c of candidates) {
    if (c.names.some(x => x.startsWith(n))) scored.push({ place: c.place, score: c.base })
    else if (loose && c.names.some(x => x.includes(n))) scored.push({ place: c.place, score: 2 + c.base })
  }
  // A typo only when nothing matched as typed — otherwise "thong" would also
  // offer every station with "phong" in it.
  if (!scored.length && n.length >= 5) {
    for (const c of candidates) if (c.names.some(x => fuzzyIncludes(x, n))) scored.push({ place: c.place, score: 4 + c.base })
  }
  return scored.sort((a, b) => a.score - b.score).slice(0, limit).map(x => x.place)
}

// ── Keyword parsing ──────────────────────────────────────────────────────────

export type ParsedQuery = {
  types: string[]
  priceMin?: number
  priceMax?: number
  beds?: number
  terms: string[]
}

function toBaht(num: string, k?: string): number {
  const n = parseFloat(num.replace(/,/g, ''))
  return k ? n * 1000 : n
}

/**
 * Pull the structured parts out of a free-text query, and leave the rest as
 * terms to match against the listing text:
 *   "คอนโด อโศก ไม่เกิน 15000"  → type Condo, max ฿15,000, terms [อโศก]
 *   "2 bed under 20k pet"      → 2 bedrooms, max ฿20,000, terms [pet]
 */
export function parseQuery(raw: string): ParsedQuery {
  let q = ` ${String(raw ?? '').toLowerCase()} `
  const out: ParsedQuery = { types: [], terms: [] }

  const range = q.match(/(\d[\d,.]*)\s*(k)?\s*(?:-|–|ถึง|to)\s*(\d[\d,.]*)\s*(k)?/)
  if (range) {
    out.priceMin = toBaht(range[1], range[2] || range[4])
    out.priceMax = toBaht(range[3], range[4])
    q = q.replace(range[0], ' ')
  }
  const max = q.match(/(?:ไม่เกิน|ต่ำกว่า|under|below|max|<)\s*฿?\s*(\d[\d,.]*)\s*(k)?/)
  if (max) { out.priceMax = toBaht(max[1], max[2]); q = q.replace(max[0], ' ') }
  const min = q.match(/(?:มากกว่า|ขั้นต่ำ|over|above|from|min|>)\s*฿?\s*(\d[\d,.]*)\s*(k)?/)
  if (min) { out.priceMin = toBaht(min[1], min[2]); q = q.replace(min[0], ' ') }

  const beds = q.match(/(\d)\s*(?:ห้องนอน|นอน|bed(?:room)?s?|br)(?=\s|$)/)
  if (beds) { out.beds = Number(beds[1]); q = q.replace(beds[0], ' ') }
  if (/(?:สตูดิโอ|studio)/.test(q)) { out.beds = 0; q = q.replace(/สตูดิโอ|studio/g, ' ') }

  for (const [type, words] of Object.entries(TYPE_WORDS)) {
    // Longest first, so "คอนโดมิเนียม" is consumed whole rather than leaving "มิเนียม".
    for (const w of [...words].sort((a, b) => b.length - a.length)) {
      if (q.includes(w)) {
        if (!out.types.includes(type)) out.types.push(type)
        q = q.split(w).join(' ')
      }
    }
  }

  // Words that only glue a query together and would otherwise have to match.
  const STOP = new Set(['เช่า', 'ให้เช่า', 'ใกล้', 'แถว', 'ย่าน', 'rent', 'forrent', 'for', 'near', 'in', 'the', 'a', 'bts', 'mrt', 'บาท', 'thb', 'baht', '฿', 'bangkok', 'กรุงเทพ', 'กรุงเทพฯ', 'กรุงเทพมหานคร', 'กทม', 'thailand'])
  out.terms = q.split(/\s+/).map(norm).filter(t => t && !STOP.has(t))
  return out
}

// ── Matching a listing ───────────────────────────────────────────────────────

export type Searchable = {
  title: string
  titleEn?: string
  excerpt?: string
  address?: string
  district?: string
  districtEn?: string | null
  amenities?: string[]
  nearest?: { station: Station; km: number } | null
}

/** Everything a tenant might type that should find this listing, normalised once. */
export function haystack(l: Searchable): string {
  const parts = [l.title, l.titleEn, l.excerpt, l.address, l.district, l.districtEn]
  for (const a of l.amenities ?? []) {
    parts.push(a)
    parts.push(...(AMENITY_WORDS[a] ?? []))
    const en = DEFAULT_AMENITIES.find(x => x.name_th === a)?.name_en
    if (en) parts.push(en)
  }
  if (l.nearest && l.nearest.km <= 1.5) parts.push(l.nearest.station.th, l.nearest.station.en)
  let hay = parts.filter(Boolean).map(p => norm(String(p))).join('|')
  // Bridge spellings: whichever side the owner wrote, add the others.
  const extra: string[] = []
  for (const group of [...PLACE_ALIASES, ...STATION_ALIASES]) {
    if (group.some(w => w.length >= 4 && hay.includes(w))) extra.push(...group)
  }
  if (extra.length) hay += '|' + extra.join('|')
  return hay
}

/** Every remaining term must appear (one typo allowed in longer Latin words). */
export function matchesTerms(hay: string, terms: string[]): boolean {
  return terms.every(t => fuzzyIncludes(hay, t) || (AMENITY_EN_TO_TH[t] ? hay.includes(norm(AMENITY_EN_TO_TH[t])) : false))
}
