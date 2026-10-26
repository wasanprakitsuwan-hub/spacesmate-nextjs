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
    metaDesc: 'SpacesMate (บริษัท เสปซเวิร์คส จำกัด) แพลตฟอร์มลงประกาศเช่าและบริการบริหารอาคารในกรุงเทพฯ บริหารแทนเจ้าของ ค่าบริการคิดตามรายได้จริง',
    ogTitle: 'เกี่ยวกับ SpacesMate',
    ogDesc: 'แพลตฟอร์มลงประกาศเช่าและบริการบริหารอาคารในกรุงเทพฯ',

    eyebrow: 'เกี่ยวกับเรา',
    // Round 6 (Founder, 26 Oct 2026): the story leads with income, then the
    // two owner situations the Founder named. "Why SpacesMate" was removed.
    heroTitle: 'เพิ่มรายได้อสังหาฯ ให้ได้สูงที่สุดเท่าที่จะทำได้',
    heroSub: 'อาคารหลายแห่งในกรุงเทพฯ ทำรายได้ต่ำกว่าที่ควร ไม่ใช่เพราะทำเลไม่ดี แต่เพราะไม่มีใครดูแลเต็มเวลา SpacesMate เข้ามาบริหารแทนเจ้าของ เพื่อให้ทุกห้องสร้างรายได้เต็มศักยภาพ',
    situations: [
      { title: 'อยากส่งต่อให้ลูกหลาน แต่ลูกหลานไม่อยากทำเอง', desc: 'เราดูแลให้ทั้งหมด ครอบครัวรับรายได้และรายงานทุกเดือน' },
      { title: 'มีอาคาร แต่ไม่สะดวกทำ เลยปล่อยทิ้งไว้', desc: 'เราเปลี่ยนอาคารที่ว่างอยู่ให้กลับมาสร้างรายได้' },
    ],
    ctaManage: 'ให้เราดูแลทรัพย์สินของคุณ',
    ctaSearch: 'ค้นหาที่พัก',
    photoAlts: ['อาคารที่พักในกรุงเทพฯ', 'ห้องนอนในอาคารให้เช่า', 'ครัวในห้องพัก'],

    whatHeading: 'สิ่งที่เราทำ',
    stream1Title: 'แพลตฟอร์มลงประกาศ',
    stream1Desc: 'ช่วยให้ห้องว่างของคุณถูกค้นเจอ ทั้งบน Google และผู้เช่าที่ค้นตามสถานีรถไฟฟ้า รับทุกประเภทตั้งแต่คอนโดถึงออฟฟิศ ผู้เช่าติดต่อเจ้าของได้โดยตรง',
    stream1Cta: 'ดูแพ็กเกจ',
    stream1Search: 'ห้องเช่าใกล้ BTS อ่อนนุช',
    stream1Rows: [
      { name: 'อพาร์ทเม้นท์ใกล้ BTS', station: 'BTS 450 ม.' },
      { name: 'ห้องสตูดิโอพร้อมเฟอร์ฯ', station: 'BTS 700 ม.' },
    ],
    samplePrice: '฿[ราคา]',
    perMonth: '/เดือน',
    stream2Title: 'บริการบริหารอาคาร',
    stream2Desc: 'ทีมงานดูแลอาคารแทนเจ้าของ ตั้งแต่หาผู้เช่า ทำสัญญา เก็บค่าเช่า ซ่อมบำรุง จนถึงรายงานผลทุกเดือน',
    stream2Cta: 'ลงทะเบียนให้ทีมงานติดต่อกลับ',
    stream2Overlay: 'ทีมงานดูแลให้',
    stream2Items: ['หาผู้เช่า + ทำสัญญา', 'เก็บค่าเช่า', 'ซ่อมบำรุง', 'รายงานทุกเดือน'],

    companyHeading: 'บริษัทของเรา',
    operatedByLabel: 'ดำเนินงานโดย',
    operatedBy: 'บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.)',
    officeLabel: 'สำนักงาน',
    officeValue: 'ซัมเมอร์ ฮิลล์ ห้อง 3026, 1106 ถนนสุขุมวิท คลองเตย กรุงเทพฯ',
    contactLabel: 'ติดต่อ',
    contactValue: 'LINE @spacesmate · support@spacesmate.com',

    closingHeading: 'พร้อมเติบโตไปด้วยกัน?',
    closingSub: 'ไม่ว่าจะเป็นเจ้าของทรัพย์สินหรือผู้เช่า SpacesMate ดูแลคุณทุกขั้นตอน',
    closingCta1: 'ฝากบริหารทรัพย์สิน',
    closingCta2: 'ติดต่อเรา',
  },

  en: {
    metaTitle: 'About us',
    metaDesc: 'SpacesMate (Space Works Co., Ltd.) runs a rental listing platform and a building management service in Bangkok. We manage on the owner’s behalf and our fee follows real revenue.',
    ogTitle: 'About SpacesMate',
    ogDesc: 'A rental listing platform and building management service in Bangkok.',

    eyebrow: 'About us',
    heroTitle: 'Getting the most income your property can earn',
    heroSub: 'Many Bangkok buildings earn less than they should. Not because the location is wrong, but because nobody runs them full time. SpacesMate manages on the owner’s behalf so every room earns what it can.',
    situations: [
      { title: 'You want to pass it on, but the next generation would rather not run it', desc: 'We handle all of it. The family receives the income and a report every month.' },
      { title: 'You own a building, but running it is not practical, so it sits idle', desc: 'We turn an idle building back into income.' },
    ],
    ctaManage: 'Let us manage your property',
    ctaSearch: 'Search rentals',
    photoAlts: ['A residential building in Bangkok', 'Bedroom in a rental building', 'Kitchen in a rental room'],

    whatHeading: 'What we do',
    stream1Title: 'Listing platform',
    stream1Desc: 'Gets your empty rooms found, on Google and by renters searching by train station. Every type from condos to offices, and renters contact you directly.',
    stream1Cta: 'See packages',
    stream1Search: 'Rentals near BTS On Nut',
    stream1Rows: [
      { name: 'Apartment near BTS', station: 'BTS 450 m' },
      { name: 'Furnished studio', station: 'BTS 700 m' },
    ],
    samplePrice: '฿[price]',
    perMonth: '/month',
    stream2Title: 'Building management',
    stream2Desc: 'Our team runs the building for you: finding tenants, contracts, rent collection, maintenance and a report every month.',
    stream2Cta: 'Ask our team to call you',
    stream2Overlay: 'Our team handles',
    stream2Items: ['Tenants + contracts', 'Rent collection', 'Maintenance', 'Monthly reports'],

    companyHeading: 'Our company',
    operatedByLabel: 'Operated by',
    operatedBy: 'Space Works Co., Ltd. (บริษัท เสปซเวิร์คส จำกัด)',
    officeLabel: 'Office',
    officeValue: 'Summer Hill, unit 3026, 1106 Sukhumvit Road, Khlong Toei, Bangkok',
    contactLabel: 'Contact',
    contactValue: 'LINE @spacesmate · support@spacesmate.com',

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
