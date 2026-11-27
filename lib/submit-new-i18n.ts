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

    // ── Funnel header (/list-your-property/fb and this page) ──
    login: 'เข้าสู่ระบบ',
    dashboard: 'ประกาศของฉัน',

    // ── 4-step wizard ──
    stepOf: (n: number) => `ขั้นที่ ${n} จาก 4`,
    stepNames: ['ข้อมูลห้อง', 'รูปภาพ', 'ราคาและช่องทางติดต่อ', 'เผยแพร่'],
    stepShort: ['ข้อมูลห้อง', 'รูปภาพ', 'ราคา/ติดต่อ', 'เผยแพร่'],
    next: 'ถัดไป',
    back: 'ย้อนกลับ',
    saveDraftShort: 'บันทึกร่าง',
    noAccountYet: 'ยังไม่ต้องสมัครสมาชิก ข้อมูลบันทึกในเครื่องนี้อัตโนมัติ',
    savedLocally: 'บันทึกในเครื่องแล้ว',
    restored: 'กู้คืนข้อมูลที่คุณกรอกไว้ครั้งก่อนแล้ว',
    startOver: 'เริ่มใหม่',
    publishHeading: 'ตรวจสอบและเผยแพร่',
    publishBody: 'บันทึกประกาศ แล้วเลือกแพ็กเกจในหน้าชำระเงิน ประกาศขึ้นเว็บทันทีหลังชำระ',
    promoHint: (code: string) => `ใช้โค้ด ${code} ตอนชำระ แพ็กเกจ Basic เดือนแรกเหลือ ฿0`,

    // ── Account sheet ──
    acctTitle: 'บันทึกฉบับร่างของคุณ',
    acctBody: 'สร้างบัญชีเพื่อเก็บประกาศไว้ ข้อมูลที่กรอกไม่หาย ยังไม่ต้องจ่าย',
    acctLoginTitle: 'เข้าสู่ระบบเพื่อบันทึก',
    email: 'อีเมล',
    password: 'ตั้งรหัสผ่าน',
    passwordLogin: 'รหัสผ่าน',
    pwdHint: 'อย่างน้อย 8 ตัวอักษร',
    acceptLead: 'ยอมรับ',
    signupAndSave: 'สมัครและบันทึกฉบับร่าง',
    loginAndSave: 'เข้าสู่ระบบและบันทึก',
    verifyLater: 'ยืนยันอีเมลทีหลังได้ ก่อนเผยแพร่เท่านั้น',
    or: 'หรือ',
    withGoogle: 'ดำเนินการต่อด้วย Google',
    withEmail: 'สมัครด้วยอีเมล',
    haveAccount: 'มีบัญชีแล้ว?',
    noAccount: 'ยังไม่มีบัญชี?',
    toLogin: 'เข้าสู่ระบบ',
    toSignup: 'สมัครสมาชิก',
    close: 'ปิด',
    googleInApp: 'ต้องการใช้ Google? Google ไม่อนุญาตให้เข้าสู่ระบบในเบราว์เซอร์ของแอป Facebook กรุณาเปิดหน้านี้ใน Safari หรือ Chrome ข้อมูลที่กรอกไว้จะไม่ถูกย้ายไปด้วย',
    copyLink: 'คัดลอกลิงก์',
    copied: 'คัดลอกแล้ว',
    badEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
    pwdTooShort: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    needAccept: 'กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว',
    needCaptcha: 'รอให้ช่องยืนยันว่าไม่ใช่บอทขึ้นเครื่องหมายถูกก่อน แล้วกดอีกครั้ง',
    badLogin: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    alreadyRegistered: 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ',
    checkInbox: (email: string) => `เราส่งลิงก์ยืนยันไปที่ ${email} กดลิงก์แล้วกลับมาที่หน้านี้ ข้อมูลที่กรอกไว้ยังอยู่`,

    // ── Email code ──
    codeTitle: 'ยืนยันอีเมลก่อนเผยแพร่',
    codeBody: (email: string) => `เราส่งรหัส 6 หลักไปที่ ${email} เปิดอีเมลแล้วกลับมากรอกที่นี่ หน้านี้ไม่หาย`,
    codeLabel: 'รหัส 6 หลัก',
    codeSend: 'ส่งรหัสไปที่อีเมล',
    codeResend: 'ส่งรหัสใหม่',
    codeResendIn: (s: number) => `ส่งใหม่ได้ใน ${s} วินาที`,
    codeConfirm: 'ยืนยันและไปชำระเงิน',
    codeConfirmOnly: 'ยืนยันอีเมล',
    codeWrong: 'รหัสไม่ถูกต้องหรือหมดอายุ',
    codeTooMany: 'กรอกผิดหลายครั้ง กรุณาขอรหัสใหม่',
    codeSendFailed: 'ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อ LINE @spacesmate',
    codeVerified: 'ยืนยันอีเมลแล้ว',
    codeIntro: 'ก่อนชำระเงินครั้งแรก กรุณายืนยันอีเมลของคุณ',
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

    login: 'Log in',
    dashboard: 'My listings',

    stepOf: (n: number) => `Step ${n} of 4`,
    stepNames: ['Your room', 'Photos', 'Price and contact', 'Publish'],
    stepShort: ['Room', 'Photos', 'Price/contact', 'Publish'],
    next: 'Next',
    back: 'Back',
    saveDraftShort: 'Save draft',
    noAccountYet: 'No account needed yet. What you type is saved on this device automatically.',
    savedLocally: 'Saved on this device',
    restored: 'We restored what you typed last time.',
    startOver: 'Start over',
    publishHeading: 'Check and publish',
    publishBody: 'Save your listing, then choose a package on the payment page. It goes live as soon as you pay.',
    promoHint: (code: string) => `Use code ${code} at payment: Basic is ฿0 for the first month.`,

    acctTitle: 'Save your draft',
    acctBody: 'Create an account to keep your listing. Nothing you typed is lost, and there is nothing to pay yet.',
    acctLoginTitle: 'Log in to save',
    email: 'Email',
    password: 'Choose a password',
    passwordLogin: 'Password',
    pwdHint: 'At least 8 characters',
    acceptLead: 'I accept the',
    signupAndSave: 'Sign up and save draft',
    loginAndSave: 'Log in and save',
    verifyLater: 'You can confirm your email later, before publishing.',
    or: 'or',
    withGoogle: 'Continue with Google',
    withEmail: 'Sign up with email',
    haveAccount: 'Already have an account?',
    noAccount: 'No account yet?',
    toLogin: 'Log in',
    toSignup: 'Sign up',
    close: 'Close',
    googleInApp: 'Want to use Google? Google does not allow sign-in inside the Facebook app browser. Open this page in Safari or Chrome. What you typed here will not move with it.',
    copyLink: 'Copy link',
    copied: 'Copied',
    badEmail: 'Please check the email address',
    pwdTooShort: 'The password needs at least 8 characters',
    needAccept: 'Please accept the Terms and the Privacy Policy',
    needCaptcha: 'Wait for the "not a bot" check to show a tick, then try again',
    badLogin: 'Email or password is incorrect',
    alreadyRegistered: 'This email already has an account. Please log in.',
    checkInbox: (email: string) => `We sent a confirmation link to ${email}. Open it, then come back to this page. What you typed is still here.`,

    codeTitle: 'Confirm your email before publishing',
    codeBody: (email: string) => `We sent a 6-digit code to ${email}. Open your email and type it here. This page stays as it is.`,
    codeLabel: '6-digit code',
    codeSend: 'Email me a code',
    codeResend: 'Send a new code',
    codeResendIn: (s: number) => `New code in ${s}s`,
    codeConfirm: 'Confirm and go to payment',
    codeConfirmOnly: 'Confirm email',
    codeWrong: 'That code is wrong or has expired',
    codeTooMany: 'Too many wrong tries. Please ask for a new code.',
    codeSendFailed: 'We could not send the email. Please try again, or message LINE @spacesmate.',
    codeVerified: 'Email confirmed',
    codeIntro: 'Before your first payment, please confirm your email.',
  },
} as const

export type SubmitNewStrings = (typeof SUBMIT_NEW_T)[Locale]
