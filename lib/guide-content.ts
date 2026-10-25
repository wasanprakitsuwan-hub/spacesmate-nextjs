import { unstable_cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase'

/**
 * /guide — the step-by-step listing guide (คู่มือการลงประกาศ).
 *
 * The text and screenshots are editable from the dashboard and stored in
 * site_settings under 'listing_guide' as { th: Guide, en: Guide }. What is in
 * code here is the default, used until the dashboard saves a version and as the
 * fallback if the table cannot be read.
 *
 * Every line is a statement about how the product works today. Before changing
 * the form, checkout or dashboard, check the step that describes it.
 */
export type GuideItem = { text: string; note?: string }
export type GuideStep = { title: string; items: GuideItem[]; image?: string }
export type GuideFaq = { q: string; a: string }
export type Guide = { title: string; intro: string; steps: GuideStep[]; faq: GuideFaq[] }
export type GuideLocale = 'th' | 'en'

export const LISTING_GUIDE_KEY = 'listing_guide'
export const GUIDE_TAG = 'listing-guide'

export const DEFAULT_GUIDE: Record<GuideLocale, Guide> = {
  th: {
    title: 'คู่มือการลงประกาศ ทีละขั้นตอน',
    intro: 'ตั้งแต่สมัครบัญชีจนประกาศขึ้นเว็บ 7 ขั้นตอน ใช้เวลาประมาณ 10–15 นาที',
    steps: [
      { title: 'สมัครบัญชีเจ้าของ', items: [
        { text: 'กด "ลงประกาศ" มุมขวาบนของทุกหน้า', note: 'ปุ่มสีเขียวบนแถบเมนู' },
        { text: 'สมัครด้วยอีเมล หรือเข้าสู่ระบบด้วย Google', note: 'ถ้าใช้อีเมล ระบบจะส่งลิงก์ยืนยันไปที่อีเมลของคุณ' },
        { text: 'ยืนยันอีเมล แล้วระบบจะพากลับมาที่หน้าลงประกาศ' },
      ] },
      { title: 'กรอกข้อมูลทรัพย์', items: [
        { text: 'เลือกประเภท: คอนโด อพาร์ทเม้นท์ บ้าน ออฟฟิศ หรือโคเวิร์กกิ้ง' },
        { text: 'ตั้งชื่อประกาศภาษาไทย และภาษาอังกฤษ (ถ้ามี)', note: 'สูตรชื่อที่ดี: ชื่อโครงการ + จุดเด่น + สถานีใกล้' },
        { text: 'กรอกขนาด ห้องนอน ห้องน้ำ และค่าเช่า สำหรับอาคารที่มีหลายแบบห้อง เพิ่มแบบห้องได้หลายแบบ', note: 'หลายแบบห้อง ระบบแสดงเป็นช่วงราคาให้' },
        { text: 'ระบุระยะสัญญาขั้นต่ำ เงินประกัน และค่าเช่าล่วงหน้า' },
      ] },
      { title: 'ปักหมุดที่ตั้ง', items: [
        { text: 'วางลิงก์ Google Maps ของอาคาร หรือค้นหาชื่อสถานที่บนแผนที่' },
        { text: 'คลิกหรือลากหมุดให้ตรงตัวอาคาร', note: 'หมุดที่ตรง ทำให้ระบบหาสถานีรถไฟฟ้าใกล้เคียงได้ถูกต้อง' },
        { text: 'ตรวจที่อยู่ เขต แขวง และรหัสไปรษณีย์' },
      ] },
      { title: 'ใส่รูปและวิดีโอ', items: [
        { text: 'อัปโหลดรูปได้ถึง 35 รูป เว็บแสดงตามแพ็กเกจ (Basic 20 · Standard 30 · Premium 35 รูป)', note: 'ถ่ายแนวนอน กลางวัน เปิดไฟทุกดวง' },
        { text: 'รูปแรกคือรูปปก กดที่รูปเพื่อตั้งเป็นรูปปกได้', note: 'รูปปกคือรูปแรกที่ผู้เช่าเห็นในผลค้นหา' },
        { text: 'วางลิงก์วิดีโอ YouTube หรือ TikTok', note: 'วิดีโอแสดงบนเว็บสำหรับแพ็กเกจ Premium' },
      ] },
      { title: 'คำอธิบาย สิ่งอำนวยความสะดวก และข้อมูลติดต่อ', items: [
        { text: 'เลือกสิ่งอำนวยความสะดวกที่มีจริง', note: 'ผู้เช่าใช้ตัวกรองนี้ค้นหา' },
        { text: 'เขียนคำอธิบายภาษาไทย และภาษาอังกฤษ', note: 'หน้าประกาศภาษาอังกฤษจะใช้ข้อความภาษาอังกฤษ ถ้าเว้นว่างจะแสดงภาษาไทย' },
        { text: 'กรอกชื่อผู้ติดต่อ เบอร์โทร และ LINE ID' },
        { text: 'กด "บันทึกและไปชำระเงิน" หรือ "บันทึกเป็นฉบับร่าง" ไว้ก่อน', note: 'ฉบับร่างไม่มีวันหมดอายุ กลับมาแก้ไขจากแดชบอร์ดได้' },
      ] },
      { title: 'เลือกแพ็กเกจและชำระเงิน', items: [
        { text: 'เลือกแพ็กเกจ Basic, Standard หรือ Premium', note: '1 การชำระ = 1 ประกาศ' },
        { text: 'ถ้ามีโค้ดส่วนลด กรอกในช่องส่วนลดแล้วกด "ใช้โค้ด"' },
        { text: 'ชำระด้วยพร้อมเพย์ หรือบัตร', note: 'ประกาศขึ้นเว็บทันทีที่ชำระสำเร็จ' },
      ] },
      { title: 'จัดการประกาศหลังเผยแพร่', items: [
        { text: 'ดูผู้เข้าชมและการกดติดต่อในแดชบอร์ด' },
        { text: 'ต่ออายุก่อนหมด ถ้าไม่ต่อ ประกาศจะปิดอัตโนมัติเมื่อครบอายุแพ็กเกจ', note: 'ระบบแจ้งเตือนทางอีเมลก่อนหมดอายุ' },
        { text: 'ปล่อยเช่าได้แล้ว กดนำลง แล้วใช้แพ็กเกจที่เหลือกับห้องอื่นได้' },
      ] },
    ],
    faq: [
      { q: 'ลงประกาศใช้เวลานานแค่ไหน?', a: 'ประมาณ 10–15 นาที ถ้าเตรียมรูปและข้อมูลห้องไว้แล้ว และบันทึกเป็นฉบับร่างไว้ก่อนได้' },
      { q: 'ประกาศขึ้นเว็บเมื่อไร?', a: 'ทันทีที่ชำระเงินสำเร็จ ไม่ต้องรออนุมัติ' },
      { q: 'ประกาศอยู่ได้นานเท่าไร?', a: 'ตามแพ็กเกจที่ซื้อ Basic 30 วัน Standard 90 วัน Premium 365 วัน ถ้าไม่ต่ออายุ ประกาศจะปิดอัตโนมัติ' },
      { q: 'ไม่สะดวกกรอกเอง ทำอย่างไร?', a: 'ส่งรายละเอียดและรูปมาทาง LINE @spacesmate ทีมงานช่วยลงประกาศให้' },
    ],
  },
  en: {
    title: 'How to list your property, step by step',
    intro: 'From creating an account to a live listing in 7 steps, about 10–15 minutes',
    steps: [
      { title: 'Create an owner account', items: [
        { text: 'Press "List property" at the top right of any page', note: 'The green button in the menu bar' },
        { text: 'Sign up with email, or sign in with Google', note: 'With email, we send a confirmation link to your inbox' },
        { text: 'Confirm your email and you are brought back to the listing form' },
      ] },
      { title: 'Enter the property details', items: [
        { text: 'Choose the type: condo, apartment, house, office or co-working' },
        { text: 'Write a title in Thai, and in English if you can', note: 'A good title: project name + best feature + nearest station' },
        { text: 'Enter size, bedrooms, bathrooms and rent. Buildings with several room types can add each one', note: 'Several room types show as a price range' },
        { text: 'Set the minimum contract, deposit and advance rent' },
      ] },
      { title: 'Pin the location', items: [
        { text: 'Paste the building\'s Google Maps link, or search for the place on the map' },
        { text: 'Click or drag the pin onto the building', note: 'An accurate pin lets us find the right nearby stations' },
        { text: 'Check the address, district, sub-district and postcode' },
      ] },
      { title: 'Add photos and video', items: [
        { text: 'Upload up to 35 photos; the website shows them by package (Basic 20 · Standard 30 · Premium 35)', note: 'Shoot landscape, in daylight, with every light on' },
        { text: 'The first photo is the cover; click any photo to make it the cover', note: 'The cover is the first thing renters see in search' },
        { text: 'Paste a YouTube or TikTok video link', note: 'Video shows on the website with the Premium package' },
      ] },
      { title: 'Description, amenities and contact', items: [
        { text: 'Tick only the amenities you really have', note: 'Renters filter by them' },
        { text: 'Write the description in Thai and English', note: 'The English listing page uses the English text, or the Thai if left empty' },
        { text: 'Enter the contact name, phone number and LINE ID' },
        { text: 'Press "Save and continue to payment", or "Save as draft" for later', note: 'Drafts never expire; edit them from your dashboard' },
      ] },
      { title: 'Choose a package and pay', items: [
        { text: 'Choose Basic, Standard or Premium', note: '1 payment = 1 listing' },
        { text: 'Have a promo code? Enter it in the discount box and press "Apply"' },
        { text: 'Pay by PromptPay or card', note: 'Your listing goes live as soon as payment succeeds' },
      ] },
      { title: 'Manage your listing', items: [
        { text: 'See views and contact clicks in your dashboard' },
        { text: 'Renew before it ends; otherwise the listing turns off when the package period is over', note: 'We email you before it expires' },
        { text: 'Rented out? Take it down and use the remaining package for another room' },
      ] },
    ],
    faq: [
      { q: 'How long does listing take?', a: 'About 10–15 minutes if your photos and room details are ready, and you can save a draft and finish later' },
      { q: 'When does my listing go live?', a: 'As soon as payment succeeds. There is no approval wait' },
      { q: 'How long does a listing stay up?', a: 'For the package you bought: Basic 30 days, Standard 90 days, Premium 365 days. It turns off automatically unless renewed' },
      { q: 'Can someone list it for me?', a: 'Send the details and photos to LINE @spacesmate and the team will help you list it' },
    ],
  },
}

/** Keep only well-formed parts of a stored guide; anything missing falls back to the default. */
export function normaliseGuide(raw: unknown, locale: GuideLocale): Guide {
  const d = DEFAULT_GUIDE[locale]
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Guide>
  const str = (v: unknown, f: string) => (typeof v === 'string' && v.trim() ? v : f)
  const steps = Array.isArray(r.steps) && r.steps.length
    ? r.steps.filter(s => s && typeof s.title === 'string').map(s => ({
        title: s.title,
        image: typeof s.image === 'string' && s.image ? s.image : undefined,
        items: Array.isArray(s.items) ? s.items.filter(i => i && typeof i.text === 'string').map(i => ({ text: i.text, note: typeof i.note === 'string' && i.note ? i.note : undefined })) : [],
      }))
    : d.steps
  const faq = Array.isArray(r.faq) ? r.faq.filter(f => f && typeof f.q === 'string' && typeof f.a === 'string') : d.faq
  return { title: str(r.title, d.title), intro: str(r.intro, d.intro), steps, faq }
}

const loadStored = unstable_cache(
  async (): Promise<unknown> => {
    const { data, error } = await createServerClient()
      .from('site_settings').select('value').eq('key', LISTING_GUIDE_KEY).maybeSingle()
    if (error) throw error
    return data?.value ?? null
  },
  ['listing-guide'],
  { revalidate: 300, tags: [GUIDE_TAG] },
)

/** The guide for a locale: the dashboard's saved version, or the default. Server only. */
export async function loadGuide(locale: GuideLocale): Promise<Guide> {
  try {
    const stored = (await loadStored()) as Record<string, unknown> | null
    return stored?.[locale] ? normaliseGuide(stored[locale], locale) : DEFAULT_GUIDE[locale]
  } catch (err) {
    console.error('[guide]', err instanceof Error ? err.message : String(err))
    return DEFAULT_GUIDE[locale]
  }
}

/** The page around the guide text: fixed strings, not edited from the dashboard. */
export const GUIDE_UI = {
  th: {
    metaTitle: 'คู่มือการลงประกาศ',
    metaDesc: 'วิธีลงประกาศให้เช่ากับ SpacesMate ทีละขั้นตอน ตั้งแต่สมัครบัญชี กรอกข้อมูล ปักหมุด ใส่รูป จนชำระเงินและจัดการประกาศ',
    home: 'หน้าแรก',
    crumb: 'คู่มือการลงประกาศ',
    toc: 'ในคู่มือนี้',
    step: (n: number) => `ขั้นที่ ${n}`,
    faqTitle: 'คำถามเกี่ยวกับการลงประกาศ',
    faqLink: 'คำถามที่พบบ่อย',
    allFaq: 'ดูคำถามทั้งหมด →',
    ctaTitle: 'พร้อมลงประกาศแล้ว?',
    ctaBody: 'แพ็กเกจเริ่มต้น ฿299 ต่อ 30 วัน ประกาศขึ้นทันทีที่ชำระเงิน',
    cta: 'เริ่มลงประกาศ',
  },
  en: {
    metaTitle: 'Listing guide',
    metaDesc: 'How to list a rental on SpacesMate step by step: account, details, map pin, photos, payment and managing your listing.',
    home: 'Home',
    crumb: 'Listing guide',
    toc: 'In this guide',
    step: (n: number) => `Step ${n}`,
    faqTitle: 'Questions about listing',
    faqLink: 'FAQ',
    allFaq: 'See all questions →',
    ctaTitle: 'Ready to list?',
    ctaBody: 'Packages start at ฿299 for 30 days, and your listing goes live as soon as you pay',
    cta: 'Start listing',
  },
} as const
