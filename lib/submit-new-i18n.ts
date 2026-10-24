/**
 * The /list-your-property/new wrapper: top bar, step indicator, validation messages, the
 * "what happens next" panel, the consent tick and the save button.
 *
 * The form itself lives in lib/wizard-i18n. This file is only the scaffolding
 * around it.
 *
 * TWO THINGS HERE ARE PROMISES, NOT COPY
 *   · The consent sentence is the record of what the owner agreed to. It names
 *     the Terms and the Privacy Policy and nothing else, and both links must
 *     point at the same locale the owner is reading. POST /api/consent logs
 *     notice_version: 1 against this wording — change the wording and the
 *     version has to move with it, in both languages, in the same commit.
 *   · "No charge yet", "saved as a draft", "drafts never expire" are
 *     statements about what the next click does. They are true of the current
 *     flow: this page writes a draft and never touches Stripe. If that changes,
 *     this text is the first thing that becomes a lie.
 */
export type Locale = 'th' | 'en'

export const SUBMIT_NEW_T = {
  th: {
    topBar: 'ลงประกาศอสังหาฯ',
    step1: 'ข้อมูลประกาศ',
    step2: 'ข้อมูลติดต่อ & บันทึก',
    loading: 'กำลังโหลด...',

    // ── Validation ──
    needTitleTh: 'กรุณากรอกชื่อประกาศ (ภาษาไทย)',
    needRoomType: 'กรุณาเพิ่มอย่างน้อย 1 ประเภทห้อง / พื้นที่',
    needPrice: 'กรุณากรอกราคาเช่า',
    needProvince: 'กรุณาเลือกจังหวัด',
    needPin: 'กรุณาปักหมุดตำแหน่งบนแผนที่ เพื่อให้ผู้เช่าเห็นรถไฟฟ้าใกล้เคียง',
    needImage: 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป',
    needContact: 'กรุณากรอกชื่อและเบอร์โทรติดต่อ',
    needConsent: 'กรุณายอมรับเงื่อนไขการให้บริการก่อนดำเนินการ',
    genericError: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',

    // ── Step 1 ──
    listingInfo: 'ข้อมูลประกาศ',
    nextContact: 'ถัดไป — ข้อมูลติดต่อ',

    // ── Step 2 summary card ──
    listingToPublish: 'ประกาศที่จะเผยแพร่',
    untitled: '(ไม่มีชื่อ)',
    photosN: (n: number) => `${n} รูป`,
    oneVideo: 'วิดีโอ 1 รายการ',

    // ── What happens next ──
    whatNext: 'ขั้นตอนถัดไป',
    draftLine1a: 'กดบันทึกแล้วประกาศจะถูกเก็บเป็น ',
    draftLine1b: 'ฉบับร่าง',
    draftLine1c: ' ในบัญชีของคุณ — ยังไม่มีการเรียกเก็บเงิน และยังไม่แสดงบนเว็บไซต์',
    draftLine2: 'หากคุณมีสล็อตว่างอยู่แล้ว ระบบจะเผยแพร่ให้ทันที ถ้ายังไม่มี เราจะพาไปเลือกซื้อสล็อต — เลือกแพ็กเกจตอนนั้นได้เลย ไม่ต้องตัดสินใจตอนนี้',
    fillFreely: 'กรอกได้เต็มที่',
    fillFreelyBody: (maxImages: number) =>
      ` — ใส่รูปได้ถึง ${maxImages} รูปและใส่วิดีโอได้ทุกแพ็กเกจ แพ็กเกจมีผลกับจำนวนที่แสดงบนเว็บไซต์เท่านั้น ไม่ได้จำกัดสิ่งที่คุณกรอก อัปเกรดเมื่อไหร่ รูปและวิดีโอที่เหลือจะแสดงทันทีโดยไม่ต้องอัปโหลดใหม่`,
    draftsNeverExpire: 'ประกาศฉบับร่างเก็บไว้ได้ตลอด ไม่มีวันหมดอายุ · แก้ไขได้ทุกเมื่อจากแดชบอร์ด',

    // ── Consent ──
    consentLead: 'ฉันยืนยันว่าข้อมูลประกาศเป็นความจริง และยอมรับ',
    terms: 'เงื่อนไขการให้บริการ',
    and: 'และ',
    privacy: 'นโยบายความเป็นส่วนตัว',
    consentTail: 'ของ SpacesMate',

    // ── Actions ──
    back: 'ย้อนกลับ',
    saving: 'กำลังบันทึก...',
    saveListing: 'บันทึกประกาศ',
    savedAsDraftNote: 'บันทึกเป็นฉบับร่างก่อน — ยังไม่มีการเรียกเก็บเงิน ขั้นตอนถัดไปคือซื้อสล็อตเพื่อเผยแพร่',
  },

  en: {
    topBar: 'List your property',
    step1: 'Listing details',
    step2: 'Contact details & save',
    loading: 'Loading…',

    /**
     * The Thai title is required, not the English one, because that is the
     * field the listing pages and search index are built on. Saying so plainly
     * is better than a message that just says "title" and leaves the owner
     * typing into the wrong box.
     */
    needTitleTh: 'Please enter the listing title in Thai — it is the one the site lists under',
    needRoomType: 'Please add at least one room or space type',
    needPrice: 'Please enter a rent',
    needProvince: 'Please choose a province',
    needPin: 'Please drop a pin on the map so renters can see the nearest stations',
    needImage: 'Please upload at least one photo',
    needContact: 'Please enter a contact name and phone number',
    needConsent: 'Please accept the Terms of Service before continuing',
    genericError: 'Something went wrong. Please try again.',

    listingInfo: 'Listing details',
    nextContact: 'Next — contact details',

    listingToPublish: 'The listing to be published',
    untitled: '(untitled)',
    photosN: (n: number) => `${n} ${n === 1 ? 'photo' : 'photos'}`,
    oneVideo: '1 video',

    whatNext: 'What happens next',
    draftLine1a: 'When you save, the listing is kept as a ',
    draftLine1b: 'draft',
    draftLine1c: ' in your account — nothing is charged, and it is not shown on the website yet.',
    draftLine2: 'If you already hold a free slot we publish it straight away. If not, we take you to buy one — you choose the package then, not now.',
    fillFreely: 'Fill it in fully',
    fillFreelyBody: (maxImages: number) =>
      ` — you can add up to ${maxImages} photos and a video on any package. The package decides how many of them appear on the website, not how many you may enter. Upgrade at any time and the rest appear immediately, with nothing to re-upload.`,
    draftsNeverExpire: 'Drafts are kept indefinitely and never expire · edit them any time from your dashboard',

    consentLead: 'I confirm the listing details are true, and I accept the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    consentTail: 'of SpacesMate',

    back: 'Back',
    saving: 'Saving…',
    saveListing: 'Save listing',
    savedAsDraftNote: 'Saved as a draft first — nothing is charged. The next step is buying a slot to publish it.',
  },
} as const

export type SubmitNewStrings = (typeof SUBMIT_NEW_T)[Locale]
