'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_CHIPS = [
  {
    key: 'apartment',
    th: 'อพาร์ทเม้นท์',
    svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  },
  {
    key: 'condo',
    th: 'คอนโดมิเนียม',
    svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />,
  },
  {
    key: 'house',
    th: 'บ้าน',
    svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    key: 'coworking',
    th: 'โคเวิร์กกิ้ง',
    svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
  {
    key: 'office',
    th: 'ออฟฟิศ',
    svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  },
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
    <section style={{ background: 'radial-gradient(90% 120% at 50% -10%, #e9f4ef 0%, #ffffff 58%)' }} className="pt-16 pb-11 md:pt-20 md:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Category label */}
        <p className="text-center text-xs font-semibold tracking-widest text-spacemate-brandTeal mb-4 uppercase">
          Apartments · Condos · Houses · Co-working · Office
        </p>

        {/* Headline */}
        <h1 className="text-center text-4xl md:text-6xl font-bold leading-tight mb-4">
          <span className="text-spacemate-brandDark">ค้นหาที่พักที่ใช่ </span>
          <span className="text-spacemate-brandGold">ในราคาที่คุ้มค่า</span>
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-sm md:text-base mb-10">
          ทุกประเภททรัพย์สิน ทั่วกรุงเทพฯ — ค้นหาตามทำเล แล้วกรองตามที่คุณต้องการ
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-spacemate-borderLight shadow-premium p-3 md:p-4 max-w-3xl mx-auto flex flex-col md:flex-row gap-3"
        >
          {/* Location */}
          <div className="flex-[2] min-w-0">
            <p className="text-xs text-gray-400 mb-1 px-1">พื้นที่ / BTS / สถานศึกษา</p>
            <input
              type="text"
              placeholder="เช่น สุขุมวิท, BTS อโศก, ม.เกษตร"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-sm text-spacemate-textCharcoal placeholder-gray-300 outline-none bg-transparent"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-spacemate-borderLight self-stretch" />

          {/* Price Range */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1 px-1">ช่วงราคา</p>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full text-sm text-spacemate-textCharcoal outline-none bg-transparent cursor-pointer"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-spacemate-brandGold hover:brightness-105 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            ค้นหา
          </button>
        </form>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {CATEGORY_CHIPS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => router.push(`/search?type=${cat.key}`)}
              className="flex items-center gap-1.5 text-sm text-spacemate-textCharcoal border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:text-spacemate-brandTeal px-4 py-2 rounded-full transition-all"
            >
              <svg className="w-4 h-4 text-spacemate-brandTeal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {cat.svgPath}
              </svg>
              <span>{cat.th}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
