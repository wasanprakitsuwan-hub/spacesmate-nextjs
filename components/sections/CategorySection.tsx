import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import type { PropertyType } from '@/lib/types'

const CATEGORIES: { type: PropertyType; th: string; en: string; icon: React.ReactNode }[] = [
  {
    type: 'apartment',
    th: 'อพาร์ทเม้นท์',
    en: 'Apartments',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    type: 'condo',
    th: 'คอนโดมิเนียม',
    en: 'Condos',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    type: 'house',
    th: 'บ้าน',
    en: 'Houses',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    type: 'coworking',
    th: 'โคเวิร์กกิ้ง',
    en: 'Co-working',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    type: 'office',
    th: 'ออฟฟิศ',
    en: 'Office',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

async function getCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('properties')
      .select('property_type')
      .eq('listing_status', 'active')
    const counts: Record<string, number> = {}
    ;(data || []).forEach((row) => {
      counts[row.property_type] = (counts[row.property_type] || 0) + 1
    })
    return counts
  } catch {
    return {}
  }
}

export default async function CategorySection() {
  const counts = await getCounts()

  return (
    <section className="py-10 bg-spacemate-bgLight border-b border-spacemate-borderLight">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/search?type=${cat.type}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-spacemate-brandDark group-hover:bg-spacemate-brandTeal flex items-center justify-center text-white transition-colors duration-200">
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-spacemate-textCharcoal group-hover:text-spacemate-brandDark text-center leading-tight">
                {cat.th}
              </span>
              <span className="text-xs text-gray-400">
                {counts[cat.type] ?? 0} แห่ง
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
