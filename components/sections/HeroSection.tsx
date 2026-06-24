'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_CHIPS = [
  { key: 'apartment', label: 'อพาร์ทเม้นท์', icon: 'apartment' },
  { key: 'condo',     label: 'คอนโดมิเนียม',  icon: 'location_city' },
  { key: 'house',     label: 'บ้าน',           icon: 'cottage' },
  { key: 'cowork',    label: 'โคเวิร์กกิ้ง',  icon: 'groups' },
  { key: 'office',    label: 'ออฟฟิศ',         icon: 'business_center' },
]

const PRICE_RANGES = [
  { label: 'ทุกราคา', value: '' },
  { label: '≤ 5,000 บาท', value: '0-5000' },
  { label: '5,000–15,000 บาท', value: '5000-15000' },
  { label: '15,000–30,000 บาท', value: '15000-30000' },
  { label: '30,000–60,000 บาท', value: '30000-60000' },
  { label: '60,000 บาท+', value: '60000-' },
]

export default function HeroSection() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [priceRange, setPriceRange] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) params.set('q', keyword)
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      if (min) params.set('price_min', min)
      if (max) params.set('price_max', max)
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section style={{ padding: '64px 24px 44px', background: 'radial-gradient(90% 120% at 50% -10%, #e9f4ef 0%, #ffffff 58%)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>

        {/* Category label */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#048c73', marginBottom: 18 }}>
          Apartments · Condos · Houses · Co-working · Office
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 46, lineHeight: 1.18, fontWeight: 600, margin: '0 0 14px', letterSpacing: '-0.8px', color: '#02402e' }}>
          ค้นหาที่พักที่ใช่ <span style={{ color: '#d97f11' }}>ในราคาที่คุ้มค่า</span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: '#64748b', fontSize: 16, fontWeight: 300, margin: '0 0 32px' }}>
          ทุกประเภททรัพย์สิน ทั่วกรุงเทพฯ — ค้นหาตามทำเล แล้วกรองตามที่คุณต้องการ
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ background: '#fff', border: '1px solid #ededed', borderRadius: 18, padding: 8, display: 'flex', gap: 7, alignItems: 'stretch', boxShadow: '0 16px 40px -16px rgba(2,64,46,0.22)', textAlign: 'left', flexWrap: 'wrap', maxWidth: 760, margin: '0 auto' }}>

          {/* Location */}
          <div style={{ flex: '1.6', minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 16px', borderRadius: 13 }}>
            <span style={{ fontSize: 10, color: '#aab', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>พื้นที่ / BTS / สถานศึกษา</span>
            <input
              type="text"
              placeholder="เช่น สุขุมวิท, BTS อโศก, ม.เกษตร"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, color: '#231f20', outline: 'none', padding: '3px 0', width: '100%' }}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: '#eee', margin: '8px 0' }} />

          {/* Price */}
          <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 16px', borderRadius: 13 }}>
            <span style={{ fontSize: 10, color: '#aab', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ช่วงราคา</span>
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: '#231f20', outline: 'none', padding: '3px 0', cursor: 'pointer' }}
            >
              {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Search button */}
          <button
            type="submit"
            style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 14, padding: '0 30px', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}
          >
            <span className="msym" style={{ fontSize: 20, marginRight: 2 }}>search</span>
            ค้นหา
          </button>
        </form>

        {/* Type chips */}
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {TYPE_CHIPS.map(t => (
            <button
              key={t.key}
              onClick={() => router.push(`/search?type=${t.key}`)}
              style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 20, cursor: 'pointer', transition: 'all .2s', border: '1px solid #ececec', color: '#475569', background: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#048c73'; el.style.color = '#048c73' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#ececec'; el.style.color = '#475569' }}
            >
              <span className="msym" style={{ fontSize: 17, color: '#048c73' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
