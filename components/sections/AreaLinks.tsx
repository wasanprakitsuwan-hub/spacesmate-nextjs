'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AREA_KEYWORDS } from '@/lib/constants'

// Search terms to match each area slug against listing fields (district, address_th, title_th)
const MATCH_MAP: Record<string, { types: string[]; terms: string[] }> = {
  'condo-rent-bts-asok':             { types: ['condo'],     terms: ['asok', 'อโศก', 'sukhumvit 21', 'สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':        { types: ['apartment'], terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-ekkamai':          { types: ['condo'],     terms: ['ekkamai', 'เอกมัย'] },
  'house-rent-lat-phrao':            { types: ['house','apartment'], terms: ['lat phrao', 'ลาดพร้าว'] },
  'condo-rent-bts-thonglor':         { types: ['condo'],     terms: ['thonglor', 'ทองหล่อ', 'thong lor'] },
  'office-rent-silom':               { types: ['office'],    terms: ['silom', 'สีลม'] },
  'condo-rent-bts-on-nut':           { types: ['condo'],     terms: ['on nut', 'อ่อนนุช', 'on-nut'] },
  'apartment-rent-ratchada':         { types: ['apartment'], terms: ['ratchada', 'รัชดา', 'ratchadaphisek', 'รัชดาภิเษก'] },
  'house-rent-rama-9':               { types: ['house','apartment'], terms: ['rama 9', 'พระราม 9', 'rama9'] },
  'condo-rent-mrt-lat-phrao':        { types: ['condo'],     terms: ['lat phrao', 'ลาดพร้าว'] },
  'coworking-rent-sukhumvit':        { types: ['coworking'], terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':      { types: ['condo'],     terms: ['saphan kwai', 'สะพานควาย'] },
  'condo-rent-bts-ari':              { types: ['condo'],     terms: ['ari', 'อารีย์', 'aree'] },
  'apartment-rent-bang-na':          { types: ['apartment'], terms: ['bang na', 'บางนา', 'bangna'] },
  'condo-rent-mrt-phahon-yothin':    { types: ['condo'],     terms: ['phahon', 'พหลโยธิน', 'phahonyothin'] },
  'office-rent-sathorn':             { types: ['office'],    terms: ['sathorn', 'สาทร'] },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countForArea(listings: any[], slug: string): number {
  const match = MATCH_MAP[slug]
  if (!match) return 0
  return listings.filter(l => {
    if (!match.types.includes(l.property_type)) return false
    const haystack = [l.district, l.sub_district, l.address_th, l.title_th]
      .filter(Boolean).join(' ').toLowerCase()
    return match.terms.some(t => haystack.includes(t.toLowerCase()))
  }).length
}

export default function AreaLinks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/listings/public')
      .then(r => r.json())
      .then(d => setListings(d.listings ?? []))
      .catch(() => {})
  }, [])

  const areas = AREA_KEYWORDS.map(area => ({
    ...area,
    count: countForArea(listings, area.slug),
  }))

  return (
    <section className="py-12 bg-spacemate-bgLight border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">ค้นหาตามทำเลยอดนิยม</h2>
        <p className="text-gray-500 text-sm mb-8">สถานี BTS · MRT · ย่านยอดนิยมในกรุงเทพ</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/area/${area.slug}`}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {area.label_th}
              </span>
              <span className="text-sm font-semibold text-spacemate-brandTeal ml-3 flex-shrink-0 tabular-nums">
                {area.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
