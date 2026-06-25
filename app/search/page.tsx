'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { properties, PRICE_RANGES, type Property } from '@/lib/property-data'

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
    image: '',
    propertyType: DB_TYPE_MAP[l.property_type] ?? 'Condo',
    listingType: 'Rent', amenities: l.amenities || [],
    featured: false, date: l.created_at || '',
  }
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const [activeType, setActiveType] = useState(sp.get('type') || '')
  const [priceRangeIdx, setPriceRangeIdx] = useState(0)
  const [sortBy, setSortBy] = useState('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [dbListings, setDbListings] = useState<Property[]>([])

  // Fetch DB listings and merge with static on mount
  useEffect(() => {
    fetch('/api/listings/public')
      .then(r => r.json())
      .then((d: { listings?: unknown[] }) => {
        setDbListings((d.listings ?? []).map(adaptDbListing))
      })
      .catch(() => {})
  }, [])

  const label = activeType ? (TYPE_LABELS[activeType] || activeType) : 'ที่พักทั้งหมด'

  // Dynamic counts including DB listings
  const typeCounts = useMemo(() => {
    const all = [...properties, ...dbListings]
    const counts: Record<string, number> = { '': all.length }
    all.forEach(p => { counts[p.propertyType] = (counts[p.propertyType] || 0) + 1 })
    return counts
  }, [dbListings])

  const results = useMemo(() => {
    let list = [...properties, ...dbListings]
    if (activeType) list = list.filter(p => p.propertyType === activeType)
    const range = PRICE_RANGES[priceRangeIdx]
    if (range.min > 0 || range.max !== Infinity) {
      list = list.filter(p => p.priceMin >= range.min && p.priceMin <= range.max)
    }
    if (sortBy === 'priceLow') list.sort((a, b) => a.priceMin - b.priceMin)
    else if (sortBy === 'priceHigh') list.sort((a, b) => b.priceMin - a.priceMin)
    else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  }, [activeType, priceRangeIdx, sortBy, dbListings])

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
    router.replace('/search')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: '#f7f9f8', borderBottom: '1px solid #eef0ef', padding: '24px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 6px' }}>
            <Link href="/" style={{ color: '#94a3b8' }}>หน้าแรก</Link> › ค้นหาที่พัก › {label}
          </p>
          <h1 style={{ color: '#02402e', fontSize: 24, fontWeight: 600, margin: 0 }}>{label}ในกรุงเทพฯ</h1>
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
              <p style={{ fontSize: 14.5, color: '#475569', margin: 0 }}>
                พบ <strong className="mono" style={{ color: '#231f20' }}>{results.length}</strong> ประกาศ
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, color: '#64748b' }}>เรียงตาม:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ border: '1px solid #eef0ef', background: '#fff', borderRadius: 11, padding: '8px 13px', fontSize: 13.5, fontWeight: 500, color: '#231f20', outline: 'none', cursor: 'pointer' }}>
                  <option value="recent">ล่าสุด</option>
                  <option value="priceLow">ราคาต่ำ - สูง</option>
                  <option value="priceHigh">ราคาสูง - ต่ำ</option>
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
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
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
        <p style={{ color: '#048c73', fontSize: 12.5, margin: '0 0 4px', fontWeight: 500 }}>📍 {p.neighborhood}</p>
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
