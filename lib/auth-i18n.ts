/**
 * The sign-in / sign-up modal.
 *
 * WHY THIS ONE MATTERS MORE THAN A NORMAL TRANSLATION
 *   The sign-up tab ends with "creating an account means you accept the Terms
 *   and the Privacy Policy". Until now that sentence was Thai for everyone, and
 *   its two links went to the Thai documents — so an English-reading owner
 *   agreed to terms they had not been shown in a language they read.
 *
 *   The links are resolved through localeHref at the call site, so an English
 *   reader is sent to /en/terms and /en/privacy. Both of those exist, and both
 *   end with a clause saying the Thai version governs if the two disagree —
 *   which is the honest position and is stated in lib/legal-i18n.
 *
 *   If the wording of this sentence changes, it changes in both languages in
 *   the same commit. It is the record of what the person agreed to.
 *
 * VALIDATION IS THAI-SPECIFIC ON PURPOSE
 *   The phone rule is /^0[6-9]\d{8}$/ — a Thai mobile number. That is not an
 *   oversight to be "fixed" in the English copy: the account is for letting
 *   property in Thailand and the team calls these numbers. So the English
 *   message says a Thai mobile number is expected, rather than implying any
 *   international number will do and then rejecting it.
 */
export type Locale = 'th' | 'en'

export const AUTH_T = {
  th: {
    // ── Tabs ──
    login: 'เข้าสู่ระบบ',
    signup: 'สมัครสมาชิก',

    // ── Password strength ──
    pwdWeak: 'อ่อน',
    pwdMedium: 'ปานกลาง',
    pwdStrong: 'แข็งแกร่ง',

    // ── Validation & errors ──
    needEmail: 'กรุณากรอกอีเมล',
    resetSent: (email: string) => `ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${email} แล้ว — กรุณาตรวจสอบอีเมลของคุณ`,
    genericError: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
    needEmailAndPwd: 'กรุณากรอกอีเมลและรหัสผ่าน',
    badCredentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    needAllFields: 'กรุณากรอกข้อมูลให้ครบ',
    badEmail: 'กรุณากรอกอีเมลที่ถูกต้อง เช่น name@email.com',
    badPhone: 'เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเบอร์มือถือ เช่น 081-234-5678',
    pwdMismatch: 'รหัสผ่านไม่ตรงกัน',
    /**
     * 8 — the NIST SP 800-63B floor and the common default across the web.
     * Both front doors (this modal and /login) enforce it as of 17 Oct 2026.
     *
     * This is a client-side check only. The minimum that actually binds is the
     * one configured in Supabase Auth, whose default is 6 — so anything posting
     * straight to the API is governed by that, not by this.
     */
    pwdTooShort: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    pwdNeedsBoth: 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข เช่น SpacesMate88',
    signupFailed: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่',
    signupFailedShort: 'สมัครสมาชิกไม่สำเร็จ',

    // ── Check your email ──
    checkEmailTitle: 'ตรวจสอบอีเมลของคุณ',
    checkEmailSentTo: 'เราส่งลิงก์ยืนยันไปที่',
    checkEmailBodyA: 'กดลิงก์ในอีเมลเพื่อยืนยันตัวตน',
    checkEmailBodyB: 'และระบบจะพาคุณเข้า Owner Dashboard ทันที',
    checkSpamA: 'ไม่ได้รับอีเมล? กรุณาตรวจสอบโฟลเดอร์ ',
    checkSpamB: ' หรือ ',
    close: 'ปิด',
    success: 'สำเร็จ!',

    // ── Forgot password ──
    resetTitle: 'รีเซ็ตรหัสผ่าน',
    resetSub: 'กรอกอีเมลที่ลงทะเบียนไว้ — เราจะส่งลิงก์ให้คุณ',
    email: 'อีเมล',
    sending: 'กำลังส่ง...',
    sendResetLink: 'ส่งลิงก์รีเซ็ตรหัสผ่าน',
    backToLogin: 'กลับไปเข้าสู่ระบบ',

    // ── Login tab ──
    googleLogin: 'เข้าสู่ระบบด้วย Google',
    or: 'หรือ',
    password: 'รหัสผ่าน',
    forgotPwd: 'ลืมรหัสผ่าน?',
    loggingIn: 'กำลังเข้าสู่ระบบ...',
    noAccount: 'ยังไม่มีบัญชี?',
    signupFree: 'สมัครสมาชิกฟรี',

    // ── Signup tab ──
    googleSignup: 'สมัครด้วย Google — ไม่ต้องยืนยันอีเมล',
    fullName: 'ชื่อ-นามสกุล',
    fullNamePlaceholder: 'สมชาย ใจดี',
    phone: 'เบอร์โทรศัพท์',
    pwdPlaceholder: 'อย่างน้อย 8 ตัวอักษร ผสมตัวเลข',
    min8: 'อย่างน้อย 8 ตัวอักษร',
    confirmPwd: 'ยืนยันรหัสผ่าน',
    signingUp: 'กำลังสมัคร...',
    haveAccount: 'มีบัญชีแล้ว?',


    // ── The standalone /login page ──
    loginSub: 'เข้าสู่ระบบเพื่อจัดการประกาศของคุณ',
    signupSub: 'สมัครสมาชิกเพื่อลงประกาศฟรี',
    signingUpLong: 'กำลังสมัครสมาชิก...',
    checkEmailSent: 'เราได้ส่งลิงก์ยืนยันบัญชีไปที่',
    checkEmailAction: 'กรุณาคลิกลิงก์ในอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ',
    checkEmailSpam: 'หากไม่พบอีเมล ให้ตรวจสอบในโฟลเดอร์ Spam',
    fullNameLogin: 'ชื่อ-นามสกุล',
    googleContinue: 'ดำเนินการต่อด้วย Google',
    googleFailed: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
    connecting: 'กำลังเชื่อมต่อ…',
    // ── Consent. Changes in both languages, same commit. ──
    consentLead: 'การสมัครสมาชิกถือว่าคุณยอมรับ',
    terms: 'เงื่อนไขการใช้งาน',
    and: 'และ',
    privacy: 'นโยบายความเป็นส่วนตัว',
  },

  en: {
    login: 'Sign in',
    signup: 'Create account',

    pwdWeak: 'Weak',
    pwdMedium: 'Medium',
    pwdStrong: 'Strong',

    needEmail: 'Please enter your email',
    resetSent: (email: string) => `A password reset link has been sent to ${email} — please check your inbox.`,
    genericError: 'Something went wrong. Please try again.',
    needEmailAndPwd: 'Please enter your email and password',
    badCredentials: 'That email or password is not correct',
    needAllFields: 'Please fill in every field',
    badEmail: 'Please enter a valid email, e.g. name@email.com',
    /** The rule is a Thai mobile number — see the header. */
    badPhone: 'Please enter a Thai mobile number, e.g. 081-234-5678',
    pwdMismatch: 'The two passwords do not match',
    pwdTooShort: 'Your password needs at least 8 characters',
    pwdNeedsBoth: 'Your password needs both letters and numbers, e.g. SpacesMate88',
    signupFailed: 'We could not create the account. Please try again.',
    signupFailedShort: 'We could not create the account',

    checkEmailTitle: 'Check your email',
    checkEmailSentTo: 'We have sent a confirmation link to',
    checkEmailBodyA: 'Open the link in that email to confirm it is you,',
    checkEmailBodyB: 'and you will go straight to your Owner Dashboard.',
    checkSpamA: 'No email? Please check your ',
    checkSpamB: ' or ',
    close: 'Close',
    success: 'Done',

    resetTitle: 'Reset your password',
    resetSub: 'Enter the email you registered with and we will send you a link.',
    email: 'Email',
    sending: 'Sending…',
    sendResetLink: 'Send the reset link',
    backToLogin: 'Back to sign in',

    googleLogin: 'Sign in with Google',
    or: 'or',
    password: 'Password',
    forgotPwd: 'Forgotten your password?',
    loggingIn: 'Signing in…',
    noAccount: 'No account yet?',
    signupFree: 'Create one, free',

    googleSignup: 'Sign up with Google — no email to confirm',
    fullName: 'Full name',
    fullNamePlaceholder: 'Alex Morgan',
    phone: 'Phone number',
    pwdPlaceholder: 'At least 8 characters, with a number',
    min8: 'At least 8 characters',
    confirmPwd: 'Confirm password',
    signingUp: 'Creating your account…',
    haveAccount: 'Already have an account?',


    loginSub: 'Sign in to manage your listings',
    signupSub: 'Create an account and list for free',
    signingUpLong: 'Creating your account…',
    checkEmailSent: 'We have sent a confirmation link to',
    checkEmailAction: 'Click the link in that email to confirm your account before signing in',
    checkEmailSpam: 'If it has not arrived, check your Spam folder',
    fullNameLogin: 'Full name',
    googleContinue: 'Continue with Google',
    googleFailed: 'Could not sign in with Google',
    connecting: 'Connecting…',

    consentLead: 'By creating an account you accept our',
    terms: 'Terms of Use',
    and: 'and',
    privacy: 'Privacy Policy',
  },
} as const

export type AuthStrings = (typeof AUTH_T)[Locale]
