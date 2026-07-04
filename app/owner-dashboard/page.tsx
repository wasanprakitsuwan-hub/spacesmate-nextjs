'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import RichEditor from '@/components/RichEditor'

// ── Types ─────────────────────────────────────────────────────────────────────
interface OwnerListing {
  id: string
  slug: string
  title_th: string
  title_en: string | null
  property_type: string
  price_from: number
  price_to: number | null
  district: string | null
  sub_district: string | null
  address_th: string | null
  province: string | null
  postcode: string | null
  images: string[] | null
  listing_status: string
  package_type: string | null
  expires_at: string | null
  created_at: string
  bedrooms: number
  bathrooms: number
  floor: number | null
  area_sqm: number | null
  rental_term: string | null
  verified: boolean
  description_th: string | null
  amenities: string[] | null
  room_types: any[] | null
  lat: number | null
  lng: number | null
  video_url: string | null
}

// ── Form types ────────────────────────────────────────────────────────────────
interface RoomTypeRow {
  id: string; room_type: string; price_from: string; price_to: string
}

interface ApartmentUnitRow {
  id: string
  room_type: string
  size_sqm: string
  price_1mo: string
  price_daily: string    // daily rate (optional, for short-stay / Airbnb pricing)
  available_1mo: boolean
  available_3mo: boolean; price_3mo: string
  available_6mo: boolean; price_6mo: string
}

interface CondoRentalDetail {
  unit_number: string; floor: string; facing: string; size_sqm: string
  property_name: string
  price_12mo: string; price_6mo: string; price_3mo: string; price_1mo: string
}

type RateType = 'fixed' | 'min_rate' | 'ask'
interface RentalCharges {
  water_type: RateType; water_fixed: string; water_min_rate: string
  electricity_type: RateType; electricity_fixed: string; electricity_min_rate: string
  security_deposit: string; advance_deposit: string
  other_charges: string[]; other_charges_fees: Record<string, string>
}

interface FormState {
  title_th: string; title_en: string; slug: string
  property_type: string; rental_term: string; package_type: string
  price_from: string; price_to: string
  room_types: RoomTypeRow[]
  apartment_units: ApartmentUnitRow[]
  condo_rental: CondoRentalDetail
  rental_charges: RentalCharges
  bedrooms: string; bathrooms: string; floor: string; area_sqm: string
  address_th: string; district: string; sub_district: string
  province: string; postcode: string
  lat: string; lng: string
  description_th: string
  amenities: string[]
  images: string[]
  video_url: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BLANK_CONDO: CondoRentalDetail = {
  unit_number: '', floor: '', facing: '', size_sqm: '',
  property_name: '', price_12mo: '', price_6mo: '', price_3mo: '', price_1mo: '',
}
const BLANK_CHARGES: RentalCharges = {
  water_type: 'ask', water_fixed: '', water_min_rate: '',
  electricity_type: 'ask', electricity_fixed: '', electricity_min_rate: '',
  security_deposit: '2', advance_deposit: '1',
  other_charges: [], other_charges_fees: {},
}
const BLANK: FormState = {
  title_th: '', title_en: '', slug: '',
  property_type: 'condo', rental_term: '1_month', package_type: 'basic',
  price_from: '', price_to: '',
  room_types: [], apartment_units: [],
  condo_rental: { ...BLANK_CONDO },
  rental_charges: { ...BLANK_CHARGES },
  bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
  address_th: '', district: '', sub_district: '',
  province: 'กรุงเทพมหานคร', postcode: '',
  lat: '', lng: '',
  description_th: '', amenities: [], images: [], video_url: '',
}

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

const TYPE_LABEL: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน', office: 'ออฟฟิศ', coworking: 'โคเวิร์ก',
}
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'รอตรวจสอบ' },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: 'หมดอายุ' },
}
const PKG_LABEL: Record<string, string> = {
  basic: 'Basic (30 วัน)', standard: 'Standard (90 วัน)', premium: 'Premium (365 วัน)', admin: 'Admin',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
}
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function getRoomTypeOptions(propType: string): string[] {
  switch (propType) {
    case 'apartment': return ['Studio', '1 ห้องนอน', '2 ห้องนอน', '3 ห้องนอน', 'เชิงพาณิชย์']
    case 'house':     return ['บ้านเดี่ยว', 'ทาวน์เฮ้าส์', '2 ห้องนอน', '3 ห้องนอน', '4 ห้องนอน+']
    case 'office':    return ['Individual Desk', 'Private Office', 'Meeting Room', 'Full Floor', 'Shared Space']
    case 'coworking': return ['Hot Desk', 'Dedicated Desk', 'Private Office', 'Meeting Room', 'Day Pass']
    default:          return ['Studio', '1 ห้องนอน', '2 ห้องนอน', '3 ห้องนอน', '4 ห้องนอน+', 'Penthouse', 'ดูเพล็กซ์', 'ลอฟท์']
  }
}

function prepareSubmitData(form: FormState) {
  let price_from = parseInt(form.price_from) || 0
  let price_to: number | null = form.price_to ? parseInt(form.price_to) : null
  let room_types: any[] = form.room_types
  let floor: number | null = form.floor ? parseInt(form.floor) : null
  let area_sqm: number | null = form.area_sqm ? parseFloat(form.area_sqm) : null

  if (['apartment', 'office', 'coworking'].includes(form.property_type)) {
    const prices = form.apartment_units.map(u => parseFloat(u.price_1mo) || 0).filter(n => n > 0)
    price_from = prices.length > 0 ? Math.min(...prices) : 0
    price_to   = prices.length > 1 ? Math.max(...prices) : (prices[0] ?? null)
    room_types = form.property_type === 'apartment'
      ? [
          { _type: 'charges', ...form.rental_charges },
          ...form.apartment_units.map(({ id: _id, ...u }) => ({ _type: 'apt_unit', ...u })),
        ]
      : form.apartment_units.map(({ id: _id, ...u }) => ({ _type: 'apt_unit', ...u }))
  } else if (['condo', 'house'].includes(form.property_type)) {
    const r = form.condo_rental
    price_from = parseFloat(r.price_12mo || r.price_1mo || '0') || 0
    price_to   = r.price_1mo ? parseFloat(r.price_1mo) : null
    room_types = [{ _type: 'rental_detail', ...r }]
    floor      = r.floor ? parseInt(r.floor) : null
    area_sqm   = r.size_sqm ? parseFloat(r.size_sqm) : null
  }

  return { price_from, price_to, room_types, floor, area_sqm }
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const SINP: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 10,
  border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none',
  boxSizing: 'border-box' as const, background: '#fff',
}
const SLBL: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block',
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
    </div>
  )
}

// ── Apartment Unit Grid ───────────────────────────────────────────────────────
function ApartmentUnitGrid({ rows, onChange, roomTypeOptions }: {
  rows: ApartmentUnitRow[]; onChange: (rows: ApartmentUnitRow[]) => void; roomTypeOptions: string[]
}) {
  function addRow() {
    onChange([...rows, {
      id: `au-${Date.now()}`, room_type: roomTypeOptions[0] ?? 'Studio',
      size_sqm: '', price_1mo: '', price_daily: '',
      available_1mo: false, available_3mo: false, price_3mo: '',
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.9fr 0.9fr 28px', gap: 6, marginBottom: 6, paddingLeft: 2 }}>
            {['ประเภทห้อง', 'ขนาด (ตร.ม.)', 'ราคา/เดือน', 'ราคา/วัน', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{h}</div>
            ))}
          </div>
          {rows.map(row => (
            <div key={row.id} style={{ background: '#fafffe', border: '1px solid #eef0ef', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', paddingLeft: 2, borderTop: '1px dashed #eef0ef', paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>ระยะสั้น:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.available_1mo} onChange={e => upd(row.id, 'available_1mo', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#048c73' }} />
                  <span style={{ fontSize: 12, color: '#334155' }}>1 เดือน</span>
                </label>
                {row.available_1mo && (
                  <span style={{ fontSize: 11, color: '#048c73', background: '#eaf6f1', padding: '2px 8px', borderRadius: 10 }}>
                    ฿{row.price_1mo ? Number(row.price_1mo).toLocaleString() : '—'}/เดือน
                  </span>
                )}
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

// ── Condo / House Rental Detail ───────────────────────────────────────────────
function CondoHouseRentalDetail({ detail, propertyType, onChange }: {
  detail: CondoRentalDetail; propertyType: string; onChange: (d: CondoRentalDetail) => void
}) {
  function u(k: keyof CondoRentalDetail, v: string) { onChange({ ...detail, [k]: v }) }
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
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
        <label style={SLBL}>{isHouse ? 'ชื่อโครงการ / หมู่บ้าน' : 'ชื่อคอนโด'}</label>
        <input value={detail.property_name} onChange={e => u('property_name', e.target.value)}
          placeholder={isHouse ? 'เช่น บ้านปลายฟ้า พระราม 9' : 'เช่น Ideo Q สยาม-ราชเทวี'} style={SINP} />
      </div>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 14px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#02402e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 5 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>payments</span>ราคาเช่าตามระยะสัญญา</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
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

// ── Rental Charges Section (Apartment) ───────────────────────────────────────
function RentalChargesSection({ charges, onChange }: {
  charges: RentalCharges; onChange: (c: RentalCharges) => void
}) {
  function u(k: keyof RentalCharges, v: any) { onChange({ ...charges, [k]: v }) }

  function toggleOther(val: string) {
    const arr = charges.other_charges
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
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
            <input type="number" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="6.50" style={{ ...SINP, width: 130 }} />
            <span style={{ fontSize: 12.5, color: '#64748b' }}>บาท / หน่วย</span>
          </div>
        )}
        {type === 'min_rate' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>ราคาต่อหน่วย (บาท)</label>
                  <input type="number" value={fixed} onChange={e => onFixed(e.target.value)} placeholder="3.50" style={{ ...SINP, width: 120 }} />
                </div>
                <span style={{ fontSize: 18, color: '#c7d2d0', paddingBottom: 4 }}>×</span>
                <span style={{ fontSize: 12.5, color: '#64748b', paddingBottom: 4 }}>หน่วย</span>
              </div>
              <div>
                <label style={{ ...SLBL, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>ราคาขั้นต่ำ (บาท/เดือน)</label>
                <input type="number" value={minRate} onChange={e => onMinRate(e.target.value)} placeholder="200" style={{ ...SINP, width: 130 }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
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
                    <input type="number" value={charges.other_charges_fees[o.value] ?? ''} onChange={e => setOtherFee(o.value, e.target.value)}
                      placeholder="500" style={{ ...SINP, width: 110, padding: '6px 10px', fontSize: 12.5 }} />
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

// ── Map Picker ────────────────────────────────────────────────────────────────
function MapPicker({ lat, lng, onLatLng }: {
  lat: string; lng: string; onLatLng: (lat: string, lng: string) => void
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
  onLatLngRef.current = onLatLng

  const defaultLat = lat ? parseFloat(lat) : 13.7563
  const defaultLng = lng ? parseFloat(lng) : 100.5018

  function initLeaflet(L: any) {
    if (mapObjRef.current || !mapContainerRef.current) return
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], lat ? 15 : 12)
    mapObjRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    const icon = L.divIcon({
      html: `<div style="width:28px;height:28px;background:#02402e;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(2,64,46,.45);position:relative;"><div style="position:absolute;inset:3px;background:#d97f11;border-radius:50%;transform:rotate(45deg);"></div></div>`,
      className: '', iconSize: [28, 28], iconAnchor: [14, 28],
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

  useEffect(() => {
    if ((window as any).L) { initLeaflet((window as any).L); return }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link')
      css.id = 'leaflet-css'; css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initLeaflet((window as any).L)
    document.head.appendChild(script)
    return () => { if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null } }
  }, [])

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
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) return { lat: atMatch[1], lng: atMatch[2] }
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] }
    const embedMatch = url.match(/!3d(-?\d+\.?\d*).*?!4d(-?\d+\.?\d*)/)
    if (embedMatch) return { lat: embedMatch[1], lng: embedMatch[2] }
    return null
  }

  async function handleGoogleMapsUrl(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setUrlError('')
    const direct = parseGoogleMapsUrl(trimmed)
    if (direct) { onLatLng(direct.lat, direct.lng); return }
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
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: urlError ? '#dc2626' : '#048c73', pointerEvents: 'none' }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>link</span></span>
            <input
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
              onPaste={e => {
                const pasted = e.clipboardData.getData('text')
                if (pasted.includes('google.com/maps') || pasted.includes('maps.app.goo.gl') || pasted.includes('goo.gl')) {
                  e.preventDefault(); setUrlInput(pasted); handleGoogleMapsUrl(pasted)
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGoogleMapsUrl(urlInput) } }}
              placeholder="วางลิงก์ Google Maps ที่นี่... (วิธีแนะนำ)"
              style={{ ...SINP, paddingLeft: 32, flex: 1, background: urlError ? '#fff5f5' : '#f0fbf8', border: `1.5px solid ${urlError ? '#fca5a5' : '#b2d8c9'}` }}
            />
          </div>
          <button type="button" onClick={() => handleGoogleMapsUrl(urlInput)}
            disabled={urlParsing || !urlInput.trim()}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: urlParsing || !urlInput.trim() ? 'not-allowed' : 'pointer', opacity: urlParsing || !urlInput.trim() ? 0.6 : 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            {urlParsing
              ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>ดึงพิกัด</>}
          </button>
        </div>
        {urlError
          ? <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#dc2626' }}>{urlError}</p>
          : <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>วางลิงก์จาก Google Maps แล้วพิกัดจะดึงอัตโนมัติ • หรือค้นหาด้านล่าง / คลิกบนแผนที่</p>
        }
      </div>

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
            placeholder="ค้นหาชื่อโครงการ / ที่อยู่ใกล้เคียง แล้วกด Enter"
            style={{ ...SINP, flex: 1 }} />
          <button type="button" onClick={doSearch} disabled={searching}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            {searching
              ? <><span className="msym" style={{ fontSize: 15, animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>ค้นหา</>
              : <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>map</span>ค้นหา</>}
          </button>
        </div>
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#fff', border: '1px solid #eef0ef', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', marginTop: 4 }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => selectResult(r)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, color: '#334155', borderBottom: i < results.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73', marginRight: 6 }}>location_on</span>{r.display_name.length > 85 ? r.display_name.slice(0, 85) + '…' : r.display_name}
              </button>
            ))}
            <button type="button" onClick={() => setResults([])} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>ปิด</button>
          </div>
        )}
      </div>
      <div ref={mapContainerRef} style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid #eef0ef', background: '#f0f4f2' }} />
      {lat && lng ? (
        <div style={{ marginTop: 8, padding: '7px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', fontWeight: 500, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</span>
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>ลากหมุดหรือคลิกบนแผนที่เพื่อปรับ</span>
        </div>
      ) : (
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>คลิกบนแผนที่ ลากหมุด หรือค้นหาชื่อสถานที่ด้านบน</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>Lat (ละติจูด)</label>
          <input value={lat} onChange={e => onLatLng(e.target.value, lng)} placeholder="13.756300" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
        <div>
          <label style={{ ...SLBL, fontSize: 11.5, color: '#94a3b8' }}>Lng (ลองจิจูด)</label>
          <input value={lng} onChange={e => onLatLng(lat, e.target.value)} placeholder="100.501800" style={{ ...SINP, fontSize: 12.5, padding: '7px 10px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Thailand Cascading Address Select ─────────────────────────────────────────
type AddrItem = { id: number; name: string; zip?: string }

function ThaiAddressSelect({ form, onChange }: {
  form: Pick<FormState, 'address_th' | 'district' | 'sub_district' | 'province' | 'postcode'>
  onChange: (k: string, v: string) => void
}) {
  const [provinces, setProvinces] = useState<AddrItem[]>([])
  const [amphures,  setAmphures]  = useState<AddrItem[]>([])
  const [tambons,   setTambons]   = useState<AddrItem[]>([])
  const [provId, setProvId] = useState<number | null>(null)
  const [amphId, setAmphId] = useState<number | null>(null)
  const [loadA, setLoadA] = useState(false)
  const [loadT, setLoadT] = useState(false)

  useEffect(() => {
    fetch('/api/thailand-address?level=provinces')
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setProvinces(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!provinces.length || !form.province || provId !== null) return
    const p = provinces.find(p => p.name === form.province)
    if (!p) return
    setProvId(p.id); setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${p.id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) }).catch(() => setLoadA(false))
  }, [provinces, form.province, provId])

  useEffect(() => {
    if (!amphures.length || !form.district || amphId !== null) return
    const a = amphures.find(a => a.name === form.district)
    if (!a) return
    setAmphId(a.id); setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${a.id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) }).catch(() => setLoadT(false))
  }, [amphures, form.district, amphId])

  function selectProvince(id: number) {
    const p = provinces.find(p => p.id === id)
    if (!p) return
    onChange('province', p.name); onChange('district', ''); onChange('sub_district', ''); onChange('postcode', '')
    setProvId(id); setAmphId(null); setAmphures([]); setTambons([])
    setLoadA(true)
    fetch(`/api/thailand-address?level=amphures&parent=${id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setAmphures(d); setLoadA(false) }).catch(() => setLoadA(false))
  }

  function selectAmphure(id: number) {
    const a = amphures.find(a => a.id === id)
    if (!a) return
    onChange('district', a.name); onChange('sub_district', ''); onChange('postcode', '')
    setAmphId(id); setTambons([])
    setLoadT(true)
    fetch(`/api/thailand-address?level=tambons&parent=${id}`)
      .then(r => r.json()).then((d: AddrItem[]) => { if (Array.isArray(d)) setTambons(d); setLoadT(false) }).catch(() => setLoadT(false))
  }

  function selectTambon(name: string) {
    const t = tambons.find(t => t.name === name)
    if (!t) return
    onChange('sub_district', t.name); onChange('postcode', t.zip ?? '')
  }

  function selStyle(disabled: boolean): React.CSSProperties {
    return { ...SINP, background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#94a3b8' : '#334155', cursor: disabled ? 'not-allowed' : 'pointer' }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>ที่อยู่ (ชื่ออาคาร / ถนน / เลขที่)</label>
        <input value={form.address_th} onChange={e => onChange('address_th', e.target.value)} placeholder="เช่น Metro Luxe Rama 4  ถนนพระราม 4" style={SINP} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={SLBL}>จังหวัด *</label>
        <select value={provId ?? ''} onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectProvince(id) }} style={{ ...SINP, cursor: 'pointer' }}>
          <option value="">{provinces.length === 0 ? 'กำลังโหลด…' : 'เลือกจังหวัด'}</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={SLBL}>เขต / อำเภอ {loadA && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>}</label>
          <select value={amphId ?? ''} onChange={e => { const id = parseInt(e.target.value as string); if (!isNaN(id)) selectAmphure(id) }} disabled={!provId || loadA} style={selStyle(!provId || loadA)}>
            <option value="">{!provId ? 'เลือกจังหวัดก่อน' : loadA ? 'กำลังโหลด…' : 'เลือกเขต / อำเภอ'}</option>
            {amphures.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label style={SLBL}>แขวง / ตำบล {loadT && <span className="msym" style={{ fontSize: 13, color: '#94a3b8', animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>}</label>
          <select value={form.sub_district || ''} onChange={e => selectTambon(e.target.value)} disabled={!amphId || loadT} style={selStyle(!amphId || loadT)}>
            <option value="">{!amphId ? 'เลือกเขต/อำเภอก่อน' : loadT ? 'กำลังโหลด…' : 'เลือกแขวง / ตำบล'}</option>
            {tambons.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={SLBL}>รหัสไปรษณีย์</label>
        <input value={form.postcode} onChange={e => onChange('postcode', e.target.value)} placeholder="10110" style={{ ...SINP, width: 130 }} />
        {form.postcode && <span style={{ fontSize: 11.5, color: '#048c73', marginLeft: 8, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>{form.postcode}</span>}
      </div>
    </div>
  )
}

// ── Image limits per package ──────────────────────────────────────────────────
const IMAGE_LIMITS: Record<string, number> = { basic: 5, standard: 10, premium: 20 }

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({ images, onImagesChange, packageType = 'basic' }: {
  images: string[]
  onImagesChange: (imgs: string[]) => void
  packageType?: string
}) {
  const [uploading,       setUploading]       = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState(0)
  const [uploadStatus,    setUploadStatus]    = useState('')
  const [uploadError,     setUploadError]     = useState('')
  const [hoveredIdx,      setHoveredIdx]      = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const imageLimit = IMAGE_LIMITS[packageType] ?? IMAGE_LIMITS.basic
  const atLimit    = images.length >= imageLimit
  const remaining  = imageLimit - images.length

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
    const token = upSess?.access_token ?? ''
    const added: string[] = []
    let currentCount = images.length
    const fileArr = Array.from(files).filter(() => currentCount < imageLimit)
    if (Array.from(files).length > fileArr.length) setUploadError(`แพ็กเกจนี้อัปโหลดได้สูงสุด ${imageLimit} รูป`)
    const total = fileArr.length
    for (let i = 0; i < total; i++) {
      setUploadStatus(`${i + 1}/${total}`)
      const fd = new FormData()
      fd.append('file', fileArr[i])
      fd.append('type', 'image')
      fd.append('packageType', packageType)
      fd.append('currentCount', String(currentCount))
      const d = await uploadFileXHR(fd, token, pct => {
        setUploadProgress(Math.round((i * 100 + pct) / total))
      })
      if (d.url) { added.push(d.url); currentCount++ }
      else setUploadError(d.error || 'อัปโหลดไม่สำเร็จ')
    }
    if (added.length) onImagesChange([...images, ...added])
    setUploading(false); setUploadProgress(0); setUploadStatus('')
  }

  function setAsCover(idx: number) {
    if (idx === 0) return
    const next = [...images]
    const [picked] = next.splice(idx, 1)
    next.unshift(picked)
    onImagesChange(next)
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) handleFiles(e.target.files) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || atLimit}
        style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: '1.5px dashed ' + (atLimit ? '#eef0ef' : '#c7d2d0'), background: uploading ? '#f8fafc' : '#fafffe', color: atLimit ? '#94a3b8' : '#048c73', fontWeight: 600, fontSize: 13, cursor: (uploading || atLimit) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {uploading
          ? <><span style={{ width: 16, height: 16, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปโหลด{uploadStatus ? ` ${uploadStatus}` : ''}…</>
          : atLimit
            ? <><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>check_circle</span>อัปโหลดครบ {imageLimit} รูปแล้ว (สูงสุดของแพ็กเกจนี้)</>
            : <><span className="msym" style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>photo_library</span>เลือกรูปภาพ (JPG · PNG · WebP)</>
        }
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

      {/* Live counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
          {images.length} / {imageLimit} รูป · แพ็กเกจ {packageType}
          {!atLimit && remaining > 0 && <span style={{ color: '#048c73' }}> · เพิ่มได้อีก {remaining} รูป</span>}
        </p>
        {atLimit && (
          <span style={{ fontSize: 11, color: '#d97f11', fontWeight: 600 }}>
            อัปเกรดแพ็กเกจเพื่อเพิ่มรูปมากขึ้น
          </span>
        )}
      </div>

      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {images.length > 0 && (
        <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {images.map((url, i) => (
            <div key={url + i} style={{ position: 'relative', flexShrink: 0, cursor: i !== 0 ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <img src={url} alt="" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, display: 'block', border: i === 0 ? '2.5px solid #02402e' : hoveredIdx === i ? '2px solid #048c73' : '1px solid #eef0ef', transition: 'border-color .15s' }} />
              {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, background: '#02402e', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><span className="msym" style={{ fontSize: 9, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>star</span>หน้าปก</span>}
              {i !== 0 && hoveredIdx === i && (
                <button type="button" onClick={() => setAsCover(i)}
                  style={{ position: 'absolute', inset: 0, borderRadius: 8, border: 'none', background: 'rgba(2,64,46,.72)', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>star</span>
                  <span>ตั้งหน้าปก</span>
                </button>
              )}
              <button type="button" onClick={() => onImagesChange(images.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#b91c1c', border: '2px solid #fff', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 2 }}><span className="msym" style={{ fontSize: 12 }}>close</span></button>
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
        <p style={{ color: '#c7d2d0', fontSize: 12, margin: '4px 0 0' }}>อัปเกรดแพ็กเกจของคุณเป็น Premium เพื่อเพิ่มวิดีโอ</p>
      </div>
    )
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontWeight: 600, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
        {uploading
          ? <><span className="msym" style={{ fontSize: 15, animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>กำลังอัปโหลด...</>
          : <><span className="msym" style={{ fontSize: 15, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>videocam</span>อัปโหลดวิดีโอ (MP4 · QuickTime · WebM  •  สูงสุด 50 MB)</>}
      </button>
      <div>
        <label style={{ ...SLBL, fontSize: 12 }}>หรือวางลิงก์วิดีโอ (YouTube / Vimeo)</label>
        <input value={videoUrl.startsWith('http') && !videoUrl.includes('supabase') ? videoUrl : ''} onChange={e => onVideoChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={SINP} />
      </div>
      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{uploadError}</p>}
      {videoUrl && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", flexShrink: 0 }}>check_circle</span>{videoUrl.length > 60 ? videoUrl.slice(0, 60) + '…' : videoUrl}</span>
          <button type="button" onClick={() => onVideoChange('')} style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ── Listing Form Fields ───────────────────────────────────────────────────────
function ListingFormFields({ form, onChange, onAmenityToggle, onImagesChange }: {
  form: FormState
  onChange: (k: string, v: any) => void
  onAmenityToggle: (a: string) => void
  onImagesChange: (imgs: string[]) => void
}) {
  const roomOpts = getRoomTypeOptions(form.property_type)
  const isApartment    = form.property_type === 'apartment'
  const isCondoOrHouse = ['condo', 'house'].includes(form.property_type)
  const isOfficeOrCo   = ['office', 'coworking'].includes(form.property_type)
  const showBedsBaths  = isCondoOrHouse
  const showAreaSqm    = isApartment || isOfficeOrCo
  const showFloor      = isOfficeOrCo

  return (
    <>
      {/* ── 1 · ข้อมูลหลัก ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="1 · ข้อมูลหลัก" />
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
                  border: `1.5px solid ${form.property_type === o.value ? '#02402e' : '#eef0ef'}`,
                  background: form.property_type === o.value ? '#02402e' : '#fff',
                  color: form.property_type === o.value ? '#fff' : '#64748b', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 5 }}>
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
      </div>

      {/* ── 2 · แพ็กเกจ & ราคา ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Package display (read-only for owners) */}
        <SectionHead text="2 · แพ็กเกจ" />
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0fbf8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#048c73' }}>แพ็กเกจของคุณ:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#02402e' }}>
            {PKG_LABEL[form.package_type] ?? form.package_type}
          </span>
        </div>

        {/* Apartment */}
        {isApartment && (
          <>
            <SectionHead text="2B · ประเภทและราคาห้อง" />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              เพิ่มแต่ละประเภทห้องพร้อมขนาดและราคา (ราคาในหน้าค้นหาจะดึงจาก ต่ำสุด–สูงสุด ของตาราง)
            </p>
            <ApartmentUnitGrid rows={form.apartment_units} onChange={rows => onChange('apartment_units', rows)} roomTypeOptions={roomOpts} />
          </>
        )}

        {/* Condo / House */}
        {isCondoOrHouse && (
          <>
            <SectionHead text="2B · รายละเอียดการเช่า" />
            <CondoHouseRentalDetail detail={form.condo_rental} propertyType={form.property_type} onChange={d => onChange('condo_rental', d)} />
          </>
        )}

        {/* Office / Coworking */}
        {isOfficeOrCo && (
          <>
            <SectionHead text="2B · ประเภทและราคาพื้นที่" />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 12px' }}>
              เพิ่มแต่ละประเภทพื้นที่พร้อมขนาดและราคา
            </p>
            <ApartmentUnitGrid rows={form.apartment_units} onChange={rows => onChange('apartment_units', rows)} roomTypeOptions={roomOpts} />
          </>
        )}
      </div>

      {/* ── 3 · ขนาดและลักษณะ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="3 · ขนาดและลักษณะ" />
        {isApartment && (
          <div style={{ padding: '10px 14px', background: '#fef9c3', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#92400e' }}>
            <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 5, verticalAlign: 'middle' }}>tips_and_updates</span>ขนาดเฉลี่ยของห้องในอาคาร — รายละเอียดแต่ละประเภทห้องอยู่ในตารางด้านบน
          </div>
        )}
        {showAreaSqm && (
          <div style={{ display: 'grid', gridTemplateColumns: showFloor ? '1fr 1fr' : '1fr', gap: 12, marginBottom: showBedsBaths ? 12 : 0 }}>
            <div>
              <label style={SLBL}>พื้นที่ใช้สอย (ตร.ม.)</label>
              <input type="number" value={form.area_sqm} onChange={e => onChange('area_sqm', e.target.value)} placeholder={isApartment ? '28 (ขนาดเฉลี่ย)' : '28'} style={SINP} />
            </div>
            {showFloor && (
              <div>
                <label style={SLBL}>ชั้นที่ตั้ง</label>
                <input type="number" value={form.floor} onChange={e => onChange('floor', e.target.value)} placeholder="7" style={SINP} />
              </div>
            )}
          </div>
        )}
        {showBedsBaths && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      </div>

      {/* ── 3B · รายละเอียดการเช่า (Apartment charges) ── */}
      {isApartment && (
        <div style={{ marginBottom: 24 }}>
          <SectionHead text="3B · รายละเอียดการเช่า" />
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '-8px 0 14px' }}>ค่าสาธารณูปโภค เงินมัดจำ และค่าใช้จ่ายอื่น ๆ ที่เรียกเก็บ</p>
          <RentalChargesSection charges={form.rental_charges} onChange={c => onChange('rental_charges', c)} />
        </div>
      )}

      {/* ── 4 · ที่ตั้งและที่อยู่ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="4 · ที่ตั้งและที่อยู่" />
        <ThaiAddressSelect
          form={{ address_th: form.address_th, district: form.district, sub_district: form.sub_district, province: form.province, postcode: form.postcode }}
          onChange={onChange}
        />
      </div>

      {/* ── 5 · พิกัดบนแผนที่ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="5 · พิกัดบนแผนที่" />
        <MapPicker lat={form.lat} lng={form.lng} onLatLng={(lat, lng) => { onChange('lat', lat); onChange('lng', lng) }} />
      </div>

      {/* ── 6 · รายละเอียดประกาศ ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="6 · รายละเอียดประกาศ" />
        <RichEditor value={form.description_th} onChange={v => onChange('description_th', v)} placeholder="อธิบายรายละเอียดห้อง ทำเล สิ่งอำนวยความสะดวก และจุดเด่น..." minHeight={220} />
      </div>

      {/* ── 7 · สิ่งอำนวยความสะดวก ── */}
      <div style={{ marginBottom: 24 }}>
        {(isApartment || isCondoOrHouse) ? (
          <>
            <SectionHead text="7 · สิ่งอำนวยความสะดวก" />
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

      {/* ── 8 · รูปภาพห้อง ── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="8 · รูปภาพห้อง" />
        <ImageUploadZone images={form.images} onImagesChange={onImagesChange} packageType={form.package_type} />
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>รูปแรกจะเป็นรูปหน้าปกของประกาศ</p>
      </div>

      {/* ── 9 · วิดีโอ (Premium) ── */}
      <div style={{ marginBottom: 8 }}>
        <SectionHead text="9 · วิดีโอประกาศ (Premium เท่านั้น)" />
        <VideoUploadZone videoUrl={form.video_url} onVideoChange={v => onChange('video_url', v)} packageType={form.package_type} />
      </div>
    </>
  )
}

// ── Drawer Wrapper ────────────────────────────────────────────────────────────
function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(2,64,46,0.3)', backdropFilter: 'blur(2px)' }} />
      <div style={{ width: '100%', maxWidth: 620, background: '#fff', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#02402e' }}>{title}</h2>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ userId, userEmail, onClose, onCreated }: { userId: string; userEmail: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm]     = useState<FormState>({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function onChange(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function onAmenityToggle(a: string) {
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
      const { data: { session: cSess } } = await createBrowserClient().auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/owner/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cSess?.access_token}` },
        body: JSON.stringify({
          ...form,
          ...extra,
          slug: '',
          bedrooms:  parseInt(form.bedrooms)  || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'ไม่สำเร็จ')
      onCreated(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <Drawer title="เพิ่มประกาศใหม่" subtitle="ประกาศจะเผยแพร่บนเว็บไซต์ทันที" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก...</> : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>publish</span>เผยแพร่ประกาศ</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, userId, onClose, onSaved }: { listing: OwnerListing; userId: string; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Parse stored room_types JSONB back into form state
  const rawRts: any[] = listing.room_types ?? []

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
  } : { ...BLANK_CONDO }

  const chargesRaw = rawRts.find(r => r._type === 'charges')
  const rentalCharges: RentalCharges = chargesRaw ? {
    water_type:           chargesRaw.water_type         ?? 'ask',
    water_fixed:          String(chargesRaw.water_fixed ?? ''),
    water_min_rate:       String(chargesRaw.water_min_rate ?? ''),
    electricity_type:     chargesRaw.electricity_type   ?? 'ask',
    electricity_fixed:    String(chargesRaw.electricity_fixed ?? ''),
    electricity_min_rate: String(chargesRaw.electricity_min_rate ?? ''),
    security_deposit:     String(chargesRaw.security_deposit ?? '2'),
    advance_deposit:      String(chargesRaw.advance_deposit  ?? '1'),
    other_charges:        chargesRaw.other_charges      ?? [],
    other_charges_fees:   chargesRaw.other_charges_fees ?? {},
  } : { ...BLANK_CHARGES }

  const [form, setForm] = useState<FormState>({
    title_th:      listing.title_th,
    title_en:      listing.title_en  ?? '',
    slug:          listing.slug,
    property_type: listing.property_type,
    rental_term:   listing.rental_term   ?? '1_month',
    package_type:  listing.package_type  ?? 'basic',
    price_from:    String(listing.price_from ?? ''),
    price_to:      listing.price_to ? String(listing.price_to) : '',
    room_types:    [],
    apartment_units:  apartmentUnits,
    condo_rental:     condoRental,
    rental_charges:   rentalCharges,
    bedrooms:      String(listing.bedrooms  ?? 1),
    bathrooms:     String(listing.bathrooms ?? 1),
    floor:         listing.floor    ? String(listing.floor)    : '',
    area_sqm:      listing.area_sqm ? String(listing.area_sqm) : '',
    address_th:    listing.address_th    ?? '',
    district:      listing.district      ?? '',
    sub_district:  listing.sub_district  ?? '',
    province:      listing.province      ?? 'กรุงเทพมหานคร',
    postcode:      listing.postcode      ?? '',
    lat:           listing.lat  ? String(listing.lat)  : '',
    lng:           listing.lng  ? String(listing.lng)  : '',
    description_th: listing.description_th ?? '',
    amenities:     listing.amenities  ?? [],
    images:        listing.images     ?? [],
    video_url:     listing.video_url  ?? '',
  })

  function onChange(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function onAmenityToggle(a: string) {
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
    }
    if (validErr) { setError(validErr); return }

    setSaving(true); setError('')
    try {
      const { data: { session: eSess } } = await createBrowserClient().auth.getSession()
      const extra = prepareSubmitData(form)
      const res = await fetch('/api/owner/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eSess?.access_token}` },
        body: JSON.stringify({
          id: listing.id,
          ...form,
          ...extra,
          bedrooms:  parseInt(form.bedrooms)  || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'ไม่สำเร็จ')
      onSaved(); onClose()
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <Drawer title="แก้ไขประกาศ" subtitle={listing.title_th} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ListingFormFields form={form} onChange={onChange} onAmenityToggle={onAmenityToggle} onImagesChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>warning</span>{error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก...</> : <><span className="msym" style={{ fontSize: 18, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>save</span>บันทึกการเปลี่ยนแปลง</>}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerDashboardPage() {
  const [listings,           setListings]           = useState<OwnerListing[]>([])
  const [loading,            setLoading]            = useState(true)
  const [userId,             setUserId]             = useState('')
  const [userEmail,          setUserEmail]          = useState('')
  const [activePackage,      setActivePackage]      = useState<string | null>(null)
  const [packageExpiresAt,   setPackageExpiresAt]   = useState<string | null>(null)
  const [showCreate,         setShowCreate]         = useState(false)
  const [editTarget,         setEditTarget]         = useState<OwnerListing | null>(null)
  const [deleting,           setDeleting]           = useState<string | null>(null)

  // Derived: user has a valid active package
  const hasPackage = activePackage !== null &&
    (packageExpiresAt === null || new Date(packageExpiresAt) > new Date())

  const load = useCallback(async (_uid?: string) => {
    setLoading(true)
    const { data: { session: lSess } } = await createBrowserClient().auth.getSession()
    const r = await fetch('/api/owner/listings', {
      headers: { Authorization: `Bearer ${lSess?.access_token}` },
    })
    const d = await r.json()
    setListings(d.listings ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')
      load()
      // Fetch package status via service-role API
      try {
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const d = await r.json()
        setActivePackage(d.active_package ?? null)
        setPackageExpiresAt(d.package_expires_at ?? null)
      } catch { /* no-op */ }
    })
  }, [load])

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้?')) return
    setDeleting(id)
    const { data: { session: dSess } } = await createBrowserClient().auth.getSession()
    await fetch('/api/owner/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${dSess?.access_token}` }, body: JSON.stringify({ id }) })
    await load()
    setDeleting(null)
  }

  const active   = listings.filter(l => l.listing_status === 'active').length
  const expiring = listings.filter(l => { const d = daysLeft(l.expires_at); return d !== null && d > 0 && d <= 7 }).length

  return (
    <div>
      {showCreate && userId && (
        <CreateDrawer userId={userId} userEmail={userEmail} onClose={() => setShowCreate(false)} onCreated={() => load()} />
      )}
      {editTarget && userId && (
        <EditDrawer listing={editTarget} userId={userId} onClose={() => setEditTarget(null)} onSaved={() => load()} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 4px', letterSpacing: '-0.3px' }}>ประกาศของฉัน</h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>{userEmail}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button
            onClick={() => hasPackage && setShowCreate(true)}
            style={{
              background: hasPackage ? '#02402e' : '#e2e8f0',
              color: hasPackage ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: 24, padding: '12px 22px',
              fontSize: 14, fontWeight: 700,
              cursor: hasPackage ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all .2s',
            }}
            title={!hasPackage ? 'กรุณาซื้อแพ็กเกจก่อนเพื่อลงประกาศ' : undefined}
          >
            + เพิ่มประกาศใหม่
          </button>
          {!hasPackage && (
            <p style={{ fontSize: 12, color: '#d97f11', margin: 0, textAlign: 'right' }}>
              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", marginRight: 4, verticalAlign: 'middle' }}>warning</span>กรุณา{' '}
              <a href="/pricing" style={{ color: '#d97f11', fontWeight: 700, textDecoration: 'underline' }}>ซื้อแพ็กเกจ</a>
              {' '}ก่อนเพื่อลงประกาศ
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'ประกาศทั้งหมด',       value: listings.length, color: '#02402e', bg: '#f0f7f4' },
          { label: 'เผยแพร่อยู่',           value: active,          color: '#048c73', bg: '#eaf6f1' },
          { label: 'ใกล้หมดอายุ (7 วัน)', value: expiring,        color: '#d97f11', bg: '#fdf3e3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.08)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -10px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#02402e' }}>รายการประกาศ</span>
          {loading && <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span className="msym" style={{ fontSize: 13, animation: 'spin .8s linear infinite', display: 'inline-block' }}>sync</span>กำลังโหลด...</span>}
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>กำลังโหลด...</p>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px' }}><span className="msym" style={{ fontSize: 44, color: '#c7d2d0', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span></p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ยังไม่มีประกาศ</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>เริ่มต้นลงประกาศทรัพย์สินแรกของคุณวันนี้</p>
            {hasPackage ? (
              <button onClick={() => setShowCreate(true)} style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                + เพิ่มประกาศใหม่
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 13.5, color: '#d97f11', margin: '0 0 14px', fontWeight: 500 }}>คุณยังไม่มีแพ็กเกจที่ใช้งานอยู่</p>
                <a href="/pricing" style={{ background: '#d97f11', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>shopping_cart</span>ดูแพ็กเกจ
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8faf9', borderBottom: '1px solid #eef0ef' }}>
                  {['ทรัพย์สิน', 'ประเภท', 'ราคา', 'แพ็กเกจ', 'หมดอายุ', 'สถานะ', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => {
                  const days    = daysLeft(l.expires_at)
                  const soonExp = days !== null && days <= 7 && days > 0
                  const ss      = STATUS_STYLE[l.listing_status] ?? STATUS_STYLE.pending
                  return (
                    <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? '1px solid #f1f5f4' : 'none', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                      <td style={{ padding: '14px 16px', minWidth: 220 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          {(l.images ?? [])[0]
                            ? <img src={l.images![0]} alt="" style={{ width: 42, height: 34, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                            : <div style={{ width: 42, height: 34, borderRadius: 7, background: '#eaf6f1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="msym" style={{ fontSize: 18, color: '#048c73', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>home</span></div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title_th}</div>
                            {l.district && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{l.district}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12.5 }}>{TYPE_LABEL[l.property_type] ?? l.property_type}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#02402e' }}>
                        ฿{l.price_from.toLocaleString()}
                        {l.price_to ? `–${l.price_to.toLocaleString()}` : ''}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>{PKG_LABEL[l.package_type ?? 'basic'] ?? l.package_type}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12 }}>
                        {l.expires_at ? (
                          <span style={{ color: soonExp ? '#d97f11' : days === 0 ? '#b91c1c' : '#334155', fontWeight: soonExp || days === 0 ? 700 : 400 }}>
                            {fmtDate(l.expires_at)}
                            {soonExp && <span style={{ display: 'block', fontSize: 10, color: '#d97f11' }}>เหลือ {days} วัน</span>}
                            {days === 0 && <span style={{ display: 'block', fontSize: 10, color: '#b91c1c' }}>หมดอายุแล้ว</span>}
                          </span>
                        ) : <span style={{ color: '#94a3b8' }}>ไม่จำกัด</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: ss.bg, color: ss.color, fontWeight: 600 }}>{ss.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <a href={`/property/${l.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                          <button onClick={() => setEditTarget(l)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><span className="msym" style={{ fontSize: 14 }}>edit</span></button>
                          <button onClick={() => deleteListing(l.id)} disabled={deleting === l.id} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting === l.id ? 0.5 : 1 }}>
                            {deleting === l.id ? '…' : 'ลบ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
