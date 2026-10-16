/**
 * Site chrome and home-page strings, per locale.
 *
 * Same approach as lib/area-shared and lib/property-i18n: one dictionary rather
 * than a second copy of each component, so the Thai and English surfaces cannot
 * drift apart. Thai stays the default so every existing route renders unchanged
 * when no locale is passed.
 */
export type Locale = 'th' | 'en'

/**
 * Paths with an English counterpart. Everything else keeps pointing at the Thai
 * route, which exists, rather than at an /en path that would 404.
 *
 * Add a path here as each English page lands, and every footer link that uses
 * localeHref starts keeping the visitor on the English side automatically.
 */
// The route table moved to lib/routes-i18n on 16 Oct 2026, because the language
// toggle needed the same knowledge and was keeping its own copy as regexes.
// Import localeHref from there.
export const SITE_T = {
  th: {
    // ── Hero ──
    heroTitleA: 'ค้นหาที่พักที่ใช่ ',
    heroTitleB: 'ในราคาที่คุ้มค่า',
    heroSub: 'ทุกประเภททรัพย์สิน ทั่วกรุงเทพฯ — ค้นหาตามทำเล แล้วกรองตามที่คุณต้องการ',
    heroAreaLabel: 'พื้นที่ / BTS / สถานศึกษา',
    heroAreaPlaceholder: 'เช่น สุขุมวิท, BTS อโศก, ม.เกษตร',
    heroPriceLabel: 'ช่วงราคา',
    heroSearch: 'ค้นหา',
    anyPrice: 'ทุกราคา',
    priceUnder: '≤ 5,000 บาท',
    price5to15: '5,000–15,000 บาท',
    price15to30: '15,000–30,000 บาท',
    price30to60: '30,000–60,000 บาท',
    priceOver60: '60,000 บาท+',

    // ── Property types ──
    apartment: 'อพาร์ทเม้นท์',
    condo: 'คอนโดมิเนียม',
    condoShort: 'คอนโด',
    house: 'บ้าน',
    cowork: 'โคเวิร์กกิ้ง',
    office: 'ออฟฟิศ',
    coSpace: 'Co-space',
    categorySearch: 'ค้นหา →',

    // ── Why SpacesMate ──
    whyHeading: 'ทำไมต้อง SpacesMate',
    whySub: 'แพลตฟอร์มที่ออกแบบมาเพื่อความเป็นธรรมและความโปร่งใส',
    why1Title: 'ข้อมูลแม่นยำเสมอ',
    why1Desc: 'ทุกประกาศต่ออายุสูงสุด 12 เดือน เจ้าของต้องอัปเดตเพื่อต่ออายุ ข้อมูลจึงใหม่กว่าเว็บอื่น',
    why2Title: 'ลงประกาศง่าย ราคาเริ่มต้น ฿299',
    why2Desc: 'เผยแพร่ทันทีหลังชำระ ไม่ต้องรอทีมงาน รองรับทุกประเภทอสังหาริมทรัพย์',
    why3Title: 'ครอบคลุมทุกประเภท',
    why3Desc: 'คอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ และตึกแถว — มากกว่าเว็บทั่วไป',
    why4Title: 'จัดการง่าย',
    why4Desc: 'แดชบอร์ดเดียวจบ แก้ไขประกาศ ดูยอดเข้าชม และผู้สนใจได้ทันที',

    // ── Management CTA ──
    mgmtHeading: 'ให้ SpacesMate ดูแลทรัพย์สินของคุณ',
    mgmtBody: 'ปล่อยเช่าให้เราดูแลตั้งแต่หาผู้เช่า ทำสัญญา ถึงเก็บค่าเช่า — กรอกข้อมูลสั้นๆ แล้วทีมงานติดต่อกลับ',
    mgmtCta: 'ให้เราติดต่อกลับ →',

    // ── Featured listings ──
    latestHeading: 'ประกาศที่พักล่าสุด',
    latestSub: 'คอนโดและอพาร์ทเม้นท์ให้เช่าในกรุงเทพฯ — สุ่มแสดงใหม่ทุกครั้ง',
    viewAllArrow: 'ดูประกาศทั้งหมด →',
    viewAll: 'ดูประกาศทั้งหมด',
    viewDetail: 'ดูรายละเอียด →',
    studio: 'สตูดิโอ',
    bedroomsValue: (n: number) => `${n} ห้องนอน`,
    bathroomsValue: (n: number) => `${n} ห้องน้ำ`,
    sqm: (v: string | number) => `${v} ตร.ม.`,
    untitled: 'ไม่ระบุชื่อ',
    askForPrice: 'สอบถามราคา',
    defaultProvince: 'กรุงเทพมหานคร',

    // ── Blog ──
    blogHeading: 'บทความล่าสุด',
    blogSub: 'เคล็ดลับ คู่มือ และข้อมูลตลาดเช่า-ขายอสังหาฯ',
    blogViewAll: 'ดูบทความทั้งหมด →',
    blogReadMore: 'อ่านต่อ →',

    // ── Area links ──
    areaHeading: 'ค้นหาตามทำเลยอดนิยม',
    areaSub: 'สถานี BTS · MRT · ย่านยอดนิยมในกรุงเทพ',
    genAreaHeading: 'ห้องเช่าตามเขต',
    genAreaSub: 'รวมประกาศให้เช่าแยกตามเขตและประเภทที่พักในกรุงเทพฯ',

    // ── Navbar ──
    navSearch: 'ค้นหาที่พัก',
    navForOwners: 'สำหรับเจ้าของ',
    navSubmit: 'ลงประกาศปล่อยเช่า',
    navSubmitDesc: 'สร้างประกาศเอง ฟรี + แพ็กเกจ',
    navManage: 'รับฝากบริหาร',
    navManageDesc: 'ให้เราดูแลให้ครบวงจร',
    navBlog: 'บทความ',
    navDashboard: 'แดชบอร์ด',
    navProfile: 'ข้อมูลส่วนตัว',
    navSignOut: 'ออกจากระบบ',
    navSignIn: 'เข้าสู่ระบบ',
    navSignInUp: 'เข้าสู่ระบบ / สมัครสมาชิก',
    navListCta: 'ลงประกาศเช่า',
    navMyAccount: 'บัญชีของฉัน',

    // ── Footer ──
    footerTagline: 'แพลตฟอร์มเช่าอสังหาฯ ที่โปร่งใสและเป็นธรรม',
    footerExplore: 'สำรวจ',
    footerPopularAreas: 'ทำเลยอดนิยม',
    footerForOwners: 'สำหรับเจ้าของ',
    footerPricing: 'แพ็กเกจราคา',
    footerCompany: 'บริษัท & ช่วยเหลือ',
    footerAbout: 'เกี่ยวกับเรา',
    footerContact: 'ติดต่อเรา',
    footerFaq: 'คำถามที่พบบ่อย',
    footerPrivacy: 'นโยบายความเป็นส่วนตัว',
    footerTerms: 'เงื่อนไขการใช้งาน',
    footerRights: '© 2026 Space Works Co., Ltd. สงวนลิขสิทธิ์',
  },

  en: {
    heroTitleA: 'Find the right place ',
    heroTitleB: 'at the right price',
    heroSub: 'Every property type, across Bangkok — search by area, then filter down to what you need',
    heroAreaLabel: 'Area / BTS / university',
    heroAreaPlaceholder: 'e.g. Sukhumvit, BTS Asok, Kasetsart',
    heroPriceLabel: 'Price range',
    heroSearch: 'Search',
    anyPrice: 'Any price',
    priceUnder: '≤ ฿5,000',
    price5to15: '฿5,000–15,000',
    price15to30: '฿15,000–30,000',
    price30to60: '฿30,000–60,000',
    priceOver60: '฿60,000+',

    apartment: 'Apartment',
    condo: 'Condominium',
    condoShort: 'Condo',
    house: 'House',
    cowork: 'Co-working',
    office: 'Office',
    coSpace: 'Co-space',
    categorySearch: 'Search →',

    whyHeading: 'Why SpacesMate',
    whySub: 'A platform built for fairness and transparency',
    why1Title: 'Listings that stay accurate',
    why1Desc: 'Every listing runs for up to 12 months and the owner has to update it to renew, so the data here is fresher than elsewhere',
    why2Title: 'Simple to list, from ฿299',
    why2Desc: 'Live the moment you pay — no waiting on our team, and every property type is supported',
    why3Title: 'Every property type',
    why3Desc: 'Condos, apartments, houses, offices and shophouses — more than most sites carry',
    why4Title: 'Easy to manage',
    why4Desc: 'One dashboard: edit a listing, see your views, and reach interested renters straight away',

    mgmtHeading: 'Let SpacesMate manage your property',
    mgmtBody: 'We handle it end to end — finding tenants, the contract, and collecting rent. Leave a few details and our team will come back to you.',
    mgmtCta: 'Ask us to call you →',

    latestHeading: 'Latest listings',
    latestSub: 'Condos and apartments to rent in Bangkok — reshuffled on every visit',
    viewAllArrow: 'Browse all listings →',
    viewAll: 'Browse all listings',
    viewDetail: 'View details →',
    studio: 'Studio',
    bedroomsValue: (n: number) => (n === 1 ? '1 bedroom' : `${n} bedrooms`),
    bathroomsValue: (n: number) => (n === 1 ? '1 bathroom' : `${n} bathrooms`),
    sqm: (v: string | number) => `${v} m²`,
    untitled: 'Untitled listing',
    askForPrice: 'Ask for price',
    defaultProvince: 'Bangkok',

    blogHeading: 'Latest articles',
    blogSub: 'Tips, guides and Bangkok rental market data',
    blogViewAll: 'Read all articles →',
    blogReadMore: 'Read more →',

    areaHeading: 'Browse by popular area',
    areaSub: 'BTS · MRT stations and Bangkok’s best-known neighbourhoods',
    genAreaHeading: 'Rentals by district',
    genAreaSub: 'Listings grouped by Bangkok district and property type',

    navSearch: 'Search rentals',
    navForOwners: 'For owners',
    navSubmit: 'List your property',
    navSubmitDesc: 'Create it yourself — free, plus packages',
    navManage: 'Full management',
    navManageDesc: 'We handle the whole tenancy',
    navBlog: 'Articles',
    navDashboard: 'Dashboard',
    navProfile: 'My profile',
    navSignOut: 'Sign out',
    navSignIn: 'Sign in',
    navSignInUp: 'Sign in / Register',
    navListCta: 'List a rental',
    navMyAccount: 'My account',

    footerTagline: 'A transparent, fair rental platform',
    footerExplore: 'Explore',
    footerPopularAreas: 'Popular areas',
    footerForOwners: 'For owners',
    footerPricing: 'Pricing',
    footerCompany: 'Company & help',
    footerAbout: 'About us',
    footerContact: 'Contact',
    footerFaq: 'FAQ',
    footerPrivacy: 'Privacy policy',
    footerTerms: 'Terms of use',
    footerRights: '© 2026 Space Works Co., Ltd. All rights reserved.',
  },
} as const

/** Thai month abbreviations; English uses the Intl short month. */
export const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
export const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Rent period suffix on a card price. */
export const CARD_TERM_SUFFIX: Record<Locale, Record<string, string>> = {
  th: { daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน', '6_months': '/เดือน', '12_months': '/เดือน' },
  en: { daily: '/day', '1_month': '/month', '3_months': '/month', '6_months': '/month', '12_months': '/month' },
}
export const CARD_DEFAULT_SUFFIX: Record<Locale, string> = { th: '/เดือน', en: '/month' }
