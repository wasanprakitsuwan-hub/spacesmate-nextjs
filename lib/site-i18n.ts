/**
 * Site chrome and home-page strings, per locale.
 *
 * Same approach as lib/property-i18n: one dictionary rather
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
    heroTitle: 'หาห้องเช่า คอนโด อพาร์ทเม้นท์ ในกรุงเทพฯ',
    heroSubMeta: 'คอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ ทั่วกรุงเทพฯ',
    heroAllTypes: 'ทั้งหมด',
    heroTry: 'ลองค้นหา',
    heroTryChips: [
      { label: 'ใกล้ BTS อุดมสุข', href: '/search?q=อุดมสุข' },
      { label: 'คอนโด คลองเตย', href: '/search?type=condo&q=คลองเตย' },
      { label: 'อพาร์ทเม้นท์ บางนา', href: '/search?type=apartment&q=บางนา' },
      { label: 'ไม่เกิน ฿6,000', href: '/search?price_max=6000' },
    ],
    heroAreaLabel: 'พื้นที่ / BTS / สถานศึกษา',
    heroAreaPlaceholder: 'ทำเล สถานี BTS/MRT มหาวิทยาลัย หรือชื่อโครงการ',
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

    // ── Management CTA ──
    mgmtKicker: 'บริการบริหารอาคาร',
    mgmtHeading: 'สนใจหามืออาชีพบริหารอาคารให้คุณ?',
    mgmtHeading2: 'ให้ทีมงานช่วยประเมินว่าอาคารของคุณทำรายได้เพิ่มได้อีกแค่ไหน',
    mgmtBody: 'ลงทะเบียนข้อมูลอาคารสั้นๆ แล้วเจ้าหน้าที่จะติดต่อกลับเพื่อนัดคุย เราดูแลตั้งแต่หาผู้เช่า ทำการตลาด ทำสัญญา เก็บค่าเช่า ไปจนถึงงานซ่อมบำรุง',
    mgmtCta: 'ลงทะเบียนให้ทีมงานติดต่อกลับ',
    mgmtMore: 'ดูรายละเอียดบริการ →',

    // ── Owner pitch (home) ──
    ownerKicker: 'สำหรับเจ้าของห้องและอาคาร',
    ownerHeading: 'ต้องการหาผู้เช่า?',
    ownerHeading2: 'ลงประกาศให้เช่ากับ SpacesMate',
    ownerBody: 'ลงประกาศได้ทุกประเภททรัพย์ เริ่มต้น ฿299 ต่อเดือน เผยแพร่ทันทีหลังชำระ แก้ไขและต่ออายุเองได้จากแดชบอร์ด',
    ownerCta: 'ลงประกาศหาผู้เช่า',
    ownerPricing: 'ดูแพ็กเกจและราคา',
    ownerFree: 'สมัครวันนี้ ลงประกาศแรกฟรี 1 เดือน',
    ownerFair: 'ไม่มีการซื้ออันดับ ทุกประกาศมีโอกาสขึ้นตำแหน่งแนะนำเท่ากัน',
    ownerTypes: [
      { name: 'คอนโดมิเนียม', desc: 'ปล่อยเช่าคอนโดรายเดือน รายปี' },
      { name: 'อพาร์ทเม้นท์ / หอพัก', desc: 'ลงได้หลายห้องในอาคารเดียว' },
      { name: 'บ้านเดี่ยว / ทาวน์เฮ้าส์', desc: 'บ้านเช่าสำหรับครอบครัว' },
      { name: 'ตึกแถว / อาคารพาณิชย์', desc: 'ทั้งหลังหรือแบ่งชั้นให้เช่า' },
      { name: 'ออฟฟิศ', desc: 'สำนักงานให้เช่าทุกขนาด' },
      { name: 'โคเวิร์กกิ้งสเปซ', desc: 'โต๊ะ ห้องประชุม และห้องส่วนตัว' },
    ],

    // ── Featured listings ──
    latestHeading: 'ประกาศล่าสุด',
    viewAllCount: (n: number) => `ดูทั้งหมด ${n.toLocaleString('en-US')} ประกาศ →`,
    near: (place: string) => `ใกล้ ${place}`,
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
    blogViewAll: 'ดูบทความทั้งหมด →',

    // ── Area links ──
    areaHeading: 'ห้องเช่าตามทำเล',
    genAreaHeading: 'ห้องเช่าตามเขต',
    genAreaSub: 'รวมประกาศให้เช่าแยกตามเขตและประเภทที่พักในกรุงเทพฯ',
    uniAreaHeading: 'ห้องเช่าใกล้มหาวิทยาลัย',

    // ── Navbar ──
    navSearch: 'ค้นหาที่พัก',
    navForOwners: 'สำหรับเจ้าของ',
    navSubmit: 'ลงประกาศให้เช่า',
    navSubmitDesc: 'สร้างประกาศเอง ฟรี + แพ็กเกจ',
    navManage: 'รับฝากบริหาร',
    navManageDesc: 'ให้เราดูแลให้ครบวงจร',
    navBlog: 'บทความ',
    navDashboard: 'แดชบอร์ด',
    navProfile: 'ข้อมูลส่วนตัว',
    navSignOut: 'ออกจากระบบ',
    navSignIn: 'เข้าสู่ระบบ',
    navSignInUp: 'เข้าสู่ระบบ / สมัครสมาชิก',
    navListCta: 'ลงประกาศ ฿299',
    navMyAccount: 'บัญชีของฉัน',

    // ── Footer ──
    footerExplore: 'สำรวจ',
    footerPopularAreas: 'ทำเลยอดนิยม',
    footerRentNear: (place: string) => `ห้องเช่าใกล้ ${place}`,
    footerForOwners: 'สำหรับเจ้าของ',
    footerPricing: 'แพ็กเกจและราคา',
    footerManage: 'บริการบริหารอาคาร',
    footerListCta: 'ลงประกาศหาผู้เช่า',
    footerCompany: 'บริษัท & ช่วยเหลือ',
    footerAbout: 'เกี่ยวกับเรา',
    footerContact: 'ติดต่อเรา',
    footerFaq: 'คำถามที่พบบ่อย',
    footerPrivacy: 'นโยบายความเป็นส่วนตัว',
    footerTerms: 'เงื่อนไขการใช้งาน',
    footerRights: '© 2026 บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.)',
    footerTagline: 'แพลตฟอร์มหาห้องเช่า คอนโด อพาร์ทเม้นท์ และออฟฟิศในกรุงเทพฯ พร้อมบริการบริหารอาคารสำหรับเจ้าของ',
    footerTenants: 'ผู้เช่า',
    footerOwners: 'เจ้าของทรัพย์',
    footerOwnerLogin: 'เข้าสู่ระบบเจ้าของ',
    footerGuide: 'คู่มือการลงประกาศ',
    // Public address. The registered one (Rama IV) stays on legal documents.
  },

  en: {
    heroTitle: 'Rooms, condos and apartments for rent in Bangkok',
    heroSubMeta: 'Condos, apartments, houses and offices across Bangkok',
    heroAllTypes: 'All',
    heroTry: 'Try',
    heroTryChips: [
      { label: 'Near BTS Udom Suk', href: '/search?q=Udom Suk' },
      { label: 'Condos in Khlong Toei', href: '/search?type=condo&q=Khlong Toei' },
      { label: 'Apartments in Bang Na', href: '/search?type=apartment&q=Bang Na' },
      { label: 'Under ฿6,000', href: '/search?price_max=6000' },
    ],
    heroAreaLabel: 'Area / BTS / university',
    heroAreaPlaceholder: 'Area, BTS/MRT station, university or building name',
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

    mgmtKicker: 'Building management',
    mgmtHeading: 'Looking for a professional to run your building?',
    mgmtHeading2: 'Let our team estimate how much more it could earn',
    mgmtBody: 'Register a few details about your building and we will call you back to arrange a talk. We handle tenant sourcing, marketing, contracts, rent collection and maintenance.',
    mgmtCta: 'Ask our team to call you back',
    mgmtMore: 'See the service →',

    // ── Owner pitch (home) ──
    ownerKicker: 'For room and building owners',
    ownerHeading: 'Looking for tenants?',
    ownerHeading2: 'List your rental on SpacesMate',
    ownerBody: 'List any property type from ฿299 a month. It goes live as soon as you pay, and you edit and renew it yourself from your dashboard.',
    ownerCta: 'List your rental',
    ownerPricing: 'See packages and prices',
    ownerFree: 'Sign up today and your first listing is free for 1 month',
    ownerFair: 'No paid ranking: every listing has the same chance at a featured spot',
    ownerTypes: [
      { name: 'Condominiums', desc: 'Monthly or yearly condo rentals' },
      { name: 'Apartments / dormitories', desc: 'Many rooms in one building' },
      { name: 'Houses / townhouses', desc: 'Family homes for rent' },
      { name: 'Shophouses / commercial buildings', desc: 'Whole building or by floor' },
      { name: 'Offices', desc: 'Office space of every size' },
      { name: 'Co-working spaces', desc: 'Desks, meeting rooms and private rooms' },
    ],

    latestHeading: 'Latest listings',
    viewAllCount: (n: number) => `See all ${n.toLocaleString('en-US')} listings →`,
    near: (place: string) => `Near ${place}`,
    viewDetail: 'View details →',
    studio: 'Studio',
    bedroomsValue: (n: number) => (n === 1 ? '1 bedroom' : `${n} bedrooms`),
    bathroomsValue: (n: number) => (n === 1 ? '1 bathroom' : `${n} bathrooms`),
    sqm: (v: string | number) => `${v} m²`,
    untitled: 'Untitled listing',
    askForPrice: 'Ask for price',
    defaultProvince: 'Bangkok',

    blogHeading: 'Latest articles',
    blogViewAll: 'Read all articles →',

    areaHeading: 'Rentals by area',
    genAreaHeading: 'Rentals by district',
    genAreaSub: 'Listings grouped by Bangkok district and property type',
    uniAreaHeading: 'Rentals near universities',

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
    navListCta: 'List from ฿299',
    navMyAccount: 'My account',

    footerExplore: 'Explore',
    footerPopularAreas: 'Popular areas',
    footerRentNear: (place: string) => `Rentals near ${place}`,
    footerForOwners: 'For owners',
    footerPricing: 'Packages and prices',
    footerManage: 'Building management',
    footerListCta: 'List your rental',
    footerCompany: 'Company & help',
    footerAbout: 'About us',
    footerContact: 'Contact',
    footerFaq: 'FAQ',
    footerPrivacy: 'Privacy policy',
    footerTerms: 'Terms of use',
    footerRights: '© 2026 Space Works Co., Ltd.',
    footerTagline: 'Find rooms, condos, apartments and offices to rent in Bangkok, with building management for owners.',
    footerTenants: 'Renters',
    footerOwners: 'Owners',
    footerOwnerLogin: 'Owner sign-in',
    footerGuide: 'Listing guide',
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
