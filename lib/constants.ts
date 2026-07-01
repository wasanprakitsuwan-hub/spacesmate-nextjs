import type { AreaKeyword, PropertyType } from './types'

// ─── Property Type Labels ─────────────────────────────────────────────────────

export const PROPERTY_TYPE_LABELS: Record<PropertyType, { th: string; en: string; icon: string }> = {
  apartment:  { th: 'อพาร์ทเม้นท์',    en: 'Apartment',       icon: 'apartment' },
  condo:      { th: 'คอนโดมิเนียม',     en: 'Condominium',     icon: 'location_city' },
  house:      { th: 'บ้าน',             en: 'House',           icon: 'house' },
  coworking:  { th: 'โคเวิร์กกิ้งสเปซ', en: 'Co-working Space', icon: 'laptop' },
  office:     { th: 'ออฟฟิศ',           en: 'Office',          icon: 'business' },
}

// ─── Amenity Labels ───────────────────────────────────────────────────────────

export const AMENITY_LABELS: Record<string, { th: string; icon: string }> = {
  pool:        { th: 'สระว่ายน้ำ',          icon: 'pool' },
  gym:         { th: 'ฟิตเนส',              icon: 'fitness_center' },
  parking:     { th: 'ที่จอดรถ',            icon: 'local_parking' },
  furnished:   { th: 'เฟอร์นิเจอร์พร้อม',   icon: 'weekend' },
  aircon:      { th: 'แอร์',               icon: 'ac_unit' },
  elevator:    { th: 'ลิฟต์',              icon: 'elevator' },
  security:    { th: 'รปภ 24 ชม.',         icon: 'security' },
  cctv:        { th: 'กล้องวงจรปิด',        icon: 'videocam' },
  lobby:       { th: 'ล็อบบี้',             icon: 'domain' },
  internet:    { th: 'อินเตอร์เน็ต',        icon: 'wifi' },
  laundry:     { th: 'ซักรีด',              icon: 'local_laundry_service' },
  rooftop:     { th: 'รูฟท็อป',             icon: 'rooftop_access' },
}

// ─── Bangkok Area SEO Keywords ────────────────────────────────────────────────

export const AREA_KEYWORDS: AreaKeyword[] = [
  { slug: 'condo-rent-bts-asok',        label_th: 'เช่าคอนโด BTS อโศก',         label_en: 'Condo for Rent BTS Asok',         property_type: 'condo',     station: 'BTS Asok' },
  { slug: 'apartment-rent-sukhumvit',   label_th: 'เช่าอพาร์ทเม้นท์ สุขุมวิท', label_en: 'Apartment for Rent Sukhumvit',     property_type: 'apartment', district: 'Sukhumvit' },
  { slug: 'condo-rent-bts-ekkamai',     label_th: 'เช่าคอนโด BTS เอกมัย',       label_en: 'Condo for Rent BTS Ekkamai',       property_type: 'condo',     station: 'BTS Ekkamai' },
  { slug: 'house-rent-lat-phrao',       label_th: 'เช่าบ้าน ลาดพร้าว',          label_en: 'House for Rent Lat Phrao',         property_type: 'house',     district: 'Lat Phrao' },
  { slug: 'condo-rent-bts-thonglor',   label_th: 'เช่าคอนโด BTS ทองหล่อ',      label_en: 'Condo for Rent BTS Thonglor',      property_type: 'condo',     station: 'BTS Thonglor' },
  { slug: 'office-rent-silom',         label_th: 'เช่าออฟฟิศ สีลม',            label_en: 'Office for Rent Silom',            property_type: 'office',    district: 'Silom' },
  { slug: 'condo-rent-bts-on-nut',     label_th: 'เช่าคอนโด BTS อ่อนนุช',      label_en: 'Condo for Rent BTS On Nut',        property_type: 'condo',     station: 'BTS On Nut' },
  { slug: 'apartment-rent-ratchada',   label_th: 'เช่าอพาร์ทเม้นท์ รัชดา',     label_en: 'Apartment for Rent Ratchada',      property_type: 'apartment', district: 'Ratchada' },
  { slug: 'house-rent-rama-9',         label_th: 'เช่าบ้าน พระราม 9',           label_en: 'House for Rent Rama 9',            property_type: 'house',     district: 'Rama 9' },
  { slug: 'condo-rent-mrt-lat-phrao',  label_th: 'เช่าคอนโด MRT ลาดพร้าว',     label_en: 'Condo for Rent MRT Lat Phrao',     property_type: 'condo',     station: 'MRT Lat Phrao' },
  { slug: 'coworking-rent-sukhumvit',  label_th: 'เช่าโคเวิร์กกิ้ง สุขุมวิท',  label_en: 'Co-working Space Sukhumvit',       property_type: 'coworking', district: 'Sukhumvit' },
  { slug: 'condo-rent-bts-saphan-kwai',label_th: 'เช่าคอนโด BTS สะพานควาย',    label_en: 'Condo for Rent BTS Saphan Kwai',   property_type: 'condo',     station: 'BTS Saphan Kwai' },
  { slug: 'condo-rent-bts-ari',        label_th: 'เช่าคอนโด BTS อารีย์',        label_en: 'Condo for Rent BTS Ari',           property_type: 'condo',     station: 'BTS Ari' },
  { slug: 'apartment-rent-bang-na',    label_th: 'เช่าอพาร์ทเม้นท์ บางนา',     label_en: 'Apartment for Rent Bang Na',       property_type: 'apartment', district: 'Bang Na' },
  { slug: 'condo-rent-mrt-phahon-yothin', label_th: 'เช่าคอนโด MRT พหลโยธิน', label_en: 'Condo for Rent MRT Phahon Yothin', property_type: 'condo',     station: 'MRT Phahon Yothin' },
  { slug: 'office-rent-sathorn',       label_th: 'เช่าออฟฟิศ สาทร',            label_en: 'Office for Rent Sathorn',          property_type: 'office',    district: 'Sathorn' },
]

// ─── Price Range Options ──────────────────────────────────────────────────────

export const PRICE_RANGES = [
  { label: 'ต่ำกว่า ฿5,000',           min: 0,      max: 5000 },
  { label: '฿5,000 – ฿10,000',         min: 5000,   max: 10000 },
  { label: '฿10,000 – ฿20,000',        min: 10000,  max: 20000 },
  { label: '฿20,000 – ฿40,000',        min: 20000,  max: 40000 },
  { label: '฿40,000 – ฿80,000',        min: 40000,  max: 80000 },
  { label: 'มากกว่า ฿80,000',          min: 80000,  max: 9999999 },
]

// ─── Subscription Packages ────────────────────────────────────────────────────

export const PACKAGES = [
  {
    id: 'trial',
    name_th: 'ทดลองใช้ฟรี',
    price_thb: 0,
    duration_days: 30,
    max_listings: 1,
    features: ['ลงประกาศได้ 1 รายการ', 'แสดงผลในระบบ 30 วัน', 'ไม่ต้องใช้บัตรเครดิต'],
  },
  {
    id: 'basic',
    name_th: 'แพ็กเกจ Basic',
    price_thb: 299,
    duration_days: 30,
    max_listings: 1,
    features: ['ลงประกาศได้ 1 รายการ', 'แสดงผล 30 วัน', 'อัปเดตข้อมูลไม่จำกัด'],
  },
  {
    id: 'standard',
    name_th: 'แพ็กเกจ Standard',
    price_thb: 799,
    duration_days: 90,
    max_listings: 3,
    features: ['ลงประกาศได้ 3 รายการ', 'แสดงผล 90 วัน', 'ส่วนลด 11%'],
  },
  {
    id: 'premium',
    name_th: 'แพ็กเกจ Premium',
    price_thb: 2499,
    duration_days: 365,
    max_listings: 10,
    features: ['ลงประกาศได้ 10 รายการ', 'แสดงผล 365 วัน', 'ส่วนลด 30%', 'Priority support'],
  },
]
