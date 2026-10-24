/**
 * FAQ content and its types, in a module with no 'use client' directive.
 *
 * Both locales live here side by side so a change to one is visible against
 * the other.
 *
 * This data is read from two places: the accordion, which is a client
 * component, and app/faq/page.tsx, which is a server component and renders the
 * FAQPage JSON-LD from it.
 *
 * It lived in FAQAccordion.tsx until the server import of it broke the build —
 * "Export encountered errors on following paths: /faq". A 'use client' module's
 * exports reach a server component as client references, not as the values
 * themselves, so FaqLd threw trying to map over what it was handed. tsc cannot
 * see that: the types are identical either way. Keeping shared data in a plain
 * module is what makes it safe for both sides to import.
 */
import { PACKAGE_IMAGE_LIMITS } from '@/lib/packages'
import type { Locale } from '@/lib/faq-i18n'

// ─── AEO data ────────────────────────────────────────────────────────────────
// Questions are written so AI answer engines (ChatGPT, Perplexity, Gemini, etc.)
// can surface them verbatim as direct answers. Keep answers factual, concise,
// and keyword-dense. Every answer is emitted as FAQPage JSON-LD by
// app/faq/page.tsx — server-side, so it is in the HTML those engines fetch.

export interface FAQ { q: string; a: string }
export interface Category {
  id: string
  icon: string
  title: string
  subtitle: string
  faqs: FAQ[]
}

const TH: Category[] = [
  {
    id: 'about',
    icon: 'apartment',
    title: 'เกี่ยวกับ SpacesMate',
    subtitle: 'SpacesMate คืออะไร ทำงานอย่างไร',
    faqs: [
      {
        q: 'SpacesMate คืออะไร?',
        a: 'SpacesMate (บริษัท เสปซเวิร์คส จำกัด) คือแพลตฟอร์มอสังหาริมทรัพย์ Asset-Light ในประเทศไทย ให้บริการ 2 รูปแบบ — (1) แพลตฟอร์มลงประกาศเช่าสำหรับเจ้าของทรัพย์ เริ่มต้น ฿299/เดือน และ (2) บริการบริหารจัดการทรัพย์สินแบบครบวงจร (Full Property Management) สำหรับเจ้าของอพาร์ทเม้นท์และคอนโดที่ต้องการมืออาชีพดูแลแทน',
      },
      {
        q: 'SpacesMate ต่างจากเว็บประกาศอสังหาริมทรัพย์ทั่วไปอย่างไร?',
        a: 'SpacesMate ใช้ระบบ Fair Rotation — ทุกประกาศที่เจ้าของยืนยันข้อมูล (อย่างน้อยทุก 6 เดือน) จะถูกสุ่มขึ้นตำแหน่ง Featured ใหม่ทุกครั้งที่โหลดหน้า ไม่มีการซื้อลำดับ ทุกประกาศมีโอกาสเท่าเทียมกัน นอกจากนี้ SpacesMate ยังรับลงประกาศอสังหาฯ ครบทุกประเภท รวมถึงออฟฟิศและโคเวิร์กกิ้งสเปซ ซึ่งหลายแพลตฟอร์มไม่รับ และยังมีบริการ Full Property Management ที่เว็บประกาศทั่วไปไม่มี',
      },
      {
        q: 'SpacesMate ให้บริการในพื้นที่ใดบ้าง?',
        a: 'SpacesMate ให้บริการทั่วประเทศไทย ไม่จำกัดเฉพาะกรุงเทพฯ เจ้าของทรัพย์สินในทุกจังหวัดสามารถลงประกาศได้ทันที สำหรับบริการ Full Property Management ขณะนี้เปิดรับในพื้นที่กรุงเทพมหานครและปริมณฑลก่อน และจะขยายไปทั่วประเทศในลำดับถัดไป',
      },
      {
        q: 'SpacesMate รองรับอสังหาริมทรัพย์ประเภทใดบ้าง?',
        a: 'SpacesMate รองรับ 5 ประเภท ได้แก่ คอนโดมิเนียม อพาร์ทเม้นท์ บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศให้เช่า ซึ่งต่างจากเว็บประกาศทั่วไปที่มักรับเฉพาะที่พักอาศัย SpacesMate รองรับทั้งสัญญารายวัน รายเดือน และรายปี',
      },
    ],
  },
  {
    id: 'tenants',
    icon: 'search',
    title: 'สำหรับผู้เช่า',
    subtitle: 'ค้นหาที่พักและติดต่อเจ้าของ',
    faqs: [
      {
        q: 'ผู้เช่าต้องเสียค่าใช้จ่ายในการใช้ SpacesMate หรือไม่?',
        a: 'ไม่มีค่าใช้จ่ายสำหรับผู้เช่า การค้นหา ดูรายละเอียด และติดต่อเจ้าของผ่าน SpacesMate ฟรีทั้งหมด ค่าบริการแพลตฟอร์มเป็นของฝั่งเจ้าของทรัพย์เท่านั้น',
      },
      {
        q: 'ประกาศบน SpacesMate น่าเชื่อถือหรือไม่?',
        a: 'ประกาศบน SpacesMate ต้องผ่านการตรวจสอบเบื้องต้น และระบบ Fair Rotation จะกรองเฉพาะประกาศที่เจ้าของยืนยันข้อมูลล่าสุดภายใน 6 เดือนออกมาแสดง ประกาศที่ไม่ได้รับการอัปเดตจะถูกซ่อนอัตโนมัติ ทำให้ผู้เช่าเห็นเฉพาะทรัพย์ที่พร้อมให้เช่าจริง',
      },
      {
        q: 'วิธีค้นหาที่พักบน SpacesMate?',
        a: 'ไปที่หน้าค้นหาที่พัก (/search) แล้วพิมพ์ชื่ออาคาร ชื่อโครงการ หรือชื่อสถานที่ เช่น "สุขุมวิท" หรือ "BTS อโศก" ในช่องค้นหา นอกจากนี้ยังสามารถใช้ฟีเจอร์แผนที่ "ใกล้ฉัน" เพื่อค้นหาทรัพย์สินตามตำแหน่งที่ตั้งปัจจุบันได้ทันที และยังกรองตามประเภท (คอนโด/อพาร์ทเม้นท์/บ้าน/ออฟฟิศ/โคเวิร์กกิ้ง) ได้อีกด้วย',
      },
    ],
  },
  {
    id: 'owners',
    icon: 'real_estate_agent',
    title: 'สำหรับเจ้าของ',
    subtitle: 'ลงประกาศ แพ็กเกจ และบริการบริหารทรัพย์',
    faqs: [
      {
        q: 'วิธีเริ่มต้นลงประกาศทรัพย์สินบน SpacesMate?',
        a: 'กดปุ่ม "ลงประกาศ" แล้วสมัครบัญชีฟรี (ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว) → กรอกรายละเอียดและอัปโหลดรูปภาพ → บันทึก บัญชีใหม่ได้แพ็กเกจ Basic ฟรี 1 แพ็กเกจ ประกาศแรกจึงเผยแพร่ทันที 30 วัน ส่วนประกาศถัดไปหรือเมื่อครบกำหนด เลือกแพ็กเกจและชำระเงินในหน้าชำระเงิน (พร้อมเพย์หรือบัตร) ประกาศเผยแพร่ทันทีหลังชำระสำเร็จ ไม่ต้องรออนุมัติ',
      },
      {
        q: 'ค่าบริการลงประกาศบน SpacesMate เป็นเท่าไร?',
        a: 'มี 3 แพ็กเกจ: Basic ฿299/เดือน (อายุ 30 วัน), Standard ฿699/3 เดือน (อายุ 90 วัน, ยอดนิยม) และ Premium ฿2,499/ปี (อายุ 365 วัน พร้อมอัปโหลดวิดีโอ) ไม่มีค่าคอมมิชชันและไม่มีค่าธรรมเนียมซ่อน',
      },
      {
        q: 'มีกฎหรือเงื่อนไขพิเศษสำหรับการลงประกาศหรือไม่?',
        a: 'มีเงื่อนไขสำคัญ 1 ข้อ — เจ้าของต้องยืนยันความถูกต้องของข้อมูลประกาศอย่างน้อยทุก 6 เดือน เพื่อให้ผู้เช่าได้รับข้อมูลที่แม่นยำและเป็นปัจจุบัน ประกาศที่ไม่ได้รับการยืนยันในเวลาที่กำหนดจะถูกซ่อนจากการแสดงผลโดยอัตโนมัติจนกว่าจะได้รับการยืนยันใหม่',
      },
      {
        q: 'นายหน้าหรือเอเจนซี่อสังหาริมทรัพย์ลงประกาศได้หรือไม่?',
        a: 'ได้ นายหน้าและเอเจนซี่อสังหาริมทรัพย์สามารถลงประกาศในนามของตนเองหรือในนามเจ้าของทรัพย์ที่ได้รับมอบหมายได้ ไม่มีข้อจำกัดประเภทผู้ลงประกาศ',
      },
      {
        q: 'มีแพ็กเกจกี่ประเภท และแตกต่างกันอย่างไร?',
        a: `มี 3 แพ็กเกจ — ต่างกันที่ระยะเวลาแสดงผลและจำนวนรูป:\n• Basic ฿299/เดือน — ลงประกาศ 30 วัน อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.basic} ภาพ\n• Standard ฿699/3 เดือน — ลงประกาศ 90 วัน อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.standard} ภาพ ประหยัดกว่า Basic 22%\n• Premium ฿2,499/ปี — ลงประกาศ 365 วัน อัปโหลดรูปสูงสุด ${PACKAGE_IMAGE_LIMITS.premium} ภาพ พร้อมเพิ่มวิดีโอได้ ประหยัดกว่ารายเดือน 30%\n\nทุกแพ็กเกจแสดงช่องทางติดต่อครบทุกช่อง ไม่จำกัดจำนวนผู้เข้าชม และใช้ระบบ Fair Rotation เหมือนกัน`,
      },
      {
        q: 'มีทรัพย์สินหลายชิ้น มีแพ็กเกจพิเศษหรือไม่?',
        a: 'มี เจ้าของหรือเอเจนซี่ที่มีทรัพย์สินหลายรายการสามารถติดต่อทีมงาน SpacesMate โดยตรงที่ support@spacesmate.com หรือผ่านหน้าติดต่อเรา เพื่อรับข้อเสนอแพ็กเกจพิเศษ ทีมงานจะติดต่อกลับโดยเร็วที่สุด',
      },
      {
        q: 'ถ้าต้องการลงประกาศหลายรายการต้องซื้อแพ็กเกจแยกสำหรับแต่ละประกาศหรือไม่?',
        a: 'ใช่ แต่ละประกาศที่แสดงอยู่บนเว็บไซต์ต้องมีแพ็กเกจของตัวเอง — 1 แพ็กเกจ = ประกาศออนไลน์ 1 รายการ ตัวอย่างเช่น ถ้าคุณมีคอนโด 3 ห้องที่ต้องการลงประกาศพร้อมกัน ก็ต้องซื้อ 3 แพ็กเกจ แต่แพ็กเกจไม่ได้ผูกกับประกาศใดประกาศหนึ่งถาวร — ถ้าห้องหนึ่งปล่อยเช่าได้แล้ว คุณสลับประกาศอื่นเข้ามาในแพ็กเกจเดิมได้ตลอดอายุแพ็กเกจ เจ้าของจัดการประกาศและแพ็กเกจทั้งหมดได้ในหน้า Owner Dashboard เดียว ซึ่งจะแสดงทุก subscription พร้อมสถานะและวันหมดอายุแยกตามแต่ละรายการ',
      },
      {
        q: 'สามารถอัปเกรดแพ็กเกจได้หรือไม่ และจะถูกเรียกเก็บเงินอย่างไร?',
        a: 'อัปเกรดได้ทันทีจาก Owner Dashboard — คลิกปุ่ม "อัปเกรด" ที่ subscription ที่ต้องการ แล้วเลือกแพ็กเกจใหม่ที่สูงขึ้น ระบบจะคิดค่าใช้จ่ายเฉพาะส่วนต่างของวันที่เหลืออยู่ในรอบปัจจุบัน (Proration) ทันทีผ่าน Stripe ไม่ต้องยกเลิกและสมัครใหม่ ประกาศไม่มีช่วงหยุดให้บริการ และสิทธิ์ใหม่ (รูปเพิ่ม, วิดีโอ) จะพร้อมใช้งานทันทีหลังอัปเกรดสำเร็จ',
      },
      {
        q: 'ถ้ายกเลิกการต่ออายุอัตโนมัติ ประกาศจะถูกลบทันทีหรือไม่?',
        a: 'ไม่ การยกเลิกผ่าน Owner Dashboard หมายความว่าระบบจะ "ไม่ต่ออายุอัตโนมัติ" เท่านั้น ประกาศของคุณจะยังเผยแพร่และมองเห็นได้ตามปกติจนกว่าจะถึงวันหมดอายุที่ชำระเงินไว้แล้ว ตัวอย่างเช่น ถ้าแพ็กเกจหมดวันที่ 31 กรกฎาคม และคุณยกเลิกวันที่ 15 กรกฎาคม ประกาศจะยังใช้งานได้จนถึงวันที่ 31 กรกฎาคม คุณไม่เสียวันที่ชำระเงินไปแล้ว',
      },
      {
        q: 'ค่าบริการ Full Property Management คิดอย่างไร?',
        a: 'SpacesMate ใช้รูปแบบ Profit Sharing — เราได้รับส่วนแบ่งจากค่าเช่าที่เก็บได้จริงเท่านั้น ยิ่งทรัพย์สินมีรายได้สูง SpacesMate ได้มากด้วย อัตราส่วนแบ่งจะถูกกำหนดหลังจาก SpacesMate ตรวจสอบและประเมินทรัพย์สินของคุณแล้ว เพื่อให้มั่นใจว่าทรัพย์สินมีศักยภาพที่เหมาะสม สนใจกรอกข้อมูลที่หน้าฝากบริหารทรัพย์สิน ทีมงานจะติดต่อกลับโดยเร็วที่สุด',
      },
      {
        q: 'หลังจากกรอกฟอร์มฝากบริหารทรัพย์ SpacesMate จะติดต่อกลับเมื่อไร?',
        a: 'ทีมงาน SpacesMate จะติดต่อกลับโดยเร็วที่สุดหลังได้รับข้อมูล เพื่อนัดหมายประเมินทรัพย์สินและหารือเงื่อนไขการบริหาร',
      },
      {
        q: 'SpacesMate ถือเงินประกันแทนเจ้าของหรือไม่?',
        a: 'ไม่ SpacesMate ไม่ถือเงินประกัน (Security Deposit) เงินประกันเป็นของเจ้าของโดยตรง เจ้าของเป็นผู้รับและคืนเงินประกันให้ผู้เช่าภายใน 14 วันหลัง Check-out SpacesMate เป็นผู้ประสานงานเท่านั้น',
      },
    ],
  },
]

const EN: Category[] = [
  {
    id: 'about',
    icon: 'apartment',
    title: 'About SpacesMate',
    subtitle: 'What SpacesMate is, and how it works',
    faqs: [
      {
        q: 'What is SpacesMate?',
        a: 'SpacesMate (Space Works Co., Ltd.) is an asset-light property platform in Thailand offering two services — (1) a rental listing platform for property owners, from ฿299/month, and (2) full property management for apartment and condominium owners who want professionals to run it for them.',
      },
      {
        q: 'How is SpacesMate different from other property listing sites?',
        a: 'SpacesMate uses Fair Rotation — every listing whose owner has confirmed its details (at least every 6 months) is shuffled into a featured position at random on each page load. Position is not for sale, and every listing gets an equal chance. SpacesMate also accepts every property type, including offices and co-working space, which many platforms do not, and offers full property management, which ordinary listing sites do not.',
      },
      {
        q: 'Where does SpacesMate operate?',
        a: 'SpacesMate covers all of Thailand, not only Bangkok — an owner in any province can list immediately. Full property management currently takes on properties in Bangkok and the surrounding provinces first, and will expand nationwide after that.',
      },
      {
        q: 'What property types does SpacesMate support?',
        a: 'Five types: condominiums, apartments, houses, co-working spaces and offices to let. That is broader than most listing sites, which usually take residential only. SpacesMate supports daily, monthly and annual contracts.',
      },
    ],
  },
  {
    id: 'tenants',
    icon: 'search',
    title: 'For renters',
    subtitle: 'Finding a place and contacting the owner',
    faqs: [
      {
        q: 'Does it cost renters anything to use SpacesMate?',
        a: 'Nothing. Searching, viewing details and contacting owners through SpacesMate are all free. The platform fee is paid by property owners only.',
      },
      {
        q: 'Can I trust the listings on SpacesMate?',
        a: 'Listings go through an initial check, and Fair Rotation only shows listings whose owner has confirmed the details within the last 6 months. Listings that have not been updated are hidden automatically, so renters see only properties that are genuinely available.',
      },
      {
        q: 'How do I search for a place on SpacesMate?',
        a: 'Go to the search page (/search) and type a building name, a development name or a place — "Sukhumvit" or "BTS Asok", for example. There is also a "near me" map feature that finds properties around your current location, and you can filter by type (condo / apartment / house / office / co-working).',
      },
    ],
  },
  {
    id: 'owners',
    icon: 'real_estate_agent',
    title: 'For owners',
    subtitle: 'Listing, packages and property management',
    faqs: [
      {
        q: 'How do I start listing a property on SpacesMate?',
        a: 'Press "List your property" and create a free account (accepting the Terms of Use and Privacy Policy) → enter the details and upload photos → save. A new account gets one free Basic package, so the first listing goes live straight away for 30 days. For further listings, or when that period ends, choose a package and pay at checkout (PromptPay or card); the listing goes live as soon as payment succeeds, with no approval to wait for.',
      },
      {
        q: 'What does listing on SpacesMate cost?',
        a: 'There are 3 packages: Basic ฿299/month (30 days), Standard ฿699/3 months (90 days, the most popular) and Premium ฿2,499/year (365 days, with video upload). No commission and no hidden fees.',
      },
      {
        q: 'Are there any special rules or conditions for listing?',
        a: 'One that matters — the owner must confirm the listing details are still correct at least every 6 months, so renters get accurate, current information. A listing that is not confirmed in time is hidden from the site automatically until it is confirmed again.',
      },
      {
        q: 'Can brokers or real estate agencies list?',
        a: 'Yes. Brokers and agencies can list in their own name or on behalf of an owner who has authorised them. There is no restriction on who may list.',
      },
      {
        q: 'How many packages are there, and how do they differ?',
        a: `There are 3 packages — they differ in how long the listing runs and how many photos it carries:\n• Basic ฿299/month — live for 30 days, up to ${PACKAGE_IMAGE_LIMITS.basic} photos\n• Standard ฿699/3 months — live for 90 days, up to ${PACKAGE_IMAGE_LIMITS.standard} photos, 22% cheaper than Basic\n• Premium ฿2,499/year — live for 365 days, up to ${PACKAGE_IMAGE_LIMITS.premium} photos, with video, 30% cheaper than paying monthly\n\nEvery package shows all your contact channels, has no cap on views, and uses the same Fair Rotation.`,
      },
      {
        q: 'I have several properties — is there a special package?',
        a: 'Yes. Owners and agencies with several properties can contact the SpacesMate team directly at support@spacesmate.com or through the contact page for a tailored offer. The team will come back to you as soon as possible.',
      },
      {
        q: 'If I want several listings, do I need a separate package for each?',
        a: 'Yes — each listing showing on the website needs its own package: one package = one live listing. If you have 3 condo units to list at the same time, for example, you buy 3 packages. But a package is not tied permanently to one listing — once a room is let, you can swap another listing into the same package for the rest of its term. Owners manage every listing and package from a single Owner Dashboard, which shows each subscription with its own status and expiry date.',
      },
      {
        q: 'Can I upgrade a package, and how is it charged?',
        a: 'You can upgrade immediately from the Owner Dashboard — click "upgrade" on the subscription you want and choose a higher package. You are charged only the difference for the days remaining in the current period (proration), straight away through Stripe. There is no need to cancel and re-subscribe, the listing has no downtime, and the new allowances (more photos, video) are available as soon as the upgrade succeeds.',
      },
      {
        q: 'If I cancel auto-renewal, is my listing deleted immediately?',
        a: 'No. Cancelling from the Owner Dashboard only means it will not renew automatically. Your listing stays published and visible until the expiry date you have already paid for. If your package ends on 31 July and you cancel on 15 July, for example, the listing runs until 31 July. You do not lose days you have paid for.',
      },
      {
        q: 'How is the Full Property Management fee calculated?',
        a: 'SpacesMate works on profit sharing — we take a share of the rent actually collected, nothing else. The more the property earns, the more SpacesMate earns. The rate is set after SpacesMate has inspected and assessed your property, to be sure it has the right potential. To start, fill in the form on the property management page and the team will come back to you as soon as possible.',
      },
      {
        q: 'After I submit the property management form, when will SpacesMate contact me?',
        a: 'The SpacesMate team will be in touch as soon as possible after receiving your details, to arrange a property assessment and discuss management terms.',
      },
      {
        q: 'Does SpacesMate hold the security deposit on the owner’s behalf?',
        a: 'No. SpacesMate does not hold security deposits. The deposit belongs to the owner directly: the owner receives it and returns it to the tenant within 14 days of check-out. SpacesMate only coordinates.',
      },
    ],
  },
]

/** The FAQ for a locale. Thai is the default everywhere that does not say otherwise. */
export function faqCategories(locale: Locale): Category[] {
  return locale === 'en' ? EN : TH
}

/** Flat question/answer list for the FAQPage schema, per locale. */
export function faqQa(locale: Locale): { q: string; a: string }[] {
  return faqCategories(locale).flatMap(c => c.faqs.map(f => ({ q: f.q, a: f.a })))
}
