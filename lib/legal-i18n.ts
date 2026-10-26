/**
 * Privacy policy and terms of use, per locale.
 *
 * TRANSLATION STATUS — READ BEFORE CHANGING
 *
 * The English here is a translation of the Thai, produced for this repository
 * and not reviewed by a lawyer. It is published alongside a governing-language
 * clause (the final section of each document, in both languages) stating that
 * the Thai version prevails if the two are ever inconsistent. That clause is
 * what makes publishing a translation safe: a slip in the English cannot become
 * a contractual term.
 *
 * Rules for anyone editing these:
 *
 * 1. Edit the Thai first. It is the operative text. The English follows it.
 * 2. Never edit one language only. Two documents that disagree are the exact
 *    situation the governing-language clause exists to survive, not an excuse
 *    to create it.
 * 3. Statute references (มาตรา 19, 28–29, 30–35, 37(4), พ.ร.บ. การบัญชี มาตรา 14)
 *    are Thai law. The numbers do not change in English — they are citations,
 *    not words. PDPA stays PDPA.
 * 4. Retention periods, the 72-hour breach window, the 30-day response window
 *    and the 7-year accounting period are commitments. If one changes, it
 *    changes in both languages in the same commit.
 */
export type Locale = 'th' | 'en'

export interface LegalSection {
  title: string
  content: string
}

export const LEGAL_T = {
  th: {
    privacyMetaTitle: 'นโยบายความเป็นส่วนตัว',
    privacyHeading: 'นโยบายความเป็นส่วนตัว',
    termsMetaTitle: 'เงื่อนไขการใช้งาน',
    termsHeading: 'เงื่อนไขการใช้งาน',
    home: 'หน้าแรก',
    privacyEffective: 'มีผลบังคับใช้ตั้งแต่ 10 สิงหาคม 2569 | ปรับปรุงล่าสุด 10 สิงหาคม 2569',
    // 2568 BE is 2025 CE — a year before Space Works Co., Ltd. was incorporated
    // on 6 January 2026 (2569 BE). Corrected; the registration number 0105569001611
    // carries 569 and confirms the year.
    termsEffective: 'มีผลบังคับใช้ตั้งแต่ 6 มกราคม 2569 | อัปเดตล่าสุด 25 มิถุนายน 2569',
    termsIntroA: 'โปรดอ่านเงื่อนไขการใช้งานนี้อย่างละเอียดก่อนใช้บริการ spacesmate.com หากคุณมีคำถาม กรุณาติดต่อ ',
    privacyIntro1a: 'บริษัท เสปซเวิร์คส จำกัด (',
    privacyIntro1b: ') ทะเบียนเลขที่ 0105569001611 ซึ่งดำเนินธุรกิจในนาม ',
    privacyIntro1c: ' เป็นผู้ควบคุมข้อมูลส่วนบุคคลตาม พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',
    privacyIntro2: 'นโยบายนี้อธิบายว่าเราเก็บข้อมูลอะไร ใช้เพื่ออะไร อาศัยฐานทางกฎหมายใด เปิดเผยให้ใคร เก็บไว้นานเท่าใด และคุณมีสิทธิอะไรบ้าง',
    // Round 6 layout (26 Oct 2026). The summary cards restate sections 1, 3
    // and 7 in a line each; they add no terms of their own.
    docsNav: 'เอกสารทางกฎหมาย',
    toc: 'สารบัญ',
    privacySummary: [
      { title: 'เก็บเท่าที่จำเป็น', desc: 'ข้อมูลบัญชี ประกาศ และการติดต่อ' },
      { title: 'ไม่ขายข้อมูลของคุณ', desc: 'ส่งต่อเฉพาะผู้ให้บริการที่จำเป็น' },
      { title: 'สิทธิของคุณตาม PDPA', desc: 'ขอดู แก้ไข ลบ หรือถอนความยินยอม' },
    ],
    cookieBox: 'ต้องการเปลี่ยนความยินยอมเรื่องคุกกี้ เปิดหรือปิดคุกกี้วิเคราะห์และการตลาดได้ทุกเมื่อ',
    privacyQuestions: 'มีคำถามเรื่องข้อมูลส่วนบุคคล ติดต่อ ',
    termsQuestions: 'มีคำถามเรื่องเงื่อนไขการใช้งาน ติดต่อ ',
  },
  en: {
    privacyMetaTitle: 'Privacy policy',
    privacyHeading: 'Privacy policy',
    termsMetaTitle: 'Terms of use',
    termsHeading: 'Terms of use',
    home: 'Home',
    privacyEffective: 'In effect from 10 August 2026 | last updated 10 August 2026',
    termsEffective: 'In effect from 6 January 2026 | last updated 25 June 2026',
    termsIntroA: 'Please read these terms carefully before using spacesmate.com. If you have any questions, contact ',
    privacyIntro1a: 'Space Works Co., Ltd. (',
    privacyIntro1b: '), registration no. 0105569001611, trading as ',
    privacyIntro1c: ', is the data controller under the Personal Data Protection Act B.E. 2562 (PDPA).',
    privacyIntro2: 'This policy explains what we collect, what we use it for, on what lawful basis, who we disclose it to, how long we keep it, and what rights you have.',
    docsNav: 'Legal documents',
    toc: 'Contents',
    privacySummary: [
      { title: 'Only what is needed', desc: 'Account, listing and contact details' },
      { title: 'We never sell your data', desc: 'Shared only with the providers we need' },
      { title: 'Your rights under the PDPA', desc: 'See, correct, delete, or withdraw consent' },
    ],
    cookieBox: 'Change your cookie consent and turn analytics and marketing cookies on or off at any time.',
    privacyQuestions: 'Questions about your personal data? Contact ',
    termsQuestions: 'Questions about these terms? Contact ',
  },
} as const

/**
 * The governing-language clause, appended to both documents in both languages.
 *
 * Added when the English versions were published. Before that there was one
 * text and the question could not arise; with two, something has to say which
 * one binds, or a translation nuance becomes a contractual ambiguity that only
 * surfaces in a dispute.
 */
const GOVERNING_LANGUAGE: Record<Locale, LegalSection> = {
  th: {
    title: '11. ภาษาของเอกสาร',
    content: `เอกสารฉบับนี้จัดทำขึ้นเป็นภาษาไทยและภาษาอังกฤษ

ในกรณีที่ข้อความสองฉบับไม่สอดคล้องกัน ให้ถือฉบับภาษาไทยเป็นฉบับที่มีผลบังคับใช้ ฉบับภาษาอังกฤษจัดทำขึ้นเพื่ออำนวยความสะดวกในการทำความเข้าใจเท่านั้น`,
  },
  en: {
    title: '11. Language of this document',
    content: `This document is published in Thai and in English.

If the two versions are inconsistent in any respect, the Thai version governs. The English version is provided for ease of understanding only.`,
  },
}

const PRIVACY_TH: LegalSection[] = [
  {
    title: '1. ข้อมูลที่เราเก็บ และฐานทางกฎหมาย',
    content: `เราเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์แต่ละข้อ:

• ประกาศทรัพย์สิน — ชื่อผู้ติดต่อ โทรศัพท์ อีเมล LINE ID ที่อยู่ทรัพย์ พิกัด ราคา เงื่อนไขเช่า
   เพื่อเผยแพร่และจัดการประกาศ · ฐาน: การปฏิบัติตามสัญญา

• คำขอลงประกาศ — ชื่อ อีเมล โทรศัพท์ LINE ID รายละเอียดทรัพย์
   เพื่อพิจารณาและดำเนินการคำขอ · ฐาน: การดำเนินการตามคำขอก่อนเข้าทำสัญญา

• บัญชีผู้ใช้ — อีเมล ชื่อ-นามสกุล โทรศัพท์ LINE ID บทบาท รหัสผ่านที่เข้ารหัสแล้ว
   เพื่อยืนยันตัวตนและควบคุมสิทธิ · ฐาน: การปฏิบัติตามสัญญา

• การชำระเงิน — รหัสลูกค้าและรหัสการสมัครสมาชิกจาก Stripe แพ็กเกจ วันที่
   เพื่อเรียกเก็บค่าบริการ บัญชีและภาษี · ฐาน: สัญญา + หน้าที่ตามกฎหมาย

• คุกกี้วิเคราะห์และโฆษณา — ตัวระบุออนไลน์ IP address ข้อมูลหน้าเว็บและอุปกรณ์
   เพื่อวัดผลการใช้งานและโฆษณา · ฐาน: ความยินยอม (ถอนได้ตลอดเวลา)

• การสนทนาผ่าน LINE — ชื่อที่แสดง LINE user ID ข้อความ
   เพื่อตอบคำถามและให้บริการ · ฐาน: การดำเนินการก่อนเข้าทำสัญญา หรือประโยชน์โดยชอบด้วยกฎหมาย

เราไม่เก็บข้อมูลบัตรเครดิต ข้อมูลบัตรอยู่กับ Stripe และไม่ผ่านระบบของ SpacesMate

คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบและความปลอดภัยไม่ได้ขอความยินยอม เพราะเว็บไซต์ทำงานไม่ได้หากไม่มี — และการเสนอเป็นตัวเลือกที่ปฏิเสธไม่ได้จริงย่อมไม่ใช่ทางเลือก`,
  },
  {
    title: '2. คุกกี้และความยินยอม',
    content: `เว็บไซต์ไม่โหลดเครื่องมือวิเคราะห์หรือโฆษณาใด ๆ จนกว่าคุณจะให้ความยินยอม

เมื่อคุณให้ความยินยอมแล้ว จะมีการโหลด:

• Google Tag Manager — ผู้รับ: Google
• Google Analytics 4 — ผู้รับ: Google (G-QBQV320QXT)
• Meta Pixel — ผู้รับ: Meta Platforms, Inc. (26085822227748725)

การถอนความยินยอมทำได้ตลอดเวลาและง่ายเท่ากับการให้ ผ่านลิงก์ "ตั้งค่าคุกกี้" ที่ส่วนท้ายของทุกหน้า การถอนมีผลทันที และไม่กระทบความชอบด้วยกฎหมายของการประมวลผลก่อนหน้า

เราบันทึกการตัดสินใจของคุณไว้ในระบบเพื่อพิสูจน์ได้ตามมาตรา 19 โดยบันทึกดังกล่าวไม่มี IP address และไม่มี user agent — เก็บเพียงว่ายินยอมอะไร ต่อนโยบายฉบับใด และเมื่อใด`,
  },
  {
    title: '3. การเปิดเผยข้อมูลและผู้ประมวลผล',
    content: `เราไม่ขายและไม่ให้เช่าข้อมูลส่วนบุคคลของคุณ

เราใช้ผู้ให้บริการภายนอกดังนี้ ซึ่งประมวลผลข้อมูลตามคำสั่งของเราและตามข้อกำหนดการให้บริการของแต่ละราย:

• Supabase — ฐานข้อมูลหลัก (บัญชี ประกาศ คำขอ) · สิงคโปร์
• Vercel — โฮสติ้งเว็บไซต์ (ข้อมูลคำขอ log) · สหรัฐอเมริกา / edge ทั่วโลก
• Google — Tag Manager, Analytics (ตัวระบุออนไลน์ ข้อมูลการใช้งาน) · สหรัฐอเมริกา
• Meta Platforms — Pixel เพื่อการโฆษณา (ตัวระบุออนไลน์ พฤติกรรมการเข้าชม) · สหรัฐอเมริกา
• Stripe — รับชำระเงิน (ข้อมูลบัตรและรหัสลูกค้า) · สหรัฐอเมริกา / ไอร์แลนด์
• n8n Cloud — ระบบอัตโนมัติ · สหภาพยุโรป
• LINE — ช่องทางติดต่อ (ข้อความและโปรไฟล์ LINE) · ญี่ปุ่น / ภูมิภาค

นอกจากนี้เราอาจเปิดเผยข้อมูลเมื่อกฎหมายกำหนด เช่น คำสั่งศาลหรือหน่วยงานรัฐ หรือกรณีควบรวมกิจการ ซึ่งจะแจ้งให้ทราบล่วงหน้า`,
  },
  {
    title: '4. การส่งข้อมูลไปต่างประเทศ (มาตรา 28–29)',
    content: `ผู้ให้บริการข้างต้นทั้งหมดตั้งอยู่นอกประเทศไทย ข้อมูลส่วนบุคคลของคุณจึงถูกส่งและจัดเก็บในต่างประเทศ

เราเลือกใช้ผู้ให้บริการที่มีมาตรฐานด้านความปลอดภัยและการคุ้มครองข้อมูลส่วนบุคคลเป็นที่ยอมรับในระดับสากล และประมวลผลข้อมูลภายใต้ข้อกำหนดการให้บริการที่กำหนดหน้าที่ด้านการคุ้มครองข้อมูล

หากคุณต้องการทราบรายละเอียดเกี่ยวกับผู้ให้บริการรายใดรายหนึ่งหรือมาตรการคุ้มครองที่ใช้ ติดต่อเราตามข้อ 8`,
  },
  {
    title: '5. ระยะเวลาการเก็บรักษา',
    content: `• ประกาศทรัพย์สิน — 24 เดือน หลังประกาศไม่ใช้งานและไม่มีการสมัครสมาชิกที่ยังมีผล
• คำขอลงประกาศที่อนุมัติแล้ว — 12 เดือน หลังสร้างประกาศ
• คำขอลงประกาศที่ปฏิเสธหรือไม่ดำเนินการ — 6 เดือน
• บัญชีผู้ใช้ — เก็บตลอดระยะเวลาที่บัญชียังใช้งานอยู่ หากคุณขอให้ลบบัญชี เราจะดำเนินการลบภายใน 30 วัน (ดูสิทธิในการลบ ข้อ 7)
• ข้อมูลการชำระเงินและบัญชี — 7 ปี นับจากสิ้นรอบบัญชี (พ.ร.บ. การบัญชี มาตรา 14)
• การสนทนาผ่าน LINE — 12 เดือน
• Google Analytics — 14 เดือน
• บันทึกความยินยอม — 3 ปี

เมื่อครบกำหนด ข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวบุคคลได้โดยกระบวนการอัตโนมัติที่ทำงานทุกคืน`,
  },
  {
    title: '6. ความปลอดภัย',
    content: `• เข้ารหัสการรับส่งข้อมูลด้วย HTTPS/TLS
• ควบคุมการเข้าถึงตามบทบาทหน้าที่ (RBAC) และตรวจสอบสิทธิที่ฝั่งเซิร์ฟเวอร์ทุกครั้ง
• รหัสผ่านเก็บในรูปแบบ hash ไม่ใช่ข้อความธรรมดา
• บันทึกการเข้าถึงข้อมูลที่อ่อนไหวเพื่อการตรวจสอบ
• ทบทวนความเสี่ยงและสิทธิการเข้าถึงเป็นระยะ

ไม่มีระบบใดปลอดภัยสมบูรณ์ หากเกิดเหตุละเมิดข้อมูลส่วนบุคคลที่มีความเสี่ยงต่อสิทธิและเสรีภาพของคุณ เราจะแจ้งสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลภายใน 72 ชั่วโมง ตามมาตรา 37(4) และแจ้งคุณโดยไม่ชักช้าเมื่อกฎหมายกำหนด`,
  },
  {
    title: '7. สิทธิของคุณ',
    content: `ภายใต้ PDPA คุณมีสิทธิ:

• เข้าถึง — ขอสำเนาข้อมูลส่วนบุคคลที่เราเก็บ (มาตรา 30)
• แก้ไข — ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่เป็นปัจจุบัน (มาตรา 35)
• ลบ — ขอลบข้อมูลในกรณีที่กฎหมายอนุญาต (มาตรา 33)
• ระงับการใช้ — ขอให้ระงับการประมวลผลชั่วคราว (มาตรา 34)
• คัดค้าน — คัดค้านการประมวลผลที่อาศัยประโยชน์โดยชอบด้วยกฎหมาย หรือเพื่อการตลาด (มาตรา 32)
• โอนย้ายข้อมูล — ขอรับข้อมูลในรูปแบบที่อ่านได้ด้วยเครื่อง (มาตรา 31)
• ถอนความยินยอม — ตลอดเวลา และง่ายเท่ากับการให้ความยินยอม (มาตรา 19 วรรคห้า)
• ร้องเรียน — ต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) หากเห็นว่าเราไม่ปฏิบัติตามกฎหมาย

เราจะตอบคำขอภายใน 30 วัน นับแต่ได้รับคำขอ`,
  },
  {
    title: '8. ติดต่อเรา',
    content: `บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.)
ทะเบียนเลขที่ 0105569001611
ที่อยู่จดทะเบียน: Summer Hill (unit 3026) 1106 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร 10110
อีเมล (รวมถึงเรื่องข้อมูลส่วนบุคคลและการใช้สิทธิ): support@spacesmate.com
เว็บไซต์: www.spacesmate.com`,
  },
  {
    title: '9. พนักงานและผู้ติดต่อฉุกเฉิน',
    content: `หากคุณเป็นพนักงานของ SpacesMate จะมีประกาศความเป็นส่วนตัวสำหรับพนักงานแยกต่างหากในระบบอินทราเน็ต ครอบคลุมข้อมูลการลงเวลา ตำแหน่งที่ตั้ง การลา และเอกสารประกอบ

ผู้ติดต่อฉุกเฉิน: พนักงานให้ชื่อและเบอร์โทรของผู้ติดต่อฉุกเฉินไว้กับเรา ข้อมูลนี้ใช้เพื่อติดต่อในกรณีฉุกเฉินเท่านั้น และจะถูกลบเมื่อพ้นสภาพการเป็นพนักงาน พนักงานควรแจ้งบุคคลดังกล่าวให้ทราบว่าได้ให้ข้อมูลไว้`,
  },
  {
    title: '10. การเปลี่ยนแปลงนโยบาย',
    content: `หากมีการเปลี่ยนแปลงสาระสำคัญ เราจะแจ้งทางอีเมลที่ลงทะเบียนไว้หรือประกาศบนเว็บไซต์

หากการเปลี่ยนแปลงกระทบวัตถุประสงค์ที่คุณเคยให้ความยินยอมไว้ เราจะขอความยินยอมใหม่ ความยินยอมที่ให้ไว้เพื่อวัตถุประสงค์หนึ่ง ไม่ใช่ความยินยอมเพื่ออีกวัตถุประสงค์หนึ่ง`,
  },
]

const PRIVACY_EN: LegalSection[] = [
  {
    title: '1. What we collect, and the lawful basis',
    content: `We collect only what each purpose requires:

• Property listings — contact name, phone, email, LINE ID, property address, coordinates, price, rental terms
   To publish and manage the listing · Basis: performance of a contract

• Listing requests — name, email, phone, LINE ID, property details
   To assess and act on the request · Basis: steps taken at your request before entering a contract

• User accounts — email, full name, phone, LINE ID, role, hashed password
   To authenticate you and control permissions · Basis: performance of a contract

• Payments — Stripe customer and subscription identifiers, package, dates
   To charge for the service, and for accounting and tax · Basis: contract + legal obligation

• Analytics and advertising cookies — online identifiers, IP address, page and device data
   To measure usage and advertising · Basis: consent (withdrawable at any time)

• LINE conversations — display name, LINE user ID, messages
   To answer questions and provide the service · Basis: steps before entering a contract, or legitimate interest

We do not store card details. Card data stays with Stripe and never passes through SpacesMate's systems.

Cookies strictly necessary for login and security are not subject to consent, because the site cannot work without them — and offering something as a choice when it cannot genuinely be refused is not a choice.`,
  },
  {
    title: '2. Cookies and consent',
    content: `The site loads no analytics or advertising tooling until you consent.

Once you consent, the following load:

• Google Tag Manager — recipient: Google
• Google Analytics 4 — recipient: Google (G-QBQV320QXT)
• Meta Pixel — recipient: Meta Platforms, Inc. (26085822227748725)

You can withdraw consent at any time, and as easily as you gave it, through the "cookie settings" link in the footer of every page. Withdrawal takes effect immediately and does not affect the lawfulness of processing carried out beforehand.

We record your decision so it can be demonstrated under section 19. That record contains no IP address and no user agent — only what was consented to, against which version of this policy, and when.`,
  },
  {
    title: '3. Disclosure and processors',
    content: `We do not sell or rent your personal data.

We use the following external providers, which process data on our instructions and under their own terms of service:

• Supabase — primary database (accounts, listings, requests) · Singapore
• Vercel — website hosting (request data, logs) · United States / global edge
• Google — Tag Manager, Analytics (online identifiers, usage data) · United States
• Meta Platforms — Pixel for advertising (online identifiers, browsing behaviour) · United States
• Stripe — payment processing (card data and customer identifiers) · United States / Ireland
• n8n Cloud — automation · European Union
• LINE — contact channel (messages and LINE profile) · Japan / regional

We may also disclose data where the law requires it — a court or government order, for example — or in the event of a merger or acquisition, of which we would give advance notice.`,
  },
  {
    title: '4. International transfers (sections 28–29)',
    content: `All of the providers above are located outside Thailand, so your personal data is transferred to and stored abroad.

We choose providers whose security and data protection standards are internationally recognised, and whose terms of service impose data protection obligations on them.

If you want detail on any particular provider or on the safeguards applied, contact us as set out in section 8.`,
  },
  {
    title: '5. Retention periods',
    content: `• Property listings — 24 months after the listing becomes inactive with no subscription still in force
• Approved listing requests — 12 months after the listing is created
• Rejected or abandoned listing requests — 6 months
• User accounts — kept for as long as the account is in use. If you ask us to delete it, we will do so within 30 days (see the right to erasure, section 7)
• Payment and accounting records — 7 years from the end of the accounting period (Accounting Act, section 14)
• LINE conversations — 12 months
• Google Analytics — 14 months
• Consent records — 3 years

Once a period expires, the data is deleted or de-identified by an automated process that runs nightly.`,
  },
  {
    title: '6. Security',
    content: `• Data in transit is encrypted with HTTPS/TLS
• Role-based access control (RBAC), with permissions checked server-side on every request
• Passwords are stored hashed, never as plain text
• Access to sensitive data is logged for audit
• Risks and access rights are reviewed periodically

No system is perfectly secure. If a personal data breach occurs that poses a risk to your rights and freedoms, we will notify the Personal Data Protection Committee within 72 hours under section 37(4), and notify you without delay where the law requires it.`,
  },
  {
    title: '7. Your rights',
    content: `Under the PDPA you have the right to:

• Access — request a copy of the personal data we hold about you (section 30)
• Rectification — ask us to correct data that is inaccurate or out of date (section 35)
• Erasure — ask us to delete data where the law permits (section 33)
• Restriction — ask us to suspend processing temporarily (section 34)
• Object — object to processing based on legitimate interest, or to direct marketing (section 32)
• Portability — receive your data in a machine-readable format (section 31)
• Withdraw consent — at any time, and as easily as it was given (section 19, paragraph five)
• Complain — to the Personal Data Protection Committee (PDPC) if you believe we are not complying with the law

We will respond to a request within 30 days of receiving it.`,
  },
  {
    title: '8. Contact us',
    content: `Space Works Co., Ltd. (บริษัท เสปซเวิร์คส จำกัด)
Registration no. 0105569001611
Registered address: Summer Hill (unit 3026), 1106 Sukhumvit Road, Phra Khanong, Khlong Toei, Bangkok 10110
Email (including for data protection matters and exercising your rights): support@spacesmate.com
Website: www.spacesmate.com`,
  },
  {
    title: '9. Employees and emergency contacts',
    content: `If you are a SpacesMate employee, a separate employee privacy notice is published on the intranet, covering attendance, location, leave and supporting documents.

Emergency contacts: employees give us the name and phone number of an emergency contact. That information is used only to make contact in an emergency, and is deleted when employment ends. Employees should tell the person concerned that they have provided it.`,
  },
  {
    title: '10. Changes to this policy',
    content: `If we make a material change, we will tell you by email to your registered address or by notice on the website.

If a change affects a purpose you previously consented to, we will ask for consent again. Consent given for one purpose is not consent for another.`,
  },
]

const TERMS_TH: LegalSection[] = [
  {
    title: '1. การยอมรับเงื่อนไข',
    content: `การใช้งานเว็บไซต์ spacesmate.com หรือบริการใดๆ ของ Space Works Co., Ltd. ("SpacesMate") ถือว่าคุณยอมรับเงื่อนไขการใช้งานฉบับนี้ทุกประการ หากคุณไม่ยอมรับ กรุณาหยุดการใช้งานทันที

SpacesMate สงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขการใช้งานได้ตลอดเวลา โดยจะแจ้งให้ทราบผ่านเว็บไซต์หรืออีเมล`,
  },
  {
    title: '2. บริการที่ให้',
    content: `SpacesMate ให้บริการ 2 ประเภทหลัก:

Stream 1 — แพลตฟอร์มลงประกาศ: เจ้าของทรัพย์สินสามารถลงประกาศเช่าหรือขายบนเว็บไซต์ โดยชำระค่าบริการตามแพ็กเกจที่เลือก

Stream 2 — บริหารจัดการทรัพย์สิน: SpacesMate รับบริหารอพาร์ทเม้นท์และคอนโดแบบครบวงจรในนามเจ้าของ

SpacesMate เป็นเพียงตัวกลาง ไม่ใช่ผู้เช่าหรือเจ้าของทรัพย์สิน และไม่รับประกันว่าจะหาผู้เช่าได้ภายในระยะเวลาใดๆ`,
  },
  {
    title: '3. การลงทะเบียนและบัญชีผู้ใช้',
    content: `เพื่อใช้บริการบางอย่าง คุณต้องสร้างบัญชีโดย:

• ให้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน
• รักษาความลับของรหัสผ่าน
• แจ้งให้เราทราบทันทีหากพบว่าบัญชีถูกใช้งานโดยไม่ได้รับอนุญาต
• รับผิดชอบกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ

คุณต้องมีอายุไม่ต่ำกว่า 18 ปีเพื่อลงทะเบียน`,
  },
  {
    title: '4. การชำระเงินและการคืนเงิน',
    content: `แพ็กเกจการลงประกาศ:
• ค่าบริการชำระล่วงหน้าสำหรับระยะเวลาที่เลือก
• ไม่มีการคืนเงินสำหรับแพ็กเกจที่ชำระแล้ว เว้นแต่ในกรณีที่กฎหมายกำหนด
• แพ็กเกจจะเริ่มนับทันทีหลังการชำระเงินสำเร็จ

ค่าบริการบริหารจัดการ:
• คำนวณตามสัญญาระหว่างเจ้าของทรัพย์สินและ SpacesMate
• ชำระตามงวดที่ตกลงในสัญญา`,
  },
  {
    title: '5. เนื้อหาของผู้ใช้',
    content: `คุณยืนยันว่าเนื้อหาที่ลงประกาศ (ข้อมูล รูปภาพ วิดีโอ):

• ถูกต้องและไม่ทำให้เข้าใจผิด
• คุณมีสิทธิ์เผยแพร่หรือได้รับอนุญาตจากเจ้าของสิทธิ์
• ไม่ละเมิดกฎหมาย กฎระเบียบ หรือสิทธิ์ของบุคคลที่สาม
• ไม่มีเนื้อหาที่ผิดกฎหมาย อนาจาร หรือเป็นอันตราย

SpacesMate สงวนสิทธิ์ลบหรือระงับเนื้อหาที่ฝ่าฝืนโดยไม่ต้องแจ้งล่วงหน้า`,
  },
  {
    title: '6. ทรัพย์สินทางปัญญา',
    content: `เนื้อหา โลโก้ ซอฟต์แวร์ และทรัพย์สินทางปัญญาทั้งหมดบนเว็บไซต์เป็นของ Space Works Co., Ltd. หรือผู้ให้อนุญาต ห้ามคัดลอก แก้ไข แจกจ่าย หรือใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร

เนื้อหาที่คุณลงบนแพลตฟอร์ม คุณยังคงเป็นเจ้าของ แต่ให้สิทธิ์ SpacesMate ใช้เพื่อการให้บริการ`,
  },
  {
    title: '7. ข้อจำกัดความรับผิดชอบ',
    content: `SpacesMate ให้บริการ "ตามสภาพ" และไม่รับประกัน:

• ความต่อเนื่องหรือปราศจากข้อผิดพลาดของบริการ
• ผลลัพธ์ที่ได้จากการใช้บริการ
• ความถูกต้องของข้อมูลที่ผู้ใช้ลงประกาศ

SpacesMate ไม่รับผิดชอบต่อความเสียหายทางอ้อม รวมถึงการสูญเสียรายได้หรือโอกาสทางธุรกิจ`,
  },
  {
    title: '8. การยกเลิกบัญชี',
    content: `คุณสามารถยกเลิกบัญชีได้ตลอดเวลาโดยติดต่อ support@spacesmate.com SpacesMate สงวนสิทธิ์ระงับหรือยกเลิกบัญชีที่ฝ่าฝืนเงื่อนไขการใช้งาน

เมื่อบัญชีถูกยกเลิก:
• ข้อมูลส่วนบุคคลจะถูกลบตามนโยบายความเป็นส่วนตัว
• ประกาศทั้งหมดจะถูกนำออกจากระบบ
• ไม่มีการคืนเงินสำหรับแพ็กเกจที่ยังเหลืออยู่`,
  },
  {
    title: '9. กฎหมายที่ใช้บังคับ',
    content: `เงื่อนไขการใช้งานนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทใดๆ จะถูกพิจารณาโดยศาลที่มีเขตอำนาจในกรุงเทพมหานคร ประเทศไทย`,
  },
  {
    title: '10. ติดต่อเรา',
    content: `หากมีคำถามเกี่ยวกับเงื่อนไขการใช้งาน:

บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.)
อีเมล: support@spacesmate.com
เว็บไซต์: www.spacesmate.com
ที่อยู่: Summer Hill (unit 3026), 1106 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110`,
  },
]

const TERMS_EN: LegalSection[] = [
  {
    title: '1. Acceptance of these terms',
    content: `Using the spacesmate.com website, or any service of Space Works Co., Ltd. ("SpacesMate"), means you accept these terms of use in full. If you do not accept them, please stop using the service.

SpacesMate reserves the right to change these terms at any time, and will give notice through the website or by email.`,
  },
  {
    title: '2. The services provided',
    content: `SpacesMate provides two main services:

Stream 1 — listing platform: property owners can list a property to rent or sell on the website, paying for the package they choose.

Stream 2 — property management: SpacesMate manages apartments and condominiums end to end on the owner's behalf.

SpacesMate is an intermediary only. It is neither the tenant nor the owner of any property, and gives no guarantee that a tenant will be found within any particular period.`,
  },
  {
    title: '3. Registration and user accounts',
    content: `To use some services you must create an account, and in doing so you agree to:

• Provide accurate and current information
• Keep your password confidential
• Tell us immediately if you discover your account has been used without your authorisation
• Take responsibility for all activity carried out under your account

You must be at least 18 years old to register.`,
  },
  {
    title: '4. Payment and refunds',
    content: `Listing packages:
• Fees are paid in advance for the period chosen
• No refund is given for a package already paid for, except where the law requires one
• The package period begins as soon as payment succeeds

Management fees:
• Calculated under the contract between the property owner and SpacesMate
• Paid at the intervals agreed in that contract`,
  },
  {
    title: '5. User content',
    content: `You confirm that the content you publish (information, photographs, video):

• Is accurate and not misleading
• Is yours to publish, or you have the rights holder's permission
• Does not breach any law, regulation or third-party right
• Contains nothing unlawful, obscene or harmful

SpacesMate reserves the right to remove or suspend infringing content without prior notice.`,
  },
  {
    title: '6. Intellectual property',
    content: `All content, logos, software and intellectual property on the website belong to Space Works Co., Ltd. or its licensors. They may not be copied, modified, distributed or used commercially without written permission.

Content you post on the platform remains yours, but you grant SpacesMate the right to use it in providing the service.`,
  },
  {
    title: '7. Limitation of liability',
    content: `SpacesMate provides the service "as is" and does not warrant:

• That the service will be uninterrupted or error-free
• Any particular outcome from using the service
• The accuracy of information published by users

SpacesMate is not liable for indirect loss, including loss of revenue or business opportunity.`,
  },
  {
    title: '8. Closing an account',
    content: `You may close your account at any time by contacting support@spacesmate.com. SpacesMate reserves the right to suspend or close an account that breaches these terms.

When an account is closed:
• Personal data is deleted in accordance with the privacy policy
• All listings are removed from the system
• No refund is given for any remaining package period`,
  },
  {
    title: '9. Governing law',
    content: `These terms are governed by Thai law. Any dispute will be heard by a court of competent jurisdiction in Bangkok, Thailand.`,
  },
  {
    title: '10. Contact us',
    content: `If you have questions about these terms:

Space Works Co., Ltd. (บริษัท เสปซเวิร์คส จำกัด)
Email: support@spacesmate.com
Website: www.spacesmate.com
Address: Summer Hill (unit 3026), 1106 Sukhumvit Road, Phra Khanong, Khlong Toei, Bangkok 10110`,
  },
]

export function privacySections(locale: Locale): LegalSection[] {
  return [...(locale === 'en' ? PRIVACY_EN : PRIVACY_TH), GOVERNING_LANGUAGE[locale]]
}

export function termsSections(locale: Locale): LegalSection[] {
  return [...(locale === 'en' ? TERMS_EN : TERMS_TH), GOVERNING_LANGUAGE[locale]]
}
