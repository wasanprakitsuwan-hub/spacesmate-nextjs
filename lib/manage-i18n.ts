/**
 * /manage — the Stream 2 pitch: SpacesMate manages the owner's building.
 *
 * WHAT IS NEVER TRANSLATED
 *   The lead form writes `type` and `channel` straight into a Google Sheet and
 *   the founder's notification email (see app/api/manage-lead/route.ts). So the
 *   stored values stay Thai in both locales — 'คอนโด', 'โทร' — and only the
 *   labels follow the reader. Translating them would put 'คอนโด' and 'Condo'
 *   in the same column of the lead sheet, and nobody could filter it again.
 *
 *   This is the same rule as the listing wizard, for the same reason, and it is
 *   the fourth place in this codebase where a display string was doubling as a
 *   stored value. See PROPERTY_TYPE_VALUES and CHANNEL_VALUES below.
 *
 * WHAT THE ENGLISH PROMISES
 *   "Within 24 hours" is a commitment the team has to keep, and it appears
 *   three times — in the steps, the form subtitle and the thank-you. All three
 *   move together or none do.
 *
 *   The fee is described as performance-based with nothing upfront, which is
 *   true: SpacesMate charges a share of rent collected, so an empty building
 *   earns no fee. No percentage is quoted here deliberately — the apartment and
 *   condominium rates differ, and /pricing is where numbers belong.
 */
export type Locale = 'th' | 'en'

/**
 * The option values submitted to the API. Thai in both locales, by design.
 * The first is the default, and the reset button depends on that.
 */
export const PROPERTY_TYPE_VALUES = ['คอนโด', 'อพาร์ทเม้นท์', 'บ้าน', 'ออฟฟิศ'] as const
export const CHANNEL_VALUES = ['โทร', 'LINE'] as const
export type PropertyTypeValue = (typeof PROPERTY_TYPE_VALUES)[number]
export type ChannelValue = (typeof CHANNEL_VALUES)[number]

/** Reader-facing label for a stored value. */
export function propertyTypeLabel(value: string, locale: Locale): string {
  if (locale === 'th') return value
  return ({
    'คอนโด': 'Condominium',
    'อพาร์ทเม้นท์': 'Apartment building',
    'บ้าน': 'House',
    'ออฟฟิศ': 'Office',
  } as Record<string, string>)[value] ?? value
}

export function channelLabel(value: string, locale: Locale): string {
  if (locale === 'th') return value
  return ({ 'โทร': 'Phone', 'LINE': 'LINE' } as Record<string, string>)[value] ?? value
}

export const MANAGE_T = {
  th: {
    // ── Hero ──
    eyebrow: 'บริการรับฝากบริหาร',
    heroLine1: 'ให้ SpacesMate ดูแล',
    heroLine2: 'ทรัพย์สินของคุณแบบครบวงจร',
    heroSub: 'หาผู้เช่า · คัดกรอง · ทำสัญญา · เก็บค่าเช่า · ดูแลซ่อมบำรุง — ทั้งเรื่องยุ่งยากไว้กับเรา',

    // ── Why ──
    whyTitle: 'ทำไมต้องใช้บริการรับฝากบริหาร',
    whySub: 'ปล่อยให้มืออาชีพดูแล คุณแค่รอรับรายได้',
    why: [
      { icon: 'schedule',      title: 'ประหยัดเวลา',    desc: 'ไม่ต้องรับสายผู้เช่า นัดห้อง หรือตามเก็บค่าเช่าเอง' },
      { icon: 'verified_user', title: 'ผู้เช่าคุณภาพ',  desc: 'เราคัดกรองและตรวจสอบประวัติผู้เช่าก่อนทุกครั้ง' },
      { icon: 'savings',       title: 'รายได้สม่ำเสมอ', desc: 'โอนค่าเช่าตรงเวลา พร้อมรายงานผลทุกเดือน' },
      { icon: 'handyman',      title: 'ดูแลครบวงจร',    desc: 'ประสานงานซ่อมบำรุงและดูแลทรัพย์สินตลอดสัญญา' },
    ],

    // ── Services ──
    servicesTitle: 'บริการของเราครอบคลุม',
    servicesSub: 'ตั้งแต่หาผู้เช่าจนถึงดูแลตลอดสัญญา — เราจัดการให้ครบ',
    services: [
      { icon: 'campaign',     title: 'การตลาด & ลงประกาศ', desc: 'ถ่ายภาพ เขียนประกาศ และโปรโมทบนทุกช่องทาง' },
      { icon: 'fact_check',   title: 'คัดกรองผู้เช่า',      desc: 'ตรวจสอบประวัติและความสามารถในการชำระ' },
      { icon: 'description',  title: 'จัดทำสัญญา',          desc: 'ทำสัญญาเช่าที่รัดกุมและถูกต้องตามกฎหมาย' },
      { icon: 'payments',     title: 'เก็บค่าเช่า',         desc: 'เรียกเก็บและโอนเข้าบัญชีคุณตรงเวลาทุกเดือน' },
      { icon: 'construction', title: 'ซ่อมบำรุง',           desc: 'ประสานงานช่างและดูแลทรัพย์สินตลอดสัญญา' },
      { icon: 'bar_chart',    title: 'รายงานผล',            desc: 'สรุปรายได้และสถานะทรัพย์สินให้ทุกเดือน' },
    ],

    // ── Steps ──
    stepsTitle: 'ขั้นตอนง่ายๆ',
    steps: [
      { n: '1', title: 'กรอกฟอร์ม',               desc: 'บอกประเภทและรายละเอียดทรัพย์สินของคุณ ใช้เวลาไม่ถึง 2 นาที' },
      { n: '2', title: 'ทีมงานติดต่อกลับ',        desc: 'เจ้าหน้าที่โทรกลับภายใน 24 ชม. เพื่อสอบถามรายละเอียด' },
      { n: '3', title: 'ตรวจสอบ & ประเมินทรัพย์', desc: 'เราเข้าดูทรัพย์สิน ตรวจสอบเอกสาร และประเมินค่าเช่าที่เหมาะสม' },
      { n: '4', title: 'เซ็นสัญญาบริหาร',         desc: 'ตกลงเงื่อนไขที่โปร่งใส แล้วเราเริ่มหาผู้เช่าและคัดกรองให้' },
      { n: '5', title: 'รับรายได้สบายใจ',         desc: 'เราดูแลเก็บค่าเช่า ซ่อมบำรุง และรายงานผลให้คุณทุกเดือน' },
    ],
    socialNote: 'สนใจจากเพจหรือโซเชียลของเรา? กรอกฟอร์มนี้ได้เลย — ทีมงานจะโทรกลับเพื่อสอบถามรายละเอียดเพิ่มเติม',

    // ── Form ──
    formTitle: 'ให้เราติดต่อกลับ',
    formSub: 'กรอกข้อมูลสั้นๆ ทีมงานติดต่อกลับภายใน 24 ชม.',
    name: 'ชื่อ-นามสกุล',
    namePlaceholder: 'ชื่อของคุณ',
    phone: 'เบอร์โทรศัพท์',
    propertyType: 'ประเภททรัพย์สิน',
    location: 'ทำเล',
    locationPlaceholder: 'เช่น สุขุมวิท',
    channel: 'ช่องทางติดต่อที่สะดวก',
    submit: 'ส่งข้อมูล — ให้เราติดต่อกลับ',
    submitting: 'กำลังส่ง...',
    confidential: 'ข้อมูลของคุณจะถูกเก็บเป็นความลับ',

    // ── Validation ──
    needName: 'กรุณากรอกชื่อ-นามสกุล',
    needPhone: 'กรุณากรอกเบอร์โทรศัพท์',
    phoneLength: 'เบอร์โทรศัพท์ต้องมี 10 หลัก',
    phoneFormat: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)',
    genericError: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    sendFailed: 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือทักเราทาง LINE',

    // ── Thank you ──
    sentTitle: 'ได้รับข้อมูลแล้ว!',
    sentBodyA: 'ทีมงาน SpacesMate จะโทรกลับ',
    sentBodyB: 'ภายใน 24 ชั่วโมง',
    sendAnother: 'ส่งข้อมูลอีกรายการ',
  },

  en: {
    eyebrow: 'Full property management',
    heroLine1: 'Let SpacesMate run',
    heroLine2: 'your property end to end',
    heroSub: 'Finding tenants · screening · contracts · rent collection · maintenance — we take the whole job off your hands',

    whyTitle: 'Why hand your property to a manager',
    whySub: 'Leave it to professionals and simply collect the income',
    why: [
      { icon: 'schedule',      title: 'Your time back',     desc: 'No tenant calls, no viewings to run, no chasing rent yourself' },
      { icon: 'verified_user', title: 'Tenants we vet',     desc: 'We screen and background-check every tenant before they sign' },
      { icon: 'savings',       title: 'Income you can plan on', desc: 'Rent transferred on time, with a report every month' },
      { icon: 'handyman',      title: 'Looked after throughout', desc: 'We coordinate repairs and care for the property for the whole tenancy' },
    ],

    servicesTitle: 'What the service covers',
    servicesSub: 'From finding a tenant to the end of the contract — all of it handled',
    services: [
      { icon: 'campaign',     title: 'Marketing & listings', desc: 'Photography, listing copy, and promotion across every channel' },
      { icon: 'fact_check',   title: 'Tenant screening',     desc: 'Background checks and a real look at ability to pay' },
      { icon: 'description',  title: 'Contracts',            desc: 'Tenancy agreements that are watertight and compliant with Thai law' },
      { icon: 'payments',     title: 'Rent collection',      desc: 'Collected and transferred to your account on time, every month' },
      { icon: 'construction', title: 'Maintenance',          desc: 'We coordinate the trades and look after the property throughout' },
      { icon: 'bar_chart',    title: 'Monthly reporting',    desc: 'Income and the state of your property, summarised every month' },
    ],

    stepsTitle: 'How it works',
    steps: [
      { n: '1', title: 'Fill in the form',        desc: 'Tell us the type of property and a few details — under two minutes' },
      { n: '2', title: 'We call you back',        desc: 'Someone from the team calls within 24 hours to go through it' },
      { n: '3', title: 'Inspection & valuation',  desc: 'We visit the property, check the documents, and work out a realistic rent' },
      { n: '4', title: 'Sign the agreement',      desc: 'Transparent terms agreed, then we start marketing and screening tenants' },
      { n: '5', title: 'Collect your income',     desc: 'We handle rent, maintenance and reporting, and you hear from us monthly' },
    ],
    socialNote: 'Found us on Facebook or Instagram? Fill in this form — the team will call to go through the details with you.',

    formTitle: 'Ask us to call you',
    formSub: 'A few details, and the team calls back within 24 hours.',
    name: 'Full name',
    namePlaceholder: 'Your name',
    phone: 'Phone number',
    propertyType: 'Type of property',
    location: 'Area',
    locationPlaceholder: 'e.g. Sukhumvit',
    channel: 'How you prefer to be contacted',
    submit: 'Send — ask us to call back',
    submitting: 'Sending…',
    confidential: 'Your details are kept confidential.',

    needName: 'Please enter your full name',
    needPhone: 'Please enter a phone number',
    /** A Thai mobile or landline number, which is 10 digits starting with 0. */
    phoneLength: 'A Thai phone number is 10 digits',
    phoneFormat: 'That number does not look right — a Thai number starts with 0',
    genericError: 'Something went wrong. Please try again.',
    sendFailed: 'We could not send your details. Please try again, or message us on LINE',

    sentTitle: 'Got it — thank you',
    sentBodyA: 'A member of the SpacesMate team will call you',
    sentBodyB: 'within 24 hours',
    sendAnother: 'Send another enquiry',
  },
} as const

export type ManageStrings = (typeof MANAGE_T)[Locale]
