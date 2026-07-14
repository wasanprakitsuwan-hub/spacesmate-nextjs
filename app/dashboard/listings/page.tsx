'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'

import RichEditor from '@/components/RichEditor'

// ── Types ────────────────────────────────────────────────────────────────────
interface RoomTypeRow {
  id: string
  room_type: string
  price_from: string
  price_to: string
}

// Apartment — one row per unit type
interface ApartmentUnitRow {
  id: string
  room_type: string
  size_sqm: string
  price_1mo: string      // base / default monthly rate (shown in search)
  price_daily: string    // daily rate (optional, for short-stay / Airbnb pricing)
  available_1mo: boolean // 1-month short-term tenancy available
  available_3mo: boolean
  price_3mo: string
  available_6mo: boolean
  price_6mo: string
}

// Condo / House — single-unit rental detail
interface CondoRentalDetail {
  unit_number: string
  floor: string
  facing: string
  size_sqm: string
  property_name: string
  price_12mo: string
  price_6mo: string
  price_3mo: string
  price_1mo: string
}

// Apartment — charges & deposit detail
type RateType = 'fixed' | 'min_rate' | 'ask'
interface RentalCharges {
  water_type: RateType
  water_fixed: string
  water_min_rate: string        // minimum bill amount (for min_rate mode)
  electricity_type: RateType
  electricity_fixed: string
  electricity_min_rate: string  // minimum bill amount (for min_rate mode)
  security_deposit: string
  advance_deposit: string
  key_deposit: string           // fixed baht amount (optional, e.g. key deposit)
  other_charges: string[]
  other_charges_fees: Record<string, string>  // monthly fee per charge key
}

interface DbListing {
  id: string
  slug: string
  title_th: string
  title_en: string | null
  description_th: string | null
  property_type: string
  status: string
  price_from: number
  price_to: number | null
  room_types: any[] | null
  area_sqm: number | null
  bedrooms: number
  bathrooms: number
  floor: number | null
  address_th: string | null
  district: string | null
  sub_district: string | null
  province: string | null
  postcode: string | null
  lat: number | null
  lng: number | null
  amenities: string[]
  rental_term: string | null
  package_type: string | null
  expires_at: string | null
  listing_status: string
  verified: boolean
  created_at: string
  images: string[] | null
  video_url: string | null
}

interface Submission {
  id: string
  title: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  district: string | null
  province: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  size: number | null
  rental_term: string | null
  package_type: string | null
  expires_at: string | null
  created_at: string
}

interface ListingFormState {
  title_th: string
  title_en: string
  slug: string          // kept in state for edit mode; hidden in form (auto-generated)
  property_type: string
  rental_term: string
  package_type: string
  price_from: string
  price_to: string
  room_types: RoomTypeRow[]         // office / coworking only
  apartment_units: ApartmentUnitRow[]
  condo_rental: CondoRentalDetail
  rental_charges: RentalCharges
  bedrooms: string
  bathrooms: string
  floor: string
  area_sqm: string
  address_th: string
  district: string
  sub_district: string
  province: string
  postcode: string
  lat: string
  lng: string
  description_th: string
  description_en: string
  amenities: string[]
  images: string[]
  video_url: string
  contact_name: string
  contact_phone: string
  contact_line: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน',
  office: 'ออฟฟิศ', coworking: 'Co-space',
  Condo: 'คอนโด', Apartment: 'อพาร์ทเม้นท์', House: 'บ้าน',
  Office: 'ออฟฟิศ', 'Co-Working': 'Co-space',
}
const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  condo:      { bg: '#e0f2f9', color: '#0284c7' },
  apartment:  { bg: '#e8f5f0', color: '#048c73' },
  house:      { bg: '#f3e8ff', color: '#9333ea' },
  office:     { bg: '#fef9c3', color: '#a16207' },
  coworking:  { bg: '#fee2e2', color: '#b91c1c' },
  Condo:      { bg: '#e0f2f9', color: '#0284c7' },
  Apartment:  { bg: '#e8f5f0', color: '#048c73' },
  'Co-Working': { bg: '#fee2e2', color: '#b91c1c' },
}
// Amenity lists — apartment & condo use split sections, others use AMENITY_OPTIONS
const AMENITY_BUILDING = [
  'ที่จอดรถ', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'กล้องวงจรปิด (CCTV)',
  'ลิฟท์', 'สวนสาธารณะ', 'สนามบาสเกตบอล', 'ห้องเกม', 'ตู้หยอดเหรียญ',
  'ห้องซักรีด', 'รปภ 24 ชม', 'ระบบ Keycard',
]
const AMENITY_ROOM = [
  'เฟอร์นิเจอร์พร้อมอยู่', 'เฟอร์นิเจอร์บางส่วน', 'แอร์', 'โทรทัศน์',
  'ตู้เย็น', 'โซฟา', 'โต๊ะกินข้าว', 'ไมโครเวฟ', 'เตาแม่เหล็กไฟฟ้า',
]
const AMENITY_OPTIONS = [
  'WiFi', 'แอร์', 'ที่จอดรถ', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)',
  'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'เฟอร์นิเจอร์พร้อมอยู่', 'ห้องครัว',
  'เครื่องซักผ้า', 'ตู้เย็น', 'ไมโครเวฟ', 'โทรทัศน์', 'ระเบียง',
  'ร้านสะดวกซื้อ', 'ร้านอาหาร', 'ร้านซักรีด', 'สวนสาธารณะ',
]
const FACING_OPTIONS = [
  { value: 'N',  label: 'ทิศเหนือ (N)' },
  { value: 'S',  label: 'ทิศใต้ (S)' },
  { value: 'E',  label: 'ทิศตะวันออก (E)' },
  { value: 'W',  label: 'ทิศตะวันตก (W)' },
  { value: 'NE', label: 'ทิศตะวันออกเฉียงเหนือ (NE)' },
  { value: 'NW', label: 'ทิศตะวันตกเฉียงเหนือ (NW)' },
  { value: 'SE', label: 'ทิศตะวันออกเฉียงใต้ (SE)' },
  { value: 'SW', label: 'ทิศตะวันตกเฉียงใต้ (SW)' },
]
const OTHER_CHARGES_OPTIONS = [
  { value: 'parking',   label: 'ค่าจอดรถ' },
  { value: 'internet',  label: 'ค่าอินเทอร์เน็ต' },
  { value: 'fridge',    label: 'ค่าเช่าตู้เย็น' },
  { value: 'tv',        label: 'ค่าเช่าโทรทัศน์' },
  { value: 'microwave', label: 'ค่าเช่าไมโครเวฟ' },
]

// ── Slug helpers ──────────────────────────────────────────────────────────────
function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // strip non-ASCII (Thai chars, symbols)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 55)
}

function buildAutoSlug(titleEn: string, titleTh: string, propertyType: string): string {
  const shortId = Math.random().toString(36).slice(2, 7)
  const base = slugifyText(titleEn || titleTh || 'listing') || 'listing'
  if (['condo', 'house'].includes(propertyType)) {
    // nested: building-name/type-shortid  → e.g. lumpini-place-suanplu/condo-ab3xy
    const typePart = propertyType === 'condo' ? 'condo' : 'house'
    return `${base}/${typePart}-${shortId}`
  }
  // flat: title-shortid  → e.g. the-room-apartment-ab3xy
  return `${base}-${shortId}`
}
const RENTAL_TERM_OPTIONS = [
  { value: 'daily',     label: 'รายวัน' },
  { value: '1_month',   label: '1 เดือน' },
  { value: '3_months',  label: '3 เดือน' },
  { value: '6_months',  label: '6 เดือน' },
  { value: '12_months', label: '12 เดือน' },
]
const RENTAL_TERM_LABEL: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน',
  '3_months': '/3 เดือน', '6_months': '/6 เดือน', '12_months': '/12 เดือน',
}
const ADMIN_PACKAGES = [
  { id: 'admin',    label: 'Admin — ไม่มีวันหมดอายุ',    days: 0   },
  { id: 'basic',    label: 'Basic — 1 เดือน (฿299)',      days: 30  },
  { id: 'standard', label: 'Standard — 3 เดือน (฿699)',   days: 90  },
  { id: 'premium',  label: 'Premium — 12 เดือน (฿2,499)', days: 365 },
]

// ── Room type options per property type ───────────────────────────────────────
function getRoomTypeOptions(propType: string): string[] {
  switch (propType) {
    case 'apartment': return ['Studio', '1 ห้องนอน', '2 ห้องนอน', '3 ห้องนอน', 'เชิงพาณิชย์']
    case 'house':     return ['บ้านเดี่ยว', 'ทาวน์เฮ้าส์', '2 ห้องนอน', '3 ห้องนอน', '4 ห้องนอน+']
    case 'office':    return ['Individual Desk', 'Private Office', 'Meeting Room', 'Full Floor', 'Shared Space']
    case 'coworking': return ['Hot Desk', 'Dedicated Desk', 'Private Office', 'Meeting Room', 'Day Pass']
    default:          return ['Studio', '1 ห้องนอน', '2 ห้องนอน', '3 ห้องนอน', '4 ห้องนอน+', 'Penthouse', 'ดูเพล็กซ์', 'ลอฟท์']
  }
}

// ── Shared form styles ────────────────────────────────────────────────────────
const SINP: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 10,
  border: '1px solid #eef0ef', fontSize: 16, outline: 'none',
  boxSizing: 'border-box' as const, background: '#fff',
}
const SLBL: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'block',
}

function computeExpiry(packageId: string): string | null {
  const pkg = ADMIN_PACKAGES.find(p => p.id === packageId)
  if (!pkg || pkg.days === 0) return null
  const d = new Date(); d.setDate(d.getDate() + pkg.days)
  return d.toISOString()
}

const BLANK_CONDO_RENTAL: CondoRentalDetail = {
  unit_number: '', floor: '', facing: '', size_sqm: '',
  property_name: '', price_12mo: '', price_6mo: '', price_3mo: '', price_1mo: '',
}
const BLANK_CHARGES: RentalCharges = {
  water_type: 'ask', water_fixed: '', water_min_rate: '',
  electricity_type: 'ask', electricity_fixed: '', electricity_min_rate: '',
  security_deposit: '2', advance_deposit: '1', key_deposit: '',
  other_charges: [], other_charges_fees: {},
}

const BLANK_FORM: ListingFormState = {
  title_th: '', title_en: '', slug: '',
  property_type: 'condo', rental_term: '1_month', package_type: 'admin',
  price_from: '', price_to: '',
  room_types: [],
  apartment_units: [],
  condo_rental: { ...BLANK_CONDO_RENTAL },
  rental_charges: { ...BLANK_CHARGES },
  bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
  address_th: '', district: '', sub_district: '',
  province: 'กรุงเทพมหานคร', postcode: '',
  lat: '', lng: '',
  description_th: '', description_en: '', amenities: [],
  images: [], video_url: '',
  contact_name: '', contact_phone: '', contact_line: '',
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function TypeChip({ type }: { type: string }) {
  const tc = TYPE_COLORS[type] ?? { bg: '#f4f6f5', color: '#64748b' }
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

// ── Responsive width hook ─────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

function SectionHead({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1.2, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
    </div>
  )
}

// ── Room Type Pricing Grid ────────────────────────────────────────────────────
// isDaily=true → single price column (/วัน)
// isDaily=false → two price columns (ต่ำสุด / สูงสุด)
function RoomTypePricingGrid({ rows, onChange, termLabel, isDaily, roomTypeOptions }: {
  rows: RoomTypeRow[]
  onChange: (rows: RoomTypeRow[]) => void
  termLabel: string
  isDaily: boolean
  roomTypeOptions: string[]
}) {
  function addRow() {
    onChange([...rows, { id: `rt-${Date.now()}`, room_type: roomTypeOptions[0] ?? 'Studio', price_from: '', price_to: '' }])
  }
  function removeRow(id: string) { onChange(rows.filter(r => r.id !== id)) }
  function updateRow(id: string, field: keyof RoomTypeRow, val: string) {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  const colTemplate = isDaily ? '1.8fr 1fr 28px' : '1.5fr 1fr 1fr 28px'

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 6, marginBottom: 5, paddingLeft: 2 }}>
            {(isDaily
              ? [`ประเภท`, `ราคา${termLabel}`, '']
              : [`ประเภท`, `ต่ำสุด${termLabel}`, `สูงสุด${termLabel}`, '']
            ).map(h => <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{h}</div>)}
          </div>
          {/* Rows */}
          {rows.map(row => (
            <div key={row.id} style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <select value={row.room_type} onChange={e => updateRow(row.id, 'room_type', e.target.value)} style={{ ...SINP, padding: '7px 10px' }}>
                {roomTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="number" value={row.price_from} onChange={e => updateRow(row.id, 'price_from', e.target.value)} placeholder={isDaily ? '1200' : '14000'} style={{ ...SINP, padding: '7px 10px' }} />
              {!isDaily && (
                <input type="number" value={row.price_to} onChange={e => updateRow(row.id, 'price_to', e.target.value)} placeholder="16000" style={{ ...SINP, padding: '7px 10px' }} />
              )}
              <button type="button" onClick={() => removeRow(row.id)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>close</span></button>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={addRow} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        + เพิ่มประเภท
      </button>
    </div>
  )
}

// ── Apartment Unit Grid ───────────────────────────────────────────────────────
// Multi-row table: unit type | size (sqm) | price/month | short-term availability
function ApartmentUnitGrid({ rows, onChange, roomTypeOptions }: {
  rows: ApartmentUnitRow[]
  onChange: (rows: ApartmentUnitRow[]) => void
  roomTypeOptions: string[]
}) {
  function addRow() {
    onChange([...rows, {
      id: `au-${Date.now()}`, room_type: roomTypeOptions[0] ?? 'Studio',
      size_sqm: '', price_1mo: '', price_daily: '',
      available_1mo: false,
      available_3mo: false, price_3mo: '',
      available_6mo: false, price_6mo: '',
    }])
  }
  function removeRow(id: string) { onChange(rows.filter(r => r.id !== id)) }
  function upd(id: string, field: keyof ApartmentUnitRow, val: any) {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.9fr 0.9fr 28px', gap: 6, marginBottom: 6, paddingLeft: 2 }}>
            {['ประเภทห้อง', 'ขนาด (ตร.ม.)', 'ราคา/เดือน', 'ราคา/วัน', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{h}</div>
            ))}
          </div>
          {rows.map(row => (
            <div key={row.id} style={{ background: '#fafffe', border: '1px solid #eef0ef', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              {/* Main row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.9fr 0.9fr 28px', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                <select value={row.room_type} onChange={e => upd(row.id, 'room_type', e.target.value)} style={{ ...SINP, padding: '7px 10px' }}>
                  {roomTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" value={row.size_sqm} onChange={e => upd(row.id, 'size_sqm', e.target.value)} placeholder="28" style={{ ...SINP, padding: '7px 10px' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12.5, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                  <input type="number" value={row.price_1mo} onChange={e => upd(row.id, 'price_1mo', e.target.value)} placeholder="7,000" style={{ ...SINP, padding: '7px 10px 7px 22px' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12.5, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                  <input type="number" value={row.price_daily} onChange={e => upd(row.id, 'price_daily', e.target.value)} placeholder="900" style={{ ...SINP, padding: '7px 10px 7px 22px' }} />
                </div>
                <button type="button" onClick={() => removeRow(row.id)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>close</span></button>
              </div>
              {/* Short-term availability */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', paddingLeft: 2, borderTop: '1px dashed #eef0ef', paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>ระยะสั้น:</span>
                {/* 1 month — uses base price_1mo, no extra input */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_1mo} onChange={e => upd(row.id, 'available_1mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>1 เดือน</span>
                </label>
                {row.available_1mo && (
                  <span style={{ fontSize: 11, color: '#048c73', background: '#eaf6f1', padding: '2px 8px', borderRadius: 10 }}>
                    ฿{row.price_1mo ? Number(row.price_1mo).toLocaleString() : '—'}/เดือน
                  </span>
                )}
                {/* 3 months */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_3mo} onChange={e => upd(row.id, 'available_3mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>3 เดือน</span>
                </label>
                {row.available_3mo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>฿</span>
                    <input type="number" value={row.price_3mo} onChange={e => upd(row.id, 'price_3mo', e.target.value)} placeholder="7,500" style={{ ...SINP, padding: '5px 8px', width: 90, fontSize: 12.5 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>/เดือน</span>
                  </div>
                )}
                {/* 6 months */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_6mo} onChange={e => upd(row.id, 'available_6mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>6 เดือน</span>
                </label>
                {row.available_6mo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>฿</span>
                    <input type="number" value={row.price_6mo} onChange={e => upd(row.id, 'price_6mo', e.target.value)} placeholder="7,200" style={{ ...SINP, padding: '5px 8px', width: 90, fontSize: 12.5 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>/เดือน</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={addRow} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        + เพิ่มประเภทห้อง
      </button>
    </div>
  )
}

// ── Map Picker (Leaflet with draggable pin + geocoding search) ─────────────────
function MapPicker({ lat, lng, onLatLng }: {
  lat: string
  lng: string
  onLatLng: (lat: string, lng: string) => void
}) {
  const [urlInput,   setUrlInput]   = useState('')
  const [urlParsing, setUrlParsing] = useState(false)
  const [urlError,   setUrlError]   = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapObjRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const onLatLngRef = useRef(onLatLng)
  onLatLngRef.current = onLatLng   // always-fresh callback ref
  const isMob = useWindowWidth() < 768

  const defaultLat = lat ? parseFloat(lat) : 13.7563
  const defaultLng = lng ? parseFloat(lng) : 100.5018

  function initLeaflet(L: any) {
    if (mapObjRef.current || !mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      [defaultLat, defaultLng],
      lat ? 15 : 12
    )
    mapObjRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // SpacesMate-branded pin icon
    const icon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;
        background:#02402e;
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(2,64,46,.45);
        position:relative;
      "><div style="
        position:absolute;inset:3px;
        background:#d97f11;
        border-radius:50%;
        transform:rotate(45deg);
      "></div></div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })

    const marker = L.marker([defaultLat, defaultLng], { draggable: true, icon }).addTo(map)
    markerRef.current = marker

    marker.bindPopup('<b style="color:#02402e;font-size:12px">ตำแหน่งอสังหาฯ</b><br><small style="color:#64748b">ลากหมุดหรือคลิกบนแผนที่เพื่อปรับตำแหน่ง</small>').openPopup()

    marker.on('dragend', () => {
      const pos = markerRef.current.getLatLng()
      onLatLngRef.current(pos.lat.toFixed(6), pos.lng.toFixed(6))
    })

    map.on('click', (e: any) => {
      markerRef.current.setLatLng(e.latlng)
      onLatLngRef.current(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
    })
  }

  // Load Leaflet CSS + JS from CDN (client only)
  useEffect(() => {
    if ((window as any).L) {
      initLeaflet((window as any).L)
      return
    }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link')
      css.id = 'leaflet-css'
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initLeaflet((window as any).L)
    document.head.appendChild(script)

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove()
        mapObjRef.current = null
      }
    }
  }, [])

  // Move marker when lat/lng change externally (e.g., from geocoder)
  useEffect(() => {
    if (!mapObjRef.current || !markerRef.current) return
    const la = parseFloat(lat), ln = parseFloat(lng)
    if (isNaN(la) || isNaN(ln)) return
    markerRef.current.setLatLng([la, ln])
    mapObjRef.current.setView([la, ln], 15)
  }, [lat, lng])

  async function doSearch() {
    if (!searchVal.trim()) return
    setSearching(true); setResults([])
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(searchVal)}`)
      const d = await r.json()
      setResults(d.results ?? [])
    } catch {}
    setSearching(false)
  }

  function selectResult(r: { lat: string; lon: string; display_name: string }) {
    onLatLng(r.lat, r.lon)
    setSearchVal(r.display_name.split(',')[0].trim())
    setResults([])
  }

  // ── Google Maps URL parser ──────────────────────────────────────────────────
  function parseGoogleMapsUrl(url: string): { lat: string; lng: string } | null {
    // /@lat,lng or /@lat,lng,zoom  (most common share format)
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) return { lat: atMatch[1], lng: atMatch[2] }
    // ?q=lat,lng or &q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] }
    // !3d lat !4d lng  (embed / place URL format)
    const embedMatch = url.match(/!3d(-?\d+\.?\d*).*?!4d(-?\d+\.?\d*)/)
    if (embedMatch) return { lat: embedMatch[1], lng: embedMatch[2] }
    return null
  }

  async function handleGoogleMapsUrl(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setUrlError('')

    // Try parsing directly first (long URLs always work this way)
    const direct = parseGoogleMapsUrl(trimmed)
    if (direct) {
      onLatLng(direct.lat, direct.lng)
      return
    }

    // Short URL — resolve via server then parse
    if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl')) {
      setUrlParsing(true)
      try {
        const r = await fetch(`/api/resolve-url?url=${encodeURIComponent(trimmed)}`)
        const d = await r.json()
        if (d.resolved) {
          const parsed = parseGoogleMapsUrl(d.resolved)
          if (parsed) { onLatLng(parsed.lat, parsed.lng); return }
        }
        setUrlError('ไม่สามารถอ่านพิกัดจากลิงก์นี้ได้')
      } catch { setUrlError('ไม่สามารถ resolve ลิงก์สั้นได้') }
      finally { setUrlParsing(false) }
      return
    }

    setUrlError('ลิงก์ไม่ถูกต้อง — ลองใช้ Google Maps แชร์ตำแหน่งแล้ววางที่นี่')
  }

  return (
    <div>
      {/* ── Google Maps URL paste (primary method) ── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 15, color: urlError ? '#dc2626' : '#048c73', pointerEvents: 'none',
            }}><span className="msym" style={{ fontVariationSettings: "'wght' 300, 'FILL' 0" }}>link</span></span>
            <input
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
              onPaste={e => {
                const pasted = e.clipboardData.getData('text')
                if (pasted.includes('google.com/maps') || pasted.includes('maps.app.goo.gl') || pasted.includes('goo.gl')) {
                  e.preventDefault()
                  setUrlInput(pasted)
                  handleGoogleMapsUrl(pasted)
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGoogleMapsUrl(urlInput) } }}
              placeholder="วางลิงก์ Google Maps ที่นี่... (วิธีแนะนำ)"
              style={{
                ...SINP, paddingLeft: 32, flex: 1,
                background: urlError ? '#fff5f5' : '#f0fbf8',
                border: `1.5px solid ${urlError ? '#fca5a5' : '#b2d8c9'}`,
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleGoogleMapsUrl(urlInput)}
            disabled={urlParsing || !urlInput.trim()}
            style={{
              padding: '9px 14px', borderRadius: 10, border: 'none',
              background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 13,
              cursor: urlParsing || !urlInput.trim() ? 'not-allowed' : 'pointer',
              opacity: urlParsing || !urlInput.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {urlParsing
              ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>location_on</span>ดึงพิกัด</>
            }
          </button>
        </div>
        {urlError
          ? <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#dc2626' }}>{urlError}</p>
          : <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>วางลิงก์จาก Google Maps แล้วพิกัดจะดึงอัตโนมัติ • หรือค้นหาด้านล่าง / คลิกบนแผนที่</p>
        }
      </div>

      {/* ── Search box ── */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
            placeholder="ค้นหาชื่อโครงการ / ที่อยู่ใกล้เคียง แล้วกด Enter"
            style={{ ...SINP, flex: 1 }}
          />
          <button
            type="button"
            onClick={doSearch}
            disabled={searching}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {searching
              ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />ค้นหา</>
              : <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>map</span>ค้นหา</>
            }
          </button>
        </div>
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#fff', border: '1px solid #eef0ef', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', marginTop: 4 }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => selectResult(r)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, color: '#334155', borderBottom: i < results.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0", verticalAlign: 'middle', marginRight: 4 }}>location_on</span>{r.display_name.length > 85 ? r.display_name.slice(0, 85) + '…' : r.display_name}
              </button>
            ))}
            <button type="button" onClick={() => setResults([])} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>ปิด</button>
          </div>
        )}
      </div>

      {/* ── Leaflet map ── */}
      <div
        ref={mapContainerRef}
        style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid #eef0ef', background: '#f0f4f2' }}
      />

      {/* ── Coordinates status ── */}
      {lat && lng ? (
        <div style={{ marginTop: 8, padding: '7px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', fontWeight: 500, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>check_circle</span>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</span>
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>ลากหมุดหรือคลิกบนแผนที่เพื่อปรับ</span>
        </div>
      ) : (
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>
          คลิกบนแผนที่ ลากหมุด หรือค้นหาชื่อสถานที่ด้านบน
        </p>
      )}

      {/* ── Manual lat / lng inputs (small override) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: 10, marginTop: 10 }}>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>Lat (ละติจูด)</label>
          <input value={lat} onChange={e => onLatLng(e.target.value, lng)} placeholder="13.756300" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>Lng (ลองจิจูด)</label>
          <input value={lng} onChange={e => onLatLng(lat, e.target.value)} placeholder="100.501800" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Thailand Cascading Address Select ────────────────────────────────────────
type AddrItem = { id: number; name: string; zip?: string }

function ThaiAddressSelect({ form, onChange }: {
  form: Pick<ListingFormState, 'address_th' | 'district' | 'sub_district' | 'province' | 'postcode'>
  onChange: (k: string, v: string) => void
}) {
  const [provinces, setProvinces] = useState<AddrItem[]>([])
  const [amphures,  setAmphures]  = useState<AddrItem[]>([])
  const [tambons,   setTambons]   = useState<AddrItem[]>([])
  const [provId, setProvId] = useState<number | null>(null)
  const [amphId, setAmphId] = useState<number | null>(null)
  const [loadA, setLoadA]   = useState(false)
  const [loadT, setLoadT]   = useState(false)
  const isMob = useWindowWidth() < 768

  // Load province list once on mount
  useEffect(() => {
    fetch('/api/thailand-address?level=provinces')
      .then(r => r.json())
      .then((d: AddrItem[]) => { if (Array.isArray(d)) setProvinces(d) })
      .catch(() => {})
  }, [])

  // Pre-populate province → districts when editing an existing listing
  useEffect(() => {
    if (!provinces.length || !form.province || provId !== null) return
    const p = provinces.find(p => p.name === form.province)
    if (!p) return
    setProvId(p.id)
    setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${p.id}`)
      .then(r => r.json())
      .then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) })
      .catch(() => setLoadA(false))
  }, [provinces, form.province, provId])

  // Pre-populate district → sub-districts when editing an existing listing
  useEffect(() => {
    if (!amphures.length || !form.district || amphId !== null) return
    const a = amphures.find(a => a.name === form.district)
    if (!a) return
    setAmphId(a.id)
    setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${a.id}`)
      .then(r => r.json())
      .then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) })
      .catch(() => setLoadT(false))
  }, [amphures, form.district, amphId])

  function selectProvince(id: number) {
    const p = provinces.find(p => p.id === id)
    if (!p) return
    onChange('province', p.name)
    onChange('district', '')
    onChange('sub_district', '')
    onChange('postcode', '')
    setProvId(id); setAmphId(null); setAmphures([]); setTambons([])
    setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${id}`)
      .then(r => r.json())
      .then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) })
      .catch(() => setLoadA(false))
  }

  function selectAmphure(id: number) {
    const a = amphures.find(a => a.id === id)
    if (!a) return
    onChange('district', a.name)
    onChange('sub_district', '')
    onChange('postcode', '')
    setAmphId(id); setTambons([])
    setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${id}`)
      .then(r => r.json())
      .then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) })
      .catch(() => setLoadT(false))
  }

  function selectTambon(name: string) {
    const t = tambons.find(t => t.name === name)
    if (!t) return
    onChange('sub_district', t.name)
    onChange('postcode', t.zip ?? '')
  }

  function selStyle(disabled: boolean): React.CSSProperties {
    return { ...SINP, background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#94a3b8' : '#334155', cursor: disabled ? 'not-allowed' : 'pointer' }
  }

  return (
    <div>
      {/* Address line */}
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>ที่อยู่ (ชื่ออาคาร / ถนน / เลขที่)</label>
        <input value={form.address_th} onChange={e => onChange('address_th', e.target.value)} placeholder="เช่น Metro Luxe Rama 4  ถนนพระราม 4" style={SINP} />
      </div>

      {/* Province */}
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>จังหวัด *</label>
        <select
          value={provId ?? ''}
          onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectProvince(id) }}
          style={{ ...SINP, cursor: 'pointer' }}
        >
          <option value="">{provinces.length === 0 ? 'กำลังโหลด…' : 'เลือกจังหวัด'}</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* District + Sub-district */}
      <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>
            เขต / อำเภอ
            {loadA && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4, display: 'inline-block', animation: 'spin .8s linear infinite' }}>sync</span>}
          </label>
          <select
            value={amphId ?? ''}
            onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectAmphure(id) }}
            disabled={!provId || loadA}
            style={selStyle(!provId || loadA)}
          >
            <option value="">{!provId ? 'เลือกจังหวัดก่อน' : loadA ? 'กำลังโหลด…' : 'เลือกเขต / อำเภอ'}</option>
            {amphures.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label style={SLBL}>
            แขวง / ตำบล
            {loadT && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4, display: 'inline-block', animation: 'spin .8s linear infinite' }}>sync</span>}
          </label>
          <select
            value={form.sub_district || ''}
            onChange={e => selectTambon(e.target.value)}
            disabled={!amphId || loadT}
            style={selStyle(!amphId || loadT)}
          >
            <option value="">{!amphId ? 'เลือกเขต/อำเภอก่อน' : loadT ? 'กำลังโหลด…' : 'เลือกแขวง / ตำบล'}</option>
            {tambons.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Postcode */}
      <div>
        <label style={SLBL}>รหัสไปรษณีย์</label>
        <input
          value={form.postcode}
          onChange={e => onChange('postcode', e.target.value)}
          placeholder="10110"
          style={{ ...SINP, width: 130 }}
        />
        {form.postcode && <span style={{ fontSize: 11.5, color: '#048c73', marginLeft: 8, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{form.postcode}</span>}
      </div>
    </div>
  )
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({ images, onImagesChange }: { images: string[]; onImagesChange: (imgs: string[]) => void }) {
  const [uploading,       setUploading]       = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState(0)   // 0–100
  const [uploadStatus,    setUploadStatus]    = useState('')   // e.g. "1/3"
  const [uploadError,     setUploadError]     = useState('')
  const [hoveredIdx,      setHoveredIdx]      = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function uploadFileXHR(fd: FormData, token: string, onProgress: (pct: number) => void): Promise<{ url?: string; error?: string }> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)) }
      xhr.onload  = () => { try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({ error: 'Parse error' }) } }
      xhr.onerror = () => resolve({ error: 'เชื่อมต่อ API ไม่ได้' })
      xhr.open('POST', '/api/dashboard/upload')
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(fd)
    })
  }

  async function handleFiles(files: FileList) {
    setUploading(true); setUploadError(''); setUploadProgress(0)
    const { data: { session: upSess } } = await createBrowserClient().auth.getSession()
    const token    = upSess?.access_token ?? ''
    const fileArr  = Array.from(files)
    const total    = fileArr.length
    const added: string[] = []
    for (let i = 0; i < total; i++) {
      setUploadStatus(`${i + 1}/${total}`)
      const fd = new FormData(); fd.append('file', fileArr[i]); fd.append('type', 'image')
      const d = await uploadFileXHR(fd, token, pct => {
        setUploadProgress(Math.round((i * 100 + pct) / total))
      })
      if (d.url) added.push(d.url)
      else setUploadError(d.error || 'อัปโหลดไม่สำเร็จ')
    }
    if (added.length) onImagesChange([...images, ...added])
    setUploading(false); setUploadProgress(0); setUploadStatus('')
  }

  // Promote clicked image to index 0 (becomes thumbnail/cover)
  function setAsCover(idx: number) {
    if (idx === 0) return
    const next = [...images]
    const [picked] = next.splice(idx, 1)
    next.unshift(picked)
    onImagesChange(next)
  }

  const limit = images.length >= 10

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) handleFiles(e.target.files) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || limit}
        style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: '1.5px dashed ' + (limit ? '#eef0ef' : '#c7d2d0'), background: uploading ? '#f8fafc' : '#fafffe', color: limit ? '#94a3b8' : '#048c73', fontWeight: 600, fontSize: 13, cursor: (uploading || limit) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {uploading ? <><span style={{ width: 16, height: 16, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปโหลด{uploadStatus ? ` ${uploadStatus}` : ''}…</>
          : limit ? <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span> อัปโหลดครบ 10 รูปแล้ว</>
          : <><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>photo_library</span> เลือกรูปภาพห้อง (JPG · PNG · WebP  •  สูงสุด 10 รูป)</>}
      </button>
      {/* Upload progress bar */}
      {uploading && (
        <div style={{ marginTop: 6 }}>
          <div style={{ height: 5, borderRadius: 4, background: '#e8f5f0', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(to right, #048c73, #02402e)', width: `${uploadProgress}%`, transition: 'width .2s ease' }} />
          </div>
          <p style={{ fontSize: 11, color: '#048c73', margin: '3px 0 0', textAlign: 'right' }}>{uploadProgress}%</p>
        </div>
      )}
      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {images.length > 0 && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {images.map((url, i) => (
              <div
                key={url + i}
                style={{ position: 'relative', flexShrink: 0, cursor: i !== 0 ? 'pointer' : 'default' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <img
                  src={url} alt=""
                  style={{
                    width: 90, height: 68, objectFit: 'cover', borderRadius: 8, display: 'block',
                    border: i === 0 ? '2.5px solid #02402e' : hoveredIdx === i ? '2px solid #048c73' : '1px solid #eef0ef',
                    transition: 'border-color .15s',
                  }}
                />
                {/* Cover badge — always on first image */}
                {i === 0 && (
                  <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, background: '#02402e', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: .3 }}>
                    <span className="msym" style={{ fontSize: 9, fontVariationSettings: "'wght' 500, 'FILL' 1", verticalAlign: 'middle' }}>star</span> หน้าปก
                  </span>
                )}
                {/* Set as cover — hover overlay on non-first images */}
                {i !== 0 && hoveredIdx === i && (
                  <button
                    type="button"
                    onClick={() => setAsCover(i)}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 8, border: 'none',
                      background: 'rgba(2,64,46,.72)', color: '#fff',
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                    }}
                  >
                    <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>star</span>
                    <span>ตั้งหน้าปก</span>
                  </button>
                )}
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#b91c1c', border: '2px solid #fff', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 2 }}
                ><span className="msym" style={{ fontSize: 12, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>close</span></button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
            คลิกบนรูปเพื่อตั้งเป็นรูปหน้าปก • รูปแรกจะแสดงเป็น Thumbnail บนเว็บไซต์
          </p>
        </>
      )}
    </div>
  )
}

// ── Video Upload Zone ─────────────────────────────────────────────────────────
function VideoUploadZone({ videoUrl, onVideoChange, packageType }: { videoUrl: string; onVideoChange: (url: string) => void; packageType: string }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isPremium = packageType === 'premium'

  async function handleFile(file: File) {
    setUploading(true); setUploadError('')
    const { data: { session: vidSess } } = await createBrowserClient().auth.getSession()
    const fd = new FormData(); fd.append('file', file); fd.append('type', 'video')
    try {
      const r = await fetch('/api/dashboard/upload', { method: 'POST', headers: { Authorization: `Bearer ${vidSess?.access_token}` }, body: fd })
      const d = await r.json()
      if (d.url) onVideoChange(d.url)
      else setUploadError(d.error || 'อัปโหลดไม่สำเร็จ')
    } catch { setUploadError('เชื่อมต่อ API ไม่ได้') }
    setUploading(false)
  }

  if (!isPremium) {
    return (
      <div style={{ background: '#f8fafc', border: '1.5px dashed #eef0ef', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: 6 }}><span className="msym" style={{ fontSize: 28, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>videocam</span></div>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontWeight: 500 }}>วิดีโอเฉพาะแพ็กเกจ Premium</p>
        <p style={{ color: '#c7d2d0', fontSize: 12, margin: '4px 0 0' }}>เปลี่ยนแพ็กเกจเป็น Premium ด้านบนเพื่อเพิ่มวิดีโอ</p>
      </div>
    )
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontWeight: 600, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
        {uploading ? <><span style={{ width: 14, height: 14, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปโหลด...</> : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>videocam</span> อัปโหลดวิดีโอ (MP4 · QuickTime · WebM  •  สูงสุด 50 MB)</>}
      </button>
      <div>
        <label style={{ ...SLBL, fontSize: 12 }}>หรือวางลิงก์วิดีโอ (YouTube / Vimeo)</label>
        <input value={videoUrl.startsWith('http') && !videoUrl.includes('supabase') ? videoUrl : ''} onChange={e => onVideoChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={SINP} />
      </div>
      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {videoUrl && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73', flexShrink: 0 }}>check_circle</span>{videoUrl.length > 60 ? videoUrl.slice(0, 60) + '…' : videoUrl}</span>
          <button type="button" onClick={() => onVideoChange('')} style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ── Condo / House Rental Detail ───────────────────────────────────────────────
// ── Condo name autocomplete — matches against SEO registry ───────────────────
function PropertyNameAutocomplete({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [allNames, setAllNames] = useState<{ name_th: string; name_en: string | null }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch from Supabase registry once on mount
  useEffect(() => {
    fetch('/api/dashboard/property-names')
      .then(r => r.json())
      .then(d => {
        setAllNames((d.names ?? []).map((n: { name_th: string; name_en: string | null }) => ({
          name_th: n.name_th,
          name_en: n.name_en,
        })))
      })
      .catch(() => {})
  }, [])

  // Search: match against name_th, name_en, or partial
  const suggestions = value.trim().length < 2 ? [] : (() => {
    const q = value.toLowerCase().trim()
    const starts: typeof allNames = []
    const contains: typeof allNames = []
    for (const n of allNames) {
      const th = n.name_th.toLowerCase()
      const en = (n.name_en ?? '').toLowerCase()
      if (th.startsWith(q) || en.startsWith(q)) starts.push(n)
      else if (th.includes(q) || en.includes(q)) contains.push(n)
    }
    return [...starts, ...contains].slice(0, 8)
  })()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => { if (value.length >= 2) setOpen(true) }}
        placeholder="เช่น แอชตัน อโศก, Ashton Asoke"
        style={SINP}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 200, top: 'calc(100% + 3px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(2,64,46,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 14px 5px', borderBottom: '1px solid #f1f5f9', fontSize: 10.5, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ชื่อแนะนำ
          </div>
          {suggestions.map(s => (
            <button key={s.name_th} type="button"
              onMouseDown={() => { onChange(s.name_th); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', border: 'none',
                padding: '10px 14px', fontSize: 13, color: '#1e293b', background: 'none',
                borderBottom: '1px solid #f8fafc', cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#eaf6f1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontWeight: 600, color: '#02402e' }}>{s.name_th}</span>
              {s.name_en && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{s.name_en}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CondoHouseRentalDetail({ detail, propertyType, onChange, isMobile }: {
  detail: CondoRentalDetail
  propertyType: string
  onChange: (d: CondoRentalDetail) => void
  isMobile?: boolean
}) {
  function u(k: keyof CondoRentalDetail, v: string) { onChange({ ...detail, [k]: v }) }
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }
  const isHouse = propertyType === 'house'

  return (
    <div>
      <div style={{ ...g2, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>{isHouse ? 'บ้านเลขที่ / House No.' : 'เลขห้อง / Unit No.'}</label>
          <input value={detail.unit_number} onChange={e => u('unit_number', e.target.value)} placeholder={isHouse ? 'เช่น 88/10' : '101'} style={SINP} />
        </div>
        <div>
          <label style={SLBL}>{isHouse ? 'จำนวนชั้นในบ้าน' : 'ชั้นที่'}</label>
          <input type="number" value={detail.floor} onChange={e => u('floor', e.target.value)} placeholder={isHouse ? '2' : '5'} style={SINP} />
        </div>
      </div>
      <div style={{ ...g2, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>{isHouse ? 'ทิศทางบ้าน / หน้าบ้านหันไปทาง' : 'ทิศทางห้อง'}</label>
          <select value={detail.facing} onChange={e => u('facing', e.target.value)} style={{ ...SINP, cursor: 'pointer' }}>
            <option value="">-- เลือกทิศ --</option>
            {FACING_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label style={SLBL}>พื้นที่ใช้สอย (ตร.ม.) *</label>
          <input type="number" value={detail.size_sqm} onChange={e => u('size_sqm', e.target.value)} placeholder={isHouse ? '120' : '35'} style={SINP} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={SLBL}>
          {isHouse ? 'ชื่อโครงการ / หมู่บ้าน' : 'ชื่อคอนโด'}
          {!isHouse && (
            <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 400, color: '#048c73' }}>
              — เลือกจากรายการ SEO เพื่อ ranking ที่ดีขึ้น
            </span>
          )}
        </label>
        {isHouse ? (
          <input value={detail.property_name} onChange={e => u('property_name', e.target.value)}
            placeholder="เช่น บ้านปลายฟ้า พระราม 9" style={SINP} />
        ) : (
          <PropertyNameAutocomplete
            value={detail.property_name}
            onChange={v => u('property_name', v)}
          />
        )}
      </div>
      {/* Price grid */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 14px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#02402e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 5 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>payments</span>ราคาเช่าตามระยะสัญญา</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 10 }}>
          {([
            { key: 'price_12mo', label: '12 เดือน', ph: '15,000' },
            { key: 'price_6mo',  label: '6 เดือน',  ph: '16,000' },
            { key: 'price_3mo',  label: '3 เดือน',  ph: '17,000' },
            { key: 'price_1mo',  label: '1 เดือน',  ph: '18,000' },
          ] as const).map(({ key, label, ph }) => (
            <div key={key}>
              <label style={{ ...SLBL, fontSize: 11.5 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>฿</span>
                <input type="number" value={detail[key]} onChange={e => u(key, e.target.value)} placeholder={ph}
                  style={{ ...SINP, padding: '7px 8px 7px 20px', fontSize: 13 }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>ราคาที่แสดงในหน้าค้นหาจะใช้ราคา 12 เดือน (ต่ำสุด)</p>
      </div>
    </div>
  )
}

// ── Rental Charges Section (Apartment only) ───────────────────────────────────
function RentalChargesSection({ charges, onChange, isMobile }: {
  charges: RentalCharges
  onChange: (c: RentalCharges) => void
  isMobile?: boolean
}) {
  function u(k: keyof RentalCharges, v: any) { onChange({ ...charges, [k]: v }) }

  function toggleOther(val: string) {
    const arr = charges.other_charges
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    // Remove fee when deselecting
    const fees = { ...charges.other_charges_fees }
    if (arr.includes(val)) delete fees[val]
    onChange({ ...charges, other_charges: next, other_charges_fees: fees })
  }

  function setOtherFee(key: string, fee: string) {
    onChange({ ...charges, other_charges_fees: { ...charges.other_charges_fees, [key]: fee } })
  }

  const rateOpts: { value: RateType; label: string }[] = [
    { value: 'fixed',    label: 'ราคาคงที่ (บาท/หน่วย)' },
    { value: 'min_rate', label: 'ราคาขั้นต่ำ' },
    { value: 'ask',      label: 'สอบถามเจ้าของ' },
  ]

  function RateRow({ label, type, fixed, minRate, onType, onFixed, onMinRate }: {
    label: string; type: RateType; fixed: string; minRate: string
    onType: (t: RateType) => void; onFixed: (v: string) => void; onMinRate: (v: string) => void
  }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={SLBL}>{label}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: type !== 'ask' ? 8 : 0 }}>
          {rateOpts.map(o => (
            <button key={o.value} type="button" onClick={() => onType(o.value)}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: `1.5px solid ${type === o.value ? '#048c73' : '#eef0ef'}`,
                background: type === o.value ? '#eaf6f1' : '#fff',
                color: type === o.value ? '#02402e' : '#64748b',
                fontWeight: type === o.value ? 600 : 400 }}>
              {o.label}
            </button>
          ))}
        </div>
        {type === 'fixed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="text" inputMode="decimal" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="6.50"
              style={{ ...SINP, width: 130 }} />
            <span style={{ fontSize: 12.5, color: '#64748b' }}>บาท / หน่วย</span>
          </div>
        )}
        {type === 'min_rate' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>ราคาต่อหน่วย (บาท)</label>
                  <input type="text" inputMode="decimal" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="3.50"
                    style={{ ...SINP, width: 120 }} />
                </div>
                <span style={{ fontSize: 18, color: '#c7d2d0', paddingBottom: 4 }}>×</span>
                <span style={{ fontSize: 12.5, color: '#64748b', paddingBottom: 4 }}>หน่วย</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>ราคาขั้นต่ำ (บาท/เดือน)</label>
                  <input type="text" inputMode="decimal" value={minRate} onChange={e => onMinRate(e.target.value)} placeholder="200"
                    style={{ ...SINP, width: 130 }} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '5px 0 0' }}>
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0", flexShrink: 0, marginRight: 4 }}>tips_and_updates</span>เรียกเก็บ <strong>ราคาที่สูงกว่า</strong> ระหว่าง (ราคา/หน่วย × จำนวนหน่วย) กับราคาขั้นต่ำ
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <RateRow label="ค่าน้ำประปา (ต่อหน่วย)"
        type={charges.water_type} fixed={charges.water_fixed} minRate={charges.water_min_rate}
        onType={v => u('water_type', v)} onFixed={v => u('water_fixed', v)} onMinRate={v => u('water_min_rate', v)} />
      <RateRow label="ค่าไฟฟ้า (ต่อหน่วย)"
        type={charges.electricity_type} fixed={charges.electricity_fixed} minRate={charges.electricity_min_rate}
        onType={v => u('electricity_type', v)} onFixed={v => u('electricity_fixed', v)} onMinRate={v => u('electricity_min_rate', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={SLBL}>เงินมัดจำ (เดือน)</label>
          <input type="number" value={charges.security_deposit} onChange={e => u('security_deposit', e.target.value)} placeholder="2" style={SINP} />
        </div>
        <div>
          <label style={SLBL}>เงินล่วงหน้า (เดือน)</label>
          <input type="number" value={charges.advance_deposit} onChange={e => u('advance_deposit', e.target.value)} placeholder="1" style={SINP} />
        </div>
      </div>
      <div>
        <label style={SLBL}>ค่าใช้จ่ายอื่น ๆ (เลือกที่เรียกเก็บ)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OTHER_CHARGES_OPTIONS.map(o => {
            const on = charges.other_charges.includes(o.value)
            return (
              <div key={o.value} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" onClick={() => toggleOther(o.value)}
                  style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', flexShrink: 0,
                    border: on ? 'none' : '1px solid #eef0ef',
                    background: on ? '#02402e' : '#f8fafc',
                    color: on ? '#fff' : '#64748b',
                    fontWeight: on ? 600 : 400 }}>
                  {on && <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 500, 'FILL' 1", marginRight: 2 }}>check</span>}{o.label}
                </button>
                {on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>฿</span>
                    <input
                      type="number"
                      value={charges.other_charges_fees[o.value] ?? ''}
                      onChange={e => setOtherFee(o.value, e.target.value)}
                      placeholder="500"
                      style={{ ...SINP, width: 110, padding: '6px 10px', fontSize: 12.5 }}
                    />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>บาท/เดือน</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Deposit section — for condo / house / office / coworking ─────────────────
// Shows only security deposit, advance deposit, and optional key deposit.
// (Apartment uses the full RentalChargesSection which also covers utilities.)
function DepositSection({ charges, onChange, isMobile }: {
  charges: RentalCharges
  onChange: (c: RentalCharges) => void
  isMobile?: boolean
}) {
  function u(k: keyof RentalCharges, v: any) { onChange({ ...charges, [k]: v }) }
  return (
    <div>
      {/* เงินประกัน + เงินล่วงหน้า */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={SLBL}>เงินประกัน (เดือน)</label>
          <input type="number" value={charges.security_deposit} onChange={e => u('security_deposit', e.target.value)} placeholder="2" style={SINP} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>โดยทั่วไป 2 เดือน</p>
        </div>
        <div>
          <label style={SLBL}>เงินล่วงหน้า (เดือน)</label>
          <input type="number" value={charges.advance_deposit} onChange={e => u('advance_deposit', e.target.value)} placeholder="1" style={SINP} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>โดยทั่วไป 1 เดือน</p>
        </div>
      </div>
      {/* เงินมัดจำกุญแจ (ไม่บังคับ) */}
      <div>
        <label style={SLBL}>เงินมัดจำกุญแจ (บาท) — ไม่บังคับ</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            value={charges.key_deposit}
            onChange={e => u('key_deposit', e.target.value)}
            placeholder="เช่น 500"
            style={{ ...SINP, maxWidth: 180 }}
          />
          <span style={{ fontSize: 12.5, color: '#64748b' }}>บาท</span>
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>หากเว้นว่าง จะไม่แสดงรายการนี้บนหน้าประกาศ</p>
      </div>
    </div>
  )
}

// ── Submit data serializer (shared between Create and Edit) ───────────────────
function prepareSubmitData(form: ListingFormState) {
  let price_from = parseInt(form.price_from) || 0
  let price_to: number | null = form.price_to ? parseInt(form.price_to) : null
  let room_types: any[] = form.room_types
  let floor: number | null = form.floor ? parseInt(form.floor) : null
  let area_sqm: number | null = form.area_sqm ? parseFloat(form.area_sqm) : null

  if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
    const prices = form.apartment_units.map(u => parseFloat(u.price_1mo) || 0).filter(n => n > 0)
    price_from = prices.length > 0 ? Math.min(...prices) : 0
    price_to   = prices.length > 1 ? Math.max(...prices) : (prices[0] ?? null)
    // All three types now prefix with a charges block (deposit info) + unit rows
    room_types = [
      { _type: 'charges', ...form.rental_charges },
      ...form.apartment_units.map(({ id: _id, ...u }) => ({ _type: 'apt_unit', ...u })),
    ]
  } else if (['condo', 'house'].includes(form.property_type)) {
    const r = form.condo_rental
    price_from = parseFloat(r.price_12mo || r.price_1mo || '0') || 0
    price_to   = r.price_1mo ? parseFloat(r.price_1mo) : null
    // Prefix with charges block (deposit info), then rental detail
    room_types = [
      { _type: 'charges', ...form.rental_charges },
      { _type: 'rental_detail', ...r },
    ]
    floor      = r.floor ? parseInt(r.floor) : null
    area_sqm   = r.size_sqm ? parseFloat(r.size_sqm) : null
  }

  return { price_from, price_to, room_types, floor, area_sqm }
}

// ── Form Fields (all 9 sections) ──────────────────────────────────────────────
function ListingFormFields({ form, onChange, onAmenityToggle, onImagesChange, onRoomTypesChange, isAdmin = true, isMobile = false }: {
  form: ListingFormState
  onChange: (k: string, v: any) => void
  onAmenityToggle: (a: string) => void
  onImagesChange: (imgs: string[]) => void
  onRoomTypesChange: (rows: RoomTypeRow[]) => void
  isAdmin?: boolean
  isMobile?: boolean
}) {
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }
  const termLabel = RENTAL_TERM_LABEL[form.rental_term] ?? '/เดือน'
  const isDaily   = form.rental_term === 'daily'
  const roomOpts  = getRoomTypeOptions(form.property_type)
  const [descTab, setDescTab] = useState<'th' | 'en'>('th')

  const isApartment     = form.property_type === 'apartment'
  const isCondoOrHouse  = ['condo', 'house'].includes(form.property_type)
  const isOfficeOrCo    = ['office', 'coworking'].includes(form.property_type)
  const showBedsBaths   = isCondoOrHouse
  // Apartment: area average only | Condo/House: size in rental detail | Office/Coworking: area + floor
  const showAreaSqm     = isApartment || isOfficeOrCo
  const showFloorSect3  = isOfficeOrCo

  // Derive price_from from minimum room type price (office/coworking)
  const derivedPriceFrom = form.room_types.length > 0
    ? Math.min(...form.room_types.map(r => parseFloat(r.price_from) || 0).filter(n => n > 0))
    : null

  // Package UI (shared across all property types)
  const PackageSelector = (
    isAdmin ? (
      <div style={{ marginBottom: 16 }}>
        <label style={SLBL}>แพ็กเกจประกาศ (Admin)</label>
        <select value={form.package_type} onChange={e => onChange('package_type', e.target.value)} style={SINP}>
          {ADMIN_PACKAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <p style={{ fontSize: 11.5, margin: '4px 0 0', fontWeight: 500, color: form.package_type === 'admin' ? '#94a3b8' : '#048c73' }}>
          {form.package_type === 'admin'
            ? 'ไม่มีวันหมดอายุ — อยู่บนเว็บจนกว่าจะลบ'
            : `⏱ หมดอายุ: ${new Date(computeExpiry(form.package_type) ?? '').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`}
        </p>
      </div>
    ) : (
      <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0fbf8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#048c73' }}>แพ็กเกจ:</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#02402e' }}>
          {ADMIN_PACKAGES.find(p => p.id === form.package_type)?.label ?? form.package_type}
        </span>
      </div>
    )
  )

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          1 · ข้อมูลหลัก
          Property type is FIRST — the form adapts its fields based on this.
      ════════════════════════════════════════════════════════════════════ */}
      <div id="lf-s1" style={{ marginBottom: 24 }}>
        <SectionHead text="1 · ข้อมูลหลัก" />

        {/* Property type — first so conditional fields below adapt */}
        <div style={{ marginBottom: 14 }}>
          <label style={SLBL}>ประเภทอสังหาฯ *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { value: 'condo',     icon: 'apartment',      label: 'คอนโด' },
              { value: 'apartment', icon: 'domain',         label: 'อพาร์ทเม้นท์' },
              { value: 'house',     icon: 'home',           label: 'บ้าน' },
              { value: 'office',    icon: 'corporate_fare', label: 'ออฟฟิศ' },
              { value: 'coworking', icon: 'hub',            label: 'Co-Working' },
            ].map(o => (
              <button key={o.value} type="button" onClick={() => onChange('property_type', o.value)}
                style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  border: `1.5px solid ${form.property_type === o.value ? '#02402e' : '#eef0ef'}`,
                  background: form.property_type === o.value ? '#02402e' : '#fff',
                  color: form.property_type === o.value ? '#fff' : '#64748b', transition: 'all .15s' }}>
                <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={SLBL}>ชื่อประกาศ (ภาษาไทย) *</label>
          <input value={form.title_th} onChange={e => onChange('title_th', e.target.value)} placeholder="เช่น เช่าคอนโด เอกมัย ห้องสวย วิวดี" required style={SINP} />
        </div>
        <div>
          <label style={SLBL}>ชื่อประกาศ (ภาษาอังกฤษ)</label>
          <input value={form.title_en} onChange={e => onChange('title_en', e.target.value)} placeholder="Condo for Rent near BTS Ekkamai" style={SINP} />
        </div>

        {/* ── Slug (editable, auto-generated from title_en → title_th) ── */}
        <div style={{ marginTop: 14 }}>
          <label style={SLBL}>
            Slug (URL)
            {['condo', 'house'].includes(form.property_type) && (
              <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 400, color: '#94a3b8' }}>
                คอนโด/บ้าน → ใช้รูปแบบ ชื่ออาคาร/ประเภท-unique
              </span>
            )}
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none', whiteSpace: 'nowrap' }}>/property/</span>
              <input
                value={form.slug}
                onChange={e => onChange('slug', e.target.value.replace(/\s+/g, '-').replace(/[^฀-๿\w/-]/g, '').toLowerCase())}
                placeholder="building-name/condo-abc123"
                style={{ ...SINP, paddingLeft: 72 }}
              />
            </div>
            <button type="button"
              onClick={() => onChange('slug', buildAutoSlug(form.title_en, form.title_th, form.property_type))}
              title="สร้าง Slug ใหม่"
              style={{ padding: '0 12px', borderRadius: 8, border: '1.5px solid #eef0ef', background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0", verticalAlign: 'middle' }}>refresh</span>
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
            URL จริง: spacesmate.com/property/{form.slug || 'ชื่อ-อาคาร-unique'}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2 · แพ็กเกจ & ราคา  — adapts per property type
      ════════════════════════════════════════════════════════════════════ */}
      <div id="lf-s2" style={{ marginBottom: 24 }}>

        {/* ── APARTMENT ── whole-building multi-unit table ── */}
        {isApartment && (
          <>
            <SectionHead text="2 · แพ็กเกจ" />
            {PackageSelector}
            <SectionHead text="2B · ประเภทและราคาห้อง" />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              เพิ่มแต่ละประเภทห้องพร้อมขนาดและราคา (ราคาในหน้าค้นหาจะดึงจาก ต่ำสุด–สูงสุด ของตาราง)
            </p>
            <ApartmentUnitGrid
              rows={form.apartment_units}
              onChange={rows => onChange('apartment_units', rows)}
              roomTypeOptions={roomOpts}
            />
          </>
        )}

        {/* ── CONDO / HOUSE ── single-unit rental detail ── */}
        {isCondoOrHouse && (
          <>
            <SectionHead text="2 · แพ็กเกจ" />
            {PackageSelector}
            <SectionHead text="2B · รายละเอียดการเช่า" />
            <CondoHouseRentalDetail
              detail={form.condo_rental}
              propertyType={form.property_type}
              onChange={d => onChange('condo_rental', d)}
              isMobile={isMobile}
            />
            {/* Condo: beds/baths inline here (section 3 removed for condo) */}
            {form.property_type === 'condo' && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 14 }}>
                <div>
                  <label style={SLBL}>ห้องนอน</label>
                  <select value={form.bedrooms} onChange={e => onChange('bedrooms', e.target.value)} style={SINP}>
                    {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : `${n} ห้อง`}</option>)}
                  </select>
                </div>
                <div>
                  <label style={SLBL}>ห้องน้ำ</label>
                  <select value={form.bathrooms} onChange={e => onChange('bathrooms', e.target.value)} style={SINP}>
                    {['1','2','3','4'].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── OFFICE / COWORKING ── same unit table as Apartment ── */}
        {isOfficeOrCo && (
          <>
            <SectionHead text="2 · แพ็กเกจ" />
            {PackageSelector}
            <SectionHead text="2B · ประเภทและราคาพื้นที่" />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              เพิ่มแต่ละประเภทพื้นที่พร้อมขนาดและราคา (ราคาในหน้าค้นหาจะดึงจาก ต่ำสุด–สูงสุด ของตาราง)
            </p>
            <ApartmentUnitGrid
              rows={form.apartment_units}
              onChange={rows => onChange('apartment_units', rows)}
              roomTypeOptions={roomOpts}
            />
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3 · ขนาดและลักษณะ
          Apartment: area_sqm (average across units)
          House: bedrooms + bathrooms
          Condo / Office / Co-Working: section hidden (data lives in their own sections)
      ════════════════════════════════════════════════════════════════════ */}
      {(isApartment || form.property_type === 'house') && (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text="3 · ขนาดและลักษณะ" />

          {isApartment && (
            <>
              <div style={{ padding: '10px 14px', background: '#fef9c3', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 4 }}>tips_and_updates</span>ขนาดเฉลี่ยของห้องในอาคาร — รายละเอียดแต่ละประเภทห้องอยู่ในตารางด้านบน
              </div>
              <div>
                <label style={SLBL}>พื้นที่ใช้สอย (ตร.ม.) — ขนาดเฉลี่ย</label>
                <input type="number" value={form.area_sqm} onChange={e => onChange('area_sqm', e.target.value)} placeholder="28 (ขนาดเฉลี่ย)" style={{ ...SINP, maxWidth: 180 }} />
              </div>
            </>
          )}

          {form.property_type === 'house' && (
            <div style={g2}>
              <div>
                <label style={SLBL}>ห้องนอน</label>
                <select value={form.bedrooms} onChange={e => onChange('bedrooms', e.target.value)} style={SINP}>
                  {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                </select>
              </div>
              <div>
                <label style={SLBL}>ห้องน้ำ</label>
                <select value={form.bathrooms} onChange={e => onChange('bathrooms', e.target.value)} style={SINP}>
                  {['1','2','3','4','5'].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          3B · รายละเอียดการเช่า  (Apartment only)
      ════════════════════════════════════════════════════════════════════ */}
      {isApartment && (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text="3B · รายละเอียดการเช่า" />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 14px' }}>ค่าสาธารณูปโภค เงินมัดจำ และค่าใช้จ่ายอื่น ๆ ที่เรียกเก็บ</p>
          <RentalChargesSection
            charges={form.rental_charges}
            onChange={c => onChange('rental_charges', c)}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          3B · รายละเอียดการเช่า  (Condo / House / Office / Co-Working)
          Deposit info — no utility rates (those are building-level for apartments)
      ════════════════════════════════════════════════════════════════════ */}
      {!isApartment && (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text="3B · รายละเอียดการเช่า" />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 14px' }}>เงินประกัน เงินล่วงหน้า และค่ามัดจำอื่น ๆ (เช่น กุญแจ)</p>
          <DepositSection
            charges={form.rental_charges}
            onChange={c => onChange('rental_charges', c)}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          4 · ที่ตั้งและที่อยู่  (cascading Thai address dropdowns)
      ════════════════════════════════════════════════════════════════════ */}
      <div id="lf-s4" style={{ marginBottom: 24 }}>
        <SectionHead text="4 · ที่ตั้งและที่อยู่" />
        <ThaiAddressSelect
          form={{ address_th: form.address_th, district: form.district, sub_district: form.sub_district, province: form.province, postcode: form.postcode }}
          onChange={onChange}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          5 · พิกัดบนแผนที่  (Leaflet map + drag pin + search)
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="5 · พิกัดบนแผนที่" />
        <MapPicker
          lat={form.lat}
          lng={form.lng}
          onLatLng={(lat, lng) => { onChange('lat', lat); onChange('lng', lng) }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          6 · รายละเอียดประกาศ (TH / EN)
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="6 · รายละเอียดประกาศ" />
        {/* Language tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {(['th', 'en'] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setDescTab(lang)}
              style={{
                padding: '6px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: descTab === lang ? '#02402e' : '#f8fafc',
                color:      descTab === lang ? '#fff'    : '#64748b',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {lang === 'th' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English'}
            </button>
          ))}
        </div>
        {descTab === 'th' ? (
          <RichEditor
            key="desc-th"
            value={form.description_th}
            onChange={v => onChange('description_th', v)}
            placeholder="อธิบายรายละเอียดห้อง ทำเล สิ่งอำนวยความสะดวก และจุดเด่น..."
            minHeight={220}
          />
        ) : (
          <RichEditor
            key="desc-en"
            value={form.description_en}
            onChange={v => onChange('description_en', v)}
            placeholder="Describe the room, location, facilities and highlights in English..."
            minHeight={220}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          7 · สิ่งอำนวยความสะดวก  — split for apartment/condo, single for others
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        {(isApartment || isCondoOrHouse) ? (
          <>
            <SectionHead text="7 · สิ่งอำนวยความสะดวก" />
            {/* ── ภายในห้อง ── */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>chair</span>ภายในห้อง</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {AMENITY_ROOM.map(a => {
                const on = form.amenities.includes(a)
                return (
                  <button key={a} type="button" onClick={() => onAmenityToggle(a)}
                    style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s',
                      border: on ? 'none' : '1px solid #eef0ef', background: on ? '#02402e' : '#f8fafc',
                      color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400 }}>
                    {on && <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 500, 'FILL' 1", marginRight: 2 }}>check</span>}{a}
                  </button>
                )
              })}
            </div>
            {/* ── ภายในอาคาร ── */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>domain</span>ภายในอาคาร</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_BUILDING.map(a => {
                const on = form.amenities.includes(a)
                return (
                  <button key={a} type="button" onClick={() => onAmenityToggle(a)}
                    style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s',
                      border: on ? 'none' : '1px solid #eef0ef', background: on ? '#048c73' : '#f8fafc',
                      color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400 }}>
                    {on && <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 500, 'FILL' 1", marginRight: 2 }}>check</span>}{a}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <SectionHead text="7 · สิ่งอำนวยความสะดวก" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_OPTIONS.map(a => {
                const on = form.amenities.includes(a)
                return (
                  <button key={a} type="button" onClick={() => onAmenityToggle(a)}
                    style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s',
                      border: on ? 'none' : '1px solid #eef0ef', background: on ? '#02402e' : '#f8fafc',
                      color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400 }}>
                    {on && <span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 500, 'FILL' 1", marginRight: 2 }}>check</span>}{a}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          8 · รูปภาพห้อง
      ════════════════════════════════════════════════════════════════════ */}
      <div id="lf-s8" style={{ marginBottom: 24 }}>
        <SectionHead text="8 · รูปภาพห้อง" />
        <ImageUploadZone images={form.images} onImagesChange={onImagesChange} />
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>รูปแรกจะเป็นรูปหน้าปกของประกาศ</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          9 · ข้อมูลติดต่อ (แสดงในประกาศ)
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="9 · ข้อมูลติดต่อ (แสดงบนหน้าประกาศ)" />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div>
            <label style={SLBL}>ชื่อผู้ติดต่อ</label>
            <input value={form.contact_name} onChange={e => onChange('contact_name', e.target.value)} placeholder="เช่น คุณสมชาย" style={SINP} />
          </div>
          <div>
            <label style={SLBL}>เบอร์โทรศัพท์</label>
            <input value={form.contact_phone} onChange={e => onChange('contact_phone', e.target.value)} placeholder="0812345678" style={SINP} />
          </div>
          <div>
            <label style={SLBL}>LINE ID</label>
            <input value={form.contact_line} onChange={e => onChange('contact_line', e.target.value)} placeholder="@lineID หรือ lineID" style={SINP} />
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '6px 0 0' }}>หากเว้นว่าง จะแสดงเบอร์และ LINE ของ SpacesMate แทน</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          10 · วิดีโอ (Premium)
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 8 }}>
        <SectionHead text="10 · วิดีโอประกาศ (Premium เท่านั้น)" />
        <VideoUploadZone videoUrl={form.video_url} onVideoChange={v => onChange('video_url', v)} packageType={form.package_type} />
      </div>
    </>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ onClose, onCreated, initialData }: { onClose: () => void; onCreated: () => void; initialData?: Partial<ListingFormState> }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [form,   setForm]   = useState<ListingFormState>({ ...BLANK_FORM, ...initialData })

  function setF(k: string, v: any) {
    setForm(f => {
      const next = { ...f, [k]: v }
      // Auto-generate slug when title changes, only if slug still looks auto-generated
      // (i.e. user hasn't manually overridden it with something custom)
      const isAutoSlug = !f.slug || /^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(f.slug)
      if ((k === 'title_en' || k === 'title_th' || k === 'property_type') && isAutoSlug) {
        const titleEn = k === 'title_en' ? v : f.title_en
        const titleTh = k === 'title_th' ? v : f.title_th
        const type    = k === 'property_type' ? v : f.property_type
        // Only regenerate if the base text changed (not on property_type flip alone when titles are blank)
        if (titleEn || titleTh) {
          next.slug = buildAutoSlug(titleEn, titleTh, type)
        }
      }
      return next
    })
  }
  function toggleAmenity(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Validate by property type
    let validErr = ''
    if (!form.title_th.trim()) {
      validErr = 'กรุณากรอกชื่อประกาศ'
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = 'กรุณาเพิ่มอย่างน้อย 1 ประเภท'
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = 'กรุณากรอกราคาเช่า'
    } else {
      if (!form.price_from) validErr = 'กรุณากรอกราคาเริ่มต้น'
    }
    if (validErr) { setError(validErr); return }

    setSaving(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/dashboard/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          ...form,
          ...extra,
          slug: form.slug.trim() || '',  // use client slug if set, server fallback if empty
          bedrooms:  parseInt(form.bedrooms),
          bathrooms: parseInt(form.bathrooms),
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          expires_at: computeExpiry(form.package_type),
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      onCreated(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  return (
    <ListingDrawer
      title="เพิ่มประกาศใหม่" subtitle="ประกาศจะเผยแพร่ทันทีบนเว็บไซต์"
      form={form} setF={setF} toggleAmenity={toggleAmenity}
      onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
      onRoomTypesChange={rows => setForm(f => ({ ...f, room_types: rows }))}
      saving={saving} error={error} isAdmin={true}
      onClose={onClose} onSubmit={handleSubmit}
      submitLabel="เผยแพร่ประกาศ" submitIcon="publish"
    />
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, onClose, onSaved }: { listing: DbListing; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Parse the new extended DB format back into form state
  const rawRts: any[] = listing.room_types ?? []

  // Apartment / Office / Coworking unit rows
  const apartmentUnits: ApartmentUnitRow[] = ['apartment', 'office', 'coworking'].includes(listing.property_type)
    ? rawRts
        .filter(r => r._type === 'apt_unit' || (!r._type && r.room_type))
        .map((r, i) => ({
          id: `au-${i}`,
          room_type: r.room_type || 'Studio',
          size_sqm:  String(r.size_sqm ?? ''),
          price_1mo: String(r.price_1mo ?? r.price_from ?? ''),
          price_daily: String(r.price_daily ?? ''),
          available_1mo: r.available_1mo ?? false,
          available_3mo: r.available_3mo ?? false,
          price_3mo: String(r.price_3mo ?? ''),
          available_6mo: r.available_6mo ?? false,
          price_6mo: String(r.price_6mo ?? ''),
        }))
    : []

  // Condo/House rental detail
  const condoRaw = rawRts.find(r => r._type === 'rental_detail')
  const condoRental: CondoRentalDetail = condoRaw ? {
    unit_number:   condoRaw.unit_number  ?? '',
    floor:         String(condoRaw.floor ?? listing.floor ?? ''),
    facing:        condoRaw.facing       ?? '',
    size_sqm:      String(condoRaw.size_sqm ?? listing.area_sqm ?? ''),
    property_name: condoRaw.property_name ?? '',
    price_12mo:    String(condoRaw.price_12mo ?? ''),
    price_6mo:     String(condoRaw.price_6mo  ?? ''),
    price_3mo:     String(condoRaw.price_3mo  ?? ''),
    price_1mo:     String(condoRaw.price_1mo  ?? ''),
  } : { ...BLANK_CONDO_RENTAL }

  // Apartment rental charges
  const chargesRaw = rawRts.find(r => r._type === 'charges')
  const rentalCharges: RentalCharges = chargesRaw ? {
    water_type:          chargesRaw.water_type          ?? 'ask',
    water_fixed:         String(chargesRaw.water_fixed  ?? ''),
    water_min_rate:      String(chargesRaw.water_min_rate ?? ''),
    electricity_type:    chargesRaw.electricity_type    ?? 'ask',
    electricity_fixed:   String(chargesRaw.electricity_fixed ?? ''),
    electricity_min_rate: String(chargesRaw.electricity_min_rate ?? ''),
    security_deposit:    String(chargesRaw.security_deposit ?? '2'),
    advance_deposit:     String(chargesRaw.advance_deposit ?? '1'),
    key_deposit:         String(chargesRaw.key_deposit ?? ''),
    other_charges:       chargesRaw.other_charges ?? [],
    other_charges_fees:  chargesRaw.other_charges_fees ?? {},
  } : { ...BLANK_CHARGES }

  const [form, setForm] = useState<ListingFormState>({
    title_th:      listing.title_th,
    title_en:      listing.title_en ?? '',
    slug:          listing.slug,
    property_type: listing.property_type,
    rental_term:   listing.rental_term ?? '1_month',
    package_type:  listing.package_type ?? 'admin',
    price_from:    String(listing.price_from),
    price_to:      listing.price_to ? String(listing.price_to) : '',
    room_types:    [],
    apartment_units: apartmentUnits,
    condo_rental:    condoRental,
    rental_charges:  rentalCharges,
    bedrooms:      String(listing.bedrooms),
    bathrooms:     String(listing.bathrooms),
    floor:         listing.floor ? String(listing.floor) : '',
    area_sqm:      listing.area_sqm ? String(listing.area_sqm) : '',
    address_th:    listing.address_th ?? '',
    district:      listing.district ?? '',
    sub_district:  listing.sub_district ?? '',
    province:      listing.province ?? 'กรุงเทพมหานคร',
    postcode:      listing.postcode ?? '',
    lat:           listing.lat ? String(listing.lat) : '',
    lng:           listing.lng ? String(listing.lng) : '',
    description_th: listing.description_th ?? '',
    description_en: (listing as any).description_en ?? '',
    amenities:     listing.amenities ?? [],
    images:        listing.images ?? [],
    video_url:     listing.video_url ?? '',
    contact_name:  (listing as any).contact_name  ?? '',
    contact_phone: (listing as any).contact_phone ?? '',
    contact_line:  (listing as any).contact_line  ?? '',
  })

  function setF(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function toggleAmenity(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let validErr = ''
    if (!form.title_th.trim()) {
      validErr = 'กรุณากรอกชื่อประกาศ'
    } else if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
      if (form.apartment_units.length === 0) validErr = 'กรุณาเพิ่มอย่างน้อย 1 ประเภท'
    } else if (['condo', 'house'].includes(form.property_type)) {
      if (!form.condo_rental.price_1mo && !form.condo_rental.price_12mo) validErr = 'กรุณากรอกราคาเช่า'
    } else {
      if (!form.price_from) validErr = 'กรุณากรอกราคาเริ่มต้น'
    }
    if (validErr) { setError(validErr); return }

    setSaving(true); setError('')
    try {
      const { data: { session: editSess } } = await createBrowserClient().auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/dashboard/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${editSess?.access_token}` },
        body: JSON.stringify({
          id: listing.id,
          ...form,
          ...extra,
          bedrooms:  parseInt(form.bedrooms),
          bathrooms: parseInt(form.bathrooms),
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          expires_at: computeExpiry(form.package_type),
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      onSaved(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    setSaving(false)
  }

  return (
    <ListingDrawer
      title="แก้ไขประกาศ" subtitle={`ID: ${listing.id.slice(0, 8)}…`}
      form={form} setF={setF} toggleAmenity={toggleAmenity}
      onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))}
      onRoomTypesChange={rows => setForm(f => ({ ...f, room_types: rows }))}
      saving={saving} error={error} isAdmin={true}
      onClose={onClose} onSubmit={handleSubmit}
      submitLabel="บันทึกการแก้ไข" submitIcon="save"
    />
  )
}

// ── Drawer Shell ──────────────────────────────────────────────────────────────
const DRAWER_TABS = [
  { id: 'lf-s1', label: '1 ข้อมูล' },
  { id: 'lf-s2', label: '2 ราคา' },
  { id: 'lf-s4', label: '3 ที่อยู่' },
  { id: 'lf-s8', label: '4 รูปภาพ' },
]

function ListingDrawer({ title, subtitle, form, setF, toggleAmenity, onImagesChange, onRoomTypesChange, saving, error, isAdmin, onClose, onSubmit, submitLabel, submitIcon }: {
  title: string; subtitle: string
  form: ListingFormState
  setF: (k: string, v: any) => void
  toggleAmenity: (a: string) => void
  onImagesChange: (imgs: string[]) => void
  onRoomTypesChange: (rows: RoomTypeRow[]) => void
  saving: boolean; error: string
  isAdmin: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
  submitIcon?: string
}) {
  const w        = useWindowWidth()
  const isMobile = w < 768
  const isSmall  = w < 1024   // tablet + mobile → full-screen from left: 0
  // Desktop: fill content area after the 248px sidebar. No overlay.
  const SIDEBAR  = 248
  const formRef  = useRef<HTMLFormElement>(null)
  const [activeTab, setActiveTab] = useState('lf-s1')

  function scrollToSection(id: string) {
    setActiveTab(id)
    const el = document.getElementById(id)
    if (el && formRef.current) {
      const top = el.offsetTop - 8
      formRef.current.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const drawerPad = isMobile ? '20px 16px' : '28px 40px'

  return (
    <>
      {/* Backdrop for tablet/mobile only */}
      {isSmall && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.35)' }}
          onClick={onClose}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isSmall ? 0 : SIDEBAR,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: '#fff',
          boxShadow: isSmall ? 'none' : '-4px 0 32px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: isMobile ? '14px 16px' : '22px 40px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isSmall && (
              <button onClick={onClose} style={{ background: '#f4f6f5', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>arrow_back</span></button>
            )}
            <div>
              <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, margin: '0 0 2px', color: '#02402e' }}>{title}</h2>
              <p style={{ fontSize: isMobile ? 11.5 : 13, color: '#94a3b8', margin: 0 }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f4f6f5', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>close</span></button>
        </div>

        {/* Section tab strip — all sizes */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #eef0ef', background: '#fafbfa', flexShrink: 0, scrollbarWidth: 'none', padding: isSmall ? '0' : '0 40px' }}>
          {DRAWER_TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => scrollToSection(tab.id)}
              style={{
                padding: isMobile ? '8px 12px' : '10px 20px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#02402e' : '#94a3b8',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${activeTab === tab.id ? '#02402e' : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all .15s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form body — centred content column on desktop */}
        <form ref={formRef} onSubmit={onSubmit} style={{ flex: 1, overflowY: 'auto', padding: drawerPad }}>
          <div style={{ maxWidth: isSmall ? 'none' : 860, margin: '0 auto' }}>
            <ListingFormFields
              form={form} onChange={setF} onAmenityToggle={toggleAmenity}
              onImagesChange={onImagesChange} onRoomTypesChange={onRoomTypesChange}
              isAdmin={isAdmin} isMobile={isMobile}
            />
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-wrap' }}>
                <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 6, flexShrink: 0 }}>warning</span>{error}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div style={{
          padding: isMobile ? '12px 14px 20px' : '18px 40px',
          borderTop: '1px solid #eef0ef',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isSmall ? 'stretch' : 'flex-end',
          gap: 12,
          flexShrink: 0,
        }}>
          {isMobile ? (
            <>
              <button onClick={onSubmit as any} disabled={saving} style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: saving ? '#64748b' : '#02402e', color: '#fff', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก…</> : <>{submitIcon && <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{submitIcon}</span>}{submitLabel}</>}
              </button>
              <button onClick={onClose} style={{ padding: '11px 0', borderRadius: 12, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>ยกเลิก</button>
            </>
          ) : (
            // Desktop / Tablet: right-aligned fixed-width buttons
            <>
              <button onClick={onClose} style={{ width: 140, padding: '13px 0', borderRadius: 12, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={onSubmit as any} disabled={saving} style={{ width: 220, padding: '13px 0', borderRadius: 12, border: 'none', background: saving ? '#64748b' : '#02402e', color: '#fff', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก…</> : <>{submitIcon && <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{submitIcon}</span>}{submitLabel}</>}
              </button>
            </>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </>
  )
}

// ── Published Tab ─────────────────────────────────────────────────────────────
function PublishedTab({ refreshKey }: { refreshKey: number }) {
  const [dbListings,       setDbListings]       = useState<DbListing[]>([])
  const [loadingDb,        setLoadingDb]        = useState(true)
  const [search,           setSearch]           = useState('')
  const [typeFilter,       setTypeFilter]       = useState('')
  const [editTarget,       setEditTarget]       = useState<DbListing | null>(null)
  const [deleting,         setDeleting]         = useState<string | null>(null)
  const [toggling,         setToggling]         = useState<Set<string>>(new Set())

  const loadDb = useCallback(async () => {
    setLoadingDb(true)
    const r = await fetch('/api/dashboard/listings')
    const d = await r.json()
    setDbListings(d.listings ?? [])
    setLoadingDb(false)
  }, [])

  useEffect(() => { loadDb() }, [loadDb, refreshKey])

  // Auto-open edit drawer when navigated here with ?editId=<id>
  useEffect(() => {
    if (!dbListings.length) return
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('editId')
    if (editId) {
      const target = dbListings.find(l => l.id === editId)
      if (target) {
        setEditTarget(target)
        window.history.replaceState({}, '', '/dashboard/listings')
      }
    }
  }, [dbListings])

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้ออกจากระบบ?')) return
    setDeleting(id)
    const { data: { session: delSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/dashboard/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delSess?.access_token}` }, body: JSON.stringify({ id }) })
    await loadDb()
    setDeleting(null)
  }

  async function togglePublish(id: string, currentStatus: string) {
    setToggling(prev => new Set(prev).add(id))
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { data: { session: tSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/dashboard/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tSess?.access_token}` },
      body: JSON.stringify({ id, listing_status: newStatus }),
    })
    setDbListings(prev => prev.map(p => p.id === id ? { ...p, listing_status: newStatus } : p))
    setToggling(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const allTypes = Array.from(new Set(dbListings.map(p => p.property_type)))
  const ok = (title: string, type: string, loc: string) => {
    if (typeFilter && type !== typeFilter) return false
    if (search) { const q = search.toLowerCase(); return title.toLowerCase().includes(q) || loc.toLowerCase().includes(q) }
    return true
  }
  const filteredDb = dbListings.filter(p => ok(p.title_th, p.property_type, (p.district ?? '') + (p.address_th ?? '')))

  return (
    <div>
      {editTarget && <EditDrawer listing={editTarget} onClose={() => setEditTarget(null)} onSaved={loadDb} />}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('')} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: !typeFilter ? '#02402e' : '#f4f6f5', color: !typeFilter ? '#fff' : '#334155' }}>ทั้งหมด</button>
          {allTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t === typeFilter ? '' : t)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: typeFilter === t ? '#02402e' : '#f4f6f5', color: typeFilter === t ? '#fff' : '#334155' }}>
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ / ทำเล" style={{ flex: 1, minWidth: 180, padding: '7px 14px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none' }} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>แสดง {filteredDb.length} จาก {dbListings.length} รายการ</span>
          {loadingDb && <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, display: 'inline-block', animation: 'spin .8s linear infinite' }}>sync</span>กำลังโหลด…</span>}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
              {['ชื่อประกาศ', 'ประเภท', 'ทำเล', 'ราคา', 'ห้องนอน', 'ช่วงเช่า', 'หมดอายุ', 'แหล่งข้อมูล', ''].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDb.map(p => (
              <tr key={`d-${p.id}`} style={{ borderBottom: '1px solid #f1f5f4', background: '#fafffe' }}>
                <td style={{ padding: '12px 14px', maxWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {(p.images ?? [])[0] ? (
                      <img src={(p.images ?? [])[0]} alt="" style={{ width: 38, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 38, height: 32, borderRadius: 6, background: '#eaf6f1', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>{p.title_th}</div>
                      {p.title_en && <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.title_en}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}><TypeChip type={p.property_type} /></td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12.5 }}>{p.district || p.address_th || '—'}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#02402e' }}>
                  {p.price_from ? `฿${p.price_from.toLocaleString()}` : '—'}
                  {p.price_to   ? `–฿${p.price_to.toLocaleString()}` : ''}
                </td>
                <td style={{ padding: '12px 14px', color: '#64748b' }}>{p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} ห้อง`}</td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>
                  {RENTAL_TERM_OPTIONS.find(o => o.value === p.rental_term)?.label ?? 'รายเดือน'}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12 }}>
                  {p.expires_at ? (
                    <span style={{ color: new Date(p.expires_at) < new Date() ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
                      {new Date(p.expires_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      {new Date(p.expires_at) < new Date() && <span style={{ display: 'block', fontSize: 10, color: '#b91c1c' }}>หมดอายุแล้ว</span>}
                    </span>
                  ) : <span style={{ color: '#94a3b8' }}>ไม่จำกัด</span>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600, alignSelf: 'flex-start' }}>Dashboard</span>
                    {p.listing_status === 'inactive'
                      ? <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 7, background: '#fef3c7', color: '#92400e', fontWeight: 600, alignSelf: 'flex-start' }}>ซ่อนอยู่</span>
                      : <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 7, background: '#dcfce7', color: '#15803d', fontWeight: 600, alignSelf: 'flex-start' }}>เผยแพร่</span>
                    }
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                    <button onClick={() => setEditTarget(p)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span></button>
                    <button
                      onClick={() => togglePublish(p.id, p.listing_status)}
                      disabled={toggling.has(p.id)}
                      title={p.listing_status === 'active' ? 'ซ่อนประกาศ' : 'เผยแพร่ประกาศ'}
                      style={{ padding: '5px 9px', borderRadius: 7, border: `1px solid ${p.listing_status === 'active' ? '#c7d2d0' : '#86efac'}`, background: '#fff', color: p.listing_status === 'active' ? '#334155' : '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: toggling.has(p.id) ? 0.5 : 1 }}>
                      <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{toggling.has(p.id) ? 'sync' : p.listing_status === 'active' ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button onClick={() => deleteListing(p.id)} disabled={deleting === p.id} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting === p.id ? 0.5 : 1 }}>
                      {deleting === p.id ? '…' : 'ลบ'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDb.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>ไม่พบรายการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Submissions Tab ───────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [items,  setItems]  = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      const r = await fetch(`/api/dashboard/submissions?${params}`)
      const d = await r.json()
      setItems(d.data ?? [])
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    setActionLoading(id + status)
    await fetch(`/api/dashboard/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await load()
    setActionLoading(null)
  }

  const STATUS_OPTS = [
    { value: '', label: 'ทั้งหมด' }, { value: 'pending_payment', label: 'รอชำระ' },
    { value: 'pending', label: 'รออนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' }, { value: 'rejected', label: 'ปฏิเสธ' },
  ]
  const STATUS_CHIP: Record<string, { bg: string; color: string; label: string }> = {
    pending_payment: { bg: '#dbeafe', color: '#1d4ed8', label: 'รอชำระ' },
    pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
    approved: { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
    rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
  }
  const PKG_LABEL: Record<string, string> = {
    free_trial: 'ทดลองฟรี', basic: 'Basic', standard: 'Standard', premium: 'Premium',
  }

  return (
    <div>
      <div style={{ background: '#fff6e9', border: '1px solid #fed7aa', borderRadius: 12, padding: '11px 15px', marginBottom: 14, fontSize: 13, color: '#92400e' }}>
        <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 6, flexShrink: 0 }}>mail</span>ประกาศที่ส่งมาจากฟอร์ม <strong>/ลงประกาศ</strong> — แพ็กเกจที่ชำระแล้วจะเผยแพร่อัตโนมัติ ฟรีทดลองต้องอนุมัติ
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)} style={{ padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: filter === o.value ? '#02402e' : '#f4f6f5', color: filter === o.value ? '#fff' : '#334155' }}>{o.label}</button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 26, height: 26, border: '3px solid #eef0ef', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            กำลังโหลด…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '50px 40px', textAlign: 'center' }}>
            <div style={{ marginBottom: 10 }}><span className="msym" style={{ fontSize: 36, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>inbox</span></div>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>ยังไม่มีคำขอใหม่</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                {['ชื่อ', 'ประเภท', 'ทำเล', 'ราคา', 'ช่วงเช่า', 'แพ็กเกจ', 'หมดอายุ', 'ผู้ส่ง', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '11px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const s = STATUS_CHIP[item.status] ?? STATUS_CHIP.pending
                const expired = item.expires_at ? new Date(item.expires_at) < new Date() : false
                return (
                  <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 600, color: '#02402e', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</td>
                    <td style={{ padding: '12px 12px' }}><TypeChip type={item.type} /></td>
                    <td style={{ padding: '12px 12px', color: '#64748b', fontSize: 12 }}>{[item.district, item.province].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ padding: '12px 12px', fontWeight: 600, color: '#02402e' }}>{item.price ? `฿${item.price.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: '#64748b' }}>{RENTAL_TERM_OPTIONS.find(o => o.value === item.rental_term)?.label ?? 'รายเดือน'}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: item.package_type === 'free_trial' ? '#fef9c3' : '#dcfce7', color: item.package_type === 'free_trial' ? '#a16207' : '#15803d', fontWeight: 600 }}>
                        {PKG_LABEL[item.package_type ?? 'free_trial'] ?? item.package_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 11.5, color: expired ? '#b91c1c' : '#64748b' }}>
                      {item.expires_at ? new Date(item.expires_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      {expired && <span style={{ display: 'block', fontSize: 10, color: '#b91c1c' }}>หมดอายุแล้ว</span>}
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 12.5 }}>
                      <div style={{ fontWeight: 500 }}>{item.contact_name || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>{item.contact_email}</div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {item.status !== 'approved' && (
                          <button onClick={() => updateStatus(item.id, 'approved')} disabled={!!actionLoading} style={{ padding: '5px 9px', borderRadius: 7, border: 'none', background: '#02402e', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>อนุมัติ</button>
                        )}
                        {item.status === 'approved' && (
                          <button onClick={() => updateStatus(item.id, 'approved')} disabled={!!actionLoading} title="สร้าง/อัปเดต property row บนเว็บไซต์" style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #02402e', background: '#fff', color: '#02402e', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>เผยแพร่</button>
                        )}
                        {item.status !== 'rejected' && (
                          <button onClick={() => updateStatus(item.id, 'rejected')} disabled={!!actionLoading} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ปฏิเสธ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [tab,        setTab]        = useState<'published' | 'queue'>('published')
  const [showCreate, setShowCreate] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>จัดการประกาศ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ประกาศจาก Dashboard</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + เพิ่มประกาศใหม่
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('published')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'published' ? '#02402e' : '#f4f6f5', color: tab === 'published' ? '#fff' : '#64748b' }}>
          <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 5 }}>home</span>เผยแพร่แล้ว
        </button>
        <button onClick={() => setTab('queue')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'queue' ? '#02402e' : '#f4f6f5', color: tab === 'queue' ? '#fff' : '#64748b' }}>
          <span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0", marginRight: 5 }}>mail</span>คำขอจากฟอร์ม
        </button>
      </div>

      {tab === 'published' ? <PublishedTab refreshKey={refreshKey} /> : <SubmissionsTab />}

      {showCreate && (
        <CreateDrawer
          onClose={() => setShowCreate(false)}
          onCreated={() => { setRefreshKey(k => k + 1); setTab('published') }}
        />
      )}
    </div>
  )
}
