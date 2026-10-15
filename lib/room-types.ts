/**
 * Room types: a stable key in the database, a label chosen for the reader.
 *
 * THE PROBLEM THIS SOLVES
 *   getRoomTypeOptions() returned bare strings and the form stored whichever
 *   the owner picked:
 *
 *       {roomTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
 *
 *   The public property page then rendered that value raw — {u.room_type} — to
 *   every visitor, in whatever language it happened to be saved in. With a
 *   Thai-only form that was merely inconsistent: an English visitor saw
 *   "2 ห้องนอน". Translating the form would have made it worse in both
 *   directions, because a Thai visitor would then see "2 bedrooms" on any
 *   listing an English-speaking owner created.
 *
 *   This is the third time the same shape of bug has appeared in this codebase,
 *   after district names and amenity spellings. The pattern that fixed those is
 *   the one used here: store something stable, translate at the point of
 *   display.
 *
 * MIGRATION
 *   Existing rows hold the old display strings. labelFor() resolves those as
 *   well as the new keys, so nothing breaks before or after the data is
 *   migrated — see migrations/2026-10-16-room-type-keys.sql.
 */
export type Locale = 'th' | 'en'

export interface RoomTypeOption {
  /** Stored in room_types.room_type. Never translated, never displayed raw. */
  value: string
  th: string
  en: string
}

/**
 * Every room type the form offers, across all property types.
 *
 * Keys are lowercase ASCII and deliberately dull. Some labels are identical in
 * both languages — "Studio", "Hot Desk" — which is exactly why the key has to
 * be separate from the label: a value that happens to read the same in two
 * languages today is not a value that will.
 */
export const ROOM_TYPES: RoomTypeOption[] = [
  { value: 'studio',          th: 'Studio',          en: 'Studio' },
  { value: 'bed_1',           th: '1 ห้องนอน',        en: '1 bedroom' },
  { value: 'bed_2',           th: '2 ห้องนอน',        en: '2 bedrooms' },
  { value: 'bed_3',           th: '3 ห้องนอน',        en: '3 bedrooms' },
  { value: 'bed_4_plus',      th: '4 ห้องนอน+',       en: '4+ bedrooms' },
  { value: 'commercial',      th: 'เชิงพาณิชย์',      en: 'Commercial' },
  { value: 'detached_house',  th: 'บ้านเดี่ยว',        en: 'Detached house' },
  { value: 'townhouse',       th: 'ทาวน์เฮ้าส์',       en: 'Townhouse' },
  { value: 'penthouse',       th: 'Penthouse',       en: 'Penthouse' },
  { value: 'duplex',          th: 'ดูเพล็กซ์',         en: 'Duplex' },
  { value: 'loft',            th: 'ลอฟท์',            en: 'Loft' },
  { value: 'individual_desk', th: 'Individual Desk', en: 'Individual desk' },
  { value: 'private_office',  th: 'Private Office',  en: 'Private office' },
  { value: 'meeting_room',    th: 'Meeting Room',    en: 'Meeting room' },
  { value: 'full_floor',      th: 'Full Floor',      en: 'Full floor' },
  { value: 'shared_space',    th: 'Shared Space',    en: 'Shared space' },
  { value: 'hot_desk',        th: 'Hot Desk',        en: 'Hot desk' },
  { value: 'dedicated_desk',  th: 'Dedicated Desk',  en: 'Dedicated desk' },
  { value: 'day_pass',        th: 'Day Pass',        en: 'Day pass' },
]

/** Which options each property type offers, in the order the form showed them. */
const BY_PROPERTY_TYPE: Record<string, string[]> = {
  apartment: ['studio', 'bed_1', 'bed_2', 'bed_3', 'commercial'],
  house:     ['detached_house', 'townhouse', 'bed_2', 'bed_3', 'bed_4_plus'],
  office:    ['individual_desk', 'private_office', 'meeting_room', 'full_floor', 'shared_space'],
  coworking: ['hot_desk', 'dedicated_desk', 'private_office', 'meeting_room', 'day_pass'],
  default:   ['studio', 'bed_1', 'bed_2', 'bed_3', 'bed_4_plus', 'penthouse', 'duplex', 'loft'],
}

const BY_VALUE = new Map(ROOM_TYPES.map(r => [r.value, r]))

/**
 * Legacy display strings → key, so rows written before this change still
 * resolve. Both languages appear here because a listing created through the
 * English form before the migration could hold either.
 */
const BY_LEGACY_LABEL = new Map<string, string>(
  ROOM_TYPES.flatMap(r => [[r.th, r.value], [r.en, r.value]] as [string, string][]),
)

/** Options for a property type, labelled for the reader. */
export function roomTypeOptions(propertyType: string, locale: Locale): { value: string; label: string }[] {
  const keys = BY_PROPERTY_TYPE[propertyType] ?? BY_PROPERTY_TYPE.default
  return keys.map(k => {
    const rt = BY_VALUE.get(k)!
    return { value: k, label: locale === 'en' ? rt.en : rt.th }
  })
}

/**
 * Label for a stored value, in the reader's language.
 *
 * Accepts a key or a legacy display string. Anything unrecognised is returned
 * as stored — an owner's own wording is better than an empty cell, and this is
 * what keeps pre-migration rows rendering.
 */
export function roomTypeLabel(stored: string | null | undefined, locale: Locale): string {
  const raw = String(stored ?? '').trim()
  if (!raw) return ''
  const direct = BY_VALUE.get(raw)
  if (direct) return locale === 'en' ? direct.en : direct.th
  const viaLegacy = BY_LEGACY_LABEL.get(raw)
  if (viaLegacy) {
    const rt = BY_VALUE.get(viaLegacy)!
    return locale === 'en' ? rt.en : rt.th
  }
  return raw
}

/** The key a legacy display string maps to, for the migration. Null if unknown. */
export function roomTypeKeyFromLabel(stored: string): string | null {
  return BY_LEGACY_LABEL.get(String(stored ?? '').trim()) ?? null
}
