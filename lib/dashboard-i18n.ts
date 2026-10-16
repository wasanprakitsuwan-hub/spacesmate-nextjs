/**
 * The owner dashboard — where a customer lands after paying.
 *
 * WHY THIS ONE IS NOT JUST LABELS
 *   Three kinds of string here are statements the business has to stand behind,
 *   and they are the reason this file exists rather than a quick find-replace:
 *
 *   1 · confirm() dialogs. `unpublishConfirm` and `deleteConfirm` are the last
 *       thing between an owner and an irreversible action. Before this, an
 *       English owner clicked OK on a Thai sentence. Each one must say exactly
 *       what happens and what becomes of the slot.
 *
 *   2 · Anything about money. `prorationNote` describes how Stripe charges a
 *       mid-term upgrade; `cancelAtPeriodEnd` and `cancelImmediate` describe
 *       what an owner keeps after cancelling. These are promises. If the
 *       billing behaviour changes, these change in both languages in the same
 *       commit — same rule as the consent line in lib/auth-i18n.
 *
 *   3 · Slot mechanics. A slot is capacity, not a listing: one slot publishes
 *       one listing, and swapping which listing occupies it is free and
 *       instant. Owners get this wrong and open support tickets, so the
 *       English has to carry the whole idea, not a literal rendering of it.
 *
 * NOTHING HERE IS A STORED VALUE
 *   Checked before translating, because a display string doubling as a stored
 *   value has caught this codebase four times (districts, amenities, room
 *   types, the manage form). The dashboard writes `form` straight through to
 *   /api/owner/listings, and every value in it is already a stable key chosen
 *   elsewhere. The package and property-type labels come from typeLabel() and
 *   pkgLabel() in SharedListingForm, which map a stored id to a label.
 */
export type Locale = 'th' | 'en'

export const DASH_T = {
  th: {
    // ── Chrome ──
    myListings: 'ประกาศของฉัน',
    newListing: 'ลงประกาศใหม่',
    signOut: 'ออกจากระบบ',
    website: 'เว็บไซต์',

    // ── Common ──
    loading: 'กำลังโหลด...',
    saving: 'กำลังบันทึก...',
    cancel: 'ยกเลิก',
    back: 'กลับ',
    error: 'เกิดข้อผิดพลาด',
    days: 'วัน',
    months: 'เดือน',
    year: 'ปี',
    slots: 'สล็อต',
    unlimited: 'ไม่จำกัด',

    // ── Listing list ──
    allListings: 'ประกาศทั้งหมด',
    listingTable: 'รายการประกาศ',
    noListings: 'ยังไม่มีประกาศ',
    startFirst: 'เริ่มต้นลงประกาศทรัพย์สินแรกของคุณวันนี้',
    addListing: 'เพิ่มประกาศใหม่',
    colProperty: 'ทรัพย์สิน',
    colType: 'ประเภท',
    colPrice: 'ราคา',
    colStatus: 'สถานะ',
    colPackage: 'แพ็กเกจ',
    editListing: 'แก้ไขประกาศ',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',

    // ── Statuses ──
    statusPublished: 'เผยแพร่อยู่',
    statusDraft: 'ฉบับร่าง',
    statusPending: 'รอตรวจสอบ',
    statusExpired: 'หมดอายุแล้ว',
    statusDisabled: 'ปิดใช้งาน',

    // ── Publish / unpublish ──
    publish: 'เผยแพร่',
    publishListing: 'เผยแพร่ประกาศ',
    publishNow: 'ประกาศจะเผยแพร่บนเว็บไซต์ทันที',
    publishFailed: 'เผยแพร่ไม่สำเร็จ',
    unpublish: 'นำประกาศลง — สล็อตจะว่างและใช้กับประกาศอื่นได้ตามวันที่เหลือ',
    /** confirm(). States the consequence and what happens to the slot. */
    unpublishConfirm: 'นำประกาศนี้ลงจากเว็บไซต์?\n\nประกาศจะกลับไปเป็นฉบับร่าง และสล็อตจะว่างพร้อมวันที่เหลือ — ใช้กับประกาศอื่นได้ทันที',
    deleteConfirm: 'ลบประกาศนี้?',
    delete: 'ลบ',

    // ── Slots ──
    noFreeSlot: 'ไม่มีสล็อตว่าง — ซื้อสล็อตเพื่อเผยแพร่',
    noFreeSlotDraft: 'ยังไม่มีสล็อตว่าง — ประกาศจะถูกบันทึกเป็นฉบับร่าง',
    slotsFull: 'สล็อตใช้งานครบแล้ว — เขียนประกาศเก็บเป็นฉบับร่างได้',
    freeSlots: 'สล็อตว่าง',
    unusedSlot: 'ยังไม่ได้ใช้สล็อต',
    buySlots: 'ซื้อสล็อต',
    buyMoreSlots: 'ซื้อสล็อตเพิ่ม',
    buyToRepublish: 'ซื้อสล็อตเพื่อเผยแพร่อีกครั้ง',
    republishNote: 'ประกาศเดิมจะกลับมาเผยแพร่ทันทีหลังชำระเงิน — ข้อมูลทรัพย์สินทั้งหมดยังอยู่ครบ',
    /** alert() after saving with no free slot. Explains why it is not live. */
    savedAsDraft: 'บันทึกเป็นฉบับร่างแล้ว ✓\n\nประกาศถูกเก็บไว้ครบถ้วน แต่ยังไม่แสดงบนเว็บไซต์ เนื่องจากยังไม่มีสล็อตว่าง\n1 สล็อต = เผยแพร่ได้ 1 ประกาศ — ซื้อสล็อตแล้วกด "เผยแพร่" ได้ทันที ไม่ต้องกรอกใหม่',

    // ── Packages ──
    myPackages: 'แพ็กเกจของฉัน',
    noActivePackage: 'ยังไม่มีแพ็กเกจที่ใช้งานอยู่',
    buyToStart: 'ซื้อแพ็กเกจเพื่อเริ่มลงประกาศทรัพย์สินของคุณ',
    viewPackages: 'ดูแพ็กเกจ',
    active: 'ใช้งานอยู่',
    expires: 'หมดอายุ',
    expiresOn: 'หมดอายุ:',
    neverExpires: 'ไม่หมดอายุ',
    expiringSoon: 'ใกล้หมดอายุ (7 วัน)',
    renew: 'ต่ออายุ',
    goToPayment: 'ไปชำระเงิน',

    // ── Upgrade. Money. ──
    upgrade: 'อัปเกรด',
    upgradePackage: 'อัปเกรดแพ็กเกจ',
    upgrading: 'กำลังอัปเกรด...',
    confirmUpgrade: 'ยืนยันอัปเกรด',
    upgradeFailed: 'อัปเกรดไม่สำเร็จ',
    currentlyLabel: 'ปัจจุบัน:',
    prorationNote: 'จะคิดค่าใช้จ่ายเฉพาะส่วนต่างของวันที่เหลืออยู่ในรอบปัจจุบัน (Proration) ทันทีที่ยืนยัน',

    // ── Cancel. Money. ──
    cancelling: 'กำลังยกเลิก...',
    confirmCancel: 'ยืนยันการยกเลิก?',
    confirmCancelPackage: 'ยืนยันการยกเลิกแพ็กเกจ?',
    confirmCancelBtn: 'ยืนยันยกเลิก',
    cancelFailed: 'ยกเลิกไม่สำเร็จ',
    cancelled: 'ยกเลิกแล้ว — ใช้งานถึงวันหมดอายุ',
    cancelAtPeriodEnd: 'ประกาศจะยังเผยแพร่ได้จนถึงวันหมดอายุ — ระบบจะไม่เรียกเก็บเงินรอบถัดไป',
    cancelImmediate: 'ประกาศจะหยุดการเผยแพร่ทันที และแพ็กเกจจะถูกยกเลิก การดำเนินการนี้ไม่สามารถยกเลิกได้',
    affectedListings: 'ประกาศที่ได้รับผลกระทบ',
    listingLabel: 'ประกาศ:',
    noListingNamed: 'ไม่ระบุประกาศ',

    // ── Validation ──
    needTitle: 'กรุณากรอกชื่อประกาศ',
    needPrice: 'กรุณากรอกราคาเช่า',
    needStartPrice: 'กรุณากรอกราคาเริ่มต้น',
    needRoomType: 'กรุณาเพิ่มอย่างน้อย 1 ประเภท',
    failed: 'ไม่สำเร็จ',


    // ── Composed ──
    packageNamed: (label: string) => `แพ็กเกจ ${label}`,
    unusedN: (n: number) => `ยังไม่ได้ใช้ ${n} สล็อต`,
    usedOfTotal: (used: number, total: number) => `— ใช้ ${used} จาก ${total} สล็อต`,
    daysLeft: (n: number) => `เหลือ ${n} วัน`,
    expiresWithDays: (date: string, days: number | null) =>
      `หมดอายุ: ${date}${days !== null ? ` (เหลือ ${days} วัน)` : ''}`,
    affectedN: (n: number, titles: string) => `ประกาศที่ได้รับผลกระทบ (${n}): ${titles}`,
    listingNamed: (title: string) => `ประกาศ: ${title}`,
    perDays: (n: number) => `/ ${n} วัน`,
    perMonths: (n: number) => `/ ${n} เดือน`,
    perYear: '/ ปี',
    planDesc: (months: number, images: number) =>
      `เผยแพร่ได้ ${months} เดือน · อัปโหลดรูปสูงสุด ${images} ภาพ`,
    uploadUpTo: (images: number) => `อัปโหลดรูปสูงสุด ${images} ภาพ`,
    prorationStripe: 'Stripe จะคิดค่าใช้จ่ายเฉพาะส่วนต่างของวันที่เหลืออยู่ในรอบปัจจุบัน (Proration) ทันทีที่ยืนยัน',
    toPublish: 'เพื่อเผยแพร่',
    whenReady: 'เมื่อพร้อมเผยแพร่',
    save: 'บันทึก',
    later: 'ไว้ทีหลัง',
    phoneIncomplete: 'กรุณากรอกเบอร์โทรให้ครบถ้วน',
    addPhoneTitle: 'เพิ่มเบอร์โทรติดต่อ',
    addPhoneBody: 'เพื่อให้ผู้เช่าและทีมงาน SpacesMate ติดต่อคุณได้ — ใช้เวลาไม่ถึงนาที',
    // ── Profile ──
    profileTitle: 'ข้อมูลส่วนตัว',
    profileSub: 'จัดการข้อมูลโปรไฟล์และการตั้งค่าบัญชี',
    loadingData: 'กำลังโหลดข้อมูล...',
    fullName: 'ชื่อ-นามสกุล',
    fullNamePlaceholder: 'ชื่อจริง นามสกุล',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    saveProfile: 'บันทึกข้อมูล',
    saveOk: 'บันทึกข้อมูลสำเร็จแล้ว',
    saveFailed: 'บันทึกไม่สำเร็จ',
    emailLocked: 'ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    newPassword: 'รหัสผ่านใหม่',
    confirmNewPassword: 'ยืนยันรหัสผ่านใหม่',
    min8: 'อย่างน้อย 8 ตัวอักษร',
    savePassword: 'บันทึกรหัสผ่านใหม่',
    passwordOk: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
    passwordFailed: 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
    passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
    noPackageYet: 'ยังไม่มีแพ็กเกจ',
    noActivePackageProfile: 'คุณยังไม่มีแพ็กเกจที่ใช้งานอยู่',
    viewAllPackages: 'ดูแพ็กเกจทั้งหมด',
  },

  en: {
    myListings: 'My listings',
    newListing: 'New listing',
    signOut: 'Sign out',
    website: 'Website',

    loading: 'Loading…',
    saving: 'Saving…',
    cancel: 'Cancel',
    back: 'Back',
    error: 'Something went wrong',
    days: 'days',
    months: 'months',
    year: 'year',
    slots: 'slots',
    unlimited: 'Unlimited',

    allListings: 'All listings',
    listingTable: 'Your listings',
    noListings: 'No listings yet',
    startFirst: 'Put your first property up today',
    addListing: 'Add a listing',
    colProperty: 'Property',
    colType: 'Type',
    colPrice: 'Price',
    colStatus: 'Status',
    colPackage: 'Package',
    editListing: 'Edit listing',
    saveChanges: 'Save changes',

    statusPublished: 'Live',
    statusDraft: 'Draft',
    statusPending: 'Under review',
    statusExpired: 'Expired',
    statusDisabled: 'Disabled',

    publish: 'Publish',
    publishListing: 'Publish listing',
    publishNow: 'The listing goes live on the website immediately',
    publishFailed: 'Could not publish',
    unpublish: 'Take it down — the slot frees up, keeping its remaining days, for another listing',
    /**
     * confirm(). Says what happens and what becomes of the slot, because the
     * owner is about to remove a live listing and cannot undo the click.
     */
    unpublishConfirm: 'Take this listing off the website?\n\nIt goes back to being a draft, and the slot frees up with its remaining days — you can use it for another listing straight away.',
    deleteConfirm: 'Delete this listing?',
    delete: 'Delete',

    noFreeSlot: 'No free slot — buy one to publish',
    noFreeSlotDraft: 'No free slot yet — the listing will be saved as a draft',
    slotsFull: 'All slots in use — you can still write listings and keep them as drafts',
    freeSlots: 'Free slots',
    unusedSlot: 'Slot not in use',
    buySlots: 'Buy a slot',
    buyMoreSlots: 'Buy more slots',
    buyToRepublish: 'Buy a slot to publish it again',
    republishNote: 'The listing goes live again as soon as you pay — everything you entered is still there',
    savedAsDraft: 'Saved as a draft ✓\n\nEverything you entered is kept, but it is not on the website yet because no slot is free.\n1 slot = 1 published listing. Buy a slot and press "Publish" — there is nothing to fill in again.',

    myPackages: 'My packages',
    noActivePackage: 'No active package',
    buyToStart: 'Buy a package to start listing your properties',
    viewPackages: 'See packages',
    active: 'Active',
    expires: 'Expires',
    expiresOn: 'Expires:',
    neverExpires: 'Never expires',
    expiringSoon: 'Expiring soon (7 days)',
    renew: 'Renew',
    goToPayment: 'Go to payment',

    upgrade: 'Upgrade',
    upgradePackage: 'Upgrade package',
    upgrading: 'Upgrading…',
    confirmUpgrade: 'Confirm upgrade',
    upgradeFailed: 'Could not upgrade',
    currentlyLabel: 'Currently:',
    /**
     * How Stripe actually bills a mid-term upgrade. "Only the difference" and
     * "charged as soon as you confirm" are both load-bearing — an owner who
     * expects a full charge, or a charge later, will dispute it.
     */
    prorationNote: 'You are charged only the difference for the days left in the current term (proration), as soon as you confirm.',

    cancelling: 'Cancelling…',
    confirmCancel: 'Confirm cancellation?',
    confirmCancelPackage: 'Cancel this package?',
    confirmCancelBtn: 'Confirm cancellation',
    cancelFailed: 'Could not cancel',
    cancelled: 'Cancelled — active until the expiry date',
    cancelAtPeriodEnd: 'Your listing stays live until the expiry date — you will not be charged for the next term.',
    cancelImmediate: 'The listing stops being published immediately and the package is cancelled. This cannot be undone.',
    affectedListings: 'Listings affected',
    listingLabel: 'Listing:',
    noListingNamed: 'No listing named',

    needTitle: 'Please enter a listing title',
    needPrice: 'Please enter a rent',
    needStartPrice: 'Please enter a starting price',
    needRoomType: 'Please add at least one type',
    failed: 'failed',


    packageNamed: (label: string) => `${label} package`,
    unusedN: (n: number) => `${n} slots not in use`,
    usedOfTotal: (used: number, total: number) => `— ${used} of ${total} slots in use`,
    daysLeft: (n: number) => `${n} days left`,
    expiresWithDays: (date: string, days: number | null) =>
      `Expires: ${date}${days !== null ? ` (${days} days left)` : ''}`,
    affectedN: (n: number, titles: string) => `Listings affected (${n}): ${titles}`,
    listingNamed: (title: string) => `Listing: ${title}`,
    perDays: (n: number) => `/ ${n} days`,
    perMonths: (n: number) => `/ ${n} months`,
    perYear: '/ year',
    planDesc: (months: number, images: number) =>
      `Publish for ${months} ${months === 1 ? 'month' : 'months'} · up to ${images} photos`,
    uploadUpTo: (images: number) => `Up to ${images} photos`,
    /** Named Stripe explicitly, as the Thai does — it is who takes the money. */
    prorationStripe: 'Stripe charges you only the difference for the days left in the current term (proration), as soon as you confirm.',

    toPublish: 'to publish it',
    whenReady: 'when you are ready to publish',
    save: 'Save',
    later: 'Later',
    phoneIncomplete: 'Please enter your full phone number',
    addPhoneTitle: 'Add a contact number',
    addPhoneBody: 'So tenants and the SpacesMate team can reach you — it takes less than a minute',
    profileTitle: 'Your details',
    profileSub: 'Manage your profile and account settings',
    loadingData: 'Loading your details…',
    fullName: 'Full name',
    fullNamePlaceholder: 'First name and surname',
    email: 'Email',
    phone: 'Phone number',
    saveProfile: 'Save',
    saveOk: 'Saved',
    saveFailed: 'Could not save',
    emailLocked: 'Your email cannot be changed here at the moment',
    changePassword: 'Change password',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    min8: 'At least 8 characters',
    savePassword: 'Save new password',
    passwordOk: 'Password changed',
    passwordFailed: 'Could not change the password',
    passwordTooShort: 'Your password needs at least 8 characters',
    passwordMismatch: 'The two passwords do not match',
    noPackageYet: 'No package yet',
    noActivePackageProfile: 'You do not have an active package',
    viewAllPackages: 'See all packages',
  },
} as const

export type DashStrings = (typeof DASH_T)[Locale]
