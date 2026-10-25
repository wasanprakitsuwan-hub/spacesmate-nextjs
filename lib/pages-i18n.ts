/**
 * Contact, search and the listing landing page, per locale.
 *
 * Same pattern as the other page dictionaries. Three pages share one file
 * because none is large on its own and they are translated together.
 *
 * Note on /list-your-property: it is the landing page, not the form. Its main CTA goes to
 * /list-your-property/new, which renders SharedListingForm and is still Thai. Translating
 * that form is a separate job (245 strings) and an all-or-nothing one, because
 * it ends at Stripe checkout — a half-translated purchase path is worse than an
 * untranslated one.
 */
export type Locale = 'th' | 'en'

export const CONTACT_T = {
  th: {
    metaTitle: 'ติดต่อเรา',
    metaDesc: 'ติดต่อ SpacesMate — สำหรับนักลงทุนและพันธมิตรธุรกิจที่สนใจร่วมเติบโตไปด้วยกัน',

    interestInvestor: 'นักลงทุน',
    interestPartner: 'พันธมิตรธุรกิจ',

    errPhoneRequired: 'กรุณากรอกเบอร์โทรศัพท์',
    errPhoneLength: 'เบอร์โทรศัพท์ต้องมี 10 หลัก',
    errPhoneFormat: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)',
    errGeneric: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
    errSendFailed: 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือทักเราทาง LINE',


    channels: 'ช่องทางติดต่อ',
    email: 'อีเมล',
    phone: 'โทรศัพท์',
    office: 'ที่ตั้งสำนักงาน',
    officeLine0: 'Summer Hill (unit 3026)',
    officeLine1: '1106 ถนนสุขุมวิท แขวงพระโขนง',
    officeLine2: 'เขตคลองเตย กรุงเทพฯ 10110',
    hours: 'เวลาทำการ',
    hoursValue: 'จันทร์ – ศุกร์: 9:00 – 17:30 น.',
    hoursClosed: 'หยุดเสาร์-อาทิตย์และวันหยุดนักขัตฤกษ์',

    sentTitle: 'ได้รับข้อความแล้ว!',
    sentBody: 'ทีมงานจะติดต่อกลับโดยเร็วที่สุด',

    fullName: 'ชื่อ – นามสกุล',
    namePlaceholder: 'สมชาย ใจดี',
    phoneLabel: 'เบอร์โทรศัพท์',
    interest: 'ความสนใจ',
    details: 'รายละเอียดเพิ่มเติม',
    detailsPlaceholder: 'บอกเราเพิ่มเติมเกี่ยวกับความสนใจหรือแนวคิดของคุณ...',
    sending: 'กำลังส่ง...',
    send: 'ส่งข้อความ',
    privacyNote: 'ข้อมูลของคุณปลอดภัยและเป็นความลับ ไม่มีการแชร์กับบุคคลที่สาม',
    pageTitle: 'ติดต่อ SpacesMate',
    pageSub: 'เลือกเรื่องที่ต้องการ เพื่อให้ถึงทีมที่ตอบได้เร็วที่สุด',
    routes: [
      { title: 'ผู้เช่า สอบถามห้อง', desc: 'ทักผู้ลงประกาศจากหน้าประกาศได้โดยตรง หรือถามทีมงานทาง LINE', cta: 'LINE @spacesmate →', href: 'https://line.me/R/ti/p/@spacesmate' },
      { title: 'เจ้าของ ลงประกาศ', desc: 'ลงประกาศเองเริ่มต้น ฿299 ต่อ 30 วัน เผยแพร่ทันทีหลังชำระ', cta: 'ลงประกาศหาผู้เช่า →', href: '/list-your-property' },
      { title: 'เจ้าของอาคาร ให้เราบริหาร', desc: 'ลงทะเบียนให้ทีมงานติดต่อกลับ และประเมินรายได้อาคาร', cta: 'บริการบริหารอาคาร →', href: '/manage#enquiry' },
    ],
    lineNote: 'ตอบเร็วที่สุดในเวลาทำการ',
    investorTitle: 'นักลงทุนและพันธมิตรธุรกิจ',
    investorSub: 'ส่งข้อความถึงทีมผู้บริหาร เราติดต่อกลับโดยเร็วที่สุด',
  },
  en: {
    metaTitle: 'Contact us',
    metaDesc: 'Contact SpacesMate — for investors and business partners interested in growing with us.',

    interestInvestor: 'Investor',
    interestPartner: 'Business partner',

    errPhoneRequired: 'Please enter a phone number',
    errPhoneLength: 'A phone number must be 10 digits',
    errPhoneFormat: 'That phone number format is not valid (it must start with 0)',
    errGeneric: 'Something went wrong. Please try again.',
    errSendFailed: 'We could not send your details. Please try again, or message us on LINE',


    channels: 'How to reach us',
    email: 'Email',
    phone: 'Phone',
    office: 'Office',
    officeLine0: 'Summer Hill (unit 3026)',
    officeLine1: '1106 Sukhumvit Road, Phra Khanong',
    officeLine2: 'Khlong Toei, Bangkok 10110',
    hours: 'Opening hours',
    hoursValue: 'Monday – Friday: 9:00 – 17:30',
    hoursClosed: 'Closed weekends and public holidays',

    sentTitle: 'Message received',
    sentBody: 'Our team will come back to you as soon as possible.',

    fullName: 'Full name',
    namePlaceholder: 'Somchai Jaidee',
    phoneLabel: 'Phone number',
    interest: 'I am interested as',
    details: 'Anything else',
    detailsPlaceholder: 'Tell us a little more about your interest or your idea…',
    sending: 'Sending…',
    send: 'Send message',
    privacyNote: 'Your details are kept confidential and are never shared with third parties.',
    pageTitle: 'Contact SpacesMate',
    pageSub: 'Pick what you need so it reaches the team that can answer fastest',
    routes: [
      { title: 'Renters: ask about a room', desc: 'Message the owner straight from the listing page, or ask our team on LINE', cta: 'LINE @spacesmate →', href: 'https://line.me/R/ti/p/@spacesmate' },
      { title: 'Owners: list a property', desc: 'List it yourself from ฿299 for 30 days, live as soon as you pay', cta: 'List your property →', href: '/list-your-property' },
      { title: 'Building owners: let us manage', desc: 'Ask our team to call you and assess your building\'s income', cta: 'Building management →', href: '/manage#enquiry' },
    ],
    lineNote: 'Fastest reply during office hours',
    investorTitle: 'Investors and business partners',
    investorSub: 'Send a message to the management team and we will come back to you soon',
  },
} as const

export const SEARCH_T = {
  th: {
    metaTitle: 'ค้นหาที่พัก',
    metaDesc: 'ค้นหาคอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ และโคเวิร์กกิ้งให้เช่าทั่วกรุงเทพฯ กรองตามทำเล ราคา และประเภท',

    within1: 'ภายใน 1 กม.',
    within2: 'ภายใน 2 กม.',
    within5: 'ภายใน 5 กม.',
    within10: 'ภายใน 10 กม.',

    allTypes: 'ทุกประเภท',
    apartment: 'อพาร์ทเม้นท์',
    condo: 'คอนโดมิเนียม',
    condoShort: 'คอนโด',
    office: 'ออฟฟิศ',

    perDay: '/วัน',
    perMonth: '/เดือน',
    untitled: 'ไม่ระบุชื่อ',
    askForPrice: 'สอบถามราคา',
    defaultProvince: 'กรุงเทพมหานคร',

    geoUnsupported: 'เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง',
    geoDenied: 'ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง',

    allListings: 'ที่พักทั้งหมด',
    home: 'หน้าแรก',
    searchRentals: 'ค้นหาที่พัก',
    inBangkok: 'ในกรุงเทพฯ',
    searchPlaceholder: 'ทำเล สถานี BTS/MRT มหาวิทยาลัย หรือชื่อโครงการ',

    filters: 'ตัวกรอง',
    propertyType: 'ประเภททรัพย์สิน',
    priceRange: 'ช่วงราคา',
    myLocation: 'ตำแหน่งของฉัน',
    locating: 'กำลังระบุตำแหน่ง...',
    searchNearMe: 'ค้นหาใกล้ฉัน',
    yourLocation: 'ตำแหน่งของคุณ',
    clearFilters: 'ล้างตัวกรอง',

    foundPrefix: 'พบ',
    foundSuffix: 'ประกาศ',
    withinPrefix: 'ภายใน',
    km: 'กม.',

    sortBy: 'เรียงตาม',
    sortNewest: 'ล่าสุด',
    sortPriceAsc: 'ราคาต่ำ - สูง',
    sortPriceDesc: 'ราคาสูง - ต่ำ',
    sortNearest: 'ใกล้ที่สุด',

    noResults: 'ไม่พบประกาศที่ตรงเงื่อนไข',
    noResultsHint: 'ลองปรับช่วงราคาหรือประเภททรัพย์สิน',

    studio: 'สตูดิโอ',
    bedrooms: 'ห้องนอน',
    featured: 'แนะนำ',
    daily: 'รายวัน',
    bathrooms: 'ห้องน้ำ',
    sqm: 'ตร.ม.',
    viewDetail: 'ดูรายละเอียด',
    loading: 'กำลังโหลด...',

    popularPlaces: 'ทำเลยอดนิยม',
    suggestStations: 'สถานีรถไฟฟ้า',
    suggestDistricts: 'เขต',
    nearPrefix: 'ใกล้',
    closestTo: 'ประกาศที่ใกล้ที่สุดจาก',
    noneNearPlace: 'ยังไม่มีประกาศในระยะที่เลือก',
    distanceFromStation: 'ระยะทางจากจุดที่เลือก',
    pickStationFirst: 'เลือกสถานีหรือสถานที่ในช่องค้นหาด้านบนก่อน แล้วปรับระยะได้ที่นี่',
    suggestLandmarks: 'สถานที่',
    fromPlace: 'ห่างจาก {p} {d}',
    findOnMap: 'ค้นหา “{q}” บนแผนที่',
    mapLoading: 'กำลังค้นหาบนแผนที่…',
    mapNotFound: 'ไม่พบสถานที่นี้บนแผนที่ แสดงผลจากคำค้นแทน',
  },
  en: {
    metaTitle: 'Search rentals',
    metaDesc: 'Search condos, apartments, houses, offices and co-working to rent across Bangkok. Filter by area, price and property type.',

    within1: 'Within 1 km',
    within2: 'Within 2 km',
    within5: 'Within 5 km',
    within10: 'Within 10 km',

    allTypes: 'All types',
    apartment: 'Apartment',
    condo: 'Condominium',
    condoShort: 'Condo',
    office: 'Office',

    perDay: '/day',
    perMonth: '/month',
    untitled: 'Untitled listing',
    askForPrice: 'Ask for price',
    defaultProvince: 'Bangkok',

    geoUnsupported: 'Your browser does not support location',
    geoDenied: 'Could not get your location. Please allow location access.',

    allListings: 'All rentals',
    home: 'Home',
    searchRentals: 'Search rentals',
    inBangkok: 'in Bangkok',
    searchPlaceholder: 'Area, BTS/MRT station, university or building name',

    filters: 'Filters',
    propertyType: 'Property type',
    priceRange: 'Price range',
    myLocation: 'My location',
    locating: 'Finding you…',
    searchNearMe: 'Search near me',
    yourLocation: 'Your location',
    clearFilters: 'Clear filters',

    foundPrefix: 'Found',
    foundSuffix: 'listings',
    withinPrefix: 'within',
    km: 'km',

    sortBy: 'Sort by',
    sortNewest: 'Newest',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    sortNearest: 'Nearest',

    noResults: 'No listings match those filters',
    noResultsHint: 'Try widening the price range or changing the property type',

    studio: 'Studio',
    bedrooms: 'bedrooms',
    featured: 'Featured',
    daily: 'Daily',
    bathrooms: 'bathrooms',
    sqm: 'm²',
    viewDetail: 'View details',
    loading: 'Loading…',

    popularPlaces: 'Popular locations',
    suggestStations: 'Train stations',
    suggestDistricts: 'Districts',
    nearPrefix: 'Near',
    closestTo: 'Closest listings to',
    noneNearPlace: 'No listings within that distance yet',
    distanceFromStation: 'Distance from chosen place',
    pickStationFirst: 'Choose a station or place in the search box above, then set the distance here',
    suggestLandmarks: 'Places',
    fromPlace: '{d} from {p}',
    findOnMap: 'Find “{q}” on the map',
    mapLoading: 'Looking it up on the map…',
    mapNotFound: 'Couldn’t find that place on the map, showing keyword matches instead',
  },
} as const

export const SUBMIT_T = {
  th: {
    metaTitle: 'ลงประกาศให้เช่า',
    metaDesc: 'ลงประกาศเช่าอพาร์ทเม้นท์ คอนโด บ้าน ออฟฟิศ หรือโคเวิร์กกิ้งสเปซ เริ่มต้นเพียง ฿299/เดือน เผยแพร่ทันทีหลังชำระ เข้าถึงผู้เช่าที่กำลังมองหาจริงๆ',

    heroTitleA: 'ลงประกาศเช่ากับ',
    heroTitleB: 'เริ่มต้น ฿299/เดือน',
    heroSub: 'เข้าถึงผู้เช่าที่กำลังมองหาจริงๆ ระบบสุ่มแสดงผลเท่าเทียม ไม่ต้องจ่ายเพื่อขึ้นหน้าแรก',

    oneListing: '1 ประกาศ',
    recommendedBadge: 'ยอดนิยม',
    statHours: '< 24 ชม.',
    step1TitleFull: 'สร้างประกาศ — ฟรี',
    step1Desc: (n: number) => `กรอกข้อมูลห้องและอัปโหลดรูปได้ถึง ${n} รูป พร้อมวิดีโอ บันทึกเป็นฉบับร่างไว้ได้ ยังไม่ต้องจ่าย`,
    note2Full: (n: number) => `กรอกประกาศได้เต็มที่ทุกแพ็กเกจ — รูปสูงสุด ${n} รูปและใส่วิดีโอได้`,
    note2TailA: 'แพ็กเกจกำหนดแค่ว่า',
    note2Strong: 'แสดงบนเว็บไซต์กี่รูป',
    note2TailB: ' อัปเกรดแล้วส่วนที่เหลือแสดงทันที',
    statAreas: 'ย่านทั่วกรุงเทพ',
    statPriceSub: 'ราคาเริ่มต้น/ประกาศ/เดือน',
    statInstant: 'เผยแพร่ประกาศทันทีหลังชำระ',

    why1Title: 'ผู้เช่าที่กำลังมองหาจริงๆ',
    why1Body: 'เข้าถึงคนที่เสิร์ชหาห้องเช่าออนไลน์โดยตรง ไม่ต้องรอลุ้นจากป้ายไวนิลหรือปากต่อปาก',
    why2Title: 'ประกาศถูกต้อง ข้อมูลแม่นยำ',
    why2Body: 'ระบบตรวจสอบให้ประกาศอัปเดตอยู่เสมอ ผู้เช่าเห็นข้อมูลจริง ลดการติดต่อที่เสียเวลา',
    why3Title: 'เริ่มต้นเพียง ฿299/เดือน',
    why3Body: 'แพ็กเกจรายเดือนถึงรายปี คุ้มค่ากว่าค่าคอมมิชชันแบบเดิมหลายเท่า',
    why4Title: 'ไม่ต้องจ่ายเพื่อขึ้นหน้าแรก',
    why4Body: 'ระบบสุ่มแสดงผลเท่าเทียมทุกประกาศ ทุกเจ้าของมีสิทธิ์เท่ากัน ไม่มีใครได้เปรียบ',

    step1Title: 'สร้างประกาศ',
    step1Free: 'ฟรี',
    step1BodyA: 'กรอกข้อมูลห้องและอัปโหลดรูปได้ถึง',
    step1BodyB: 'รูป พร้อมวิดีโอ บันทึกเป็นฉบับร่างไว้ได้ ยังไม่ต้องจ่าย',
    step2Title: 'ซื้อแพ็กเกจเมื่อพร้อม',
    step2Body: 'เลือกแพ็กเกจตามระยะเวลาที่ต้องการแสดงผล 1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ ซื้อหลายแพ็กเกจพร้อมกันได้',
    step3Title: 'เผยแพร่ทันที',
    step3Body: 'ประกาศขึ้นเว็บทันทีที่ชำระสำเร็จ สลับประกาศในแพ็กเกจได้ตลอดอายุ',

    ownersEyebrow: 'สำหรับเจ้าของทรัพย์สิน',
    ownersTitle: 'ลงประกาศปล่อยเช่า',
    ownersBody: 'ปล่อยเช่าทรัพย์สินของคุณให้เข้าถึงผู้เช่าที่ผ่านการยืนยันหลายพันคน สร้างประกาศเองง่ายๆ ใน 3 ขั้นตอน',
    ownersCta1: 'เริ่มลงประกาศเลย',
    ownersCta2: 'อยากให้เราดูแลให้',

    whyHeadingA: 'ลงประกาศกับ',
    whyHeadingB: 'ดียังไง',
    whySub: 'แพลตฟอร์มที่ช่วยให้คุณปล่อยเช่าได้เร็วและปลอดภัย',
    stepsHeading: 'ลงประกาศง่ายๆ 3 ขั้นตอน',
    packagesHeading: 'แพ็กเกจราคา',

    note1: '1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ · เผยแพร่ทันที ไม่ต้องรอ',
    note2A: 'กรอกประกาศได้เต็มที่ทุกแพ็กเกจ',
    note2B: 'แพ็กเกจกำหนดแค่ว่าแสดงบนเว็บไซต์กี่รูป อัปเกรดแล้วส่วนที่เหลือแสดงทันที',
    note3: 'แพ็กเกจสูงสุด 12 เดือน เพื่อให้ประกาศได้รับการอัปเดตเสมอ — ข้อมูลแม่นกว่าเว็บอื่น',

    promoTitle: 'ลงประกาศฟรีเดือนแรก!',
    promoUseCode: 'ใช้โค้ด',
    promoDetail: 'ขั้นตอนสุดท้าย — ลดทันที ฿299 สำหรับแพ็กเกจแรก',

    recommended: 'แนะนำ',
    baht: 'บาท',
    save: 'ประหยัด',

    draftTitle: 'สร้างประกาศก่อน — ฟรี ยังไม่ต้องจ่าย',
    draftBody: 'บันทึกเป็นฉบับร่างไว้ได้ตลอด พร้อมเผยแพร่เมื่อไหร่ค่อยซื้อแพ็กเกจในแดชบอร์ด',

    closingTitle: 'พร้อมปล่อยเช่าแล้วหรือยัง?',
    closingBody: 'เผยแพร่ประกาศของคุณต่อผู้เช่าหลายพันคน เริ่มต้นเพียง ฿299',
  },
  en: {
    metaTitle: 'List your property',
    metaDesc: 'List an apartment, condo, house, office or co-working space from ฿299/month. Live as soon as you pay, in front of renters who are actively looking.',

    heroTitleA: 'List your rental with',
    heroTitleB: 'from ฿299/month',
    heroSub: 'Reach renters who are actively looking. Listings are shuffled on equal terms — you never pay for a front-page position.',

    oneListing: '1 listing',
    recommendedBadge: 'Most popular',
    statHours: '< 24 hrs',
    step1TitleFull: 'Create the listing — free',
    step1Desc: (n: number) => `Fill in the room details and upload up to ${n} photos, plus video. Save it as a draft — nothing to pay yet.`,
    note2Full: (n: number) => `Every package lets you fill in the whole listing — up to ${n} photos, and video`,
    note2TailA: 'The package only decides ',
    note2Strong: 'how many photos show on the website',
    note2TailB: '. Upgrade and the rest appear immediately.',
    statAreas: 'areas across Bangkok',
    statPriceSub: 'from, per listing per month',
    statInstant: 'listing live as soon as you pay',

    why1Title: 'Renters who are actually looking',
    why1Body: 'Reach people searching for a rental online, rather than hoping a banner or word of mouth finds them.',
    why2Title: 'Listings that stay accurate',
    why2Body: 'The system keeps listings up to date, so renters see real information and you waste less time on dead enquiries.',
    why3Title: 'From ฿299/month',
    why3Body: 'Monthly to annual packages — many times cheaper than a traditional agent’s commission.',
    why4Title: 'No paying for the front page',
    why4Body: 'Every listing is shuffled on equal terms. Every owner has the same chance, and nobody can buy an advantage.',

    step1Title: 'Create the listing',
    step1Free: 'free',
    step1BodyA: 'Fill in the room details and upload up to',
    step1BodyB: 'photos, plus video. Save it as a draft — nothing to pay yet.',
    step2Title: 'Buy a package when you are ready',
    step2Body: 'Choose a package for how long you want it live. One package = one live listing, and you can buy several at once.',
    step3Title: 'Publish immediately',
    step3Body: 'The listing goes live the moment payment succeeds, and you can swap listings within the package for the rest of its term.',

    ownersEyebrow: 'For property owners',
    ownersTitle: 'List your property to let',
    ownersBody: 'Put your property in front of thousands of verified renters. Create the listing yourself in three simple steps.',
    ownersCta1: 'Start listing',
    ownersCta2: 'I’d rather you managed it',

    whyHeadingA: 'Why list with',
    whyHeadingB: '',
    whySub: 'A platform built to let your property quickly and safely',
    stepsHeading: 'Three simple steps',
    packagesHeading: 'Packages',

    note1: 'One package = one live listing · published immediately, with nothing to wait for',
    note2A: 'Every package lets you fill in the whole listing.',
    note2B: 'The package only decides how many photos show on the website; upgrade and the rest appear immediately.',
    note3: 'Packages run to 12 months at most, so listings stay updated — which is why the data here is more accurate than elsewhere.',

    promoTitle: 'First month free',
    promoUseCode: 'Use code',
    promoDetail: 'at checkout — ฿299 off your first package',

    recommended: 'Recommended',
    baht: 'baht',
    save: 'Saves',

    draftTitle: 'Create the listing first — free, nothing to pay',
    draftBody: 'Keep it as a draft for as long as you like, then buy a package from your dashboard when you are ready to publish.',

    closingTitle: 'Ready to let it?',
    closingBody: 'Put your listing in front of thousands of renters, from ฿299.',
  },
} as const

/** The shape of one locale's strings, for helpers that accept either. */
export type ContactStrings = (typeof CONTACT_T)[Locale]
export type SearchStrings = (typeof SEARCH_T)[Locale]
export type SubmitStrings = (typeof SUBMIT_T)[Locale]

/**
 * Cookie consent banner and the footer link that reopens it.
 *
 * These render on every page in both locales. They were Thai-only until the
 * English pages existed, which meant an English visitor read an English privacy
 * policy explaining their right to withdraw consent, then gave that consent
 * through a Thai interface. PDPA consent has to be informed; consent collected
 * through wording the person cannot read is weak consent.
 */
export const CONSENT_T = {
  th: {
    dialogLabel: 'การตั้งค่าคุกกี้ / Cookie settings',
    weUseCookies: 'เราใช้คุกกี้',
    intro: 'คุกกี้ที่จำเป็นทำให้เว็บไซต์ทำงานได้ และเปิดใช้งานอยู่เสมอ ส่วนคุกกี้เพื่อการวิเคราะห์และการตลาดจะใช้ก็ต่อเมื่อคุณอนุญาตเท่านั้น',
    privacyLink: 'นโยบายความเป็นส่วนตัว',
    // The banner has always shown both languages: the main line in the reader's
    // language, a smaller gloss in the other. Before locale support the gloss
    // was hardcoded English, which read correctly under Thai and duplicated
    // itself under English.
    introAlt: 'Essential cookies keep the site working and are always on. Analytics and marketing cookies are used only if you allow them.',
    necessary: 'จำเป็น · Essential',
    necessaryDesc: 'เข้าสู่ระบบ ความปลอดภัย และการทำงานพื้นฐาน — ปิดไม่ได้',
    alwaysOn: 'ปิดไม่ได้',
    analytics: 'การวิเคราะห์ · Analytics',
    analyticsDesc: 'ช่วยให้เราเข้าใจว่าหน้าไหนมีคนใช้งาน (Google Analytics)',
    marketing: 'การตลาด · Marketing',
    marketingDesc: 'ใช้วัดผลโฆษณาบน Facebook และ Instagram',
    save: 'บันทึกการตั้งค่า · Save',
    acceptAll: 'ยอมรับทั้งหมด · Accept all',
    rejectAll: 'ปฏิเสธทั้งหมด · Reject all',
    customise: 'ตั้งค่า · Customise',
    settingsLink: 'ตั้งค่าคุกกี้',
  },
  en: {
    dialogLabel: 'Cookie settings / การตั้งค่าคุกกี้',
    weUseCookies: 'We use cookies',
    intro: 'Strictly necessary cookies make the site work and are always on. Analytics and marketing cookies are used only if you allow them.',
    privacyLink: 'Privacy policy',
    introAlt: 'คุกกี้ที่จำเป็นทำให้เว็บไซต์ทำงานได้ และเปิดใช้งานอยู่เสมอ ส่วนคุกกี้เพื่อการวิเคราะห์และการตลาดจะใช้ก็ต่อเมื่อคุณอนุญาตเท่านั้น',
    necessary: 'Essential · จำเป็น',
    necessaryDesc: 'Login, security and basic functionality — cannot be switched off',
    alwaysOn: 'Always on',
    analytics: 'Analytics · การวิเคราะห์',
    analyticsDesc: 'Helps us understand which pages people use (Google Analytics)',
    marketing: 'Marketing · การตลาด',
    marketingDesc: 'Measures advertising on Facebook and Instagram',
    save: 'Save · บันทึกการตั้งค่า',
    acceptAll: 'Accept all · ยอมรับทั้งหมด',
    rejectAll: 'Reject all · ปฏิเสธทั้งหมด',
    customise: 'Customise · ตั้งค่า',
    settingsLink: 'Cookie settings',
  },
} as const
