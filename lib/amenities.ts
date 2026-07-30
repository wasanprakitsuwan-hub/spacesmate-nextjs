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
 * Defaults, seeded from the arrays previously hardcoded in the listing form so
 * nothing already selected on a live listing stops matching.
 */
export const DEFAULT_AMENITIES: Amenity[] = [
  // ── in the unit ──
  { id: 'u1',  name_th: 'เฟอร์นิเจอร์พร้อมอยู่', name_en: 'Fully furnished',   section: 'unit' },
  { id: 'u2',  name_th: 'เฟอร์นิเจอร์บางส่วน',   name_en: 'Partly furnished',  section: 'unit' },
  { id: 'u3',  name_th: 'แอร์',                  name_en: 'Air conditioning',  section: 'unit' },
  { id: 'u4',  name_th: 'โทรทัศน์',              name_en: 'Television',        section: 'unit' },
  { id: 'u5',  name_th: 'ตู้เย็น',                name_en: 'Refrigerator',      section: 'unit' },
  { id: 'u6',  name_th: 'โซฟา',                  name_en: 'Sofa',              section: 'unit' },
  { id: 'u7',  name_th: 'โต๊ะกินข้าว',            name_en: 'Dining table',      section: 'unit' },
  { id: 'u8',  name_th: 'ไมโครเวฟ',              name_en: 'Microwave',         section: 'unit' },
  { id: 'u9',  name_th: 'เตาแม่เหล็กไฟฟ้า',      name_en: 'Induction hob',     section: 'unit' },
  { id: 'u10', name_th: 'เครื่องซักผ้า',          name_en: 'Washing machine',   section: 'unit' },
  { id: 'u11', name_th: 'ระเบียง',               name_en: 'Balcony',           section: 'unit' },
  { id: 'u12', name_th: 'ห้องครัว',              name_en: 'Kitchen',           section: 'unit' },
  { id: 'u13', name_th: 'WiFi',                  name_en: 'WiFi',              section: 'unit' },

  // ── in the building ──
  { id: 'b1',  name_th: 'ที่จอดรถ',                 name_en: 'Parking',        section: 'building' },
  { id: 'b2',  name_th: 'สระว่ายน้ำ',               name_en: 'Swimming pool',  section: 'building' },
  { id: 'b3',  name_th: 'ห้องออกกำลังกาย (GYM)',   name_en: 'Fitness',        section: 'building' },
  { id: 'b4',  name_th: 'กล้องวงจรปิด (CCTV)',      name_en: 'CCTV',           section: 'building' },
  { id: 'b5',  name_th: 'ลิฟท์',                    name_en: 'Lift',           section: 'building' },
  { id: 'b6',  name_th: 'สวนสาธารณะ',              name_en: 'Garden',         section: 'building' },
  { id: 'b7',  name_th: 'สนามบาสเกตบอล',           name_en: 'Basketball court', section: 'building' },
  { id: 'b8',  name_th: 'ห้องเกม',                  name_en: 'Games room',     section: 'building' },
  { id: 'b9',  name_th: 'ตู้หยอดเหรียญ',            name_en: 'Vending machine', section: 'building' },
  { id: 'b10', name_th: 'ห้องซักรีด',               name_en: 'Laundry',        section: 'building' },
  { id: 'b11', name_th: 'รปภ 24 ชม',                name_en: '24hr security',  section: 'building' },
  { id: 'b12', name_th: 'ระบบ Keycard',             name_en: 'Keycard access', section: 'building' },
  { id: 'b13', name_th: 'ร้านสะดวกซื้อ',            name_en: 'Convenience store', section: 'building' },
  { id: 'b14', name_th: 'ร้านอาหาร',                name_en: 'Restaurant',     section: 'building' },
  { id: 'b15', name_th: 'ร้านซักรีด',               name_en: 'Laundry shop',   section: 'building' },
]

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
  return list.filter(a => a.section === section)
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
    const section = index.get(name) ?? 'building'
    out[section].push(name)
  }
  return out
}
