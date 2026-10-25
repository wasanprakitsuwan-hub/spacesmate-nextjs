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

    // ── Step 2 summary card ──

    // ── What happens next ──
    fillFreely: 'กรอกได้เต็มที่',
    fillFreelyBody: (maxImages: number) =>
      ` — ใส่รูปได้ถึง ${maxImages} รูปและใส่วิดีโอได้ทุกแพ็กเกจ แพ็กเกจมีผลกับจำนวนที่แสดงบนเว็บไซต์เท่านั้น ไม่ได้จำกัดสิ่งที่คุณกรอก อัปเกรดเมื่อไหร่ รูปและวิดีโอที่เหลือจะแสดงทันทีโดยไม่ต้องอัปโหลดใหม่`,

    // ── Consent ──
    consentLead: 'ฉันยืนยันว่าข้อมูลประกาศเป็นความจริง และยอมรับ',
    terms: 'เงื่อนไขการให้บริการ',
    and: 'และ',
    privacy: 'นโยบายความเป็นส่วนตัว',
    consentTail: 'ของ SpacesMate',

    // ── Actions ──
    saving: 'กำลังบันทึก...',
    pageTitle: 'ลงประกาศให้เช่า',
    crumbMine: 'ประกาศของฉัน',
    crumbNew: 'ลงประกาศใหม่',
    stepFill: 'กรอกประกาศ',
    stepPay: 'ชำระเงินและเผยแพร่',
    saveDraft: 'บันทึกเป็นฉบับร่าง',
    saveAndPay: 'บันทึกและไปชำระเงิน →',
    previewTitle: 'ตัวอย่างการ์ดในผลค้นหา',
    previewUntitled: 'ชื่อประกาศจะแสดงที่นี่',
    perMonth: '/เดือน',
    completeness: 'ความครบถ้วน',
    missing: 'ขาด: ',
    complete: 'ครบแล้ว พร้อมเผยแพร่',
    itemTitle: 'ชื่อประกาศ',
    itemPrice: 'ราคา',
    itemPin: 'หมุดแผนที่',
    itemPhotos: 'รูปภาพ',
    itemContact: 'ข้อมูลติดต่อ',
    itemTitleEn: 'ชื่อภาษาอังกฤษ',
    itemDescEn: 'รายละเอียดภาษาอังกฤษ',
    nextHeading: 'ถัดไป',
    next1: 'บันทึกแล้วไปหน้าชำระเงิน เลือกแพ็กเกจ แล้วประกาศเผยแพร่ทันที',
    next2: 'มีแพ็กเกจว่างอยู่แล้ว? ระบบเผยแพร่ให้เลย ไม่ต้องจ่ายซ้ำ',
    next3: 'บันทึกเป็นฉบับร่างได้ ไม่มีวันหมดอายุ กลับมาแก้ไขจากแดชบอร์ดได้ทุกเมื่อ',
    guideLink: 'อ่านคู่มือการลงประกาศ →',
  },

  en: {
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



    fillFreely: 'Fill it in fully',
    fillFreelyBody: (maxImages: number) =>
      ` — you can add up to ${maxImages} photos and a video on any package. The package decides how many of them appear on the website, not how many you may enter. Upgrade at any time and the rest appear immediately, with nothing to re-upload.`,

    consentLead: 'I confirm the listing details are true, and I accept the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    consentTail: 'of SpacesMate',

    saving: 'Saving…',
    pageTitle: 'List a property for rent',
    crumbMine: 'My listings',
    crumbNew: 'New listing',
    stepFill: 'Fill in listing',
    stepPay: 'Pay and publish',
    saveDraft: 'Save as draft',
    saveAndPay: 'Save and continue to payment →',
    previewTitle: 'How your card looks in search',
    previewUntitled: 'Your listing title appears here',
    perMonth: '/month',
    completeness: 'Completeness',
    missing: 'Missing: ',
    complete: 'Complete and ready to publish',
    itemTitle: 'title',
    itemPrice: 'price',
    itemPin: 'map pin',
    itemPhotos: 'photos',
    itemContact: 'contact details',
    itemTitleEn: 'English title',
    itemDescEn: 'English description',
    nextHeading: 'Next',
    next1: 'Save, then choose a package on the payment page and your listing goes live straight away',
    next2: 'Already hold an unused package? We publish it for you, with nothing to pay again',
    next3: 'Or save it as a draft. Drafts never expire and you can edit them from your dashboard',
    guideLink: 'Read the listing guide →',
  },
} as const

export type SubmitNewStrings = (typeof SUBMIT_NEW_T)[Locale]
