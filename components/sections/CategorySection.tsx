import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import type { PropertyType } from '@/lib/types'

const CATEGORIES = [
  { type: 'apartment' as PropertyType, label: 'อพาร์ทเม้นท์', icon: 'apartment' },
  { type: 'condo'     as PropertyType, label: 'คอนโดมิเนียม',  icon: 'location_city' },
  { type: 'house'     as PropertyType, label: 'บ้าน',           icon: 'cottage' },
  { type: 'coworking' as PropertyType, label: 'โคเวิร์กกิ้ง',  icon: 'groups' },
  { type: 'office'    as PropertyType, label: 'ออฟฟิศ',         icon: 'business_center' },
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
    <section className="sm-home-categories" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }} className="sm-cats">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.type}
            href={`/search?type=${cat.type}`}
            style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}
            className="sm-cat-card"
          >
            <span style={{ width: 58, height: 58, borderRadius: '50%', background: 'linear-gradient(140deg,#06a487,#02402e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 9px 18px -8px rgba(2,64,46,0.55)', flexShrink: 0 }}>
              <span className="msym" style={{ fontSize: 28, color: '#fff' }}>{cat.icon}</span>
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 500, color: '#231f20', textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
            <span className="mono" style={{ fontSize: 10.5, color: '#9aa' }}>{counts[cat.type] ?? 0} แห่ง</span>
          </Link>
        ))}
      </div>
      <style>{`
        .sm-cat-card:hover {
          border-color: #048c73 !important;
          box-shadow: 0 12px 28px -12px rgba(2,64,46,0.16) !important;
          transform: translateY(-3px) !important;
        }
        @media (max-width: 900px) {
          .sm-home-categories { display: none !important; }
          .sm-cats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  )
}
