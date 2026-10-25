/**
 * Every string the property page renders, per locale.
 *
 * Same approach as lib/site-i18n: one dictionary rather than two copies of
 * the template, so the Thai and English pages cannot drift apart.
 *
 * Scope note: this covers the page's own chrome. Owner-supplied values —
 * listing title, description, room type names, district — come from the
 * database and are translated only where the owner supplied an English version.
 * Where they did not, Thai is shown rather than nothing, and the structured
 * data marks the language of the text it actually contains.
 */
import { DEFAULT_AMENITIES, LEGACY_AMENITY_RENAMES } from '@/lib/amenities'

export type Locale = 'th' | 'en'

export const PROPERTY_T = {
  th: {
    notFoundTitle: 'ไม่พบประกาศ',
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
    nearbyStations: 'รถไฟฟ้าใกล้เคียง',
    nearbyHeading: 'สถานที่สำคัญใกล้เคียง',
    nearbyGroups: { transport: 'การเดินทาง', university: 'สถานศึกษา', hospital: 'โรงพยาบาล', mall: 'ห้างสรรพสินค้า', place: 'สถานที่อื่นๆ' },
    nearbyNote: 'ระยะทางเป็นระยะเส้นตรงจากหมุดบนแผนที่ ระยะเดินจริงอาจไกลกว่านี้',
    searchNearPlace: (name: string) => `ดูที่พักอื่นใกล้ ${name}`,
    searchNearStation: (name: string) => `ดูที่พักอื่นใกล้ ${name}`,
    mapTitle: 'แผนที่ที่ตั้ง',
    openInMaps: 'เปิดใน Google Maps',

    priceLabel: 'ราคาเช่า',
    verified: 'ยืนยันตัวตนแล้ว',
    askOnLine: 'สอบถามผ่าน LINE',
    call: (n: string) => `โทร ${n}`,
    noCommission: 'SpacesMate ให้บริการฟรี ไม่มีค่าคอมมิชชั่นจากผู้เช่า',
    browseAll: 'ดูประกาศทั้งหมด',
    relatedHeading: 'ประกาศที่คล้ายกัน',
    nearbyListingsHeading: 'ห้องเช่าใกล้เคียง',
    awayFromHere: (d: string) => `ห่างจากห้องนี้ ${d}`,
    sameBuildingHeading: 'ห้องอื่นในอาคารเดียวกัน',
    sameBuildingAll: (name: string) => `ดูทุกห้องใน ${name} →`,
    floor: 'ชั้น',
    detailsHeading: 'รายละเอียด',
    infoHeading: 'ข้อมูลประกาศ',
    infoLocation: 'ที่ตั้ง',
    infoPosted: 'ลงประกาศ',
    infoUpdated: 'อัปเดตล่าสุด',
    infoMinTerm: 'สัญญาขั้นต่ำ',
    minTerms: { daily: 'รายวัน', '1_month': '1 เดือน', '3_months': '3 เดือน', '6_months': '6 เดือน', '12_months': '12 เดือน' } as Record<string, string>,
    locationNearbyHeading: 'ทำเลและสถานที่ใกล้เคียง',
    perMonthWord: 'ต่อเดือน',
    perDayWord: 'ต่อวัน',
    callOwner: 'โทรหาผู้ลงประกาศ',
    allPhotos: (n: number) => `ดูรูปทั้งหมด ${n} รูป`,
    photoAlt: (title: string, n: number) => `${title} รูปที่ ${n}`,
    prevPhoto: 'รูปก่อนหน้า',
    nextPhoto: 'รูปถัดไป',
    closePhotos: 'ปิด',

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
    notFoundTitle: 'Listing not found',
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
    nearbyStations: 'Nearby stations',
    nearbyHeading: "What's nearby",
    nearbyGroups: { transport: 'Transport', university: 'Education', hospital: 'Hospitals', mall: 'Shopping', place: 'Other places' },
    nearbyNote: 'Straight-line distance from the map pin; the walking route may be longer.',
    searchNearPlace: (name: string) => `More rentals near ${name}`,
    searchNearStation: (name: string) => `More rentals near ${name}`,
    mapTitle: 'Location map',
    openInMaps: 'Open in Google Maps',

    priceLabel: 'Rent',
    verified: 'Verified',
    askOnLine: 'Ask on LINE',
    call: (n: string) => `Call ${n}`,
    noCommission: 'SpacesMate is free for tenants — no commission.',
    browseAll: 'Browse all listings',
    relatedHeading: 'Similar listings',
    nearbyListingsHeading: 'Rentals nearby',
    awayFromHere: (d: string) => `${d} from this listing`,
    sameBuildingHeading: 'Other rooms in this building',
    sameBuildingAll: (name: string) => `See every room in ${name} →`,
    floor: 'Floor',
    detailsHeading: 'Details',
    infoHeading: 'Listing information',
    infoLocation: 'Location',
    infoPosted: 'Listed',
    infoUpdated: 'Last updated',
    infoMinTerm: 'Minimum contract',
    minTerms: { daily: 'Daily', '1_month': '1 month', '3_months': '3 months', '6_months': '6 months', '12_months': '12 months' } as Record<string, string>,
    locationNearbyHeading: 'Location and nearby places',
    perMonthWord: 'per month',
    perDayWord: 'per day',
    callOwner: 'Call the lister',
    allPhotos: (n: number) => `See all ${n} photos`,
    photoAlt: (title: string, n: number) => `${title} photo ${n}`,
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    closePhotos: 'Close',

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
 * A legacy spelling → the canonical name, so English display works whether or
 * not migrations/2026-10-16-amenities-canonical.sql has run yet.
 *
 * This used to be a hand-written map pointing the other way — the live names at
 * the old DEFAULT_AMENITIES names — because DEFAULT_AMENITIES was then the stale
 * list. When that array was made canonical on 16 Oct 2026 the direction
 * inverted, and a second hand-written map would have had to invert with it. So
 * there is now one: LEGACY_AMENITY_RENAMES, shared with the migration that
 * rewrites the stored values.
 *
 * Which means display is tolerant and the code and the migration do not have to
 * ship together. Once the migration has run this map stops matching anything,
 * and that is the point at which it can go.
 */
export function localiseAmenity(name: string, locale: Locale): string {
  if (locale === 'th') return name
  const canonical = LEGACY_AMENITY_RENAMES[name] ?? name
  return AMENITY_TH_TO_EN.get(canonical) ?? name
}

/** Section headings on the amenity block ('In the unit' / 'In the building'). */
export function amenitySectionLabel(
  sec: { label_th: string; label_en: string },
  locale: Locale,
): string {
  return locale === 'th' ? sec.label_th : sec.label_en
}
