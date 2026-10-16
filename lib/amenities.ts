/**
 * Amenities — one source of truth for the form, the settings screen and the
 * public property page.
 *
 * THE PROBLEM THIS SOLVES
 *   There were two unconnected systems. The listing form used hardcoded arrays
 *   (AMENITY_ROOM, AMENITY_BUILDING, AMENITY_OPTIONS) while the Settings screen
 *   saved an editable list to site_settings under the key 'amenities'. Editing
 *   amenities in Settings changed nothing on the form — the admin screen looked
 *   like it controlled the list, and didn't.
 *
 *   They also grouped differently: Settings had four categories, the form has two
 *   sections. So this needed a model change, not just wiring.
 *
 * THE MODEL
 *   Two sections, matching how a tenant actually reads a listing:
 *     unit     — what is inside the room
 *     building — what the building provides
 *
 * IDENTITY
 *   An amenity is identified by its Thai name, because that is what is already
 *   stored in properties.amenities as a string[]. Renaming an amenity in Settings
 *   therefore orphans existing selections — the old label simply stops matching.
 *   Worth a warning in the UI before anyone does a bulk rename.
 */

export type AmenitySection = 'unit' | 'building'

export type Amenity = {
  id: string
  name_th: string
  name_en: string
  section: AmenitySection
}

export const AMENITY_SECTIONS: { key: AmenitySection; label_th: string; label_en: string; icon: string }[] = [
  { key: 'unit',     label_th: 'ภายในห้อง',   label_en: 'In the unit',     icon: 'bed' },
  { key: 'building', label_th: 'ภายในอาคาร',  label_en: 'In the building', icon: 'domain' },
]

/**
 * The canonical amenity list.
 *
 * THIS IS A FALLBACK THAT MUST MATCH THE LIVE LIST
 *   fetchAmenities() reads the editable list from site_settings and falls back
 *   to this one. For that fallback to be safe the two have to agree, because
 *   a listing saved during a fallback window stores whatever names this array
 *   holds — and if they are not the names the picker normally offers, those
 *   selections match nothing afterwards.
 *
 *   On 16 Oct 2026 they did not agree. This array had 28 entries, the live list
 *   had 15, and exactly three names appeared in both: ที่จอดรถ, สระว่ายน้ำ and
 *   เครื่องซักผ้า. The comment here claimed the defaults were seeded "so nothing
 *   already selected on a live listing stops matching", which had been true of
 *   the hardcoded arrays it replaced and had quietly stopped being true of the
 *   list people actually edit.
 *
 *   migrations/2026-10-16-amenities-canonical.sql writes this exact list into
 *   site_settings, and is generated from this array — see the header there. If
 *   you change this list, regenerate that file. If you change the list in the
 *   Settings screen, change it here too.
 *
 * NAMING RULES
 *   name_th  The identity, and the value stored in properties.amenities. Never
 *            rename one in place without a migration: the old label stops
 *            matching and every listing tagged with it loses that amenity.
 *   name_en  Title Case throughout, matching what the Settings screen already
 *            held. The English listing form shows these, so "pet allow" sitting
 *            next to "Air Conditioning" is visible to owners.
 *
 *   Where the old defaults and the live list named the same thing differently,
 *   the live name wins — it is the one current listings are tagged with:
 *     แอร์ → เครื่องปรับอากาศ · เฟอร์นิเจอร์พร้อมอยู่ → เฟอร์นิเจอร์ครบ
 *     ลิฟท์ → ลิฟต์ · รปภ 24 ชม → รักษาความปลอดภัย 24 ชม.
 *     กล้องวงจรปิด (CCTV) → กล้องวงจรปิด · ห้องออกกำลังกาย (GYM) → ฟิตเนส
 *     WiFi → อินเทอร์เน็ต · เตาแม่เหล็กไฟฟ้า → เตาไฟฟ้า
 *
 *   เลี้ยงสัตว์ได้ was dropped in favour of รับสัตว์เลี้ยง. They were the same
 *   amenity under two stored values, so a tenant filtering on one missed every
 *   listing tagged with the other.
 *
 * IDS
 *   Existing entries keep the ids they had in site_settings so nothing keyed on
 *   them shifts. New entries use readable slugs. The duplicate
 *   เครื่องทำน้ำอุ่น (id 1791993263976) is gone; id 1783608202476 survives.
 */
export const DEFAULT_AMENITIES: Amenity[] = [
  // ── in the unit ──
  { id: '1',             name_th: 'เครื่องปรับอากาศ',  name_en: 'Air Conditioning', section: 'unit' },
  { id: '2',             name_th: 'เฟอร์นิเจอร์ครบ',    name_en: 'Fully Furnished',  section: 'unit' },
  { id: 'partly-furn',   name_th: 'เฟอร์นิเจอร์บางส่วน', name_en: 'Partly Furnished', section: 'unit' },
  { id: '3',             name_th: 'อินเทอร์เน็ต',       name_en: 'Internet',         section: 'unit' },
  { id: '1783608191258', name_th: 'เครื่องซักผ้า',      name_en: 'Washing Machine',  section: 'unit' },
  { id: '1783608202476', name_th: 'เครื่องทำน้ำอุ่น',    name_en: 'Water Heater',     section: 'unit' },
  { id: '1785131409261', name_th: 'เตาไฟฟ้า',          name_en: 'Electric Stove',   section: 'unit' },
  { id: 'microwave',     name_th: 'ไมโครเวฟ',          name_en: 'Microwave',        section: 'unit' },
  { id: 'fridge',        name_th: 'ตู้เย็น',             name_en: 'Refrigerator',     section: 'unit' },
  { id: 'tv',            name_th: 'โทรทัศน์',           name_en: 'Television',       section: 'unit' },
  { id: 'sofa',          name_th: 'โซฟา',              name_en: 'Sofa',             section: 'unit' },
  { id: 'dining-table',  name_th: 'โต๊ะกินข้าว',        name_en: 'Dining Table',     section: 'unit' },
  { id: 'kitchen',       name_th: 'ห้องครัว',           name_en: 'Kitchen',          section: 'unit' },
  { id: 'balcony',       name_th: 'ระเบียง',            name_en: 'Balcony',          section: 'unit' },
  { id: '11',            name_th: 'รับสัตว์เลี้ยง',      name_en: 'Pet Friendly',     section: 'unit' },

  // ── in the building ──
  { id: '6',             name_th: 'ที่จอดรถ',            name_en: 'Parking',            section: 'building' },
  { id: '4',             name_th: 'สระว่ายน้ำ',          name_en: 'Swimming Pool',      section: 'building' },
  { id: '5',             name_th: 'ฟิตเนส',             name_en: 'Fitness',            section: 'building' },
  { id: '7',             name_th: 'รักษาความปลอดภัย 24 ชม.', name_en: '24hr Security',  section: 'building' },
  { id: '8',             name_th: 'กล้องวงจรปิด',        name_en: 'CCTV',               section: 'building' },
  { id: '12',            name_th: 'ลิฟต์',              name_en: 'Elevator',           section: 'building' },
  { id: 'keycard',       name_th: 'ระบบ Keycard',       name_en: 'Keycard Access',     section: 'building' },
  { id: '10',            name_th: 'ใกล้ห้างสรรพสินค้า',   name_en: 'Near Shopping',      section: 'building' },
  { id: 'laundry-room',  name_th: 'ห้องซักรีด',          name_en: 'Laundry Room',       section: 'building' },
  { id: 'laundry-shop',  name_th: 'ร้านซักรีด',          name_en: 'Laundry Shop',       section: 'building' },
  { id: 'convenience',   name_th: 'ร้านสะดวกซื้อ',       name_en: 'Convenience Store',  section: 'building' },
  { id: 'restaurant',    name_th: 'ร้านอาหาร',          name_en: 'Restaurant',         section: 'building' },
  { id: 'garden',        name_th: 'สวนสาธารณะ',        name_en: 'Garden',             section: 'building' },
  { id: 'games-room',    name_th: 'ห้องเกม',            name_en: 'Games Room',         section: 'building' },
  { id: 'basketball',    name_th: 'สนามบาสเกตบอล',     name_en: 'Basketball Court',   section: 'building' },
  { id: 'vending',       name_th: 'ตู้หยอดเหรียญ',       name_en: 'Vending Machine',    section: 'building' },
]

/**
 * Names that were stored before this list was made canonical, and the name each
 * one now maps to. Used by the migration and kept here so the two agree.
 *
 * Display is tolerant of unknown names (see groupSelected), so an unmigrated row
 * still renders — it just will not match the picker or a filter.
 */
export const LEGACY_AMENITY_RENAMES: Record<string, string> = {
  'เลี้ยงสัตว์ได้':            'รับสัตว์เลี้ยง',
  'แอร์':                     'เครื่องปรับอากาศ',
  'เแอร์':                    'เครื่องปรับอากาศ',   // typed on a live listing
  'เฟอร์นิเจอร์พร้อมอยู่':      'เฟอร์นิเจอร์ครบ',
  'ลิฟท์':                    'ลิฟต์',
  'รปภ 24 ชม':               'รักษาความปลอดภัย 24 ชม.',
  'กล้องวงจรปิด (CCTV)':      'กล้องวงจรปิด',
  'ห้องออกกำลังกาย (GYM)':    'ฟิตเนส',
  'WiFi':                     'อินเทอร์เน็ต',
  'เตาแม่เหล็กไฟฟ้า':          'เตาไฟฟ้า',
}

/**
 * Map the four old Settings categories onto the two sections, so a list already
 * saved under the previous model keeps working without anyone re-entering it.
 */
const LEGACY_CATEGORY_TO_SECTION: Record<string, AmenitySection> = {
  'ห้องและสิ่งอำนวยความสะดวก': 'unit',
  'บริการส่วนกลาง':             'building',
  'ความปลอดภัย':                'building',
  'การเดินทาง':                 'building',
}

/** Accept either shape — `section` if present, otherwise the legacy `category`. */
export function normaliseAmenity(row: Record<string, unknown>, index: number): Amenity | null {
  const name_th = String(row.name_th ?? '').trim()
  if (!name_th) return null

  const rawSection = String(row.section ?? '')
  const section: AmenitySection =
    rawSection === 'unit' || rawSection === 'building'
      ? rawSection
      : LEGACY_CATEGORY_TO_SECTION[String(row.category ?? '')] ?? 'building'

  return {
    id: String(row.id ?? `a${index}`),
    name_th,
    name_en: String(row.name_en ?? ''),
    section,
  }
}

/**
 * Load the editable list, falling back to defaults.
 *
 * The fallback matters: if the settings request fails, a form rendering zero
 * amenities looks like a broken page and would silently produce listings with
 * none selected.
 *
 * Reads /api/settings/public, NOT /api/dashboard/settings. The listing form is
 * rendered for the public submit page and the owner dashboard as well as for
 * admins, so this call has to work without an admin session — and the dashboard
 * settings route is admin-only because it will read any key in the table. If
 * this is ever pointed back at the dashboard route, non-admins silently drop to
 * DEFAULT_AMENITIES and the editable list stops applying without any error.
 */
export async function fetchAmenities(): Promise<Amenity[]> {
  try {
    const res = await fetch('/api/settings/public?key=amenities')
    if (!res.ok) return DEFAULT_AMENITIES
    const json = await res.json()
    const raw = json?.data
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_AMENITIES

    const list = raw
      .map((r: Record<string, unknown>, i: number) => normaliseAmenity(r, i))
      .filter((a): a is Amenity => a !== null)

    return list.length ? list : DEFAULT_AMENITIES
  } catch {
    return DEFAULT_AMENITIES
  }
}

export function bySection(list: Amenity[], section: AmenitySection): Amenity[] {
  return dedupeByName(list.filter(a => a.section === section))
}

/**
 * Collapse entries that share a name_th, keeping the first.
 *
 * name_th is the identity (see IDENTITY above) and it is what the form stores
 * and compares against, so two entries with the same name_th are not two
 * amenities — they are one amenity with two rows. Rendered as-is they produce
 * two buttons that light up together and cannot be toggled independently,
 * which is what happened to เครื่องทำน้ำอุ่น: saved twice in Settings, ids
 * 1783608202476 and 1791993263976.
 *
 * The Settings screen should stop this being saved in the first place. This
 * guard is here as well because the list is editable by hand and the form
 * should not break when it is wrong.
 */
export function dedupeByName(list: Amenity[]): Amenity[] {
  const seen = new Set<string>()
  return list.filter(a => {
    if (seen.has(a.name_th)) return false
    seen.add(a.name_th)
    return true
  })
}

/**
 * Group the plain string[] stored on a property back into the two sections, for
 * display. Anything unrecognised — an amenity later renamed or removed in
 * Settings — is kept under 'building' rather than dropped, so a listing never
 * silently loses information it was published with.
 */
export function groupSelected(
  selected: string[],
  list: Amenity[] = DEFAULT_AMENITIES,
): { unit: string[]; building: string[] } {
  const index = new Map(list.map(a => [a.name_th, a.section]))
  const out = { unit: [] as string[], building: [] as string[] }
  for (const name of selected ?? []) {
    // Resolve a legacy spelling before looking up the section, otherwise every
    // pre-migration amenity falls through to 'building' and a listing shows its
    // air conditioning and furniture under "In the building".
    const canonical = LEGACY_AMENITY_RENAMES[name] ?? name
    const section = index.get(canonical) ?? 'building'
    out[section].push(name)
  }
  return out
}
