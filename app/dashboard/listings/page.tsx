'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { properties as staticProperties, Property } from '@/lib/property-data'

// ── Types ────────────────────────────────────────────────────────────────────
interface DbListing {
  id: string
  slug: string
  title_th: string
  title_en: string | null
  property_type: string
  status: string
  price_from: number
  price_to: number | null
  area_sqm: number | null
  bedrooms: number
  bathrooms: number
  address_th: string | null
  district: string | null
  province: string | null
  amenities: string[]
  listing_status: string
  featured: boolean
  verified: boolean
  created_at: string
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
  created_at: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ทเม้นท์', house: 'บ้าน',
  office: 'ออฟฟิศ', coworking: 'Co-space',
  Condo: 'คอนโด', Apartment: 'อพาร์ทเม้นท์', House: 'บ้าน',
  Office: 'ออฟฟิศ', 'Co-Working': 'Co-space',
}
const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  condo: { bg: '#e0f2f9', color: '#0284c7' },
  apartment: { bg: '#e8f5f0', color: '#048c73' },
  house: { bg: '#f3e8ff', color: '#9333ea' },
  office: { bg: '#fef9c3', color: '#a16207' },
  coworking: { bg: '#fee2e2', color: '#b91c1c' },
  Condo: { bg: '#e0f2f9', color: '#0284c7' },
  Apartment: { bg: '#e8f5f0', color: '#048c73' },
  'Co-Working': { bg: '#fee2e2', color: '#b91c1c' },
}

const AMENITY_OPTIONS = [
  'WiFi', 'แอร์', 'ที่จอดรถ', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)',
  'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'เฟอร์นิเจอร์พร้อมอยู่', 'ห้องครัว',
  'เครื่องซักผ้า', 'ตู้เย็น', 'ไมโครเวฟ', 'โทรทัศน์', 'ระเบียง',
  'ร้านสะดวกซื้อ', 'ร้านอาหาร', 'ร้านซักรีด', 'สวนสาธารณะ',
]

function TypeChip({ type }: { type: string }) {
  const tc = TYPE_COLORS[type] ?? { bg: '#f4f6f5', color: '#64748b' }
  return <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>{TYPE_LABELS[type] ?? type}</span>
}

// ── Create Listing Drawer ────────────────────────────────────────────────────
function CreateDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title_th: '', title_en: '', slug: '',
    property_type: 'condo',
    price_from: '', price_to: '',
    bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
    address_th: '', district: '', sub_district: '', province: 'กรุงเทพมหานคร', postcode: '',
    lat: '', lng: '',
    description_th: '',
    featured: false,
    amenities: [] as string[],
  })

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
    // Auto-generate slug from Thai title
    if (key === 'title_th' && typeof value === 'string') {
      const auto = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').slice(0, 60)
      setForm(f => ({ ...f, title_th: value, slug: f.slug || auto }))
      return
    }
  }

  function toggleAmenity(a: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_th || !form.price_from || !form.property_type) {
      setError('กรุณากรอกชื่อ ประเภท และราคา')
      return
    }
    setSaving(true)
    setError('')
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/dashboard/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId: session?.user.id,
          userEmail: session?.user.email,
          userName: session?.user.email?.split('@')[0],
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 13px', borderRadius: 10,
    border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block',
  }
  const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={onClose}>
      {/* Backdrop */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
      {/* Drawer */}
      <div
        style={{ width: 520, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', height: '100vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px', color: '#02402e' }}>เพิ่มประกาศใหม่</h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>ประกาศจะเผยแพร่ทันทีบนเว็บไซต์</p>
          </div>
          <button onClick={onClose} style={{ background: '#f4f6f5', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

          {/* Section: ข้อมูลหลัก */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>ข้อมูลหลัก</div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>ชื่อประกาศ (ภาษาไทย) *</label>
              <input value={form.title_th} onChange={e => set('title_th', e.target.value)} placeholder="เช่น เช่าคอนโด เอกมัย ห้องสวย วิวดี" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>ชื่อประกาศ (ภาษาอังกฤษ)</label>
              <input value={form.title_en} onChange={e => set('title_en', e.target.value)} placeholder="Condo for Rent near BTS Ekkamai" style={inputStyle} />
            </div>

            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Slug (URL) *</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="condo-for-rent-ekkamai" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ประเภทอสังหาฯ *</label>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} style={{ ...inputStyle }}>
                  <option value="condo">คอนโดมิเนียม</option>
                  <option value="apartment">อพาร์ทเม้นท์</option>
                  <option value="house">บ้าน</option>
                  <option value="office">ออฟฟิศ</option>
                  <option value="coworking">Co-Working Space</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: ราคา & ขนาด */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>ราคา & ขนาด</div>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>ราคาเริ่มต้น (บาท/เดือน) *</label>
                <input type="number" value={form.price_from} onChange={e => set('price_from', e.target.value)} placeholder="14000" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ราคาสูงสุด (ถ้ามี)</label>
                <input type="number" value={form.price_to} onChange={e => set('price_to', e.target.value)} placeholder="18000" style={inputStyle} />
              </div>
            </div>
            <div style={{ ...rowStyle, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>ห้องนอน</label>
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} style={{ ...inputStyle }}>
                  {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : `${n} ห้อง`}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ห้องน้ำ</label>
                <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} style={{ ...inputStyle }}>
                  {['1','2','3','4'].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                </select>
              </div>
            </div>
            <div style={{ ...rowStyle, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>พื้นที่ใช้สอย (ตร.ม.)</label>
                <input type="number" value={form.area_sqm} onChange={e => set('area_sqm', e.target.value)} placeholder="28" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ชั้น</label>
                <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="7" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Section: ที่ตั้ง */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>ที่ตั้ง</div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>ที่อยู่</label>
              <input value={form.address_th} onChange={e => set('address_th', e.target.value)} placeholder="เช่น Metro Luxe Rama 4 ถนนพระราม 4" style={inputStyle} />
            </div>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>ย่าน / BTS / MRT</label>
                <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="BTS เอกมัย" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>แขวง</label>
                <input value={form.sub_district} onChange={e => set('sub_district', e.target.value)} placeholder="แขวงพระโขนง" style={inputStyle} />
              </div>
            </div>
            <div style={{ ...rowStyle, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>จังหวัด</label>
                <input value={form.province} onChange={e => set('province', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>รหัสไปรษณีย์</label>
                <input value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="10110" style={inputStyle} />
              </div>
            </div>
            <div style={{ ...rowStyle, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="13.7117" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="100.5803" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Section: รายละเอียด */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>รายละเอียด</div>
            <textarea
              value={form.description_th}
              onChange={e => set('description_th', e.target.value)}
              placeholder="อธิบายรายละเอียดห้อง ทำเล สิ่งอำนวยความสะดวก และจุดเด่น..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Section: สิ่งอำนวยความสะดวก */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>สิ่งอำนวยความสะดวก</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_OPTIONS.map(a => {
                const on = form.amenities.includes(a)
                return (
                  <button
                    key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{
                      padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s',
                      border: on ? 'none' : '1px solid #eef0ef',
                      background: on ? '#02402e' : '#f8fafc',
                      color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400,
                    }}
                  >{on ? '✓ ' : ''}{a}</button>
                )
              })}
            </div>
          </div>

          {/* Featured toggle */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => set('featured', !form.featured)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: form.featured ? '#d97f11' : '#e2e8f0', position: 'relative', transition: 'background .2s',
              }}
            >
              <span style={{ position: 'absolute', top: 3, left: form.featured ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
            </button>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#334155' }}>ประกาศแนะนำ (Featured)</span>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c' }}>
              ⚠️ {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 11, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            style={{ flex: 2, padding: '12px 0', borderRadius: 11, border: 'none', background: saving ? '#64748b' : '#02402e', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {saving ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                กำลังบันทึก...
              </>
            ) : '🏠 เผยแพร่ประกาศ'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  )
}

// ── Published listings tab ───────────────────────────────────────────────────
function PublishedTab({ onAddClick }: { onAddClick: () => void }) {
  const [dbListings, setDbListings] = useState<DbListing[]>([])
  const [loadingDb, setLoadingDb] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState<Property | DbListing | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadDb = useCallback(async () => {
    setLoadingDb(true)
    const r = await fetch('/api/dashboard/listings')
    const d = await r.json()
    setDbListings(d.listings ?? [])
    setLoadingDb(false)
  }, [])

  useEffect(() => { loadDb() }, [loadDb])

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้ออกจากระบบ?')) return
    setDeleting(id)
    await fetch('/api/dashboard/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await loadDb()
    setDeleting(null)
  }

  // Merge static + DB listings
  const allTypes = Array.from(new Set([
    ...staticProperties.map(p => p.propertyType),
    ...dbListings.map(p => p.property_type),
  ]))

  const filterItem = (title: string, type: string, location: string) => {
    if (typeFilter && type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return title.toLowerCase().includes(q) || location.toLowerCase().includes(q)
    }
    return true
  }

  const filteredStatic = staticProperties.filter(p => filterItem(p.title, p.propertyType, p.neighborhood + p.address))
  const filteredDb = dbListings.filter(p => filterItem(p.title_th, p.property_type, (p.district ?? '') + (p.address_th ?? '')))
  const total = staticProperties.length + dbListings.length

  return (
    <div>
      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('')} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: !typeFilter ? '#02402e' : '#f4f6f5', color: !typeFilter ? '#fff' : '#334155' }}>ทั้งหมด</button>
          {allTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t === typeFilter ? '' : t)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: typeFilter === t ? '#02402e' : '#f4f6f5', color: typeFilter === t ? '#fff' : '#334155' }}>
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  ค้นหาชื่อ / ทำเล" style={{ flex: 1, minWidth: 180, padding: '7px 14px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13, outline: 'none' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>แสดง {filteredStatic.length + filteredDb.length} จาก {total} รายการ</span>
          {loadingDb && <span style={{ fontSize: 12, color: '#94a3b8' }}>⟳ กำลังโหลดจากระบบ...</span>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
              {['ชื่อประกาศ', 'ประเภท', 'ทำเล', 'ราคา', 'ห้องนอน', 'แหล่งข้อมูล', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Static properties (read-only) */}
            {filteredStatic.map((p, i) => (
              <tr key={`static-${p.id}`} style={{ borderBottom: '1px solid #f1f5f4' }}>
                <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={p.image} alt="" style={{ width: 40, height: 34, borderRadius: 7, objectFit: 'cover', flexShrink: 0, background: '#eef0ef' }} onError={e => (e.currentTarget.style.display = 'none')} />
                    <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{p.title}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}><TypeChip type={p.propertyType} /></td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12.5, whiteSpace: 'nowrap' }}>{p.neighborhood}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#02402e', whiteSpace: 'nowrap' }}>{p.priceDisplay}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} ห้อง`}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#f0f2f1', color: '#64748b', fontWeight: 500 }}>Static file</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>↗ ดูหน้า</a>
                </td>
              </tr>
            ))}

            {/* DB listings (can delete) */}
            {filteredDb.map(p => (
              <tr key={`db-${p.id}`} style={{ borderBottom: '1px solid #f1f5f4', background: '#fafffe' }}>
                <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                  <div style={{ fontWeight: 600, color: '#02402e', fontSize: 13, lineHeight: 1.3 }}>{p.title_th}</div>
                  {p.title_en && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{p.title_en}</div>}
                </td>
                <td style={{ padding: '12px 16px' }}><TypeChip type={p.property_type} /></td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12.5 }}>{p.district || p.address_th || '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#02402e', whiteSpace: 'nowrap' }}>
                  {p.price_from ? `฿${p.price_from.toLocaleString()}` : '—'}
                  {p.price_to ? ` – ฿${p.price_to.toLocaleString()}` : ''}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} ห้อง`}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Dashboard</span>
                    {p.featured && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#fff6e9', color: '#d97f11', fontWeight: 600 }}>⭐ Featured</span>}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                    <button onClick={() => deleteListing(p.id)} disabled={deleting === p.id} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting === p.id ? 0.5 : 1 }}>
                      {deleting === p.id ? '...' : 'ลบ'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredStatic.length + filteredDb.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>ไม่พบรายการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Submission queue tab ─────────────────────────────────────────────────────
function SubmissionsTab() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
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
    { value: '', label: 'ทั้งหมด' },
    { value: 'pending', label: 'รออนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'rejected', label: 'ปฏิเสธ' },
  ]

  const STATUS_CHIP: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
    approved: { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
    rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
  }

  return (
    <div>
      <div style={{ background: '#fff6e9', border: '1px solid #fed7aa', borderRadius: 12, padding: '11px 15px', marginBottom: 14, fontSize: 13, color: '#92400e' }}>
        📬 ประกาศที่ส่งมาจากฟอร์ม <strong>/ลงประกาศ</strong> บนเว็บไซต์ — ต้องการอนุมัติก่อนเผยแพร่
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
            กำลังโหลด...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '50px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>ยังไม่มีคำขอใหม่</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>เมื่อมีคนส่งประกาศผ่านเว็บไซต์ จะปรากฏที่นี่</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                {['ชื่อ', 'ประเภท', 'ทำเล', 'ราคา', 'ผู้ส่ง', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const s = STATUS_CHIP[item.status] ?? STATUS_CHIP.pending
                return (
                  <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#02402e', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '—'}</td>
                    <td style={{ padding: '12px 14px' }}><TypeChip type={item.type} /></td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{[item.district, item.province].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#02402e' }}>{item.price ? `฿${item.price.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12.5 }}>
                      <div style={{ fontWeight: 500 }}>{item.contact_name || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11.5 }}>{item.contact_email}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 11.5, whiteSpace: 'nowrap' }}>{new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {item.status !== 'approved' && <button onClick={() => updateStatus(item.id, 'approved')} disabled={!!actionLoading} style={{ padding: '5px 9px', borderRadius: 7, border: 'none', background: '#02402e', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>อนุมัติ</button>}
                        {item.status !== 'rejected' && <button onClick={() => updateStatus(item.id, 'rejected')} disabled={!!actionLoading} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>ปฏิเสธ</button>}
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

// ── Main page ────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [tab, setTab] = useState<'published' | 'queue'>('published')
  const [showCreate, setShowCreate] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>จัดการประกาศ</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{staticProperties.length} ประกาศ static + ประกาศจาก Dashboard</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          + เพิ่มประกาศใหม่
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('published')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'published' ? '#02402e' : '#f4f6f5', color: tab === 'published' ? '#fff' : '#64748b' }}>
          🏠 เผยแพร่แล้ว
        </button>
        <button onClick={() => setTab('queue')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'queue' ? '#02402e' : '#f4f6f5', color: tab === 'queue' ? '#fff' : '#64748b' }}>
          📬 คำขอจากฟอร์ม
        </button>
      </div>

      {tab === 'published'
        ? <PublishedTab key={refreshKey} onAddClick={() => setShowCreate(true)} />
        : <SubmissionsTab />
      }

      {showCreate && (
        <CreateDrawer
          onClose={() => setShowCreate(false)}
          onCreated={() => { setRefreshKey(k => k + 1); setTab('published') }}
        />
      )}
    </div>
  )
}
