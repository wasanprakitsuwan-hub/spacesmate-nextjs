'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const TYPE_FILTERS = [
  { key: '', label: 'ทุกประเภท' },
  { key: 'apartment', label: 'อพาร์ทเม้นท์' },
  { key: 'condo', label: 'คอนโดมิเนียม' },
  { key: 'house', label: 'บ้าน' },
  { key: 'coworking', label: 'โคเวิร์กกิ้ง' },
  { key: 'office', label: 'ออฟฟิศ' },
]

const AMENITIES = ['Wi-Fi', 'แอร์', 'ที่จอดรถ', 'เฟอร์นิเจอร์ครบ', 'ซักรีด', 'รักษาความปลอดภัย']

const GRADS: Record<string, string> = {
  apartment: 'linear-gradient(135deg,#02402e,#036b56)',
  condo:     'linear-gradient(135deg,#036b56,#048c73)',
  house:     'linear-gradient(135deg,#03533c,#06a487)',
  coworking: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)',
  office:    'linear-gradient(135deg,#4a1d1d,#8b3a3a)',
  default:   'linear-gradient(135deg,#02402e,#048c73)',
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'อพาร์ทเม้นท์', condo: 'คอนโด', house: 'บ้าน',
  coworking: 'โคเวิร์กกิ้ง', office: 'ออฟฟิศ',
}

function fmt(min: number, max: number) {
  if (min && max) return `฿${min.toLocaleString()}–${max.toLocaleString()}`
  if (min) return `฿${min.toLocaleString()}+`
  if (max) return `ถึง ฿${max.toLocaleString()}`
  return 'TBD'
}

interface Prop {
  id: string; title: string; district: string; area: string
  property_type: string; price_min: number; price_max: number
  bedrooms: number; bathrooms: number; size_sqm: number; is_featured: boolean
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const [activeType, setActiveType] = useState(sp.get('type') || '')
  const [priceMax, setPriceMax] = useState(120000)
  const [sortBy, setSortBy] = useState('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [results, setResults] = useState<Prop[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const label = activeType ? (TYPE_LABELS[activeType] || activeType) : 'ที่พักทั้งหมด'

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createBrowserClient()
      let q = sb.from('properties')
        .select('id,title,district,area,property_type,price_min,price_max,bedrooms,bathrooms,size_sqm,is_featured')
        .eq('listing_status', 'active').lte('price_min', priceMax)
      if (activeType) q = q.eq('property_type', activeType)
      if (sortBy === 'priceLow') q = q.order('price_min', { ascending: true })
      else if (sortBy === 'sizeBig') q = q.order('size_sqm', { ascending: false })
      else q = q.order('created_at', { ascending: false })
      const { data } = await q.limit(24)
      setResults(data || [])
      const { data: all } = await sb.from('properties').select('property_type').eq('listing_status', 'active')
      const c: Record<string, number> = { '': (all || []).length }
      ;(all || []).forEach((r: { property_type: string }) => { c[r.property_type] = (c[r.property_type] || 0) + 1 })
      setCounts(c)
    } catch { setResults([]) }
    setLoading(false)
  }, [activeType, priceMax, sortBy])

  useEffect(() => { fetch_() }, [fetch_])

  function selectType(t: string) {
    setActiveType(t)
    const p = new URLSearchParams(sp.toString())
    if (t) { p.set('type', t) } else { p.delete('type') }
    router.replace(`/search?${p.toString()}`)
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

            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ประเภททรัพย์สิน</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {TYPE_FILTERS.map(t => {
                  const on = activeType === t.key
                  return (
                    <button key={t.key} onClick={() => selectType(t.key)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${on ? '#048c73' : '#eef0ef'}`, background: on ? '#eaf6f1' : '#fff', color: on ? '#02402e' : '#475569', fontWeight: on ? 600 : 400 }}>
                      <span>{t.label}</span>
                      <span className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{counts[t.key] ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>ราคาสูงสุด</p>
                <span className="mono" style={{ fontSize: 12.5, color: '#048c73', fontWeight: 600 }}>{priceMax.toLocaleString()} บาท</span>
              </div>
              <input type="range" min="5000" max="120000" step="1000" value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#048c73', cursor: 'pointer' }} />
              <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>
                <span>5,000 บาท</span><span>120,000 บาท</span>
              </div>
            </div>

            <div style={{ height: 1, background: '#eef0ef', margin: '0 0 20px' }} />

            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', margin: '0 0 11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>สิ่งอำนวยความสะดวก</p>
              {AMENITIES.map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 14, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#048c73', cursor: 'pointer' }} /> {a}
                </label>
              ))}
            </div>

            <button onClick={() => { setActiveType(''); setPriceMax(120000); setSortBy('recent') }}
              style={{ width: '100%', marginTop: 14, background: '#f4f6f5', color: '#475569', fontWeight: 500, fontSize: 13.5, border: 'none', borderRadius: 11, padding: '11px 0', cursor: 'pointer', transition: 'all .2s' }}
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
                  <option value="sizeBig">พื้นที่มาก - น้อย</option>
                </select>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-grid2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', opacity: 0.55 }}>
                    <div style={{ height: 168, background: 'linear-gradient(135deg,#e8f0ed,#d5e5de)' }} />
                    <div style={{ padding: 17 }}>
                      <div style={{ height: 16, background: '#f0f4f2', borderRadius: 8, marginBottom: 8, width: '70%' }} />
                      <div style={{ height: 12, background: '#f0f4f2', borderRadius: 8, width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="sm-grid2">
                {results.map(p => (
                  <Link key={p.id} href={`/property/${p.id}`} className="sm-prop-card"
                    style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 6px 20px -10px rgba(2,64,46,0.10)', display: 'block', textDecoration: 'none' }}>
                    <div style={{ height: 168, background: GRADS[p.property_type] || GRADS.default, position: 'relative' }}>
                      {p.is_featured && <span style={{ position: 'absolute', top: 12, left: 12, background: '#d97f11', color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 8 }}>แนะนำ</span>}
                      <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 7 }}>{TYPE_LABELS[p.property_type] || p.property_type}</span>
                    </div>
                    <div style={{ padding: 17 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.35, color: '#231f20' }}>{p.title}</h3>
                      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px', fontWeight: 300 }}>📍 {p.district}{p.area ? `, ${p.area}` : ''}</p>
                      <div className="mono" style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid #f3f5f4', borderBottom: '1px solid #f3f5f4', marginBottom: 12, fontSize: 11, color: '#7a8a85' }}>
                        {p.bedrooms != null && <span>{p.bedrooms} ห้องนอน</span>}
                        {p.bathrooms != null && <span>{p.bathrooms} ห้องน้ำ</span>}
                        {p.size_sqm != null && <span>{p.size_sqm} ตร.ม.</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 17, fontWeight: 600, color: '#d97f11' }}>{fmt(p.price_min, p.price_max)}</span>
                        <span style={{ color: '#048c73', fontSize: 13, fontWeight: 600 }}>ดูรายละเอียด</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && (
              <div style={{ background: '#fff', border: '1px dashed #d5ddd9', borderRadius: 18, padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>ไม่พบประกาศที่ตรงเงื่อนไข</p>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px', fontWeight: 300 }}>ลองปรับช่วงราคาหรือประเภททรัพย์สิน</p>
                <button onClick={() => { setActiveType(''); setPriceMax(120000) }}
                  style={{ background: '#048c73', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 22, padding: '11px 24px', cursor: 'pointer' }}>ล้างตัวกรอง</button>
              </div>
            )}

            {/* Pagination */}
            {!loading && results.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36 }}>
                {[1, 2, 3].map(n => (
                  <a key={n} className="mono" style={{ width: 40, height: 40, borderRadius: 11, background: n === 1 ? '#02402e' : '#fff', color: n === 1 ? '#fff' : '#334155', border: n === 1 ? 'none' : '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{n}</a>
                ))}
                <span style={{ color: '#94a3b8', padding: '0 4px' }}>…</span>
                <a className="mono" style={{ width: 40, height: 40, borderRadius: 11, background: '#fff', border: '1px solid #eef0ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#334155', cursor: 'pointer' }}>›</a>
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
      `}</style>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#94a3b8' }}>กำลังโหลด...</div>}>
      <SearchContent />
    </Suspense>
  )
}
