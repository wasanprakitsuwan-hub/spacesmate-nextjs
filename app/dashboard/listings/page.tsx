'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { properties as staticProperties } from '@/lib/property-data'

// ── Types ────────────────────────────────────────────────────────────────────
interface RoomTypeRow {
  id: string
  room_type: string
  price_from: string
  price_to: string
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
  slug: string
  property_type: string
  rental_term: string
  package_type: string
  price_from: string
  price_to: string
  room_types: RoomTypeRow[]
  bedrooms: string
  bathrooms: string
  floor: string
  area_sqm: string
  address_th: string
  district: string
  sub_district: string
  province: string
  postcode: string
  map_search: string
  lat: string
  lng: string
  description_th: string
  amenities: string[]
  images: string[]
  video_url: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const ROOM_TYPE_OPTIONS = [
  'Studio', '1 ห้องนอน', '2 ห้องนอน', '3 ห้องนอน', '4 ห้องนอน+',
  'Penthouse', 'เชิงพาณิชย์', 'ลอฟท์', 'ดูเพล็กซ์',
]

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
const AMENITY_OPTIONS = [
  'WiFi', 'แอร์', 'ที่จอดรถ', 'ลิฟท์', 'สระว่ายน้ำ', 'ห้องออกกำลังกาย (GYM)',
  'รปภ 24 ชม', 'กล้องวงจรปิด (CCTV)', 'เฟอร์นิเจอร์พร้อมอยู่', 'ห้องครัว',
  'เครื่องซักผ้า', 'ตู้เย็น', 'ไมโครเวฟ', 'โทรทัศน์', 'ระเบียง',
  'ร้านสะดวกซื้อ', 'ร้านอาหาร', 'ร้านซักรีด', 'สวนสาธารณะ',
]
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
  { id: 'admin',    label: 'Admin — ไม่มีวันหมดอายุ',         days: 0   },
  { id: 'basic',    label: 'Basic — 1 เดือน (฿299)',           days: 30  },
  { id: 'standard', label: 'Standard — 3 เดือน (฿699)',        days: 90  },
  { id: 'premium',  label: 'Premium — 12 เดือน (฿2,499)',      days: 365 },
]

function computeExpiry(packageId: string): string | null {
  const pkg = ADMIN_PACKAGES.find(p => p.id === packageId)
  if (!pkg || pkg.days === 0) return null
  const d = new Date(); d.setDate(d.getDate() + pkg.days)
  return d.toISOString()
}

const BLANK_FORM: ListingFormState = {
  title_th: '', title_en: '', slug: '',
  property_type: 'condo', rental_term: '1_month', package_type: 'admin',
  price_from: '', price_to: '',
  room_types: [],
  bedrooms: '1', bathrooms: '1', floor: '', area_sqm: '',
  address_th: '', district: '', sub_district: '',
  province: 'กรุงเทพมหานคร', postcode: '',
  map_search: '', lat: '', lng: '',
  description_th: '', amenities: [],
  images: [], video_url: '',
}

// ── Tiny helper components ───────────────────────────────────────────────────
function TypeChip({ type }: { type: string }) {
  const tc = TYPE_COLORS[type] ?? { bg: '#f4f6f5', color: '#64748b' }
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function SectionHead({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#048c73', letterSpacing: 1.2, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: '#eef0ef' }} />
    </div>
  )
}

// ── Rich Text Editor ─────────────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, []) // only on mount

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    ref.current?.focus()
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const btnStyle: React.CSSProperties = {
    padding: '4px 8px', borderRadius: 6, border: '1px solid #eef0ef',
    background: '#f8fafc', color: '#475569', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, lineHeight: 1,
  }

  return (
    <div style={{ border: '1px solid #eef0ef', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #eef0ef', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('bold') }}><b>B</b></button>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('italic') }}><i>I</i></button>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('underline') }}><u>U</u></button>
        <div style={{ width: 1, background: '#eef0ef', margin: '0 2px' }} />
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2') }}>H2</button>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3') }}>H3</button>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p') }}>¶</button>
        <div style={{ width: 1, background: '#eef0ef', margin: '0 2px' }} />
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}>• List</button>
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }}>1. List</button>
        <div style={{ width: 1, background: '#eef0ef', margin: '0 2px' }} />
        <button type="button" style={{ ...btnStyle, color: '#b91c1c' }} onMouseDown={e => { e.preventDefault(); exec('removeFormat') }}>✕ Clear</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
        data-placeholder={placeholder || 'อธิบายรายละเอียด...'}
        style={{ minHeight: 120, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.7, color: '#334155', outline: 'none' }}
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        [contenteditable] h2 { font-size: 1.15em; font-weight: 700; color: #02402e; margin: .8em 0 .3em; }
        [contenteditable] h3 { font-size: 1em; font-weight: 600; margin: .6em 0 .2em; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.4em; }
        [contenteditable] li { margin-bottom: 3px; }
      `}</style>
    </div>
  )
}

// ── Room Type Pricing Grid ────────────────────────────────────────────────────
function RoomTypePricingGrid({ rows, onChange, termLabel }: {
  rows: RoomTypeRow[]
  onChange: (rows: RoomTypeRow[]) => void
  termLabel: string
}) {
  const inputS: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #eef0ef',
    fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box',
  }

  function addRow() {
    onChange([...rows, { id: `rt-${Date.now()}`, room_type: 'Studio', price_from: '', price_to: '' }])
  }
  function removeRow(id: string) {
    onChange(rows.filter(r => r.id !== id))
  }
  function updateRow(id: string, field: keyof RoomTypeRow, val: string) {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 30px', gap: 6, marginBottom: 5, paddingLeft: 2 }}>
            {[`ประเภทห้อง`, `ราคาต่ำสุด${termLabel}`, `ราคาสูงสุด${termLabel}`, ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          {rows.map(row => (
            <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 30px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <select value={row.room_type} onChange={e => updateRow(row.id, 'room_type', e.target.value)} style={inputS}>
                {ROOM_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="number" value={row.price_from} onChange={e => updateRow(row.id, 'price_from', e.target.value)} placeholder="14000" style={inputS} />
              <input type="number" value={row.price_to}   onChange={e => updateRow(row.id, 'price_to',   e.target.value)} placeholder="16000" style={inputS} />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addRow}
        style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
      >
        + เพิ่มประเภทห้อง
      </button>
    </div>
  )
}

// ── Map Search (proxied Nominatim) ────────────────────────────────────────────
function MapSearch({ value, onChange, onResult }: {
  value: string
  onChange: (v: string) => void
  onResult: (lat: string, lng: string) => void
}) {
  const [searching, setSearching] = useState(false)
  const [results, setResults]     = useState<Array<{ lat: string; lon: string; display_name: string }>>([])

  async function doSearch() {
    if (!value.trim()) return
    setSearching(true)
    setResults([])
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`)
      const d = await r.json()
      setResults(d.results ?? [])
    } catch {}
    setSearching(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
          placeholder="พิมพ์ชื่อโครงการ หรือที่อยู่ แล้วกด Enter หรือ ค้นหา"
          style={{ flex: 1, padding: '9px 13px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none' }}
        />
        <button
          type="button"
          onClick={doSearch}
          disabled={searching}
          style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#02402e', color: '#fff', fontWeight: 600, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: searching ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {searching
            ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />ค้นหา</>
            : '🗺️ ค้นหา'
          }
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300, background: '#fff', border: '1px solid #eef0ef', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', overflow: 'hidden', marginTop: 4 }}>
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onResult(r.lat, r.lon)
                onChange(r.display_name.split(',')[0].trim())
                setResults([])
              }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 13, color: '#334155',
                borderBottom: i < results.length - 1 ? '1px solid #f1f5f4' : 'none',
              }}
            >
              📍 {r.display_name.length > 90 ? r.display_name.slice(0, 90) + '…' : r.display_name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setResults([])}
            style={{ display: 'block', width: '100%', textAlign: 'center', padding: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}
          >ปิด</button>
        </div>
      )}
    </div>
  )
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({ images, onImagesChange }: {
  images: string[]
  onImagesChange: (imgs: string[]) => void
}) {
  const [uploading, setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    setUploadError('')
    const added: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'image')
      try {
        const r = await fetch('/api/dashboard/upload', { method: 'POST', body: fd })
        const d = await r.json()
        if (d.url) added.push(d.url)
        else setUploadError(d.error || 'อัปโหลดไม่สำเร็จ')
      } catch { setUploadError('เชื่อมต่อ API ไม่ได้') }
    }
    if (added.length) onImagesChange([...images, ...added])
    setUploading(false)
  }

  function remove(idx: number) {
    onImagesChange(images.filter((_, i) => i !== idx))
  }

  const limit = images.length >= 10

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files) handleFiles(e.target.files) }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || limit}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 10,
          border: '1.5px dashed ' + (limit ? '#eef0ef' : '#c7d2d0'),
          background: uploading ? '#f8fafc' : '#fafffe',
          color: limit ? '#94a3b8' : '#048c73',
          fontWeight: 600, fontSize: 13,
          cursor: (uploading || limit) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {uploading ? (
          <><span style={{ width: 16, height: 16, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปโหลด...</>
        ) : limit ? (
          '✅ อัปโหลดครบ 10 รูปแล้ว'
        ) : (
          <><span style={{ fontSize: 20 }}>📁</span> เลือกรูปภาพห้อง (JPG · PNG · WebP  •  สูงสุด 10 รูป  •  10 MB/รูป)</>
        )}
      </button>

      {uploadError && (
        <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0' }}>⚠️ {uploadError}</p>
      )}

      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={url}
                alt=""
                style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid #eef0ef' }}
              />
              {i === 0 && (
                <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, background: '#02402e', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                  หน้าปก
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#b91c1c', border: '2px solid #fff', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Video Upload Zone ─────────────────────────────────────────────────────────
function VideoUploadZone({ videoUrl, onVideoChange, packageType }: {
  videoUrl: string
  onVideoChange: (url: string) => void
  packageType: string
}) {
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isPremium = packageType === 'premium'

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'video')
    try {
      const r = await fetch('/api/dashboard/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.url) onVideoChange(d.url)
      else setUploadError(d.error || 'อัปโหลดไม่สำเร็จ')
    } catch { setUploadError('เชื่อมต่อ API ไม่ได้') }
    setUploading(false)
  }

  if (!isPremium) {
    return (
      <div style={{ background: '#f8fafc', border: '1.5px dashed #eef0ef', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🎬</div>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontWeight: 500 }}>วิดีโอเฉพาะแพ็กเกจ Premium</p>
        <p style={{ color: '#c7d2d0', fontSize: 12, margin: '4px 0 0' }}>เปลี่ยนแพ็กเกจเป็น Premium ด้านบนเพื่อเพิ่มวิดีโอ</p>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1.5px dashed #048c73', background: '#f0fbf8', color: '#048c73', fontWeight: 600, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}
      >
        {uploading
          ? <><span style={{ width: 14, height: 14, border: '2px solid #d1fae5', borderTopColor: '#048c73', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังอัปโหลด...</>
          : '📹 อัปโหลดวิดีโอ (MP4 · QuickTime · WebM  •  สูงสุด 50 MB)'
        }
      </button>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
          หรือวางลิงก์วิดีโอ (YouTube / Vimeo / ลิงก์ตรง)
        </label>
        <input
          value={videoUrl.startsWith('http') && !videoUrl.includes('supabase') ? videoUrl : ''}
          onChange={e => onVideoChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' as const }}
        />
      </div>

      {uploadError && <p style={{ color: '#b91c1c', fontSize: 12, margin: '5px 0 0' }}>⚠️ {uploadError}</p>}

      {videoUrl && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, wordBreak: 'break-all' }}>✅ {videoUrl.length > 60 ? videoUrl.slice(0, 60) + '…' : videoUrl}</span>
          <button type="button" onClick={() => onVideoChange('')} style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ── Form Fields (all sections) ────────────────────────────────────────────────
function ListingFormFields({ form, onChange, onAmenityToggle, onImagesChange, onRoomTypesChange }: {
  form: ListingFormState
  onChange: (k: string, v: any) => void
  onAmenityToggle: (a: string) => void
  onImagesChange: (imgs: string[]) => void
  onRoomTypesChange: (rows: RoomTypeRow[]) => void
}) {
  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 13px', borderRadius: 10,
    border: '1px solid #eef0ef', fontSize: 13.5, outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block' }
  const g2:  React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <>
      {/* ── 1. ข้อมูลหลัก ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="1 · ข้อมูลหลัก" />
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>ชื่อประกาศ (ภาษาไทย) *</label>
          <input value={form.title_th} onChange={e => onChange('title_th', e.target.value)} placeholder="เช่น เช่าคอนโด เอกมัย ห้องสวย วิวดี" required style={inp} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>ชื่อประกาศ (ภาษาอังกฤษ)</label>
          <input value={form.title_en} onChange={e => onChange('title_en', e.target.value)} placeholder="Condo for Rent near BTS Ekkamai" style={inp} />
        </div>
        <div style={g2}>
          <div>
            <label style={lbl}>Slug (URL ของประกาศ) *</label>
            <input value={form.slug} onChange={e => onChange('slug', e.target.value)} placeholder="condo-for-rent-ekkamai" required style={inp} />
          </div>
          <div>
            <label style={lbl}>ประเภทอสังหาฯ *</label>
            <select value={form.property_type} onChange={e => onChange('property_type', e.target.value)} style={inp}>
              <option value="condo">คอนโดมิเนียม</option>
              <option value="apartment">อพาร์ทเม้นท์</option>
              <option value="house">บ้าน</option>
              <option value="office">ออฟฟิศ</option>
              <option value="coworking">Co-Working Space</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. แพ็กเกจ & รูปแบบเช่า ─────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="2 · แพ็กเกจ & รูปแบบการเช่า" />
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>แพ็กเกจประกาศ</label>
          <select value={form.package_type} onChange={e => onChange('package_type', e.target.value)} style={inp}>
            {ADMIN_PACKAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <p style={{ fontSize: 11.5, margin: '4px 0 0', fontWeight: 500, color: form.package_type === 'admin' ? '#94a3b8' : '#048c73' }}>
            {form.package_type === 'admin'
              ? 'ไม่มีวันหมดอายุ — ประกาศอยู่บนเว็บตลอดไปจนกว่าจะลบ'
              : `⏱ หมดอายุ: ${new Date(computeExpiry(form.package_type) ?? '').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`}
          </p>
        </div>
        <div>
          <label style={lbl}>รูปแบบการเช่า</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {RENTAL_TERM_OPTIONS.map(o => (
              <button key={o.value} type="button" onClick={() => onChange('rental_term', o.value)}
                style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', border: `1.5px solid ${form.rental_term === o.value ? '#048c73' : '#eef0ef'}`, background: form.rental_term === o.value ? '#eaf6f1' : '#fff', color: form.rental_term === o.value ? '#02402e' : '#64748b' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. ราคาหลัก & ราคาตามประเภทห้อง ─────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="3 · ราคาและประเภทห้อง" />

        {/* ราคาหลัก */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#02402e', margin: '0 0 10px' }}>💰 ราคาหลัก (แสดงเป็น "เริ่มต้น" บนหน้าประกาศ)</p>
          <div style={g2}>
            <div>
              <label style={lbl}>ราคาต่ำสุด (บาท{RENTAL_TERM_LABEL[form.rental_term] ?? ''}) *</label>
              <input type="number" value={form.price_from} onChange={e => onChange('price_from', e.target.value)} placeholder="14000" required style={inp} />
            </div>
            <div>
              <label style={lbl}>ราคาสูงสุด (ถ้ามี)</label>
              <input type="number" value={form.price_to} onChange={e => onChange('price_to', e.target.value)} placeholder="22000" style={inp} />
            </div>
          </div>
        </div>

        {/* ราคาตามประเภทห้อง */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#02402e', margin: '0 0 4px' }}>🏠 ราคาตามประเภทห้อง (สำหรับอาคารที่มีหลายขนาด)</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>เพิ่มราคาแยกตามประเภท เช่น Studio, 1 ห้องนอน, 2 ห้องนอน</p>
          <RoomTypePricingGrid
            rows={form.room_types}
            onChange={onRoomTypesChange}
            termLabel={RENTAL_TERM_LABEL[form.rental_term] ?? ''}
          />
        </div>
      </div>

      {/* ── 4. ขนาดและลักษณะห้อง ─────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="4 · ขนาดและลักษณะห้อง" />
        <div style={{ ...g2, marginBottom: 12 }}>
          <div>
            <label style={lbl}>ห้องนอน</label>
            <select value={form.bedrooms} onChange={e => onChange('bedrooms', e.target.value)} style={inp}>
              {['0','1','2','3','4','5'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : `${n} ห้อง`}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>ห้องน้ำ</label>
            <select value={form.bathrooms} onChange={e => onChange('bathrooms', e.target.value)} style={inp}>
              {['1','2','3','4'].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
            </select>
          </div>
        </div>
        <div style={g2}>
          <div>
            <label style={lbl}>พื้นที่ใช้สอย (ตร.ม.)</label>
            <input type="number" value={form.area_sqm} onChange={e => onChange('area_sqm', e.target.value)} placeholder="28" style={inp} />
          </div>
          <div>
            <label style={lbl}>ชั้นที่ตั้ง</label>
            <input type="number" value={form.floor} onChange={e => onChange('floor', e.target.value)} placeholder="7" style={inp} />
          </div>
        </div>
      </div>

      {/* ── 5. ที่ตั้งและที่อยู่ ────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="5 · ที่ตั้งและที่อยู่" />
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>ที่อยู่ (ชื่ออาคาร / ถนน)</label>
          <input value={form.address_th} onChange={e => onChange('address_th', e.target.value)} placeholder="เช่น Metro Luxe Rama 4 ถนนพระราม 4" style={inp} />
        </div>
        <div style={{ ...g2, marginBottom: 12 }}>
          <div>
            <label style={lbl}>ย่าน / BTS / MRT</label>
            <input value={form.district} onChange={e => onChange('district', e.target.value)} placeholder="BTS เอกมัย" style={inp} />
          </div>
          <div>
            <label style={lbl}>แขวง</label>
            <input value={form.sub_district} onChange={e => onChange('sub_district', e.target.value)} placeholder="แขวงพระโขนง" style={inp} />
          </div>
        </div>
        <div style={g2}>
          <div>
            <label style={lbl}>จังหวัด</label>
            <input value={form.province} onChange={e => onChange('province', e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>รหัสไปรษณีย์</label>
            <input value={form.postcode} onChange={e => onChange('postcode', e.target.value)} placeholder="10110" style={inp} />
          </div>
        </div>
      </div>

      {/* ── 6. พิกัดบนแผนที่ ──────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="6 · พิกัดบนแผนที่ (Latitude / Longitude)" />
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>🗺️ ค้นหาพิกัดอัตโนมัติจากชื่อสถานที่</label>
          <MapSearch
            value={form.map_search}
            onChange={v => onChange('map_search', v)}
            onResult={(lat, lng) => { onChange('lat', lat); onChange('lng', lng) }}
          />
          {form.lat && form.lng && (
            <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fbf8', borderRadius: 8, fontSize: 12, color: '#048c73', fontWeight: 500 }}>
              ✅ พิกัดที่เลือก: {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}
            </div>
          )}
        </div>
        <div style={g2}>
          <div>
            <label style={lbl}>Latitude (ละติจูด)</label>
            <input value={form.lat} onChange={e => onChange('lat', e.target.value)} placeholder="13.711700" style={inp} />
          </div>
          <div>
            <label style={lbl}>Longitude (ลองจิจูด)</label>
            <input value={form.lng} onChange={e => onChange('lng', e.target.value)} placeholder="100.580300" style={inp} />
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '6px 0 0' }}>
          ค้นหาชื่อโครงการด้านบนเพื่อดึงพิกัดอัตโนมัติ หรือใส่ตัวเลขพิกัดด้วยตนเอง
        </p>
      </div>

      {/* ── 7. รายละเอียดประกาศ ──────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="7 · รายละเอียดประกาศ" />
        <RichEditor
          value={form.description_th}
          onChange={v => onChange('description_th', v)}
          placeholder="อธิบายรายละเอียดห้อง ทำเล สิ่งอำนวยความสะดวก และจุดเด่น..."
        />
      </div>

      {/* ── 8. สิ่งอำนวยความสะดวก ────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="8 · สิ่งอำนวยความสะดวก" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AMENITY_OPTIONS.map(a => {
            const on = form.amenities.includes(a)
            return (
              <button key={a} type="button" onClick={() => onAmenityToggle(a)}
                style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s', border: on ? 'none' : '1px solid #eef0ef', background: on ? '#02402e' : '#f8fafc', color: on ? '#fff' : '#64748b', fontWeight: on ? 600 : 400 }}>
                {on ? '✓ ' : ''}{a}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 9. รูปภาพห้อง ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHead text="9 · รูปภาพห้อง" />
        <ImageUploadZone images={form.images} onImagesChange={onImagesChange} />
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '7px 0 0' }}>
          รูปแรกจะเป็นรูปหน้าปกของประกาศ · ลาก/วางก็ได้เช่นกัน
        </p>
      </div>

      {/* ── 10. วิดีโอ (Premium) ─────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}>
        <SectionHead text="10 · วิดีโอประกาศ (Premium เท่านั้น)" />
        <VideoUploadZone
          videoUrl={form.video_url}
          onVideoChange={v => onChange('video_url', v)}
          packageType={form.package_type}
        />
      </div>
    </>
  )
}

// ── Create Drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [form,   setForm]   = useState<ListingFormState>({ ...BLANK_FORM })

  function setF(k: string, v: any) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'title_th' && !f.slug) {
        next.slug = (v as string).toLowerCase().trim()
          .replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-').slice(0, 60)
      }
      return next
    })
  }
  function toggleAmenity(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_th || !form.price_from) { setError('กรุณากรอกชื่อประกาศและราคาเริ่มต้น'); return }
    setSaving(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/dashboard/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId:    session?.user.id,
          userEmail: session?.user.email,
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
      saving={saving} error={error}
      onClose={onClose} onSubmit={handleSubmit}
      submitLabel="🏠 เผยแพร่ประกาศ"
    />
  )
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────
function EditDrawer({ listing, onClose, onSaved }: { listing: DbListing; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [form,   setForm]   = useState<ListingFormState>({
    title_th:      listing.title_th,
    title_en:      listing.title_en ?? '',
    slug:          listing.slug,
    property_type: listing.property_type,
    rental_term:   listing.rental_term ?? '1_month',
    package_type:  listing.package_type ?? 'admin',
    price_from:    String(listing.price_from),
    price_to:      listing.price_to ? String(listing.price_to) : '',
    room_types:    (listing.room_types ?? []).map((r: any, i: number) => ({
      id: `rt-${i}`, room_type: r.room_type || 'Studio',
      price_from: String(r.price_from || ''), price_to: String(r.price_to || ''),
    })),
    bedrooms:      String(listing.bedrooms),
    bathrooms:     String(listing.bathrooms),
    floor:         listing.floor ? String(listing.floor) : '',
    area_sqm:      listing.area_sqm ? String(listing.area_sqm) : '',
    address_th:    listing.address_th ?? '',
    district:      listing.district ?? '',
    sub_district:  listing.sub_district ?? '',
    province:      listing.province ?? 'กรุงเทพมหานคร',
    postcode:      listing.postcode ?? '',
    map_search:    '',
    lat:           listing.lat ? String(listing.lat) : '',
    lng:           listing.lng ? String(listing.lng) : '',
    description_th: listing.description_th ?? '',
    amenities:     listing.amenities ?? [],
    images:        listing.images ?? [],
    video_url:     listing.video_url ?? '',
  })

  function setF(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }
  function toggleAmenity(a: string) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title_th || !form.price_from) { setError('กรุณากรอกชื่อประกาศและราคา'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/dashboard/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listing.id,
          ...form,
          price_from:  parseInt(form.price_from),
          price_to:    form.price_to ? parseInt(form.price_to) : null,
          bedrooms:    parseInt(form.bedrooms),
          bathrooms:   parseInt(form.bathrooms),
          floor:       form.floor    ? parseInt(form.floor)    : null,
          area_sqm:    form.area_sqm ? parseFloat(form.area_sqm) : null,
          lat:         form.lat ? parseFloat(form.lat) : null,
          lng:         form.lng ? parseFloat(form.lng) : null,
          expires_at:  computeExpiry(form.package_type),
          room_types:  form.room_types.map(r => ({
            room_type:  r.room_type,
            price_from: parseInt(r.price_from) || 0,
            price_to:   r.price_to ? parseInt(r.price_to) : null,
          })),
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
      saving={saving} error={error}
      onClose={onClose} onSubmit={handleSubmit}
      submitLabel="💾 บันทึกการแก้ไข"
    />
  )
}

// ── Drawer Shell ──────────────────────────────────────────────────────────────
function ListingDrawer({ title, subtitle, form, setF, toggleAmenity, onImagesChange, onRoomTypesChange, saving, error, onClose, onSubmit, submitLabel }: {
  title: string; subtitle: string
  form: ListingFormState
  setF: (k: string, v: any) => void
  toggleAmenity: (a: string) => void
  onImagesChange: (imgs: string[]) => void
  onRoomTypesChange: (rows: RoomTypeRow[]) => void
  saving: boolean; error: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
      <div
        style={{ width: 600, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', height: '100vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px', color: '#02402e' }}>{title}</h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f4f6f5', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          <ListingFormFields
            form={form} onChange={setF} onAmenityToggle={toggleAmenity}
            onImagesChange={onImagesChange} onRoomTypesChange={onRoomTypesChange}
          />
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-wrap' }}>
              ⚠️ {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eef0ef', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 11, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>ยกเลิก</button>
          <button onClick={onSubmit as any} disabled={saving} style={{ flex: 2, padding: '12px 0', borderRadius: 11, border: 'none', background: saving ? '#64748b' : '#02402e', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />กำลังบันทึก…</>
              : submitLabel
            }
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  )
}

// ── Published Tab ─────────────────────────────────────────────────────────────
function PublishedTab({ refreshKey }: { refreshKey: number }) {
  const [dbListings, setDbListings] = useState<DbListing[]>([])
  const [loadingDb,  setLoadingDb]  = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [editTarget, setEditTarget] = useState<DbListing | null>(null)
  const [deleting,   setDeleting]   = useState<string | null>(null)

  const loadDb = useCallback(async () => {
    setLoadingDb(true)
    const r = await fetch('/api/dashboard/listings')
    const d = await r.json()
    setDbListings(d.listings ?? [])
    setLoadingDb(false)
  }, [])

  useEffect(() => { loadDb() }, [loadDb, refreshKey])

  async function deleteListing(id: string) {
    if (!confirm('ลบประกาศนี้ออกจากระบบ?')) return
    setDeleting(id)
    await fetch('/api/dashboard/listings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await loadDb()
    setDeleting(null)
  }

  const allTypes = Array.from(new Set([
    ...staticProperties.map(p => p.propertyType),
    ...dbListings.map(p => p.property_type),
  ]))

  const ok = (title: string, type: string, loc: string) => {
    if (typeFilter && type !== typeFilter) return false
    if (search) { const q = search.toLowerCase(); return title.toLowerCase().includes(q) || loc.toLowerCase().includes(q) }
    return true
  }

  const filteredStatic = staticProperties.filter(p => ok(p.title, p.propertyType, p.neighborhood + p.address))
  const filteredDb     = dbListings.filter(p => ok(p.title_th, p.property_type, (p.district ?? '') + (p.address_th ?? '')))

  return (
    <div>
      {editTarget && <EditDrawer listing={editTarget} onClose={() => setEditTarget(null)} onSaved={loadDb} />}

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

      <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px -12px rgba(2,64,46,0.08)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>แสดง {filteredStatic.length + filteredDb.length} จาก {staticProperties.length + dbListings.length} รายการ</span>
          {loadingDb && <span style={{ fontSize: 12, color: '#94a3b8' }}>⟳ กำลังโหลด…</span>}
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
            {filteredStatic.map(p => (
              <tr key={`s-${p.id}`} style={{ borderBottom: '1px solid #f1f5f4' }}>
                <td style={{ padding: '12px 14px', maxWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={p.image} alt="" style={{ width: 38, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => (e.currentTarget.style.display = 'none')} />
                    <span style={{ fontWeight: 600, color: '#02402e', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}><TypeChip type={p.propertyType} /></td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12.5 }}>{p.neighborhood}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#02402e' }}>{p.priceDisplay}</td>
                <td style={{ padding: '12px 14px', color: '#64748b' }}>{p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} ห้อง`}</td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>รายเดือน</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>—</td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#f0f2f1', color: '#64748b', fontWeight: 500 }}>Static</span></td>
                <td style={{ padding: '12px 14px' }}>
                  <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                </td>
              </tr>
            ))}
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
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Dashboard</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', borderRadius: 7, background: '#e8f5f0', color: '#048c73', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>↗</a>
                    <button onClick={() => setEditTarget(p)} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #c7d2d0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteListing(p.id)} disabled={deleting === p.id} style={{ padding: '5px 9px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: deleting === p.id ? 0.5 : 1 }}>
                      {deleting === p.id ? '…' : 'ลบ'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStatic.length + filteredDb.length === 0 && (
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
    { value: '', label: 'ทั้งหมด' }, { value: 'pending', label: 'รออนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' }, { value: 'rejected', label: 'ปฏิเสธ' },
  ]
  const STATUS_CHIP: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
    approved: { bg: '#dcfce7', color: '#15803d', label: 'อนุมัติแล้ว' },
    rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ' },
    active:   { bg: '#e0f2f9', color: '#0284c7', label: 'เผยแพร่อยู่' },
  }
  const PKG_LABEL: Record<string, string> = {
    free_trial: 'ทดลองฟรี', basic: 'Basic', standard: 'Standard', premium: 'Premium',
  }

  return (
    <div>
      <div style={{ background: '#fff6e9', border: '1px solid #fed7aa', borderRadius: 12, padding: '11px 15px', marginBottom: 14, fontSize: 13, color: '#92400e' }}>
        📬 ประกาศที่ส่งมาจากฟอร์ม <strong>/ลงประกาศ</strong> — แพ็กเกจที่ชำระแล้วจะเผยแพร่อัตโนมัติ ฟรีทดลองต้องอนุมัติ
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)} style={{ padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: filter === o.value ? '#02402e' : '#f4f6f5', color: filter === o.value ? '#fff' : '#334155' }}>
            {o.label}
          </button>
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
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
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
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{staticProperties.length} static + ประกาศจาก Dashboard</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '11px 22px', borderRadius: 12, border: 'none', background: '#02402e', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          + เพิ่มประกาศใหม่
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('published')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'published' ? '#02402e' : '#f4f6f5', color: tab === 'published' ? '#fff' : '#64748b' }}>
          🏠 เผยแพร่แล้ว
        </button>
        <button onClick={() => setTab('queue')} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, background: tab === 'queue' ? '#02402e' : '#f4f6f5', color: tab === 'queue' ? '#fff' : '#64748b' }}>
          📬 คำขอจากฟอร์ม
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
