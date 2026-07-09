'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRICE_RANGES, type Property } from '@/lib/property-data'

// ── Haversine distance (km) between two lat/lng points ───────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const RADIUS_OPTIONS = [
  { km: 1,   label: 'ภายใน 1 กม.' },
  { km: 2,   label: 'ภายใน 2 กม.' },
  { km: 5,   label: 'ภายใน 5 กม.' },
  { km: 10,  label: 'ภายใน 10 กม.' },
]

const TYPE_FILTERS = [
  { key: '', label: 'ทุกประเภท' },
  { key: 'Apartment', label: 'อพาร์ทเม้นท์' },
  { key: 'Condo', label: 'คอนโดมิเนียม' },
  { key: 'Office', label: 'ออฟฟิศ' },
]

const GRADS: Record<string, string> = {
  Apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  Condo:     'linear-gradient(135deg,#036b56,#048c73)',
  Office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

const TYPE_LABELS: Record<string, string> = {
  Apartment: 'อพาร์ทเม้นท์', Condo: 'คอนโด', Office: 'ออฟฟิศ',
}

// DB adapter helpers
const TERM_SUFFIX: Record<string, string> = {
  daily: '/วัน', '1_month': '/เดือน', '3_months': '/เดือน',
  '6_months': '/เดือน', '12_months': '/เดือน',
}
const DB_TYPE_MAP: Record<string, Property['propertyType']> = {
  condo: 'Condo', apartment: 'Apartment', house: 'Apartment',
  office: 'Office', coworking: 'Co-Working',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptDbListing(l: any): Property {
  const suffix = TERM_SUFFIX[l.rental_term] ?? '/เดือน'
  return {
    id: 0, slug: l.slug,
    title: l.title_th || l.title_en || 'ไม่ระบุชื่อ',
    excerpt: l.description_th || '',
    priceMin: l.price_from || 0,
    priceDisplay: l.price_from
      ? `฿${Number(l.price_from).toLocaleString('en-US')}${suffix}`
      : 'สอบถามราคา',
    bedrooms: l.bedrooms || 0, bathrooms: l.bathrooms || 0,
    size: l.area_sqm ? String(l.area_sqm) : '',
    address: l.address_th || '',
    neighborhood: l.district || l.province || 'กรุงเทพมหานคร',
    lat: l.lat ? String(l.lat) : '', lng: l.lng ? String(l.lng) : '',
    image: (() => { const imgs = Array.isArray(l.images) ? l.images : []; return imgs.find((i: string) => i.startsWith('https://')) ?? imgs.find((i: string) => i.startsWith('/')) ?? ''; })(),
    images: Array.isArray(l.images) ? l.images.filter((img: string) => img.startsWith('https://') || img.startsWith('/')) : [],
    propertyType: DB_TYPE_MAP[l.property_type] ?? 'Condo',
    listingType: 'Rent', amenities: l.amenities || [],
    featured: false, date: l.created_at || '',
  }
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const [activeType, setActiveType] = useState(sp.get('type') || '')
  const [keyword, setKeyword] = useState(sp.get('q') || '')
  const [priceRangeIdx, setPriceRangeIdx] = useState(0)
  const [sortBy, setSortBy] = useState('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [dbListings, setDbListings] = useState<Property[]>([])

  // ── Geolocation state ─────────────────────────────────────────────────────
  const [userLatLng, setUserLatLng]     = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm]         = useState<number | null>(null)
  const [geoLoading, setGeoLoading]     = useState(false)
  const [geoError, setGeoError]         = useState<string | null>(null)

  // Fetch DB listings and merge with static on mount
  useEffect(() => {
    fetch('/api/listings/public')
      .then(r => r.json())
      .then((d: { listings?: unknown[] }) => {
        setDbListings((d.listings ?? []).map(adaptDbListing))
      })
      .catch(() => {})
  }, [])

  // ── Geolocation handler ───────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('เบราว์เซอร์ของคุณไม่รองรับ Geolocation')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        if (!radiusKm) setRadiusKm(2)  // default 2 km
        setGeoLoading(false)
      },
      () => {
        setGeoError('ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาต Location')
        setGeoLoading(false)
      },
      { timeout: 8000 },
    )
  }, [radiusKm])

  function clearGeo() {
    setUserLatLng(null)
    setRadiusKm(null)
    setGeoError(null)
  }

  const label = activeType ? (TYPE_LABELS[activeType] || activeType) : 'ที่พักทั้งหมด'

  // Dynamic counts including DB listings
  const typeCounts = useMemo(() => {
    const all = [...dbListings]
    const counts: Record<string, number> = { '': all.length }
    all.forEach(p => { counts[p.propertyType] = (counts[p.propertyType] || 0) + 1 })
    return counts
  }, [dbListings])

  const results = useMemo(() => {
    let list = [...dbListings]
    if (activeType) list = list.filter(p => p.propertyType === activeType)
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(kw) ||
        p.neighborhood.toLowerCase().includes(kw) ||
        p.address.toLowerCase().includes(kw) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(kw))
      )
    }
    const range = PRICE_RANGES[priceRangeIdx]
    if (range.min > 0 || range.max !== Infinity) {
      list = list.filter(p => p.priceMin >= range.min && p.priceMin <= range.max)
    }
    // ── Radius filter ───────────────────────────────────────────────────────
    if (userLatLng && radiusKm) {
      list = list.filter(p => {
        const pLat = parseFloat(p.lat || '')
        const pLng = parseFloat(p.lng || '')
        if (isNaN(pLat) || isNaN(pLng)) return false
        return haversineKm(userLatLng.lat, userLatLng.lng, pLat, pLng) <= radiusKm
      })
    }
    if (sortBy === 'priceLow') list.sort((a, b) => a.priceMin - b.priceMin)
    else if (sortBy === 'priceHigh') list.sort((a, b) => b.priceMin - a.priceMin)
    else if (sortBy === 'nearest' && userLatLng) {
      list.sort((a, b) => {
        const dA = haversineKm(userLatLng.lat, userLatLng.lng, parseFloat(a.lat || '0'), parseFloat(a.lng || '0'))
        const dB = haversineKm(userLatLng.lat, userLatLng.lng, parseFloat(b.lat || '0'), parseFloat(b.lng || '0'))
        return dA - dB
      })
    } else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  }, [activeType, keyword, priceRangeIdx, sortBy, dbListings, userLatLng, radiusKm])

  function selectType(t: string) {
    setActiveType(t)
    const p = new URLSearchParams(sp.toString())
    if (t) { p.set('type', t) } else { p.delete('type') }
    router.replace(`/search?${p.toString()}`)
  }

  function resetFilters() {
    setActiveType('')
    setPriceRangeIdx(0)
    setSortBy('recent')
    clearGeo()
    router.replace('/search')
  }

  return (
    <div>
      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '32px 24px 36px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 8px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>หน้าแรก</Link> › ค้นหาที่พัก
          </p>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>{label}ในกรุงเทพฯ</h1>
          {/* Keyword search bar */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#94a3b8', pointerEvents: 'none' }} className="msym">search</span>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="ค้นหาย่าน BTS สถานี หรือชื่อที่พัก..."
              style={{ width: '100%', paddingLeft: 48, paddingRight: keyword ? 44 : 16, paddingTop: 14, paddingBottom: 14, fontSize: 15, borderRadius: 28, border: 'none', outline: 'none', background: '#fff', color: '#231f20', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}
            />
            {keyword && (
              <button onClick={() => setKeyword('')}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center' }}>
                <span className="msym">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* Mobile toggle */}
        <button className="sm-filter-toggle" onClick={() => setFilterOpen(!filterOpen)}
          style={{ alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, padding: '13px 16px', fontSize: 15, fontWeight: 600, color: '#02402e', cursor: 'pointer', width: '100%', marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="msym" style={{ fontSize: 20, color: '#048c73' }}>tune</span>ตัวกรอง
          </span>
          <span className="msym" style={{ fontSize: 22, color: '#94a3b8' }}>{filterOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '278px 1fr', gap: 28 }} className="sm-searchlayout">

          {/* Sidebar */}
          <aside className={`sm-filter-aside${filterOpen ? ' filter-open' : ''}`}
            style={{ alignSelf: 'start', position: 'sticky', top: 86, background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, boxShadow: '0 6px 20px -12px rgba(2,64,46,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 18px' }}>ตัวกรอง</h3>

            {/* Type filter */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ประเภททรัพย์สิน</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {TYPE_FILTERS.map(t => {
                  const on = activeType === t.key
                  return (
                    <button key={t.key} onClick={() => selectType(t.key)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                      <span>{t.label}</span>
                      <span className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{typeCounts[t.key] ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            {/* Price range */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ช่วงราคา</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRICE_RANGES.map((r, i) => {
                  const on = priceRangeIdx === i
                  return (
                    <button key={i} onClick={() => setPriceRangeIdx(i)}
                      style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                      {r.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            {/* Geolocation filter */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ตำแหน่งของฉัน</p>

              {!userLatLng ? (
                <button
                  onClick={requestLocation}
                  disabled={geoLoading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: geoLoading ? 'wait' : 'pointer', border: '1.5px solid #048c73', background: '#eaf6f1', color: '#02402e', transition: 'all .2s' }}
                >
                  <span className="msym" style={{ fontSize: 18, fontVariationSettings: geoLoading ? "'wght' 300, 'FILL' 0" : "'wght' 400, 'FILL' 1", color: '#048c73', animation: geoLoading ? 'spin 1s linear infinite' : 'none' }}>
                    {geoLoading ? 'autorenew' : 'near_me'}
                  </span>
                  {geoLoading ? 'กำลังระบุตำแหน่ง...' : 'ค้นหาใกล้ฉัน'}
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#eaf6f1', borderRadius: 9, marginBottom: 8, fontSize: 13, color: '#02402e', fontWeight: 600 }}>
                    <span className="msym" style={{ fontSize: 16, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>location_on</span>
                    ตำแหน่งของคุณ
                    <button onClick={clearGeo} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <span className="msym" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {RADIUS_OPTIONS.map(opt => {
                      const on = radiusKm === opt.km
                      return (
                        <button key={opt.km} onClick={() => setRadiusKm(opt.km)}
                          style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 9, fontSize: 13.5, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {geoError && (
                <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', lineHeight: 1.5 }}>{geoError}</p>
              )}
            </div>

            <button onClick={resetFilters}
              style={{ width: '100%', marginTop: 6, background: '#f4f6f5', color: '#475569', fontWeight: 500, fontSize: 13.5, border: 'none', borderRadius: 11, padding: '11px 0', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e9edeb'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f4f6f5'}>
              ล้างตัวกรอง
            </button>
          </aside>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 14.5, color: '#475569', margin: 0 }}>
                  พบ <strong className="mono" style={{ color: '#231f20' }}>{results.length}</strong> ประกาศ
                </p>
                {userLatLng && radiusKm && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eaf6f1', border: '1px solid #a7f3d0', borderRadius: 20, padding: '4px 10px', fontSize: 12.5, color: '#02402e', fontWeight: 600 }}>
                    <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 1", color: '#048c73' }}>near_me</span>
                    ภายใน {radiusKm} กม.
                    <button onClick={clearGeo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                      <span className="msym" style={{ fontSize: 13 }}>close</span>
                    </button>
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, color: '#64748b' }}>เรียงตาม:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ border: '1px solid #eef0ef', background: '#fff', borderRadius: 11, padding: '8px 13px', fontSize: 13.5, fontWeight: 500, color: '#231f20', outline: 'none', cursor: 'pointer' }}>
                  <option value="recent">ล่าสุด</option>
                  <option value="priceLow">ราคาต่ำ - สูง</option>
                  <option value="priceHigh">ราคาสูง - ต่ำ</option>
                  {userLatLng && <option value="nearest">ใกล้ที่สุด</option>}
                </select>
              </div>
            </div>

            {/* Results grid */}
            {results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-grid2">
                {results.map(p => (
                  <PropertyCard key={p.slug} property={p} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {results.length === 0 && (
              <div style={{ background: '#fff', border: '1px dashed #d5ddd9', borderRadius: 18, padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}><span className="msym" style={{ fontSize: 36, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>search</span></div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>ไม่พบประกาศที่ตรงเงื่อนไข</p>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px', fontWeight: 300 }}>ลองปรับช่วงราคาหรือประเภททรัพย์สิน</p>
                <button onClick={resetFilters}
                  style={{ background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 22, padding: '11px 24px', cursor: 'pointer' }}>ล้างตัวกรอง</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sm-filter-toggle { display: none !important; }
        @media (max-width: 900px) {
          .sm-searchlayout { grid-template-columns: 1fr !important; }
          .sm-filter-toggle { display: flex !important; }
          .sm-filter-aside { display: none !important; position: static !important; }
          .sm-filter-aside.filter-open { display: block !important; margin-bottom: 20px; }
          .sm-grid2 { grid-template-columns: 1fr !important; }
        }
        .sm-prop-card:hover {
          box-shadow: 0 16px 34px -12px rgba(2,64,46,0.18) !important;
          transform: translateY(-4px) !important;
        }
        .sm-prop-card:hover .sm-prop-img { transform: scale(1.05); }
      `}</style>
    </div>
  )
}

function PropertyCard({ property: p }: { property: Property }) {
  const bedroomLabel = p.bedrooms === 0 ? 'สตูดิโอ' : `${p.bedrooms} ห้องนอน`
  const grad = GRADS[p.propertyType] || GRADS.default

  return (
    <Link href={`/property/${p.slug}`} className="sm-prop-card"
      style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}>
      <div style={{ height: 168, background: grad, position: 'relative', overflow: 'hidden' }}>
        {p.image && (
          <img src={p.image} alt={p.title} className="sm-prop-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} />
        )}
        {p.featured && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: '#d97f11', color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 8 }}>แนะนำ</span>
        )}
        {p.listingType === 'Daily' && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(217,127,17,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7 }}>รายวัน</span>
        )}
        <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 7 }}>
          {TYPE_LABELS[p.propertyType] || p.propertyType}
        </span>
      </div>
      <div style={{ padding: 17 }}>
        <p style={{ color: '#048c73', fontSize: 12.5, margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><span className="msym" style={{ fontSize: 13, fontVariationSettings: "'wght' 400, 'FILL' 1" }}>location_on</span>{p.neighborhood}</p>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.35, color: '#231f20' }}>{p.title}</h3>
        <div className="mono" style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 12, fontSize: 11, color: '#7a8a85' }}>
          <span>{bedroomLabel}</span>
          {p.bathrooms > 0 && <span>{p.bathrooms} ห้องน้ำ</span>}
          {p.size && <span>{p.size} ตร.ม.</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 17, fontWeight: 600, color: '#d97f11' }}>{p.priceDisplay}</span>
          <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>ดูรายละเอียด</span>
        </div>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#94a3b8' }}>กำลังโหลด...</div>}>
      <SearchContent />
    </Suspense>
  )
}
