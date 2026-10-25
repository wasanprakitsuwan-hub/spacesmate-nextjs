/**
 * The listing wizard, per locale.
 *
 * This is the form an owner fills in to publish a listing, shared by
 * /list-your-property/new and the owner dashboard. It is the longest single piece of copy
 * on the site and the one with the most ways to go wrong, so a few rules:
 *
 * WHAT IS NEVER TRANSLATED
 *   Anything the form *stores*. The labels here are what the owner reads; the
 *   values written to the database are stable keys or canonical Thai, chosen
 *   elsewhere:
 *     · room types   — lib/room-types, keys like 'bed_1'
 *     · amenities    — lib/amenities, stored as name_th in both locales
 *     · facing       — 'N', 'S', 'E'… in SharedListingForm
 *     · other charges— 'common_fee', 'parking'…
 *     · bedroom count— '1'–'4'
 *   Translating a stored value fragments the data across two languages and
 *   shows whichever the owner happened to use to every visitor. That has
 *   happened three times in this codebase already — district names, amenity
 *   spellings, room types — and each one cost a migration.
 *
 * WHAT THE OWNER IS AGREEING TO
 *   This form ends at Stripe. Where the Thai states a limit or a consequence —
 *   the package image allowance, that extra photos are kept but not shown, that
 *   the slug cannot be edited — the English says the same and no more.
 */
export type Locale = 'th' | 'en'

export const WIZARD_T = {
  th: {
    // ── Units and counters ──
    /** "12 เดือน". Thai has no plural form; English does. */
    monthN: (n: number) => `${n} เดือน`,
    perMonth: '/เดือน',
    photos: 'รูป',
    canAddMoreN: (n: number) => `เพิ่มได้อีก ${n} รูป`,

    // ── Unit identity ──
    unitNo: 'เลขห้อง / Unit No.',

    /**
     * The package image rule, split so the package name stays bold.
     *   {before}<strong>basic</strong>{after(shown, hidden)}
     * The two halves are never shown apart, so a change to one belongs with a
     * change to the other.
     */
    imgRuleBefore: 'แพ็กเกจ ',
    imgRuleAfter: (shown: number, hidden: number) =>
      ` แสดงรูปได้ ${shown} รูปแรก — อีก ${hidden} รูป จะถูกเก็บไว้แต่ยังไม่แสดงบนเว็บไซต์`,
    imgRuleReorder: 'ลากสลับลำดับหรือกดตั้งหน้าปกเพื่อเลือกว่ารูปไหนจะแสดง · อัปเกรดแพ็กเกจแล้วรูปที่เหลือจะแสดงทันที โดยไม่ต้องอัปโหลดใหม่',

    /** Same split, around <strong>Premium</strong>. */
    videoRuleBefore: 'วิดีโอแสดงบนเว็บไซต์เฉพาะแพ็กเกจ ',
    videoRuleAfter: ' — เพิ่มไว้ตอนนี้ได้เลย ',

    // ── Charges and deposits ──
    commonFee: 'ค่าส่วนกลาง',
    parking: 'ค่าจอดรถ',
    internet: 'ค่าอินเทอร์เน็ต',
    fridge: 'ค่าเช่าตู้เย็น',
    tv: 'ค่าเช่าโทรทัศน์',
    microwave: 'ค่าเช่าไมโครเวฟ',

    // ── Facing ──
    facingN: 'ทิศเหนือ (N)',
    facingS: 'ทิศใต้ (S)',
    facingE: 'ทิศตะวันออก (E)',
    facingW: 'ทิศตะวันตก (W)',
    facingNE: 'ทิศตะวันออกเฉียงเหนือ (NE)',
    facingNW: 'ทิศตะวันตกเฉียงเหนือ (NW)',
    facingSE: 'ทิศตะวันออกเฉียงใต้ (SE)',
    facingSW: 'ทิศตะวันตกเฉียงใต้ (SW)',
    chooseFacing: '-- เลือกทิศ --',

    // ── Property types ──
    typeCondo: 'คอนโด',
    typeApartment: 'อพาร์ทเม้นท์',
    typeHouse: 'บ้าน',
    typeOffice: 'ออฟฟิศ',

    // ── Unit grid ──
    colRoomType: 'ประเภทห้อง',
    colSize: 'ขนาด (ตร.ม.)',
    col12m: 'สัญญา 12 เดือน (บาท/เดือน)',
    colDaily: 'ราคา/วัน',
    shorterTerms: 'สัญญาสั้นกว่า:',
    addRoomType: 'เพิ่มประเภทห้อง',

    // ── Property identity ──
    projectName: 'ชื่อโครงการ / หมู่บ้าน',
    condoName: 'ชื่อคอนโด',
    projectPlaceholder: 'เช่น บ้านปลายฟ้า พระราม 9',
    condoPlaceholder: 'เช่น ลุมพินี สยาม-ราชเทวี',
    houseNo: 'บ้านเลขที่ / เลขห้อง',
    houseNoPlaceholder: 'เช่น 88/10',
    floorsInHouse: 'จำนวนชั้นในบ้าน',
    floorNo: 'ชั้นที่',
    facingHouse: 'ทิศทางบ้าน / หน้าบ้านหันไปทาง',
    facingRoom: 'ทิศทางห้อง',
    usableArea: 'พื้นที่ใช้สอย (ตร.ม.)',

    // ── Rent by term ──
    rentByTerm: 'ราคาเช่าตามระยะสัญญา',
    searchUses12m: 'ราคาที่แสดงในหน้าค้นหาจะใช้ราคา 12 เดือน (ต่ำสุด)',

    // ── Deposits ──
    securityDeposit: 'เงินประกัน (เดือน)',
    typically2: 'โดยทั่วไป 2 เดือน',
    advanceRent: 'เงินล่วงหน้า (เดือน)',
    typically1: 'โดยทั่วไป 1 เดือน',
    keyDepositBaht: 'เงินมัดจำกุญแจ (บาท) — ไม่บังคับ',
    eg500: 'เช่น 500',
    baht: 'บาท',
    blankHidesRow: 'หากเว้นว่าง จะไม่แสดงรายการนี้บนหน้าประกาศ',

    // ── Utility rate types ──
    rateFixed: 'ราคาคงที่ (บาท/หน่วย)',
    rateMin: 'ราคาขั้นต่ำ',
    rateGov: 'ตามเรทรัฐ',
    rateAsk: 'สอบถามเจ้าของ',
    govRateNote: 'คิดตามอัตราของการไฟฟ้า/การประปานครหลวง — ไม่ต้องระบุตัวเลข ระบบจะแสดงว่า "ตามเรทรัฐ"',
    bahtPerUnit: 'บาท / หน่วย',
    pricePerUnit: 'ราคาต่อหน่วย (บาท)',
    unit: 'หน่วย',
    minPerMonth: 'ราคาขั้นต่ำ (บาท/เดือน)',
    whicheverHigher: 'เรียกเก็บ "ราคาที่สูงกว่า" ระหว่าง (ราคา/หน่วย × จำนวนหน่วย) กับราคาขั้นต่ำ',
    water: 'ค่าน้ำประปา (ต่อหน่วย)',
    electricity: 'ค่าไฟฟ้า (ต่อหน่วย)',
    depositMonths: 'เงินมัดจำ (เดือน)',
    otherCharges: 'ค่าใช้จ่ายอื่น ๆ (เลือกที่เรียกเก็บ)',
    bahtPerMonth: 'บาท/เดือน',

    // ── Map ──
    propertyLocation: 'ตำแหน่งอสังหาฯ',
    dragPin: 'ลากหมุดหรือคลิกบนแผนที่เพื่อปรับตำแหน่ง',
    cantReadCoords: 'ไม่สามารถอ่านพิกัดจากลิงก์นี้ได้',
    cantExpandShort: 'ไม่สามารถขยายลิงก์สั้นได้',
    badLink: 'ลิงก์ไม่ถูกต้อง — ลองใช้ "แชร์ตำแหน่ง" แล้ววางที่นี่',
    pasteLink: 'วางลิงก์ Google Maps ที่นี่... (วิธีแนะนำ)',
    getCoords: 'ดึงพิกัด',
    pasteHint: 'วางลิงก์จาก Google Maps แล้วพิกัดจะดึงอัตโนมัติ หรือค้นหาด้านล่าง / คลิกบนแผนที่',
    searchNearby: 'ค้นหาชื่อโครงการ / ที่อยู่ใกล้เคียง แล้วกด',
    search: 'ค้นหา',
    close: 'ปิด',
    dragToAdjust: 'ลากหมุดหรือคลิกบนแผนที่เพื่อปรับ',
    clickMapHint: 'คลิกบนแผนที่ ลากหมุด หรือค้นหาชื่อสถานที่ด้านบน',
    latitude: 'ละติจูด',
    longitude: 'ลองจิจูด',

    // ── Address ──
    address: 'ที่อยู่ (ชื่ออาคาร / ถนน / เลขที่)',
    addressPlaceholder: 'เช่น 123 ถนนพระราม 4',
    province: 'จังหวัด',
    loading: 'กำลังโหลด…',
    chooseProvince: 'เลือกจังหวัด',
    district: 'เขต / อำเภอ',
    chooseProvinceFirst: 'เลือกจังหวัดก่อน',
    chooseDistrict: 'เลือกเขต / อำเภอ',
    subDistrict: 'แขวง / ตำบล',
    chooseDistrictFirst: 'เลือกเขต/อำเภอก่อน',
    chooseSubDistrict: 'เลือกแขวง / ตำบล',
    postcode: 'รหัสไปรษณีย์',

    // ── Images ──
    connectFailed: 'เชื่อมต่อไม่ได้',
    maxImagesForPackage: (n: number) => `แพ็กเกจนี้อัปโหลดได้สูงสุด ${n} รูป`,
    uploadFailed: 'อัปโหลดไม่สำเร็จ',
    uploading: 'กำลังอัปโหลด',
    uploadedMax: (n: number) => `อัปโหลดครบ ${n} รูปแล้ว (สูงสุดของแพ็กเกจนี้)`,
    chooseImages: 'เลือกรูปภาพ',
    reachedMax: 'อัปโหลดครบจำนวนสูงสุดแล้ว',
    notShown: 'ยังไม่แสดง',
    cover: 'หน้าปก',
    setCover: 'ตั้งหน้าปก',
    clickToSetCover: 'คลิกบนรูปเพื่อตั้งเป็นรูปหน้าปก รูปแรกจะแสดงเป็นหน้าปกบนเว็บไซต์',
    fadedNotShown: 'รูปที่จางคือรูปที่ยังไม่แสดงบนเว็บไซต์',

    // ── Video ──
    videoKeptForUpgrade: 'ระบบจะเก็บไว้ให้ และจะแสดงทันทีเมื่ออัปเกรด โดยไม่ต้องใส่ลิงก์ใหม่',
    uploadingEllipsis: 'กำลังอัปโหลด...',
    uploadVideo: 'อัปโหลดวิดีโอ (สูงสุด 50 MB)',
    orPasteVideoLink: 'หรือวางลิงก์วิดีโอ (YouTube / TikTok)',
    remove: 'ลบ',

    // ── Package / sections ──
    listingPackage: 'แพ็กเกจประกาศ',
    neverExpires: 'ไม่มีวันหมดอายุ — อยู่บนเว็บจนกว่าจะลบ',
    expires: 'หมดอายุ:',
    mainInfo: 'ข้อมูลหลัก',
    propertyType: 'ประเภทอสังหาฯ',
    titleTh: 'ชื่อประกาศ (ภาษาไทย)',
    titleThPlaceholder: 'เช่น เช่าคอนโด เอกมัย ห้องสวย วิวดี',
    titleEn: 'ชื่อประกาศ (ภาษาอังกฤษ)',
    ofListing: 'ของประกาศ',
    slugAuto: 'สร้างอัตโนมัติจากชื่อประกาศ — ไม่สามารถแก้ไขได้ เพื่อไม่ให้ลิงก์เดิมเสีย',
    roomTypesAndPrices: 'ประเภทและราคาห้อง',
    addEachRoomType: 'เพิ่มแต่ละประเภทห้องพร้อมขนาดและราคา (ราคาในหน้าค้นหาจะดึงจาก ต่ำสุด–สูงสุด ของตาราง)',
    rentalDetail: 'รายละเอียดการเช่า',
    spaceTypesAndPrices: 'ประเภทและราคาพื้นที่',
    addEachSpaceType: 'เพิ่มแต่ละประเภทพื้นที่พร้อมขนาดและราคา',
    sizeAndLayout: 'ขนาดและลักษณะ',
    floorLocated: 'ชั้นที่ตั้ง',
    bedrooms: 'ห้องนอน',
    /** Thai has no plural form, so the count is just prefixed. */
    roomsN: (n: number) => `${n} ห้อง`,
    bathrooms: 'ห้องน้ำ',
    utilitiesNote: 'ค่าสาธารณูปโภค เงินมัดจำ และค่าใช้จ่ายอื่น ๆ ที่เรียกเก็บ',
    depositsNote: 'เงินประกัน เงินล่วงหน้า และค่ามัดจำอื่น ๆ (เช่น กุญแจ)',
    locationAndAddress: 'ที่ตั้งและที่อยู่',
    mapCoords: 'พิกัดบนแผนที่',
    listingDetail: 'รายละเอียดประกาศ',
    thaiLanguage: 'ภาษาไทย',
    descPlaceholder: 'อธิบายรายละเอียดห้อง ทำเล สิ่งอำนวยความสะดวก และจุดเด่น...',
    amenities: 'สิ่งอำนวยความสะดวก',
    roomImages: 'รูปภาพห้อง',
    firstIsCover: 'รูปแรกจะเป็นรูปหน้าปกของประกาศ',
    listingVideo: 'วิดีโอประกาศ',
    premiumOnly: 'Premium เท่านั้น',
    contactInfo: 'ข้อมูลการติดต่อ',
    contactShownOnListing: 'ข้อมูลนี้จะแสดงในหน้าประกาศเพื่อให้ผู้เช่าติดต่อได้',
    contactName: 'ชื่อผู้ติดต่อ',
    contactNamePlaceholder: 'ชื่อ-นามสกุล หรือชื่อนิติบุคคล',
    phone: 'เบอร์โทรศัพท์',
    or: 'หรือ',
    emailOptional: 'อีเมล — ไม่บังคับ',
    emailBlankNote: 'เว้นว่างได้ — ระบบจะใช้อีเมลจากบัญชีของคุณ',
  },

  en: {
    monthN: (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`,
    perMonth: '/month',
    photos: 'photos',
    canAddMoreN: (n: number) => `${n} more can be added`,

    unitNo: 'Unit number',

    imgRuleBefore: 'The ',
    imgRuleAfter: (shown: number, hidden: number) =>
      ` package shows the first ${shown} photos — the other ${hidden} are kept but not shown on the website`,
    imgRuleReorder: 'Drag to reorder, or set a cover photo, to choose which ones show · upgrade and the remaining photos appear immediately, with nothing to re-upload',

    videoRuleBefore: 'Video shows on the website for the ',
    videoRuleAfter: ' package only — you can add it now. ',

    commonFee: 'Common area fee',
    parking: 'Parking',
    internet: 'Internet',
    fridge: 'Fridge rental',
    tv: 'TV rental',
    microwave: 'Microwave rental',

    facingN: 'North (N)',
    facingS: 'South (S)',
    facingE: 'East (E)',
    facingW: 'West (W)',
    facingNE: 'North-east (NE)',
    facingNW: 'North-west (NW)',
    facingSE: 'South-east (SE)',
    facingSW: 'South-west (SW)',
    chooseFacing: '-- Choose a direction --',

    typeCondo: 'Condo',
    typeApartment: 'Apartment',
    typeHouse: 'House',
    typeOffice: 'Office',

    colRoomType: 'Room type',
    colSize: 'Size (m²)',
    col12m: '12-month contract (baht/month)',
    colDaily: 'Price/day',
    shorterTerms: 'Shorter terms:',
    addRoomType: 'Add a room type',

    projectName: 'Project / village name',
    condoName: 'Condominium name',
    projectPlaceholder: 'e.g. Baan Plai Fah Rama 9',
    condoPlaceholder: 'e.g. Lumpini Siam-Ratchathewi',
    houseNo: 'House / unit number',
    houseNoPlaceholder: 'e.g. 88/10',
    floorsInHouse: 'Floors in the house',
    floorNo: 'Floor',
    facingHouse: 'Which way the house faces',
    facingRoom: 'Which way the room faces',
    usableArea: 'Usable area (m²)',

    rentByTerm: 'Rent by contract length',
    searchUses12m: 'The price shown in search uses the 12-month rate (the lowest)',

    securityDeposit: 'Security deposit (months)',
    typically2: 'Usually 2 months',
    advanceRent: 'Advance rent (months)',
    typically1: 'Usually 1 month',
    keyDepositBaht: 'Key deposit (baht) — optional',
    eg500: 'e.g. 500',
    baht: 'baht',
    blankHidesRow: 'Leave it blank and this line will not appear on the listing',

    rateFixed: 'Fixed rate (baht/unit)',
    rateMin: 'Minimum charge',
    rateGov: 'Government rate',
    rateAsk: 'Ask the owner',
    govRateNote: 'Charged at the MEA/MWA rate — no figure needed, the listing will show "Government rate"',
    bahtPerUnit: 'baht / unit',
    pricePerUnit: 'Price per unit (baht)',
    unit: 'unit',
    minPerMonth: 'Minimum charge (baht/month)',
    whicheverHigher: 'Charges whichever is higher: (price per unit × units used), or the minimum',
    water: 'Water (per unit)',
    electricity: 'Electricity (per unit)',
    depositMonths: 'Deposit (months)',
    otherCharges: 'Other charges (tick the ones you charge)',
    bahtPerMonth: 'baht/month',

    propertyLocation: 'Property location',
    dragPin: 'Drag the pin or click the map to adjust the position',
    cantReadCoords: 'Could not read coordinates from that link',
    cantExpandShort: 'Could not expand that short link',
    badLink: 'That link is not valid — try "Share location" and paste it here',
    pasteLink: 'Paste a Google Maps link here… (easiest way)',
    getCoords: 'Get coordinates',
    pasteHint: 'Paste a Google Maps link and the coordinates fill in automatically — or search below, or click the map',
    searchNearby: 'Search a project name or nearby address, then press',
    search: 'Search',
    close: 'Close',
    dragToAdjust: 'Drag the pin or click the map to adjust',
    clickMapHint: 'Click the map, drag the pin, or search for a place above',
    latitude: 'Latitude',
    longitude: 'Longitude',

    address: 'Address (building / street / number)',
    addressPlaceholder: 'e.g. 123 Rama 4 Road',
    province: 'Province',
    loading: 'Loading…',
    chooseProvince: 'Choose a province',
    district: 'District',
    chooseProvinceFirst: 'Choose a province first',
    chooseDistrict: 'Choose a district',
    subDistrict: 'Sub-district',
    chooseDistrictFirst: 'Choose a district first',
    chooseSubDistrict: 'Choose a sub-district',
    postcode: 'Postcode',

    connectFailed: 'Could not connect',
    maxImagesForPackage: (n: number) => `This package allows up to ${n} photos`,
    uploadFailed: 'Upload failed',
    uploading: 'Uploading',
    uploadedMax: (n: number) => `All ${n} photos uploaded (the maximum for this package)`,
    chooseImages: 'Choose photos',
    reachedMax: 'You have reached the maximum',
    notShown: 'Not shown',
    cover: 'Cover',
    setCover: 'Set as cover',
    clickToSetCover: 'Click a photo to make it the cover. The first photo is the cover on the website.',
    fadedNotShown: 'Faded photos are the ones not yet shown on the website',

    videoKeptForUpgrade: 'We keep it for you and it appears as soon as you upgrade, with no need to add the link again',
    uploadingEllipsis: 'Uploading…',
    uploadVideo: 'Upload a video (up to 50 MB)',
    orPasteVideoLink: 'Or paste a video link (YouTube / TikTok)',
    remove: 'Remove',

    listingPackage: 'Listing package',
    neverExpires: 'Never expires — stays on the site until you delete it',
    expires: 'Expires:',
    mainInfo: 'Main details',
    propertyType: 'Property type',
    titleTh: 'Listing title (Thai)',
    titleThPlaceholder: 'e.g. Condo for rent, Ekkamai, bright room with a view',
    titleEn: 'Listing title (English)',
    ofListing: 'of the listing',
    slugAuto: 'Generated from the listing title and not editable, so existing links keep working',
    roomTypesAndPrices: 'Room types and prices',
    addEachRoomType: 'Add each room type with its size and price (search shows the lowest to highest from this table)',
    rentalDetail: 'Rental details',
    spaceTypesAndPrices: 'Space types and prices',
    addEachSpaceType: 'Add each type of space with its size and price',
    sizeAndLayout: 'Size and layout',
    floorLocated: 'Floor',
    bedrooms: 'Bedrooms',
    roomsN: (n: number) => `${n} ${n === 1 ? 'room' : 'rooms'}`,
    bathrooms: 'Bathrooms',
    utilitiesNote: 'Utilities, deposits and any other charges you make',
    depositsNote: 'Security deposit, advance rent and any other deposit (a key deposit, for example)',
    locationAndAddress: 'Location and address',
    mapCoords: 'Map coordinates',
    listingDetail: 'Listing description',
    thaiLanguage: 'Thai',
    descPlaceholder: 'Describe the room, the area, the amenities and what makes it stand out…',
    amenities: 'Amenities',
    roomImages: 'Photos',
    firstIsCover: 'The first photo is the listing cover',
    listingVideo: 'Listing video',
    premiumOnly: 'Premium only',
    contactInfo: 'Contact details',
    contactShownOnListing: 'These are shown on the listing so renters can get in touch',
    contactName: 'Contact name',
    contactNamePlaceholder: 'Full name, or company name',
    phone: 'Phone number',
    or: 'or',
    emailOptional: 'Email — optional',
    emailBlankNote: 'Leave blank and we will use the email on your account',
  },
} as const

export type WizardStrings = (typeof WIZARD_T)[Locale]
