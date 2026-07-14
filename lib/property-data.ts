// ─── SpacesMate Property Listings — Static Fallback Data ─────────────────────

export interface Property {
  id: number             // Internal listing ID
  slug: string           // URL slug for Next.js routing
  title: string
  excerpt: string
  priceMin: number       // Minimum price for filtering (THB/month)
  priceDisplay: string   // Display string e.g. "฿14,000/เดือน"
  bedrooms: number       // 0 = Studio
  bathrooms: number
  size: string           // e.g. "28.19" or "25-32"
  address: string        // Short display address
  neighborhood: string   // e.g. "BTS เอกมัย", "MRT ศูนย์วัฒนธรรม"
  lat: string
  lng: string
  image: string          // Primary / hero image
  images?: string[]      // Additional gallery images (index 0 = hero override if set)
  propertyType: 'Condo' | 'Apartment' | 'Office' | 'Co-Working'
  listingType: 'Rent' | 'Sale' | 'Daily'
  amenities: string[]
  featured: boolean
  date: string
}

export const properties: Property[] = [
  // ── Recently uploaded (6 flagship listings) ──────────────────────────────────
  {
    id: 20329,
    slug: 'metro-luxe-rama-4-unit-318-154-rent-bts-ekkamai',
    title: 'เช่าคอนโด Metro Luxe Rama 4 ชั้น 7 ห้อง 318/154 ใกล้ BTS เอกมัย 28.19 ตร.ม.',
    excerpt: 'คอนโดให้เช่าใกล้ BTS เอกมัย ห้อง 28.19 ตร.ม. ชั้น 7 วิวโล่ง เฟอร์นิเจอร์ครบ พร้อมอยู่',
    priceMin: 14000,
    priceDisplay: '฿14,000/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '28.19',
    address: 'Metro Luxe Rama 4, แขวงพระโขนง เขตคลองเตย',
    neighborhood: 'BTS เอกมัย',
    lat: '13.7117907',
    lng: '100.5803751',
    image: '/properties/metro-luxe-318-154-photo-0.jpg',
    images: [
      '/properties/metro-luxe-318-154-photo-0.jpg',
      '/properties/metro-luxe-318-154-photo-1.jpg',
      '/properties/metro-luxe-318-154-photo-2.jpg',
      '/properties/metro-luxe-318-154-photo-3.jpg',
      '/properties/metro-luxe-318-154-photo-4.jpg',
      '/properties/metro-luxe-318-154-photo-5.jpg',
    ],
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: true,
    date: '2026-06-21T07:33:17',
  },
  {
    id: 20321,
    slug: 'metro-luxe-rama-4-unit-314-119-rent-bts-ekkamai',
    title: 'เช่าคอนโด Metro Luxe Rama 4 ชั้น 6 ห้อง 314/119 ใกล้ BTS เอกมัย 32.82 ตร.ม.',
    excerpt: 'คอนโดให้เช่าใกล้ BTS เอกมัย ห้อง 32.82 ตร.ม. ชั้น 6 เฟอร์นิเจอร์ครบ ราคาดี',
    priceMin: 15000,
    priceDisplay: '฿15,000/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '32.82',
    address: 'Metro Luxe Rama 4, แขวงพระโขนง เขตคลองเตย',
    neighborhood: 'BTS เอกมัย',
    lat: '13.7117907',
    lng: '100.5803751',
    image: '/properties/metro-luxe-rama-4-unit-314-119-rent-bts-ekkamai.jpg',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: true,
    date: '2026-06-21T07:24:58',
  },
  {
    id: 20309,
    slug: 'domethong-apartment-bts-yaek-kor-por-or-sai-mai',
    title: 'โดมทอง อพาร์ทเม้นท์ ห้องพักใกล้ BTS แยก คปอ. พหลโยธิน สายไหม',
    excerpt: 'ห้องพักรายเดือนราคาประหยัด ใกล้ BTS แยก คปอ. พหลโยธิน สายไหม เริ่มต้น ฿4,400/เดือน',
    priceMin: 4400,
    priceDisplay: '฿4,400/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '22',
    address: 'พหลโยธิน สายไหม กรุงเทพฯ',
    neighborhood: 'BTS แยก คปอ.',
    lat: '13.9187',
    lng: '100.5758',
    image: '/properties/domethong-apartment-bts-yaek-kor-por-or-sai-mai.jpg',
    propertyType: 'Apartment',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'ที่จอดรถ', 'กล้องวงจรปิด (CCTV)'],
    featured: false,
    date: '2026-06-21T07:09:23',
  },
  {
    id: 20289,
    slug: 'p-apartment-charan-37-mrt-bang-khun-non',
    title: 'พี อพาร์ทเม้นท์ ห้องพักใกล้ MRT บางขุนนนท์ จรัญสนิทวงศ์ 37',
    excerpt: 'ห้องพักรายเดือนราคาประหยัดใจกลางฝั่งธน ใกล้ MRT บางขุนนนท์ จรัญสนิทวงศ์ 37 เริ่ม ฿4,200/เดือน',
    priceMin: 4200,
    priceDisplay: '฿4,200/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '20',
    address: 'จรัญสนิทวงศ์ 37 บางกอกน้อย กรุงเทพฯ',
    neighborhood: 'MRT บางขุนนนท์',
    lat: '13.7727',
    lng: '100.4783',
    image: '/properties/p-apartment-charan-37-mrt-bang-khun-non.jpg',
    propertyType: 'Apartment',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'ที่จอดรถ', 'กล้องวงจรปิด (CCTV)'],
    featured: false,
    date: '2026-06-21T00:01:00',
  },
  {
    id: 20258,
    slug: 'bannai-ratchada-soi-5-mrt-soonwatthanatham',
    title: 'บ้านในรัชดา ซอย 5 — ห้องพักใกล้ MRT ศูนย์วัฒนธรรม เริ่มต้น 8,100 บาท',
    excerpt: 'ห้องพักรายเดือนทำเลดี ใจกลางรัชดา ใกล้ MRT ศูนย์วัฒนธรรม เริ่มต้น ฿8,100/เดือน',
    priceMin: 8100,
    priceDisplay: 'เริ่มต้น ฿8,100/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '24',
    address: 'รัชดาภิเษก ซอย 5 ห้วยขวาง กรุงเทพฯ',
    neighborhood: 'MRT ศูนย์วัฒนธรรม',
    lat: '13.7677',
    lng: '100.5724',
    image: '/properties/bannai-ratchada-soi-5-mrt-soonwatthanatham.jpg',
    propertyType: 'Apartment',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'ลิฟท์'],
    featured: true,
    date: '2026-06-20T21:37:05',
  },
  {
    id: 20092,
    slug: 'pasuk-palace-apartment-bang-na',
    title: 'ห้องพักให้เช่ารายเดือน ผาสุข พาเลซ บางนา ใกล้ BTS แบริ่ง',
    excerpt: 'อพาร์ทเม้นท์รายเดือนย่านบางนา ใกล้ BTS แบริ่ง สุวรรณภูมิ เริ่มต้น ฿6,000/เดือน',
    priceMin: 6000,
    priceDisplay: 'เริ่มต้น ฿6,000/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '25',
    address: 'บางนา กรุงเทพฯ',
    neighborhood: 'BTS แบริ่ง',
    lat: '13.6715',
    lng: '100.6018',
    image: '',
    propertyType: 'Apartment',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'ที่จอดรถ', 'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'เคเบิ้ลทีวี', 'เครื่องซักผ้า', 'ลิฟท์'],
    featured: true,
    date: '2026-04-10T00:00:00',
  },

  // ── Earlier listings ─────────────────────────────────────────────────────────
  {
    id: 19772,
    slug: 'flexi-sathorn-charoennakorn-phase-2',
    title: 'ปล่อยเช่า คอนโดเฟล็กซี่ สาทร-เจริญนคร เฟส 2 ใหม่ เริ่ม 12,600.-',
    excerpt: 'คอนโดให้เช่า Low Rise ใหม่ ย่านสาทร-เจริญนคร เฟส 2 สตูดิโอ 25 ตร.ม. เริ่ม ฿12,600/เดือน',
    priceMin: 12600,
    priceDisplay: 'เริ่มต้น ฿12,600/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '25',
    address: 'เจริญนคร ซ.22 บางลำภูล่าง คลองสาน กรุงเทพฯ',
    neighborhood: 'BTS สาทร/กรุงธนบุรี',
    lat: '13.7178533',
    lng: '100.5044564',
    image: '',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'ตู้เย็น', 'ทีวี', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เครื่องซักผ้า', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: false,
    date: '2026-04-20T00:00:00',
  },
  {
    id: 19756,
    slug: 'flexi-sathorn-charoennakorn-phase-1',
    title: 'ปล่อยเช่าคอนโด เฟล็กซี่ สาทร-เจริญนคร เฟส 1 ใกล้บีทีเอส เริ่มต้น 12,900.-',
    excerpt: 'คอนโดให้เช่าย่านสาทร-เจริญนคร เฟส 1 สตูดิโอ 25-32 ตร.ม. ใกล้ BTS กรุงธนบุรี เริ่ม ฿12,900/เดือน',
    priceMin: 12900,
    priceDisplay: '฿12,900 - 19,400/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '25-32',
    address: 'FLEXI Sathon-Charoen Nakhon, เจริญนคร ซ.22 คลองสาน กรุงเทพฯ',
    neighborhood: 'BTS กรุงธนบุรี',
    lat: '13.7174880',
    lng: '100.5044999',
    image: '',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'ตู้เย็น', 'ทีวี', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เครื่องซักผ้า', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: false,
    date: '2026-04-18T00:00:00',
  },
  {
    id: 19741,
    slug: 'flexi-rattanathibet-nonthaburi',
    title: 'ปล่อยเช่า คอนโด เฟล็กซี่ รัตนาธิเบศร์ ใกล้รถไฟฟ้า เริ่ม 10,900.-',
    excerpt: 'คอนโดให้เช่าย่านรัตนาธิเบศร์ นนทบุรี ใกล้รถไฟฟ้า สตูดิโอ-1 ห้องนอน 28-48 ตร.ม. เริ่ม ฿10,900/เดือน',
    priceMin: 10900,
    priceDisplay: '฿10,900 - 25,500/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '28-48',
    address: 'Flexi Rattanathibet, รัตนาธิเบศร์ เมืองนนทบุรี นนทบุรี',
    neighborhood: 'MRT แยกนนทบุรี 1',
    lat: '13.8634924',
    lng: '100.5044564',
    image: '',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'ตู้เย็น', 'ทีวี', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เครื่องซักผ้า', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: false,
    date: '2026-04-15T00:00:00',
  },
  {
    id: 19676,
    slug: 'flexi-mega-space-bangna',
    title: 'ปล่อยเช่าคอนโด เฟล็กซี่ เมกะ สเปซ บางนา เริ่มที่ 9,000.-',
    excerpt: 'คอนโดให้เช่าย่านบางนา ใกล้ Mega Bangna เริ่มต้น ฿9,000/เดือน ห้อง 1 นอน 22.5-50.5 ตร.ม.',
    priceMin: 9000,
    priceDisplay: 'เริ่มต้น ฿9,000/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '22.5-50.5',
    address: 'บางแก้ว คลองปลัดเปรียง บางพลี สมุทรปราการ',
    neighborhood: 'Mega Bangna / BTS อุดมสุข',
    lat: '13.6617',
    lng: '100.6423',
    image: '',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'ตู้เย็น', 'ทีวี', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เฟอร์นิเจอร์พร้อมอยู่', 'เแอร์'],
    featured: false,
    date: '2026-03-25T00:00:00',
  },
  {
    id: 19573,
    slug: 'laidback-place-sukhumvit-71',
    title: 'เลดแบ็ค เพลส ที่พักสุขุมวิท 71',
    excerpt: 'ที่พักสไตล์ญี่ปุ่น-สแกนดิเนเวีย ย่านสุขุมวิท 71 เริ่มต้น ฿7,800/เดือน บรรยากาศเงียบสงบ ใกล้ BTS พระโขนง',
    priceMin: 7800,
    priceDisplay: '฿7,800 - 26,000/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '',
    address: '222 ซ.ปรีดีพนมยงค์ 14 แยก 16 พระโขนงเหนือ วัฒนา กรุงเทพฯ',
    neighborhood: 'BTS พระโขนง / สุขุมวิท 71',
    lat: '13.7294',
    lng: '100.6032',
    image: '/properties/laidback-place-sukhumvit-71.jpg',
    propertyType: 'Apartment',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'ที่จอดรถ', 'กล้องวงจรปิด (CCTV)'],
    featured: false,
    date: '2026-02-15T00:00:00',
  },
  {
    id: 19549,
    slug: 'st-apartment-daily-rental-sriyan',
    title: 'ST Apartment ห้องเช่ารายวัน – ศรีย่าน 2 (ซ.ราชพัสดุ)',
    excerpt: 'ห้องเช่ารายวันย่านศรีย่าน ดุสิต บรรยากาศสไตล์คลาสสิก กว้างขวาง ราคา ฿1,000-1,700/คืน',
    priceMin: 1000,
    priceDisplay: '฿1,000 - 1,700/คืน',
    bedrooms: 1,
    bathrooms: 1,
    size: '',
    address: 'ซ.ศรีย่าน 2 ชุมชนราชพัสดุ ถนนนครไชยศรี เขตดุสิต กรุงเทพฯ 10300',
    neighborhood: 'ย่านดุสิต / เทเวศร์',
    lat: '13.7784',
    lng: '100.5051',
    image: '/properties/st-apartment-daily-rental-sriyan.jpg',
    propertyType: 'Apartment',
    listingType: 'Daily',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'WiFi', 'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'ที่จอดรถ', 'เครื่องซักผ้า', 'เคเบิ้ลทีวี', 'ลิฟท์'],
    featured: false,
    date: '2026-02-10T00:00:00',
  },
  {
    id: 19360,
    slug: 'office-p-park-residence-on-nut-suvarnabhumi',
    title: 'เช่าพื้นที่สำนักงานที่ P-Park Residence (อ่อนนุช-สุวรรณภูมิ)',
    excerpt: 'พื้นที่สำนักงานให้เช่า 79.15 ตร.ม. ย่านอ่อนนุช-สุวรรณภูมิ เหมาะสำหรับ SME ฿50,000/เดือน',
    priceMin: 50000,
    priceDisplay: '฿50,000/เดือน',
    bedrooms: 0,
    bathrooms: 1,
    size: '79.15',
    address: 'P-Park Residence, อ่อนนุช-สุวรรณภูมิ ประเวศ กรุงเทพฯ 10250',
    neighborhood: 'อ่อนนุช / สุวรรณภูมิ',
    lat: '13.6731',
    lng: '100.7038',
    image: '',
    propertyType: 'Office',
    listingType: 'Rent',
    amenities: ['กล้องวงจรปิด (CCTV)', 'ที่จอดรถ'],
    featured: false,
    date: '2026-01-20T00:00:00',
  },
  {
    id: 19333,
    slug: 'lumpini-place-pinklao-2-rent',
    title: 'Lumpini Place Pinklao 2 (ลุมพินี เพลส ปิ่นเกล้า 2) ให้เช่า',
    excerpt: 'คอนโดให้เช่า ลุมพินี เพลส ปิ่นเกล้า 2 ห้อง 1 นอน 28 ตร.ม. ใกล้รถไฟฟ้า ฿9,000/เดือน',
    priceMin: 9000,
    priceDisplay: '฿9,000/เดือน',
    bedrooms: 1,
    bathrooms: 1,
    size: '28',
    address: 'Lumpini Place Pinklao 2, 89 บรมราชชนนี อรุณอมรินทร์ บางกอกน้อย กรุงเทพฯ 10700',
    neighborhood: 'ปิ่นเกล้า / บรมราชชนนี',
    lat: '13.7758',
    lng: '100.4706',
    image: '',
    propertyType: 'Condo',
    listingType: 'Rent',
    amenities: ['เแอร์', 'เครื่องทำน้ำอุ่น', 'ตู้เย็น', 'รปภ 24 ชม', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'เฟอร์นิเจอร์พร้อมอยู่'],
    featured: false,
    date: '2026-01-10T00:00:00',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find(p => p.slug === slug)
}

export function getFeaturedProperties(count = 6): Property[] {
  return properties.filter(p => p.featured).slice(0, count)
}

export function getRecentProperties(count = 6): Property[] {
  return [...properties].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count)
}

export function formatPrice(price: number): string {
  return '฿' + price.toLocaleString('th-TH')
}

export const PROPERTY_TYPES = ['ทั้งหมด', 'Apartment', 'Condo', 'Office'] as const
export const PRICE_RANGES = [
  { label: 'ทุกราคา', min: 0, max: Infinity },
  { label: 'ต่ำกว่า ฿5,000', min: 0, max: 5000 },
  { label: '฿5,000 - ฿10,000', min: 5000, max: 10000 },
  { label: '฿10,000 - ฿20,000', min: 10000, max: 20000 },
  { label: 'มากกว่า ฿20,000', min: 20000, max: Infinity },
]

// Returns empty string — property detail content is served from static data only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchPropertyContent(_id: number): Promise<string> {
  return ''
}
