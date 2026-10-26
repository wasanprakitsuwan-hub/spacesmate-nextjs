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
import { PACKAGE_IMAGE_LIMITS, PACKAGE_ALLOWS_VIDEO, PACKAGE_PRICE_THB, pricePerMonth, savingsVsBasic } from '@/lib/packages'

/** Display price, derived from the one constant rather than written out again. */
const price = (id: string) => (PACKAGE_PRICE_THB[id] ?? 0).toLocaleString('en-US')

export type Locale = 'th' | 'en'

export const PRICING_T = {
  th: {
    metaTitle: 'ราคาและแพ็กเกจ',
    metaDesc: 'ลงประกาศเช่าอสังหาริมทรัพย์ เริ่มต้น ฿299/ประกาศ/เดือน — 1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ ยกเลิกการต่ออายุได้ทุกเมื่อ ไม่มีค่าคอมมิชชัน',
    ogTitle: 'ราคาลงประกาศ | SpacesMate — เริ่มต้น ฿299/เดือน',
    ogDesc: 'เลือก Basic, Standard หรือ Premium — 1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ เผยแพร่ทันที ไม่มีค่าคอมมิชชันซ่อน',

    heading: 'ราคาและแพ็กเกจ',
    subhead: '1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ · ผูกกับประกาศนั้นตลอดอายุ · ยกเลิกการต่ออายุได้ทุกเมื่อ',

    promoTitle: 'ลงประกาศฟรีเดือนแรก!',
    promoUseCode: 'ใช้โค้ด',
    promoDetail: 'ขั้นตอนสุดท้าย — ลด ฿299 สำหรับการซื้อครั้งแรก (แพ็กเกจ Basic แรกจึงฟรี)',

    includesTitle: 'ทุกแพ็กเกจได้',
    // What every package gets. Only what is true today (26 Oct 2026); the
    // cards above carry the differences: duration, price, photos, video.
    // The "swap listings" line went with the no-swap rule (Founder, 26 Oct
    // 2026). SubmitBody pairs an icon with each line by position.
    includes: [
      'ไม่จำกัดจำนวนผู้เข้าชม',
      'แสดงเบอร์โทรและ LINE ให้ผู้เช่าติดต่อคุณได้โดยตรง',
      'ดูสถิติผู้เข้าชมและการกดติดต่อในแดชบอร์ด',
      'แสดงสถานีรถไฟฟ้าและสถานที่สำคัญใกล้เคียงให้อัตโนมัติ',
      'มีหน้าประกาศภาษาอังกฤษสำหรับผู้เช่าชาวต่างชาติ',
      'ข้อมูลประกาศพร้อมให้ Google และ AI ค้นเจอ (SEO/AEO)',
      'Fair Rotation — ไม่มีการจ่ายเงินเพื่อขึ้นอันดับ',
      'ไม่มีค่าคอมมิชชัน',
    ],
    featNoVideo: 'ไม่รวมวิดีโอ (มีใน Premium)',

    avgPrefix: 'เฉลี่ย',
    avgSuffix: 'บาท/เดือน',
    savePrefix: 'ประหยัด',
    saveSuffix: 'เทียบกับ Basic',
    video: 'วิดีโอ',

    basicPeriod: '/ประกาศ/เดือน',
    basicDesc: 'สำหรับห้องที่ปล่อยเช่าง่าย หรือทดลองใช้งานก่อน',
    basicDuration: 'แสดงผล 1 เดือน',
    basicDurationSub: '30 วันนับจากวันที่เผยแพร่',

    standardPeriod: '/ประกาศ/3 เดือน',
    standardDesc: 'ระยะเวลาที่ห้องเช่าในกรุงเทพฯ ส่วนใหญ่หาผู้เช่าได้',
    standardDuration: 'แสดงผล 3 เดือน',
    standardDurationSub: '90 วันนับจากวันที่เผยแพร่',
    standardBadge: 'ยอดนิยม',

    premiumPeriod: '/ประกาศ/12 เดือน',
    premiumDesc: 'สำหรับเจ้าของที่ปล่อยเช่าต่อเนื่อง หรือห้องราคาสูง',
    premiumDuration: 'แสดงผล 12 เดือน',
    premiumDurationSub: '365 วันนับจากวันที่เผยแพร่',
    premiumBadge: 'คุ้มที่สุดต่อเดือน',

    featImages: (n: number) => `รูปภาพสูงสุด ${n} รูป`,
    featVideo: 'เพิ่มวิดีโอได้ — อัปโหลด หรือลิงก์ YouTube/TikTok',

    helpTitle: 'ไม่สะดวกกรอกเอง? ให้ทีมงานช่วยลงประกาศให้',
    helpBody: 'ส่งรายละเอียดห้องและรูปภาพมาที่หน้าติดต่อ ทีมงาน SpacesMate จะจัดทำประกาศให้เรียบร้อย พร้อมเผยแพร่',
    helpCta: 'ให้ทีมงานช่วยลงประกาศ →',

    faqHeading: 'คำถามที่พบบ่อย',
  },

  en: {
    metaTitle: 'Pricing and packages',
    metaDesc: 'List a rental property from ฿299 per listing per month — one package = one live listing. Cancel auto-renewal any time, no commission.',
    ogTitle: 'Listing prices | SpacesMate — from ฿299/month',
    ogDesc: 'Basic, Standard or Premium — one package = one live listing, published immediately, with no hidden commission.',

    heading: 'Pricing and packages',
    subhead: 'One package = one live listing · tied to that listing for its whole term · cancel auto-renewal whenever you like',

    promoTitle: 'First month free',
    promoUseCode: 'Use code',
    promoDetail: 'at checkout — ฿299 off your first purchase (which makes the first Basic package free)',

    includesTitle: 'Every package includes',
    includes: [
      'Unlimited views',
      'Your phone number and LINE shown, so renters contact you directly',
      'Views and contact clicks in your dashboard',
      'Nearby train stations and landmarks added automatically',
      'An English listing page for international renters',
      'Listing data ready for Google and AI search (SEO/AEO)',
      'Fair Rotation — no paying to rank higher',
      'No commission',
    ],
    featNoVideo: 'No video (Premium only)',

    avgPrefix: 'Averages',
    avgSuffix: 'baht/month',
    savePrefix: 'Saves',
    saveSuffix: 'vs Basic',
    video: 'Video',

    basicPeriod: '/listing/month',
    basicDesc: 'For rooms that let easily, or to try the platform first',
    basicDuration: 'Live for 1 month',
    basicDurationSub: '30 days from the day it is published',

    standardPeriod: '/listing/3 months',
    standardDesc: 'About how long most Bangkok rentals take to find a tenant',
    standardDuration: 'Live for 3 months',
    standardDurationSub: '90 days from the day it is published',
    standardBadge: 'Most popular',

    premiumPeriod: '/listing/12 months',
    premiumDesc: 'For owners letting continuously, or higher-value rooms',
    premiumDuration: 'Live for 12 months',
    premiumDurationSub: '365 days from the day it is published',
    premiumBadge: 'Best value per month',

    featImages: (n: number) => `Up to ${n} photos`,
    featVideo: 'Video — upload a file, or link YouTube/TikTok',

    helpTitle: 'Would rather not fill it in yourself? Our team can list it for you',
    helpBody: 'Send the room details and photos through the contact page and the SpacesMate team will prepare the listing, ready to publish.',
    helpCta: 'Ask the team to list it →',

    faqHeading: 'Frequently asked questions',
  },
} as const

/**
 * The eight pricing questions, per locale (round 6, Founder 26 Oct 2026: the
 * listing is chosen at purchase, one room per payment, no swapping, and
 * cancelling only stops auto-renewal).
 */
export const PRICING_FAQ_T: Record<Locale, { q: string; a: string }[]> = {
  th: [
    {
      q: 'สมัครใหม่ลงประกาศฟรีไหม?',
      a: 'สมัครบัญชีฟรี และช่วงที่มีโปรโมชัน ผู้ซื้อครั้งแรกใช้โค้ดส่วนลดที่แสดงในหน้าชำระเงินได้ เช่น ลงประกาศแรกฟรี 1 เดือน กรอกโค้ดในขั้น "ส่วนลด" แล้วยอดจะลดก่อนชำระ',
    },
    {
      q: 'แพ็กเกจคืออะไร? ต่างจากประกาศอย่างไร?',
      a: 'ประกาศคือข้อมูลห้องที่คุณกรอกไว้ เก็บอยู่ในบัญชีของคุณตลอด ไม่มีวันหาย ส่วนแพ็กเกจคือสิทธิ์ในการแสดงประกาศนั้นบนเว็บไซต์ตามระยะเวลาที่ซื้อ พูดง่ายๆ คือ 1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ และผูกกับประกาศนั้นตลอดอายุแพ็กเกจ',
    },
    {
      q: 'เลือกประกาศตอนไหน?',
      a: 'เลือกตอนซื้อแพ็กเกจ สร้างประกาศเก็บเป็นฉบับร่างไว้ก่อน แล้วกด "เผยแพร่" ที่ประกาศนั้นเพื่อเลือกแพ็กเกจและชำระเงิน แพ็กเกจจะผูกกับประกาศนั้นตลอดอายุแพ็กเกจ',
    },
    {
      q: 'มีหลายห้อง ซื้ออย่างไร?',
      a: 'ซื้อทีละห้อง 1 การชำระเงิน = 1 ประกาศ เช่น อพาร์ตเมนต์ 8 ห้อง ให้สร้าง 8 ประกาศ แล้วเลือกแพ็กเกจและชำระแยกทีละประกาศ จะเห็นชัดว่าแพ็กเกจไหนเป็นของห้องไหน และวันหมดอายุของแต่ละห้องในแดชบอร์ด',
    },
    {
      q: 'แพ็กเกจหมดอายุแล้วประกาศหายไหม?',
      a: 'ไม่หาย ประกาศยังอยู่ครบทุกรายละเอียด รูปภาพ และราคาในแดชบอร์ดของคุณ เพียงแต่ไม่แสดงบนเว็บไซต์ เมื่อซื้อแพ็กเกจใหม่ กดเผยแพร่ได้ทันที ไม่ต้องกรอกใหม่',
    },
    {
      q: 'ยกเลิกได้ไหม?',
      a: 'ยกเลิกการต่ออายุอัตโนมัติได้ทุกเมื่อจากแดชบอร์ด ไม่มีสัญญาผูกมัด การยกเลิกคือการหยุดต่ออายุรอบถัดไปเท่านั้น วันที่เหลือยังนับต่อ ประกาศยังแสดงตามปกติจนครบระยะเวลา แล้วจะปิดโดยอัตโนมัติ และไม่มีการเรียกเก็บเงินรอบถัดไป',
    },
    {
      q: 'ชำระเงินอย่างไร?',
      a: 'ชำระผ่าน Stripe เลือกได้ 2 แบบในหน้าชำระเงิน · จ่ายครั้งเดียว: พร้อมเพย์ (สแกน QR) หรือบัตรเครดิต/เดบิต ไม่ต่ออายุอัตโนมัติ เมื่อครบกำหนดประกาศจะหยุดแสดงจนกว่าจะต่ออายุ · ต่ออายุอัตโนมัติ: บัตรเครดิต/เดบิตเท่านั้น ตัดบัตรทุกรอบจนกว่าจะยกเลิก ประกาศไม่หลุดกลางคัน · แพ็กเกจเข้าบัญชีอัตโนมัติหลังชำระสำเร็จ กรณีพร้อมเพย์ระบบจะรอธนาคารยืนยันก่อน ปกติไม่กี่วินาที',
    },
    {
      q: 'SpacesMate ต่างจากเว็บประกาศอสังหาทั่วไปอย่างไร?',
      a: 'SpacesMate ใช้ระบบ Fair Rotation — ประกาศจะหมุนขึ้นหน้าแรกแบบสุ่มโดยอัตโนมัติ ไม่มีระบบจ่ายเงินเพื่อขึ้นอันดับ ทุกประกาศมีโอกาสเท่าเทียมกัน',
    },
  ],

  en: [
    {
      q: 'Is my first listing free?',
      a: 'The account is free, and while a promotion runs, first-time buyers can use the code shown on the checkout page, for example a free first month. Enter it in the "Discount" step and the total drops before you pay.',
    },
    {
      q: 'What is a package? How is it different from a listing?',
      a: 'A listing is the room details you fill in — it stays on your account permanently and is never lost. A package is the right to show that listing on the website for the period you bought. Put simply: one package = one live listing, tied to that listing for the whole term.',
    },
    {
      q: 'When do I choose the listing?',
      a: 'When you buy the package. Write the listing and keep it as a draft, then press "Publish" on it to choose a package and pay. The package stays tied to that listing for its whole term.',
    },
    {
      q: 'I have several rooms — how do I buy?',
      a: 'One room at a time: one payment = one listing. An 8-room apartment building, for example, creates 8 listings, then chooses a package and pays for each one separately. The dashboard then shows clearly which package belongs to which room, and when each one expires.',
    },
    {
      q: 'When the package expires, do I lose the listing?',
      a: 'No. The listing stays in your dashboard with every detail, photo and price — it simply stops showing on the website. Buy a new package and you can publish it again immediately, with nothing to re-enter.',
    },
    {
      q: 'Can I cancel?',
      a: 'You can cancel auto-renewal any time from the dashboard. There is no lock-in. Cancelling only stops the next renewal: the remaining days keep counting, the listing stays live until the end of the period, then closes automatically, and you are not charged again.',
    },
    {
      q: 'How do I pay?',
      a: 'Through Stripe, with two options at checkout. · One-time: PromptPay (scan the QR) or credit/debit card, with no auto-renewal; when the period ends the listing stops showing until you renew. · Auto-renew: credit/debit card only, charged each period until you cancel, so the listing never drops off mid-way. · Packages are added to your account automatically once payment succeeds. With PromptPay the system waits for the bank to confirm first, which is usually a few seconds.',
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
 * it. /list-your-property used to carry its own copy with savings: '22%' as a literal; it
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
      perMonth: pricePerMonth('basic'),
      maxImages: PACKAGE_IMAGE_LIMITS.basic,
      allowVideo: PACKAGE_ALLOWS_VIDEO.basic,
      features: [
        t.basicDuration,
        t.featImages(PACKAGE_IMAGE_LIMITS.basic),
        t.featNoVideo,
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
      perMonth: pricePerMonth('standard'),
      maxImages: PACKAGE_IMAGE_LIMITS.standard,
      allowVideo: PACKAGE_ALLOWS_VIDEO.standard,
      features: [
        t.standardDuration,
        t.featImages(PACKAGE_IMAGE_LIMITS.standard),
        t.featNoVideo,
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
      perMonth: pricePerMonth('premium'),
      maxImages: PACKAGE_IMAGE_LIMITS.premium,
      // Premium-only, and genuinely enforced — VideoUploadZone gates on
      // packageType === 'premium'. This flag read false until 3 Sep 2026, which
      // hid the only feature difference between Premium and the cheaper tiers.
      allowVideo: PACKAGE_ALLOWS_VIDEO.premium,
      features: [
        t.premiumDuration,
        t.featImages(PACKAGE_IMAGE_LIMITS.premium),
        t.featVideo,
      ],
    },
  ]
}


