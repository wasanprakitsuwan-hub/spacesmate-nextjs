/**
 * Every string the property page renders, per locale.
 *
 * Same approach as lib/area-shared: one dictionary rather than two copies of
 * the template, so the Thai and English pages cannot drift apart.
 *
 * Scope note: this covers the page's own chrome. Owner-supplied values —
 * listing title, description, room type names, district — come from the
 * database and are translated only where the owner supplied an English version.
 * Where they did not, Thai is shown rather than nothing, and the structured
 * data marks the language of the text it actually contains.
 */
import { DEFAULT_AMENITIES } from '@/lib/amenities'

export type Locale = 'th' | 'en'

export const PROPERTY_T = {
  th: {
    notFoundTitle: 'ไม่พบประกาศ | SpacesMate',
    fallbackListingName: 'ประกาศ',
    untitled: 'ไม่ระบุชื่อ',
    askForPrice: 'สอบถามราคา',
    defaultProvince: 'กรุงเทพมหานคร',

    home: 'หน้าแรก',
    search: 'ค้นหาที่พัก',

    dailyBadge: 'เช่ารายวัน',
    otherRoomsIn: (name: string) => `ดูห้องอื่นใน ${name}`,

    bedrooms: 'ห้องนอน',
    bathrooms: 'ห้องน้ำ',
    bathroomsValue: (n: number) => `${n} ห้องน้ำ`,
    size: 'ขนาด',
    sizeValue: (v: string | number) => `${v} ตร.ม.`,
    type: 'ประเภท',
    studio: 'สตูดิโอ',
    bedroomsValue: (n: number) => `${n} ห้องนอน`,

    unitPricingHeading: 'ราคาเช่าต่อห้อง',
    colRoomType: 'ประเภทห้อง',
    colSize: 'ขนาด',
    col12: 'สัญญา 12 เดือน',
    col6: 'สัญญา 6 เดือน',
    col3: 'สัญญา 3 เดือน',
    col1: 'สัญญา 1 เดือน',
    colDaily: 'รายวัน',
    pricingNote: 'ทุกราคาเป็นค่าเช่าต่อเดือน — ต่างกันตามระยะเวลาสัญญา สัญญายาวกว่าราคาต่อเดือนถูกกว่า',

    chargesHeading: 'ค่าใช้จ่ายและเงื่อนไข',
    amenitiesHeading: 'สิ่งอำนวยความสะดวก',
    locationHeading: 'ทำเลที่ตั้ง',
    mapTitle: 'แผนที่ที่ตั้ง',
    openInMaps: 'เปิดใน Google Maps',

    priceLabel: 'ราคาเช่า',
    verified: 'ยืนยันตัวตนแล้ว',
    askOnLine: 'สอบถามผ่าน LINE',
    call: (n: string) => `โทร ${n}`,
    noCommission: 'SpacesMate ให้บริการฟรี ไม่มีค่าคอมมิชชั่นจากผู้เช่า',
    browseAll: 'ดูประกาศทั้งหมด',
    relatedHeading: 'ประกาศที่คล้ายกัน',

    ownerHeading: 'มีทรัพย์สินอยากปล่อยเช่า?',
    ownerBody: 'ให้ SpacesMate ดูแลตั้งแต่หาผู้เช่า ทำสัญญา ไปจนถึงเก็บค่าเช่า — ครบวงจรในที่เดียว',
    ownerServicesCta: 'ดูบริการรับฝากบริหาร',
    ownerListCta: 'ลงประกาศที่พัก',

    // Charges
    securityDeposit: 'เงินประกัน',
    advanceDeposit: 'ค่าเช่าล่วงหน้า',
    keyDeposit: 'ค่ากุญแจ',
    water: 'ค่าน้ำ',
    electricity: 'ค่าไฟ',
    months: (n: string | number) => `${n} เดือน`,
    perUnit: (v: string) => `฿${v}/หน่วย`,
    minimum: (v: string) => `ขั้นต่ำ ฿${v}`,
    govRate: 'ตามเรทรัฐ',
    asBilled: 'แจ้งตามจริง',
    perMonthAmount: (v: string) => `฿${v}/เดือน`,
  },
  en: {
    notFoundTitle: 'Listing not found | SpacesMate',
    fallbackListingName: 'Listing',
    untitled: 'Untitled listing',
    askForPrice: 'Ask for price',
    defaultProvince: 'Bangkok',

    home: 'Home',
    search: 'Search',

    dailyBadge: 'Daily rental',
    otherRoomsIn: (name: string) => `See other rooms in ${name}`,

    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    bathroomsValue: (n: number) => (n === 1 ? '1 bathroom' : `${n} bathrooms`),
    size: 'Size',
    sizeValue: (v: string | number) => `${v} m²`,
    type: 'Type',
    studio: 'Studio',
    bedroomsValue: (n: number) => (n === 1 ? '1 bedroom' : `${n} bedrooms`),

    unitPricingHeading: 'Rent by room type',
    colRoomType: 'Room type',
    colSize: 'Size',
    col12: '12-month contract',
    col6: '6-month contract',
    col3: '3-month contract',
    col1: '1-month contract',
    colDaily: 'Daily',
    pricingNote: 'All prices are monthly rent — they vary by contract length. A longer contract means a lower monthly rate.',

    chargesHeading: 'Costs and conditions',
    amenitiesHeading: 'Amenities',
    locationHeading: 'Location',
    mapTitle: 'Location map',
    openInMaps: 'Open in Google Maps',

    priceLabel: 'Rent',
    verified: 'Verified',
    askOnLine: 'Ask on LINE',
    call: (n: string) => `Call ${n}`,
    noCommission: 'SpacesMate is free for tenants — no commission.',
    browseAll: 'Browse all listings',
    relatedHeading: 'Similar listings',

    ownerHeading: 'Have a property to rent out?',
    ownerBody: 'SpacesMate handles it end to end — finding tenants, the contract, and collecting rent.',
    ownerServicesCta: 'See management services',
    ownerListCta: 'List your property',

    securityDeposit: 'Security deposit',
    advanceDeposit: 'Advance rent',
    keyDeposit: 'Key deposit',
    water: 'Water',
    electricity: 'Electricity',
    months: (n: string | number) => (String(n) === '1' ? '1 month' : `${n} months`),
    perUnit: (v: string) => `฿${v}/unit`,
    minimum: (v: string) => `Minimum ฿${v}`,
    govRate: 'Government rate',
    asBilled: 'As billed',
    perMonthAmount: (v: string) => `฿${v}/month`,
  },
} as const

/** Rent period suffix on the headline price. */
export const TERM_SUFFIX: Record<Locale, Record<string, string>> = {
  th: { daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน', '6_months': '/เดือน', '12_months': '/เดือน' },
  en: { daily: '/day', '1_month': '/month', '3_months': '/month', '6_months': '/month', '12_months': '/month' },
}
export const DEFAULT_TERM_SUFFIX: Record<Locale, string> = { th: '/เดือน', en: '/month' }

/** Property type, as displayed. Keys are the normalised Property['propertyType']. */
export const TYPE_LABELS: Record<Locale, Record<string, string>> = {
  th: { Apartment: 'อพาร์ทเม้นท์', Condo: 'คอนโดมิเนียม', Office: 'ออฟฟิศ', 'Co-Working': 'โคเวิร์กกิ้ง' },
  en: { Apartment: 'Apartment', Condo: 'Condominium', Office: 'Office', 'Co-Working': 'Co-Working' },
}

/** Optional extra charges, keyed as stored in room_types. */
export const OTHER_CHARGE_LABELS: Record<Locale, Record<string, string>> = {
  th: {
    common_fee: 'ค่าส่วนกลาง', parking: 'ค่าจอดรถ', internet: 'ค่าอินเทอร์เน็ต',
    fridge: 'ค่าเช่าตู้เย็น', tv: 'ค่าเช่าโทรทัศน์', microwave: 'ค่าเช่าไมโครเวฟ',
  },
  en: {
    common_fee: 'Common area fee', parking: 'Parking', internet: 'Internet',
    fridge: 'Fridge rental', tv: 'TV rental', microwave: 'Microwave rental',
  },
}

/**
 * Amenities are stored as Thai strings on the listing. The editable list in
 * Settings already carries an English name for each, so this is a lookup rather
 * than a translation. Anything not in the list is shown as stored — better an
 * untranslated amenity than a missing one.
 */
const AMENITY_TH_TO_EN = new Map(DEFAULT_AMENITIES.map(a => [a.name_th, a.name_en]))

/**
 * The same amenity is stored under several spellings across the listings —
 * 'แอร์' / 'เครื่องปรับอากาศ' / 'เแอร์' (a typo), 'ลิฟท์' / 'ลิฟต์',
 * 'รปภ 24 ชม' / 'รักษาความปลอดภัย 24 ชม.'. 9 of the 29 distinct values in use
 * do not match the canonical list.
 *
 * Aliasing them here fixes the English display. It does not fix the underlying
 * data, which also affects Thai-side filtering — worth a cleanup pass on the
 * properties table separately.
 */
const AMENITY_ALIASES: Record<string, string> = {
  'เครื่องปรับอากาศ': 'แอร์',
  'เแอร์': 'แอร์',
  'เฟอร์นิเจอร์ครบ': 'เฟอร์นิเจอร์พร้อมอยู่',
  'ฟิตเนส': 'ห้องออกกำลังกาย (GYM)',
  'รักษาความปลอดภัย 24 ชม.': 'รปภ 24 ชม',
  'กล้องวงจรปิด': 'กล้องวงจรปิด (CCTV)',
  'ลิฟต์': 'ลิฟท์',
  'อินเทอร์เน็ต': 'WiFi',
}

/** Not in the canonical list at all, but in use on live listings. */
const AMENITY_EXTRA_EN: Record<string, string> = {
  'เครื่องทำน้ำอุ่น': 'Water heater',
}

export function localiseAmenity(name: string, locale: Locale): string {
  if (locale === 'th') return name
  const canonical = AMENITY_ALIASES[name] ?? name
  return AMENITY_TH_TO_EN.get(canonical) ?? AMENITY_EXTRA_EN[name] ?? name
}

/** Section headings on the amenity block ('In the unit' / 'In the building'). */
export function amenitySectionLabel(
  sec: { label_th: string; label_en: string },
  locale: Locale,
): string {
  return locale === 'th' ? sec.label_th : sec.label_en
}
