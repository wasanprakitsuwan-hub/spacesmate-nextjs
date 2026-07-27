'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ADMIN_PACKAGES, computeExpiry } from '@/lib/packages'
import {
  ListingFormFields as SharedListingFormFields,
  prepareSubmitData,
  type FormState as ListingFormState,
  type CondoRentalDetail,
  type RentalCharges,
  type RateType,
} from '@/components/listing/SharedListingForm'
import { slugify } from '@/lib/slug'
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

// Apartment — charges & deposit detail

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

// ── Slug helpers ──────────────────────────────────────────────────────────────
function slugifyText(text: string): string {
  // Thai is preserved — see lib/slug.ts for why.
  return slugify(text, 55)
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

// ── Room type options per property type ───────────────────────────────────────
// ── Shared form styles ────────────────────────────────────────────────────────
const SINP: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 10,
  border: '1px solid #eef0ef', fontSize: 16, outline: 'none',
  boxSizing: 'border-box' as const, background: '#fff',
}
const SLBL: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'block',
}

const BLANK_CONDO_RENTAL: CondoRentalDetail = {
  unit_number: '', floor: '', facing: '', size_sqm: '',
  property_name: '', property_name_id: '', price_12mo: '', price_6mo: '', price_3mo: '', price_1mo: '',
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
  contact_name: '', contact_phone: '', contact_line: '', contact_email: '',
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
// ── Rental Charges Section (Apartment only) ───────────────────────────────────
// ── Deposit section — for condo / house / office / coworking ─────────────────
// Shows only security deposit, advance deposit, and optional key deposit.
// (Apartment uses the full RentalChargesSection which also covers utilities.)
// ── Submit data serializer (shared between Create and Edit) ───────────────────
// ── Form Fields (all 9 sections) ──────────────────────────────────────────────
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
    property_name_id: String((listing as any).property_name_id ?? ''),
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
    contact_email: (listing as any).contact_email ?? '',
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
          // Only recompute the expiry when the package actually changed. This
          // used to run on every save, so editing a listing silently reset its
          // expiry to a full term from today — a listing created on 10 Jul and
          // edited on 26 Jul gained an extra fortnight for free, and a premium
          // listing edited while the dropdown read 'basic' would lose months.
          expires_at: form.package_type === listing.package_type
            ? listing.expires_at
            : computeExpiry(form.package_type),
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
            <SharedListingFormFields
              form={form} onChange={setF} onAmenityToggle={toggleAmenity}
              onImagesChange={onImagesChange}
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
