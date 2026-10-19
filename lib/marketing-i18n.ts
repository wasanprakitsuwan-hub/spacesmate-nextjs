/**
 * About and Services page copy, per locale.
 *
 * Same shared-component + dictionary pattern as lib/site-i18n and
 * lib/property-i18n. Thai is the default, so the existing routes render
 * unchanged.
 *
 * Translation policy on these two pages: the English is a translation of the
 * Thai, not a rewrite. Where the Thai states a commercial term — the 10% and 15%
 * fees, ฿299/month, "equivalent to one month's commission" — the English says
 * the same thing and nothing more. Marketing copy is where it is tempting to
 * improve the offer in translation; anything that reads better in English but
 * promises more is a different product.
 */
export type Locale = 'th' | 'en'

export const ABOUT_T = {
  th: {
    metaTitle: 'เกี่ยวกับเรา',
    metaDesc: 'SpacesMate (Space Works Co., Ltd.) — แพลตฟอร์มบริหารจัดการอสังหาริมทรัพย์ Asset-Light ในกรุงเทพฯ ดูแลแบบ Performance-Based ยิ่งเจ้าของได้มาก SpacesMate ได้มากด้วย',
    ogTitle: 'เกี่ยวกับ SpacesMate',
    ogDesc: 'แพลตฟอร์มบริหารจัดการอสังหาริมทรัพย์ Asset-Light ในกรุงเทพฯ — Performance-Based, AI-Powered',

    eyebrow: 'เกี่ยวกับเรา',
    heroSub: 'SpacesMate คือแพลตฟอร์ม PropTech Asset-Light ที่ช่วยเจ้าของทรัพย์สินในกรุงเทพฯ ให้ได้ผลตอบแทนสูงขึ้น โดยไม่ต้องเหนื่อยบริหารเอง',
    ctaManage: 'ให้เราดูแลทรัพย์สินของคุณ',
    ctaSearch: 'ค้นหาที่พัก',

    missionEyebrow: 'พันธกิจของเรา',
    missionTitleA: 'ทำให้อสังหาฯ ที่ไม่ได้ใช้งาน',
    missionTitleB: 'กลายเป็นรายได้ที่แน่นอน',
    missionP1: 'ทรัพย์สินหลายแห่งในกรุงเทพฯ ถูกปล่อยทิ้งว่างหรือได้ผลตอบแทนต่ำกว่าที่ควรจะเป็น เพราะเจ้าของไม่มีเวลาหรือไม่รู้วิธีบริหาร SpacesMate เข้ามาเติมเต็มช่องว่างนี้',
    missionP2: 'เราใช้ระบบ SOP มาตรฐาน ติดตาม P&L รายอาคาร และ AI เพื่อให้การบริหารทรัพย์สินเป็นแบบ lean และ scalable — บริการที่ดีกว่า โดยไม่ซับซ้อน',

    companyHeading: 'บริษัทของเรา',
    companyNameThLabel: 'ชื่อบริษัท (ไทย)',
    companyNameEnLabel: 'ชื่อบริษัท (อังกฤษ)',
    regNoLabel: 'เลขทะเบียน',
    foundedLabel: 'ก่อตั้ง',
    officeLabel: 'ที่ตั้งสำนักงาน',
    foundedValue: '6 มกราคม 2569',
    officeValue: 'Summer Hill (unit 3026), สุขุมวิท คลองเตย กรุงเทพฯ',

    dnaEyebrow: 'DNA ของเรา',
    dnaHeading: 'ทำไมถึงเป็น SpacesMate',
    dna1Desc: 'เราไม่ได้เป็นเจ้าของทรัพย์สิน เราบริหารแทนเจ้าของและแบ่งรายได้ตามผลจริง',
    dna2Desc: 'ยิ่งเจ้าของทรัพย์ได้มาก SpacesMate ได้มากด้วย ทุกบาทที่เราได้มาจากผลงานจริง',
    dna3Desc: 'ใช้ AI ยกระดับทุกขั้นตอน ตั้งแต่การตลาด สัญญา ไปจนถึงรายงานการเงิน เพื่อให้บริการที่รวดเร็วและแม่นยำยิ่งขึ้น',
    dna4Desc: 'รู้จักตลาดกรุงเทพฯ ดี ทั้งโซน BTS/MRT และกลุ่มผู้เช่าทั้ง B2C และ B2B',

    stream1Title: 'Stream 1 — แพลตฟอร์มลงประกาศ',
    stream1Desc: 'เจ้าของทรัพย์สินลงประกาศเช่าบน spacesmate.com SpacesMate เก็บค่าสมัครสมาชิกรายเดือน เริ่มต้น ฿299/เดือน/ประกาศ',
    stream1Cta: 'ดูแพ็กเกจ →',
    stream2Title: 'Stream 2 — บริหารจัดการทรัพย์สิน',
    stream2Desc: 'SpacesMate บริหารทรัพย์สินที่มีศักยภาพสูงแทนเจ้าของ ตั้งแต่หาผู้เช่า เก็บค่าเช่า จนถึงออกรายงาน รูปแบบ Profit Sharing — SpacesMate ได้รับส่วนแบ่งจากรายได้จริงเท่านั้น',
    stream2Cta: 'ฝากบริหารทรัพย์สิน →',

    closingHeading: 'พร้อมเติบโตไปด้วยกัน?',
    closingSub: 'ไม่ว่าจะเป็นเจ้าของทรัพย์สินหรือผู้เช่า SpacesMate ดูแลคุณทุกขั้นตอน',
    closingCta1: 'ฝากบริหารทรัพย์สิน',
    closingCta2: 'ติดต่อเรา',
  },

  en: {
    metaTitle: 'About us',
    metaDesc: 'SpacesMate (Space Works Co., Ltd.) — an asset-light property management platform in Bangkok. Performance-based: the more the owner earns, the more SpacesMate earns.',
    ogTitle: 'About SpacesMate',
    ogDesc: 'An asset-light property management platform in Bangkok — performance-based, AI-powered.',

    eyebrow: 'About us',
    heroSub: 'SpacesMate is an asset-light PropTech platform that helps Bangkok property owners earn more from what they own, without having to manage it themselves.',
    ctaManage: 'Let us manage your property',
    ctaSearch: 'Search rentals',

    missionEyebrow: 'Our mission',
    missionTitleA: 'Turn underused property',
    missionTitleB: 'into dependable income',
    missionP1: 'A lot of Bangkok property sits empty, or earns less than it should, because the owner has neither the time nor a way to manage it. SpacesMate exists to close that gap.',
    missionP2: 'We use standardised SOPs, per-building P&L tracking and AI to keep property management lean and scalable — a better service, without the complication.',

    companyHeading: 'Our company',
    companyNameThLabel: 'Company name (Thai)',
    companyNameEnLabel: 'Company name (English)',
    regNoLabel: 'Registration no.',
    foundedLabel: 'Founded',
    officeLabel: 'Office',
    // Gregorian for an English reader. The Thai side keeps the Buddhist year.
    foundedValue: '6 January 2026',
    officeValue: 'Summer Hill (unit 3026), Sukhumvit, Khlong Toei, Bangkok',

    dnaEyebrow: 'Our DNA',
    dnaHeading: 'Why SpacesMate',
    dna1Desc: 'We do not own property. We manage it on the owner’s behalf and share in what it actually earns.',
    dna2Desc: 'The more the owner earns, the more SpacesMate earns. Every baht we make comes from results.',
    dna3Desc: 'AI across every step — marketing, contracts, financial reporting — so the service is faster and more accurate.',
    dna4Desc: 'We know the Bangkok market: the BTS and MRT corridors, and both B2C and B2B tenants.',

    stream1Title: 'Stream 1 — Listing platform',
    stream1Desc: 'Owners list their rentals on spacesmate.com. SpacesMate charges a monthly subscription from ฿299 per listing per month.',
    stream1Cta: 'See packages →',
    stream2Title: 'Stream 2 — Property management',
    stream2Desc: 'SpacesMate manages high-potential properties on the owner’s behalf — finding tenants, collecting rent, and reporting. Profit sharing: SpacesMate earns a share of actual income only.',
    stream2Cta: 'Hand us your property →',

    closingHeading: 'Ready to grow together?',
    closingSub: 'Owner or tenant, SpacesMate looks after you at every step.',
    closingCta1: 'Hand us your property',
    closingCta2: 'Contact us',
  },
} as const

export const SERVICES_T = {
  th: {
    metaTitle: 'บริการของเรา',
    metaDesc: 'บริการบริหารจัดการอสังหาริมทรัพย์ให้เช่าครบวงจร ทั้งอพาร์ทเม้นท์และคอนโด พร้อมแพลตฟอร์มลงประกาศเช่าออนไลน์ เริ่มต้น ฿299/เดือน',
    ogTitle: 'บริการ SpacesMate — บริหารอพาร์ทเม้นท์ คอนโด และลงประกาศเช่า',
    ogDesc: 'บริหารทรัพย์สินครบวงจรแบบ Performance-Based และแพลตฟอร์มลงประกาศเช่าเริ่มต้น ฿299/เดือน',

    heading: 'บริการของเรา',
    sub: 'SpacesMate ดูแลทรัพย์สินของคุณตั้งแต่ต้นจนจบ — Performance-aligned ทุกบาทที่คุณได้ เราได้ด้วย',
    enquire: 'สอบถามบริการนี้ →',

    aptTitle: 'บริหารจัดการอพาร์ทเม้นท์',
    aptFee: '10% ของค่าเช่าสุทธิ',
    aptDesc: 'ดูแลอพาร์ทเม้นท์ที่มีศักยภาพสูงของคุณครบวงจร ตั้งแต่หาผู้เช่า ทำสัญญา เก็บค่าเช่า จัดการซ่อมแซม และออกรายงานรายเดือนให้เจ้าของ SpacesMate ได้รับส่วนแบ่งจากรายได้จริงเท่านั้น',
    aptFeatures: ['หาผู้เช่าและคัดกรอง', 'จัดทำและบริหารสัญญา', 'เก็บค่าเช่ารายเดือน', 'จัดการซ่อมแซมฉุกเฉิน', 'รายงาน P&L รายเดือน', 'บริหารพนักงานประจำอาคาร'],

    condoTitle: 'บริหารจัดการคอนโด',
    condoFee: '15% ของค่าเช่าสุทธิ',
    condoDesc: 'บริหารจัดการคอนโดยูนิตที่มีศักยภาพด้านการลงทุนครบวงจร รวมการตลาดหาผู้เช่าและดูแลตลอดสัญญา SpacesMate อยู่กับคุณทุกขั้นตอน ต่างจากเอเจนต์ที่จบงานหลังหาผู้เช่าได้',
    condoFeatures: ['การตลาดเพื่อหาผู้เช่า (เทียบเท่า 1 เดือน commission)', 'บริหารสัญญาเช่า', 'เก็บค่าเช่าและค่าสาธารณูปโภค', 'ประสานงานซ่อมแซม', 'รายงานทางการเงินรายเดือน', 'ระบบ EasyRenz สำหรับความโปร่งใส'],

    listTitle: 'แพลตฟอร์มลงประกาศ',
    listFee: 'เริ่มต้น ฿299/เดือน',
    listDesc: 'ลงประกาศเช่าอสังหาริมทรัพย์บน SpacesMate ด้วยระบบ Fair Rotation ที่ทำให้ทุกประกาศมีโอกาสเท่าเทียมกันในการแสดงผล',
    listFeatures: ['เผยแพร่ทันทีหลังชำระ', 'รูปภาพและวิดีโอคุณภาพสูง', 'ระบบ Fair Rotation', 'แดชบอร์ดสถิติการเข้าชม', 'รองรับทุกประเภทอสังหา', 'ค้นหาได้ทั้งภาษาไทยและอังกฤษ'],

    assetLightBody: 'SpacesMate ไม่ได้เป็นเจ้าของทรัพย์สินใด ๆ เราบริหารแทนเจ้าของและได้รับค่าตอบแทนตามผลงานจริง — ยิ่งคุณได้มาก เราได้มากด้วย',
    assetLightCta: 'ฝากบริหารทรัพย์สิน →',
  },

  en: {
    metaTitle: 'Our services',
    metaDesc: 'End-to-end rental property management for apartments and condominiums, plus an online listing platform from ฿299/month.',
    ogTitle: 'SpacesMate services — apartment and condo management, and rental listings',
    ogDesc: 'Full-service, performance-based property management, and a rental listing platform from ฿299/month.',

    heading: 'Our services',
    sub: 'SpacesMate looks after your property end to end — performance-aligned, so every baht you earn, we earn with you.',
    enquire: 'Ask about this service →',

    aptTitle: 'Apartment management',
    aptFee: '10% of net rent',
    aptDesc: 'Full management of your high-potential apartment building — finding tenants, contracts, rent collection, repairs, and a monthly report to the owner. SpacesMate takes a share of actual income only.',
    aptFeatures: ['Tenant sourcing and screening', 'Contract drafting and administration', 'Monthly rent collection', 'Emergency repairs', 'Monthly P&L reporting', 'Building staff management'],

    condoTitle: 'Condominium management',
    condoFee: '15% of net rent',
    condoDesc: 'Full management of investment condo units, including tenant marketing and care through the whole tenancy. SpacesMate stays with you at every step — unlike an agent whose job ends once a tenant is found.',
    condoFeatures: ['Tenant marketing (equivalent to one month’s commission)', 'Tenancy contract administration', 'Rent and utility collection', 'Repair coordination', 'Monthly financial reporting', 'EasyRenz system for transparency'],

    listTitle: 'Listing platform',
    listFee: 'From ฿299/month',
    listDesc: 'List your rental property on SpacesMate, with Fair Rotation giving every listing an equal chance of being seen.',
    listFeatures: ['Live as soon as you pay', 'High-quality photos and video', 'Fair Rotation', 'Views dashboard', 'Every property type supported', 'Searchable in Thai and English'],

    assetLightBody: 'SpacesMate owns no property. We manage on the owner’s behalf and are paid on results — the more you earn, the more we earn.',
    assetLightCta: 'Hand us your property →',
  },
} as const
