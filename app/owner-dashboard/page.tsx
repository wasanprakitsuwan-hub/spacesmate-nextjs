'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

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
  address_th: string | null
  images: string[] | null
  listing_status: string
  package_type: string | null
  expires_at: string | null
  created_at: string
  bedrooms: number
  bathrooms: number
  area_sqm: number | null
  rental_term: string | null
  verified: boolean
}

interface FormState {
  title_th: string; title_en: string; slug: string
  property_type: string; rental_term: string; package_type: string
  price_from: string; price_to: string
  bedrooms: string; bathrooms: string; floor: string; area_sqm: string
  address_th: string; district: string; sub_district: string; province: string; postcode: string
  lat: string; lng: string
  description_th: string
  amenities: string[]
  images: string[]
  video_url: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BLANK: FormState = {
  title_th: '', title_en: '', slug: '',
  property_type: 'condo', rental_term: 'monthly', package_type: 'basic',
  price_from: '', price_to: '',
  bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
  address_th: '', district: '', sub_district: '', province: 'กรุงเทพมหานคร', postcode: '',
  lat: '', lng: '',
  description_th: '',
  amenities: [], images: [], video_url: '',
}

const PROPERTY_TYPES = [
  { value: 'condo',     label: 'คอนโดมิเนียม' },
  { value: 'apartment', label: 'อพาร์ทเม้นท์' },
  { value: 'house',     label: 'บ้าน' },
  { value: 'office',    label: 'ออฟฟิศ' },
  { value: 'coworking', label: 'โคเวิร์กกิ้ง' },
]

const RENTAL_TERMS = [
  { value: 'daily',    label: 'รายวัน' },
  { value: 'weekly',   label: 'รายสัปดาห์' },
  { value: 'monthly',  label: 'รายเดือน' },
  { value: '3_months', label: '3 เดือน' },
  { value: '6_months', label: '6 เดือน' },
  { value: 'yearly',   label: 'รายปี' },
]

const AMENITY_OPTIONS = [
  'เฟอร์นิเจอร์พร้อมอยู่', 'เฟอร์นิเจอร์บางส่วน', 'แอร์', 'โทรทัศน์', 'ตู้เย็น',
  'ที่จอดรถ', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)', 'กล้องวงจรปิด (CCTV)',
  'ลิฟท์', 'รปภ 24 ชม', 'อินเทอร์เน็ต', 'เครื่องซักผ้า', 'ไมโครเวฟ',
]

const PKG_LABEL: Record<string, string> = {
  basic: 'Basic (30 วัน)', standard: 'Standard (90 วัน)', premium: 'Premium (365 วัน)', admin: 'Admin',
}

const TYPE_LABEL: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน', office: 'ออฟฟิศ', coworking: 'โคเวิร์ก',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่แล้ว' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'รอตรวจสอบ' },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: 'หมดอายุ' },
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

// ── Shared input styles ───────────────────────────────────────────────────────
const INP: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }
const LBL: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }
const FG: React.CSSProperties  = { marginBottom: 16 }

// ── Image Upload ──────────────────────────────────────────────────────────────
function ImageUpload({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file)
      try {
        const r = await fetch('/api/dashboard/upload', { method: 'POST', body: fd })
        const d = await r.json()
        if (d.url) urls.push(d.url)
      } catch { /* skip failed upload */ }
    }
    onChange([...images, ...urls].slice(0, 10))
    setUploading(false)
  }

  return (
    <div>
      <label
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: 12, border: '2px dashed #c7d2d0', background: '#f8faf9', cursor: 'pointer', marginBottom: 12, minHeight: 80 }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        {uploading
          ? <><div style={{ width: 22, height: 22, border: '2.5px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', marginBottom: 6 }} /><span style={{ fontSize: 13, color: '#94a3b8' }}>กำลังอัปโหลด...</span></>
          : <><span style={{ fontSize: 22, marginBottom: 4 }}>📁</span><span style={{ fontSize: 13, color: '#64748b' }}>เลือกรูปภาพ (JPG · PNG · WebP · สูงสุด 10 รูป)</span></>
        }
      </label>
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid ' + (i === 0 ? '#048c73' : '#eef0ef') }} />
              {i === 0 && <span style={{ position: 'absolute', bottom: 3, left: 3, background: '#048c73', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>หน้าปก</span>}
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#b91c1c', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>รูปแรกจะเป็นรูปหน้าปกของประกาศ</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Listing Form ──────────────────────────────────────────────────────────────
function ListingForm({ form, setF, toggleAmenity }: {
  form: FormState
  setF: (k: keyof FormState, v: any) => void
  toggleAmenity: (a: string) => void
}) {
  return (
    <div>
      {/* Section 1 — ข้อมูลพื้นฐาน */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>1 · ข้อมูลพื้นฐาน</p>
        <div style={FG}>
          <label style={LBL}>ชื่อประกาศ (ภาษาไทย) *</label>
          <input style={INP} value={form.title_th} onChange={e => setF('title_th', e.target.value)} placeholder="เช่น เช่าคอนโด ใกล้ BTS อโศก ห้องสวย พร้อมอยู่" />
        </div>
        <div style={FG}>
          <label style={LBL}>ชื่อประกาศ (ภาษาอังกฤษ)</label>
          <input style={INP} value={form.title_en} onChange={e => setF('title_en', e.target.value)} placeholder="e.g. Condo for Rent near BTS Asoke" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={FG}>
            <label style={LBL}>ประเภทอสังหาริมทรัพย์ *</label>
            <select style={INP} value={form.property_type} onChange={e => setF('property_type', e.target.value)}>
              {PROPERTY_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={FG}>
            <label style={LBL}>ระยะเวลาเช่า</label>
            <select style={INP} value={form.rental_term} onChange={e => setF('rental_term', e.target.value)}>
              {RENTAL_TERMS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2 — ราคา */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>2 · ราคาเช่า</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={FG}>
            <label style={LBL}>ราคาเริ่มต้น (บาท/เดือน) *</label>
            <input style={INP} type="number" value={form.price_from} onChange={e => setF('price_from', e.target.value)} placeholder="8,000" />
          </div>
          <div style={FG}>
            <label style={LBL}>ราคาสูงสุด (บาท/เดือน)</label>
            <input style={INP} type="number" value={form.price_to} onChange={e => setF('price_to', e.target.value)} placeholder="12,000" />
          </div>
        </div>
      </div>

      {/* Section 3 — รายละเอียดห้อง */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>3 · รายละเอียดทรัพย์สิน</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div style={FG}>
            <label style={LBL}>ห้องนอน</label>
            <select style={INP} value={form.bedrooms} onChange={e => setF('bedrooms', e.target.value)}>
              {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>)}
            </select>
          </div>
          <div style={FG}>
            <label style={LBL}>ห้องน้ำ</label>
            <select style={INP} value={form.bathrooms} onChange={e => setF('bathrooms', e.target.value)}>
              {['1','2','3','4'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={FG}>
            <label style={LBL}>ชั้น</label>
            <input style={INP} type="number" value={form.floor} onChange={e => setF('floor', e.target.value)} placeholder="7" />
          </div>
          <div style={FG}>
            <label style={LBL}>ขนาด (ตร.ม.)</label>
            <input style={INP} type="number" value={form.area_sqm} onChange={e => setF('area_sqm', e.target.value)} placeholder="35" />
          </div>
        </div>
      </div>

      {/* Section 4 — สถานที่ */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>4 · สถานที่ตั้ง</p>
        <div style={FG}>
          <label style={LBL}>ที่อยู่</label>
          <input style={INP} value={form.address_th} onChange={e => setF('address_th', e.target.value)} placeholder="เลขที่ ซอย ถนน" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={FG}>
            <label style={LBL}>แขวง / ตำบล</label>
            <input style={INP} value={form.district} onChange={e => setF('district', e.target.value)} placeholder="คลองเตย" />
          </div>
          <div style={FG}>
            <label style={LBL}>เขต / อำเภอ</label>
            <input style={INP} value={form.sub_district} onChange={e => setF('sub_district', e.target.value)} placeholder="วัฒนา" />
          </div>
          <div style={FG}>
            <label style={LBL}>จังหวัด</label>
            <input style={INP} value={form.province} onChange={e => setF('province', e.target.value)} placeholder="กรุงเทพมหานคร" />
          </div>
          <div style={FG}>
            <label style={LBL}>รหัสไปรษณีย์</label>
            <input style={INP} value={form.postcode} onChange={e => setF('postcode', e.target.value)} placeholder="10110" maxLength={5} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={FG}>
            <label style={LBL}>Latitude (GPS)</label>
            <input style={INP} value={form.lat} onChange={e => setF('lat', e.target.value)} placeholder="13.7563" />
          </div>
          <div style={FG}>
            <label style={LBL}>Longitude (GPS)</label>
            <input style={INP} value={form.lng} onChange={e => setF('lng', e.target.value)} placeholder="100.5018" />
          </div>
        </div>
      </div>

      {/* Section 5 — สิ่งอำนวยความสะดวก */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>5 · สิ่งอำนวยความสะดวก</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AMENITY_OPTIONS.map(a => {
            const on = form.amenities.includes(a)
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${on ? '#048c73' : '#d1d5db'}`,
                background: on ? '#048c73' : '#fff', color: on ? '#fff' : '#475569',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              }}>
                {on ? '✓ ' : ''}{a}
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 6 — รูปภาพ */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>6 · รูปภาพประกาศ</p>
        <ImageUpload images={form.images} onChange={imgs => setF('images', imgs)} />
      </div>

      {/* Section 7 — คำอธิบาย */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontWeight: 700, color: '#02402e', fontSize: 13, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.5 }}>7 · คำอธิบายเพิ่มเติม</p>
        <textarea style={{ ...INP, minHeight: 120, resize: 'vertical' }} value={form.description_th} onChange={e => setF('description_th', e.target.value)} placeholder="อธิบายรายละเอียดทรัพย์สิน สิ่งอำนวยความสะดวก บรรยากาศ การเดินทาง..." />
      </div>
    </div>
  )
}

// ── Drawer wrapper ────────────────────────────────────────────────────────────
function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(2,64,46,0.3)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div style={{ width: '100%', maxWidth: 620, background: '#fff', boxShadow: '-8px 0 40px rgba(2,64,46,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
  const [form, setForm] = useState<FormState>({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function setF(k: keyof FormState, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function toggleAmenity(a: string) { setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_th.trim()) { setError('กรุณากรอกชื่อประกาศ'); return }
    if (!form.price_from)       { setError('กรุณากรอกราคาเริ่มต้น'); return }

    setSaving(true); setError('')
    try {
      const res = await fetch('/api/owner/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId, userEmail,
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
        <ListingForm form={form} setF={setF} toggleAmenity={toggleAmenity} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'กำลังบันทึก...' : '🏠 เผยแพร่ประกาศ'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, userId, onClose, onSaved }: { listing: OwnerListing; userId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>({
    title_th:      listing.title_th   || '',
    title_en:      listing.title_en   || '',
    slug:          listing.slug       || '',
    property_type: listing.property_type || 'condo',
    rental_term:   listing.rental_term   || 'monthly',
    package_type:  listing.package_type  || 'basic',
    price_from:    String(listing.price_from   ?? ''),
    price_to:      String(listing.price_to     ?? ''),
    bedrooms:      String(listing.bedrooms     ?? 1),
    bathrooms:     String(listing.bathrooms    ?? 1),
    floor:         '',
    area_sqm:      String(listing.area_sqm     ?? ''),
    address_th:    listing.address_th  || '',
    district:      listing.district    || '',
    sub_district:  '',
    province:      'กรุงเทพมหานคร',
    postcode:      '',
    lat:  '', lng: '',
    description_th: '',
    amenities: [],
    images:    listing.images ?? [],
    video_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function setF(k: keyof FormState, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function toggleAmenity(a: string) { setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_th.trim()) { setError('กรุณากรอกชื่อประกาศ'); return }

    setSaving(true); setError('')
    try {
      const res = await fetch('/api/owner/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listing.id, userId,
          ...form,
          bedrooms:  parseInt(form.bedrooms)  || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          price_from: parseInt(form.price_from) || 0,
          price_to: form.price_to ? parseInt(form.price_to) : null,
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
        <ListingForm form={form} setF={setF} toggleAmenity={toggleAmenity} />
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#02402e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerDashboardPage() {
  const [listings,    setListings]    = useState<OwnerListing[]>([])
  const [loading,     setLoading]     = useState(true)
  const [userId,      setUserId]      = useState('')
  const [userEmail,   setUserEmail]   = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [editTarget,  setEditTarget]  = useState<OwnerListing | null>(null)
  const [deleting,    setDeleting]    = useState<string | null>(null)

  const load = useCallback(async (uid: string) => {
    setLoading(true)
    const r = await fetch(`/api/owner/listings?userId=${uid}`)
    const d = await r.json()
    setListings(d.listings ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')
      load(session.user.id)
    })
  }, [load])

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้?')) return
    setDeleting(id)
    await fetch('/api/owner/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, userId }) })
    await load(userId)
    setDeleting(null)
  }

  const active  = listings.filter(l => l.listing_status === 'active').length
  const expiring = listings.filter(l => { const d = daysLeft(l.expires_at); return d !== null && d > 0 && d <= 7 }).length

  return (
    <div>
      {showCreate && userId && (
        <CreateDrawer userId={userId} userEmail={userEmail} onClose={() => setShowCreate(false)} onCreated={() => load(userId)} />
      )}
      {editTarget && userId && (
        <EditDrawer listing={editTarget} userId={userId} onClose={() => setEditTarget(null)} onSaved={() => load(userId)} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#02402e', margin: '0 0 4px', letterSpacing: '-0.3px' }}>ประกาศของฉัน</h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>{userEmail}</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
          + เพิ่มประกาศใหม่
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'ประกาศทั้งหมด',    value: listings.length, color: '#02402e', bg: '#f0f7f4' },
          { label: 'เผยแพร่อยู่',       value: active,          color: '#048c73', bg: '#eaf6f1' },
          { label: 'ใกล้หมดอายุ (7 วัน)', value: expiring,     color: '#d97f11', bg: '#fdf3e3' },
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
          {loading && <span style={{ fontSize: 12, color: '#94a3b8' }}>⟳ กำลังโหลด...</span>}
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #048c73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>กำลังโหลด...</p>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 44, margin: '0 0 12px' }}>🏠</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 8px' }}>ยังไม่มีประกาศ</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>เริ่มต้นลงประกาศทรัพย์สินแรกของคุณวันนี้</p>
            <button onClick={() => setShowCreate(true)} style={{ background: '#02402e', color: '#fff', border: 'none', borderRadius: 24, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              + เพิ่มประกาศใหม่
            </button>
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
                            : <div style={{ width: 42, height: 34, borderRadius: 7, background: '#eaf6f1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏠</div>
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
                          <button onClick={() => setEditTarget(l)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✏️</button>
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
