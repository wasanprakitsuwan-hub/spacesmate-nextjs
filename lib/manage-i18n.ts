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
 *   The fee is described as a share of the building's net revenue (rent
 *   collected minus electricity and water), with no fixed monthly fee. No
 *   percentage is quoted deliberately (Founder, 25 Oct 2026): the rate is set
 *   after the building is assessed.
 */
export type Locale = 'th' | 'en'

/**
 * The option values submitted to the API. Thai in both locales, by design.
 * The first is the default, and the reset button depends on that.
 */
export const PROPERTY_TYPE_VALUES = ['อพาร์ทเม้นท์ / หอพัก', 'คอนโดทั้งตึก', 'อาคารพาณิชย์', 'ออฟฟิศ', 'บ้าน'] as const
export const CHANNEL_VALUES = ['โทร', 'LINE'] as const
export type PropertyTypeValue = (typeof PROPERTY_TYPE_VALUES)[number]
export type ChannelValue = (typeof CHANNEL_VALUES)[number]

/** Reader-facing label for a stored value. */
export function propertyTypeLabel(value: string, locale: Locale): string {
  if (locale === 'th') return value
  return ({
    'อพาร์ทเม้นท์ / หอพัก': 'Apartment / dormitory',
    'คอนโดทั้งตึก': 'Whole condominium building',
    'อาคารพาณิชย์': 'Shophouse / commercial building',
    'ออฟฟิศ': 'Office',
    'บ้าน': 'House',
  } as Record<string, string>)[value] ?? value
}

export function channelLabel(value: string, locale: Locale): string {
  if (locale === 'th') return value
  return ({ 'โทร': 'Phone', 'LINE': 'LINE' } as Record<string, string>)[value] ?? value
}

export const MANAGE_T = {
  th: {
    // ── Hero ──
    eyebrow: 'บริการรับบริหารอาคาร',
    heroTitle: 'เราดูแลอาคารของคุณ เหมือนเป็นอาคารของเราเอง',
    heroSub: 'ค่าบริการคิดตามรายได้จริงของอาคาร ไม่มีค่าบริหารตายตัว เมื่ออาคารของคุณได้มากขึ้น เราถึงได้มากขึ้น เป้าหมายของเราจึงเป็นเป้าหมายเดียวกับคุณ',
    heroCta: 'ให้ทีมงานประเมินอาคารฟรี ↓',
    heroLine: 'ทัก LINE @spacesmate',
    facts: [
      { title: 'ไม่มีค่าบริหารรายเดือนตายตัว', sub: 'คิดเป็น % ของรายได้สุทธิ' },
      { title: 'เป้าหมายเดียวกับเจ้าของ', sub: 'ห้องเต็มขึ้น เราได้มากขึ้น' },
      { title: 'รายงานทุกเดือน', sub: 'รายได้ ค่าใช้จ่าย อัตราเข้าพัก' },
    ],

    // ── Why ──
    whyTitle: 'ทำไมเจ้าของอาคารเลือก SpacesMate',
    why: [
      { title: 'เราดูแลอาคารเหมือนเป็นของเราเอง', desc: 'ค่าบริการคิดจากรายได้จริง ไม่มีค่าบริหารรายเดือนแบบตายตัว อาคารของคุณได้มากขึ้น เราจึงได้มากขึ้น' },
      { title: 'เพิ่มรายได้ด้วยมืออาชีพ', desc: 'ตั้งราคาจากข้อมูลตลาด ทำการตลาดทุกช่องทาง ลดห้องว่างและระยะเวลาว่างระหว่างผู้เช่า' },
      { title: 'ผู้เช่าคุณภาพ ความเสี่ยงต่ำ', desc: 'คัดกรองผู้เช่า ทำสัญญาที่รัดกุม เก็บค่าเช่าตรงเวลา' },
      { title: 'โปร่งใส ตรวจสอบได้', desc: 'รายงานรายได้ ค่าใช้จ่าย และอัตราการเข้าพักทุกเดือน' },
    ],

    // ── Fee ──
    feeTitle: 'ค่าบริการคิดอย่างไร',
    feeSub: 'คิดจากผลงานจริงเท่านั้น เดือนไหนรายได้น้อย ค่าบริการก็น้อยตาม',
    fee: [
      { title: 'รายได้ค่าเช่าที่เก็บได้', sub: 'ทุกห้องที่มีผู้เช่า' },
      { title: 'หักค่าไฟและค่าน้ำ', sub: 'ตามที่ใช้จริง' },
      { title: 'รายได้สุทธิ', sub: 'ฐานคิดค่าบริการ' },
      { title: 'ค่าบริการ SpacesMate', sub: '% ของรายได้สุทธิ ตามสัญญา' },
    ],
    feeNote: 'ค่าใช้จ่ายของอาคาร เช่น พนักงาน การตลาด ซ่อมบำรุง และอินเทอร์เน็ต หักก่อนตามจริง อัตราค่าบริการแจ้งหลังประเมินอาคาร',

    // ── Services ──
    servicesTitle: 'บริการของเราครอบคลุม',
    services: [
      { title: 'การตลาด & ลงประกาศ', desc: 'ถ่ายภาพ เขียนประกาศ โปรโมททุกช่องทาง' },
      { title: 'คัดกรองผู้เช่า',      desc: 'ตรวจสอบประวัติและความสามารถในการชำระ' },
      { title: 'จัดทำสัญญา',          desc: 'สัญญาเช่าที่รัดกุม ถูกต้องตามกฎหมาย' },
      { title: 'เก็บค่าเช่า',         desc: 'เรียกเก็บและโอนเข้าบัญชีคุณตรงเวลา' },
      { title: 'ซ่อมบำรุง',           desc: 'ประสานงานช่างตลอดสัญญา' },
      { title: 'ดูแลพนักงานอาคาร',    desc: 'วางระบบงานและดูแลทีมหน้างาน' },
    ],

    // ── Steps ──
    stepsTitle: 'ขั้นตอนเริ่มต้น',
    steps: [
      { n: '1', title: 'กรอกฟอร์ม',        desc: 'ไม่ถึง 2 นาที' },
      { n: '2', title: 'ทีมงานติดต่อกลับ', desc: 'ภายใน 24 ชม.' },
      { n: '3', title: 'ประเมินอาคาร',     desc: 'ดูอาคาร ตรวจเอกสาร ประเมินรายได้' },
      { n: '4', title: 'เซ็นสัญญาบริหาร',  desc: 'เงื่อนไขโปร่งใส' },
      { n: '5', title: 'รับรายได้',        desc: 'รายงานผลทุกเดือน' },
    ],

    // ── Form ──
    formTitle: 'ให้ทีมงานประเมินอาคารของคุณ',
    formSub: 'กรอกข้อมูลสั้นๆ ทีมงานจะโทรกลับภายใน 24 ชม. เพื่อนัดดูอาคาร และบอกว่าอาคารของคุณทำรายได้เพิ่มได้อีกแค่ไหน ยังไม่ต้องตัดสินใจอะไร',
    formPoints: ['ติดต่อกลับภายใน 24 ชม.', 'ข้อมูลของคุณเป็นความลับ', 'กรุงเทพฯ และปริมณฑล'],
    firstName: 'ชื่อ',
    firstNamePlaceholder: 'ชื่อจริง',
    lastName: 'นามสกุล',
    lastNamePlaceholder: 'นามสกุล',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    building: 'ชื่ออาคาร / โครงการ',
    buildingPlaceholder: 'เช่น บ้านสุขใจ อพาร์ทเม้นท์',
    propertyType: 'ประเภทอาคาร',
    location: 'ทำเล',
    locationPlaceholder: 'เช่น สุขุมวิท 101',
    rooms: 'จำนวนห้องโดยประมาณ',
    roomsPlaceholder: 'เช่น 40',
    channel: 'ช่องทางติดต่อที่สะดวก',
    submit: 'ส่งข้อมูล ให้ทีมงานติดต่อกลับ',
    submitting: 'กำลังส่ง...',

    // ── Validation ──
    needFirstName: 'กรุณากรอกชื่อ',
    needLastName: 'กรุณากรอกนามสกุล',
    needEmail: 'กรุณากรอกอีเมล',
    emailFormat: 'รูปแบบอีเมลไม่ถูกต้อง',
    needPhone: 'กรุณากรอกเบอร์โทรศัพท์',
    phoneLength: 'เบอร์โทรศัพท์ต้องมี 10 หลัก',
    phoneFormat: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)',
    genericError: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    sendFailed: 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือทักเราทาง LINE',

    // ── Thank you ──
    sentTitle: 'ได้รับข้อมูลแล้ว',
    sentBodyA: 'ทีมงาน SpacesMate จะโทรกลับ',
    sentBodyB: 'ภายใน 24 ชั่วโมง',
    sendAnother: 'ส่งข้อมูลอีกรายการ',
  },

  en: {
    eyebrow: 'Building management',
    heroTitle: 'We look after your building as if it were our own',
    heroSub: 'Our fee follows what your building actually earns, with no fixed management fee. When your building earns more, so do we, so your goal and ours are the same.',
    heroCta: 'Get a free building assessment ↓',
    heroLine: 'Message LINE @spacesmate',
    facts: [
      { title: 'No fixed monthly fee', sub: 'A share of net revenue' },
      { title: 'The same goal as you', sub: 'Fuller building, bigger fee' },
      { title: 'Monthly reports', sub: 'Income, costs, occupancy' },
    ],

    whyTitle: 'Why building owners choose SpacesMate',
    why: [
      { title: 'We run it like our own', desc: 'Our fee comes from real revenue, not a fixed monthly charge. Your building earns more, so we earn more.' },
      { title: 'More income, professionally', desc: 'Market-based pricing, marketing on every channel, fewer empty rooms and shorter gaps between tenants.' },
      { title: 'Good tenants, lower risk', desc: 'Tenant screening, watertight contracts, rent collected on time.' },
      { title: 'Transparent and checkable', desc: 'Income, costs and occupancy reported every month.' },
    ],

    feeTitle: 'How the fee works',
    feeSub: 'Based on results only. In a slower month, the fee is smaller too.',
    fee: [
      { title: 'Rent collected', sub: 'Every occupied room' },
      { title: 'Minus electricity and water', sub: 'As actually used' },
      { title: 'Net revenue', sub: 'What the fee is based on' },
      { title: 'SpacesMate fee', sub: '% of net revenue, per contract' },
    ],
    feeNote: 'Building costs such as staff, marketing, maintenance and internet are paid first at cost. The fee rate is quoted after we assess the building.',

    servicesTitle: 'What the service covers',
    services: [
      { title: 'Marketing & listings', desc: 'Photography, listing copy, promotion on every channel' },
      { title: 'Tenant screening',     desc: 'Background and ability-to-pay checks' },
      { title: 'Contracts',            desc: 'Watertight tenancy agreements under Thai law' },
      { title: 'Rent collection',      desc: 'Collected and paid into your account on time' },
      { title: 'Maintenance',          desc: 'Trades coordinated for the whole tenancy' },
      { title: 'Building staff',       desc: 'Working routines set up and the on-site team managed' },
    ],

    stepsTitle: 'Getting started',
    steps: [
      { n: '1', title: 'Fill in the form',   desc: 'Under 2 minutes' },
      { n: '2', title: 'We call you back',   desc: 'Within 24 hours' },
      { n: '3', title: 'Building assessment', desc: 'Visit, documents, income estimate' },
      { n: '4', title: 'Sign the agreement', desc: 'Transparent terms' },
      { n: '5', title: 'Collect your income', desc: 'Monthly reporting' },
    ],

    formTitle: 'Have our team assess your building',
    formSub: 'A few details and the team calls back within 24 hours to arrange a visit and tell you how much more your building could earn. Nothing to decide yet.',
    formPoints: ['Call back within 24 hours', 'Your details stay confidential', 'Bangkok and surrounding provinces'],
    firstName: 'First name',
    firstNamePlaceholder: 'First name',
    lastName: 'Last name',
    lastNamePlaceholder: 'Last name',
    email: 'Email',
    phone: 'Phone number',
    building: 'Building / project name',
    buildingPlaceholder: 'e.g. Baan Sukjai Apartment',
    propertyType: 'Type of building',
    location: 'Area',
    locationPlaceholder: 'e.g. Sukhumvit 101',
    rooms: 'Approximate number of rooms',
    roomsPlaceholder: 'e.g. 40',
    channel: 'How you prefer to be contacted',
    submit: 'Send, and have the team call me',
    submitting: 'Sending…',

    needFirstName: 'Please enter your first name',
    needLastName: 'Please enter your last name',
    needEmail: 'Please enter your email',
    emailFormat: 'That email address does not look right',
    needPhone: 'Please enter a phone number',
    /** A Thai mobile or landline number, which is 10 digits starting with 0. */
    phoneLength: 'A Thai phone number is 10 digits',
    phoneFormat: 'That number does not look right — a Thai number starts with 0',
    genericError: 'Something went wrong. Please try again.',
    sendFailed: 'We could not send your details. Please try again, or message us on LINE',

    sentTitle: 'Got it, thank you',
    sentBodyA: 'A member of the SpacesMate team will call you',
    sentBodyB: 'within 24 hours',
    sendAnother: 'Send another enquiry',
  },
} as const

export type ManageStrings = (typeof MANAGE_T)[Locale]
