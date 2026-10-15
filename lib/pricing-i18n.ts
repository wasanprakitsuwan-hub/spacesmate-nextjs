/**
 * Pricing page copy, per locale.
 *
 * This is the page that quotes money, so the English is a strict translation.
 * Where the Thai states a term — ฿299 per slot per month, the SM299 promo being
 * once per customer, PromptPay not auto-renewing — the English says the same and
 * no more. A sentence that reads better in English but promises more is a
 * different contract.
 *
 * Package names (Basic / Standard / Premium) and prices are not translated.
 * Neither is the promo code.
 */
import { PACKAGE_IMAGE_LIMITS, PACKAGE_ALLOWS_VIDEO, PACKAGE_PRICE_THB, savingsVsBasic } from '@/lib/packages'

/** Display price, derived from the one constant rather than written out again. */
const price = (id: string) => (PACKAGE_PRICE_THB[id] ?? 0).toLocaleString('en-US')

export type Locale = 'th' | 'en'

export const PRICING_T = {
  th: {
    metaTitle: 'ราคาและแพ็กเกจ | SpacesMate',
    metaDesc: 'ลงประกาศเช่าอสังหาริมทรัพย์ เริ่มต้น ฿299/สล็อต/เดือน — 1 สล็อต = ประกาศออนไลน์ 1 รายการ ซื้อหลายสล็อตพร้อมกันได้ ยกเลิกได้ทุกเมื่อ ไม่มีค่าคอมมิชชัน',
    ogTitle: 'ราคาลงประกาศ | SpacesMate — เริ่มต้น ฿299/เดือน',
    ogDesc: 'เลือก Basic, Standard หรือ Premium — 1 สล็อต = ประกาศออนไลน์ 1 รายการ เผยแพร่ทันที ไม่มีค่าคอมมิชชันซ่อน',

    heading: 'ราคาและแพ็กเกจ',
    subhead: '1 สล็อต = ประกาศออนไลน์ 1 รายการ · สลับประกาศได้ตลอดอายุ · ยกเลิกได้ทุกเมื่อ',

    promoTitle: 'ลงประกาศฟรีเดือนแรก!',
    promoUseCode: 'ใช้โค้ด',
    promoDetail: 'ขั้นตอนสุดท้าย — ลด ฿299 สำหรับการซื้อครั้งแรก (สล็อตแรกฟรีสำหรับ Basic)',

    includesTitle: 'ทุกแพ็กเกจได้ครบเท่ากัน — ไม่มีการกั๊กฟีเจอร์',
    inc1Title: 'แสดงช่องทางติดต่อครบทุกช่อง',
    inc1Body: 'เบอร์โทร LINE WhatsApp อีเมล — ไม่จำกัดจำนวน ผู้เช่าติดต่อคุณได้โดยตรง',
    inc2Title: 'ไม่จำกัดจำนวนผู้เข้าชม',
    inc2Body: 'ไม่มีเพดานรายเดือน ประกาศไม่ถูกปิดกลางคันเพราะมีคนสนใจมากเกินไป',
    inc3Title: 'Fair Rotation — ไม่มีการซื้อลำดับ',
    inc3Body: 'ทุกประกาศสุ่มขึ้นหน้าแรกเท่าเทียมกัน จ่ายเพิ่มก็ซื้อตำแหน่งไม่ได้',

    avgPrefix: 'เฉลี่ย',
    avgSuffix: 'บาท/เดือน',
    savePrefix: 'ประหยัด',
    saveSuffix: 'เทียบกับ Basic',
    video: 'วิดีโอ',

    basicPeriod: '/สล็อต/เดือน',
    basicDesc: 'สำหรับห้องที่ปล่อยเช่าง่าย หรือทดลองใช้งานก่อน',
    basicDuration: 'แสดงผล 1 เดือน',
    basicDurationSub: '30 วันนับจากวันที่เผยแพร่',

    standardPeriod: '/สล็อต/3 เดือน',
    standardDesc: 'ระยะเวลาที่ห้องเช่าในกรุงเทพฯ ส่วนใหญ่หาผู้เช่าได้',
    standardDuration: 'แสดงผล 3 เดือน',
    standardDurationSub: '90 วันนับจากวันที่เผยแพร่',
    standardBadge: 'ยอดนิยม',

    premiumPeriod: '/สล็อต/12 เดือน',
    premiumDesc: 'สำหรับเจ้าของที่ปล่อยเช่าต่อเนื่อง หรือห้องราคาสูง',
    premiumDuration: 'แสดงผล 12 เดือน',
    premiumDurationSub: '365 วันนับจากวันที่เผยแพร่',
    premiumBadge: 'คุ้มที่สุดต่อเดือน',

    featSlot: '1 สล็อต = ประกาศออนไลน์ 1 รายการ',
    featImages: (n: number) => `รูปภาพสูงสุด ${n} รูป`,
    featDays: (n: number) => `แสดงผล ${n} วัน`,
    featSwap: 'สลับประกาศในสล็อตได้ตลอดอายุ',
    featCancel: 'ยกเลิกได้ทุกเมื่อ — ใช้ได้จนครบรอบ',
    featVideo: 'เพิ่มวิดีโอได้ — อัปโหลด หรือลิงก์ YouTube/Vimeo',

    helpTitle: 'ไม่สะดวกกรอกเอง? ให้ทีมงานช่วยลงประกาศให้',
    helpBody: 'ส่งรายละเอียดห้องและรูปภาพมาที่หน้าติดต่อ ทีมงาน SpacesMate จะจัดทำประกาศให้เรียบร้อย พร้อมเผยแพร่',
    helpCta: 'ให้ทีมงานช่วยลงประกาศ →',

    faqHeading: 'คำถามที่พบบ่อย',
  },

  en: {
    metaTitle: 'Pricing and packages | SpacesMate',
    metaDesc: 'List a rental property from ฿299 per slot per month — one slot = one live listing. Buy several slots at once, cancel any time, no commission.',
    ogTitle: 'Listing prices | SpacesMate — from ฿299/month',
    ogDesc: 'Basic, Standard or Premium — one slot = one live listing, published immediately, with no hidden commission.',

    heading: 'Pricing and packages',
    subhead: 'One slot = one live listing · swap listings any time during the term · cancel whenever you like',

    promoTitle: 'First month free',
    promoUseCode: 'Use code',
    promoDetail: 'at checkout — ฿299 off your first purchase (which makes the first Basic slot free)',

    includesTitle: 'Every package includes the same things — nothing is held back for a higher tier',
    inc1Title: 'Every contact method shown',
    inc1Body: 'Phone, LINE, WhatsApp, email — no limit. Renters contact you directly.',
    inc2Title: 'Unlimited views',
    inc2Body: 'No monthly cap. Your listing is never cut off for being too popular.',
    inc3Title: 'Fair Rotation — position is not for sale',
    inc3Body: 'Every listing is shuffled onto the front page on equal terms. Paying more cannot buy you a place.',

    avgPrefix: 'Averages',
    avgSuffix: 'baht/month',
    savePrefix: 'Saves',
    saveSuffix: 'vs Basic',
    video: 'Video',

    basicPeriod: '/slot/month',
    basicDesc: 'For rooms that let easily, or to try the platform first',
    basicDuration: 'Live for 1 month',
    basicDurationSub: '30 days from the day it is published',

    standardPeriod: '/slot/3 months',
    standardDesc: 'About how long most Bangkok rentals take to find a tenant',
    standardDuration: 'Live for 3 months',
    standardDurationSub: '90 days from the day it is published',
    standardBadge: 'Most popular',

    premiumPeriod: '/slot/12 months',
    premiumDesc: 'For owners letting continuously, or higher-value rooms',
    premiumDuration: 'Live for 12 months',
    premiumDurationSub: '365 days from the day it is published',
    premiumBadge: 'Best value per month',

    featSlot: 'One slot = one live listing',
    featImages: (n: number) => `Up to ${n} photos`,
    featDays: (n: number) => `Live for ${n} days`,
    featSwap: 'Swap which listing occupies the slot, any time during its term',
    featCancel: 'Cancel any time — runs to the end of the period you paid for',
    featVideo: 'Video — upload a file, or link YouTube/Vimeo',

    helpTitle: 'Would rather not fill it in yourself? Our team can list it for you',
    helpBody: 'Send the room details and photos through the contact page and the SpacesMate team will prepare the listing, ready to publish.',
    helpCta: 'Ask the team to list it →',

    faqHeading: 'Frequently asked questions',
  },
} as const

/** The eight pricing questions, per locale. */
export const PRICING_FAQ_T: Record<Locale, { q: string; a: string }[]> = {
  th: [
    {
      q: 'สล็อตคืออะไร? ต่างจากประกาศอย่างไร?',
      a: 'ประกาศคือข้อมูลห้องที่คุณกรอกไว้ — เก็บอยู่ในบัญชีของคุณตลอด ไม่มีวันหาย ส่วนสล็อตคือสิทธิ์ในการนำประกาศขึ้นแสดงบนเว็บไซต์ 1 รายการ ตามระยะเวลาที่ซื้อ พูดง่าย ๆ คือ 1 สล็อต = ประกาศออนไลน์ 1 รายการ',
    },
    {
      q: 'ต้องเลือกประกาศตอนซื้อไหม?',
      a: 'ไม่ต้อง ซื้อสล็อตได้เลยโดยยังไม่ต้องมีประกาศ แล้วค่อยเลือกทีหลังในแดชบอร์ดว่าจะเผยแพร่ประกาศไหน หรือจะกรอกประกาศเก็บเป็นฉบับร่างไว้ก่อนแล้วค่อยซื้อสล็อตก็ได้เช่นกัน',
    },
    {
      q: 'มีหลายห้อง ต้องซื้อทีละครั้งไหม?',
      a: 'ไม่ต้อง เลือกจำนวนสล็อตที่ต้องการในหน้าชำระเงินได้เลย เช่น อพาร์ตเมนต์ 8 ห้อง ซื้อ 8 สล็อตในครั้งเดียว จ่ายรอบเดียว จัดการรวมกันในแดชบอร์ด',
    },
    {
      q: 'ห้องปล่อยเช่าได้แล้ว ทำอย่างไรกับสล็อต?',
      a: 'นำประกาศลงจากแดชบอร์ด สล็อตจะว่างทันทีพร้อมจำนวนวันที่เหลือ แล้วนำประกาศห้องอื่นขึ้นแทนได้เลย ไม่เสียวันที่ชำระไปแล้ว',
    },
    {
      q: 'สล็อตหมดอายุแล้วประกาศหายไหม?',
      a: 'ไม่หาย ประกาศยังอยู่ครบทุกรายละเอียด รูปภาพ และราคาในแดชบอร์ดของคุณ เพียงแต่ไม่แสดงบนเว็บไซต์ เมื่อซื้อสล็อตใหม่ กดเผยแพร่ได้ทันที ไม่ต้องกรอกใหม่',
    },
    {
      q: 'ยกเลิกได้ไหม?',
      a: 'ยกเลิกได้ทุกเมื่อจากแดชบอร์ด ไม่มีสัญญาผูกมัด เมื่อยกเลิกแล้วสล็อตยังใช้งานได้จนครบรอบที่ชำระเงินไว้ และจะไม่มีการเรียกเก็บเงินรอบถัดไป',
    },
    {
      q: 'ชำระเงินอย่างไร?',
      a: 'ชำระผ่าน Stripe ได้ 2 แบบ — บัตรเครดิต/เดบิตทุกธนาคาร หรือพร้อมเพย์ (สแกน QR) · บัตร: ต่ออายุอัตโนมัติทุกรอบจนกว่าจะยกเลิก ประกาศไม่หลุดกลางคัน · พร้อมเพย์: จ่ายครั้งเดียว ไม่ต่ออัตโนมัติ เมื่อครบกำหนดประกาศจะหยุดแสดงจนกว่าจะซื้อสล็อตใหม่ · สล็อตเข้าบัญชีอัตโนมัติหลังชำระสำเร็จ กรณีพร้อมเพย์ระบบจะรอธนาคารยืนยันก่อนจึงเพิ่มสล็อตให้ ปกติไม่กี่วินาที',
    },
    {
      q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
      a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศจะหมุนขึ้นหน้าแรกแบบสุ่มโดยอัตโนมัติ ไม่มีระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
    },
  ],

  en: [
    {
      q: 'What is a slot? How is it different from a listing?',
      a: 'A listing is the room details you fill in — it stays on your account permanently and is never lost. A slot is the right to show one listing on the website, for the period you bought. Put simply: one slot = one live listing.',
    },
    {
      q: 'Do I have to choose a listing when I buy?',
      a: 'No. You can buy a slot before you have a listing and choose later, from the dashboard, which listing to publish. Equally, you can write a listing as a draft first and buy the slot afterwards.',
    },
    {
      q: 'I have several rooms — do I have to buy one at a time?',
      a: 'No. Choose how many slots you want at checkout. An 8-room apartment building, for example, buys 8 slots in one go, pays once, and manages them together in the dashboard.',
    },
    {
      q: 'The room is let — what do I do with the slot?',
      a: 'Take the listing down from the dashboard. The slot frees up immediately with its remaining days intact, and you can put another room’s listing in it straight away. You do not lose the days you have paid for.',
    },
    {
      q: 'When the slot expires, do I lose the listing?',
      a: 'No. The listing stays in your dashboard with every detail, photo and price — it simply stops showing on the website. Buy a new slot and you can publish it again immediately, with nothing to re-enter.',
    },
    {
      q: 'Can I cancel?',
      a: 'Any time, from the dashboard. There is no lock-in. After you cancel, the slot keeps working until the end of the period you have already paid for, and you will not be charged for the next one.',
    },
    {
      q: 'How do I pay?',
      a: 'Through Stripe, two ways — credit or debit card from any bank, or PromptPay (scan the QR). · Card: renews automatically each period until you cancel, so the listing never drops off mid-way. · PromptPay: a single payment with no auto-renewal; when the period ends the listing stops showing until you buy a new slot. · Slots are added to your account automatically once payment succeeds. With PromptPay the system waits for the bank to confirm before adding them, which is usually a few seconds.',
    },
    {
      q: 'How is SpacesMate different from other property listing sites?',
      a: 'SpacesMate uses Fair Rotation — listings are shuffled onto the front page at random, automatically. There is no paying to rank higher, and every listing gets an equal chance.',
    },
  ],
}

/**
 * The three packages, with copy in the requested locale.
 *
 * Names, prices and image limits are not locale-dependent, so they stay here
 * rather than in the dictionary — a price that could differ per language is a
 * bug waiting to happen.
 *
 * The price and the saving are derived from PACKAGE_PRICE_THB rather than
 * written out, so changing a price in one place changes every page that shows
 * it. /submit used to carry its own copy with savings: '22%' as a literal; it
 * happened to be right, but only until the next price change.
 */
export function buildPlans(locale: Locale) {
  const t = PRICING_T[locale]
  return [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: price('basic'),
      period: t.basicPeriod,
      description: t.basicDesc,
      durationLabel: t.basicDuration,
      durationSub: t.basicDurationSub,
      highlight: false,
      badge: null as string | null,
      savingsPct: savingsVsBasic('basic'),
      maxImages: PACKAGE_IMAGE_LIMITS.basic,
      allowVideo: PACKAGE_ALLOWS_VIDEO.basic,
      features: [
        t.featSlot,
        t.featImages(PACKAGE_IMAGE_LIMITS.basic),
        t.featDays(30),
        t.featSwap,
        t.featCancel,
      ],
    },
    {
      id: 'standard' as const,
      name: 'Standard',
      price: price('standard'),
      period: t.standardPeriod,
      description: t.standardDesc,
      durationLabel: t.standardDuration,
      durationSub: t.standardDurationSub,
      highlight: false,
      badge: t.standardBadge as string | null,
      savingsPct: savingsVsBasic('standard'),
      maxImages: PACKAGE_IMAGE_LIMITS.standard,
      allowVideo: PACKAGE_ALLOWS_VIDEO.standard,
      features: [
        t.featSlot,
        t.featImages(PACKAGE_IMAGE_LIMITS.standard),
        t.featDays(90),
        t.featSwap,
        t.featCancel,
      ],
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: price('premium'),
      period: t.premiumPeriod,
      description: t.premiumDesc,
      durationLabel: t.premiumDuration,
      durationSub: t.premiumDurationSub,
      highlight: true,
      badge: t.premiumBadge as string | null,
      savingsPct: savingsVsBasic('premium'),
      maxImages: PACKAGE_IMAGE_LIMITS.premium,
      // Premium-only, and genuinely enforced — VideoUploadZone gates on
      // packageType === 'premium'. This flag read false until 3 Sep 2026, which
      // hid the only feature difference between Premium and the cheaper tiers.
      allowVideo: PACKAGE_ALLOWS_VIDEO.premium,
      features: [
        t.featSlot,
        t.featImages(PACKAGE_IMAGE_LIMITS.premium),
        t.featVideo,
        t.featDays(365),
        t.featSwap,
        t.featCancel,
      ],
    },
  ]
}
