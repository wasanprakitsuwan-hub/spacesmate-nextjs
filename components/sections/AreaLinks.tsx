import Link from 'next/link'
import { properties } from '@/lib/property-data'
import { AREA_KEYWORDS } from '@/lib/constants'

// Match terms for each keyword slug — Thai + English
const MATCH_MAP: Record<string, { type: string; terms: string[] }> = {
  'condo-rent-bts-asok':            { type: 'Condo',     terms: ['asok', 'อโศก', 'sukhumvit 21', 'สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':       { type: 'Apartment', terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-ekkamai':         { type: 'Condo',     terms: ['ekkamai', 'เอกมัย'] },
  'house-rent-lat-phrao':           { type: 'Apartment', terms: ['lat phrao', 'ลาดพร้าว'] },
  'condo-rent-bts-thonglor':        { type: 'Condo',     terms: ['thonglor', 'ทองหล่อ', 'thong lor'] },
  'office-rent-silom':              { type: 'Office',    terms: ['silom', 'สีลม'] },
  'condo-rent-bts-on-nut':          { type: 'Condo',     terms: ['on nut', 'อ่อนนุช', 'on-nut'] },
  'apartment-rent-ratchada':        { type: 'Apartment', terms: ['ratchada', 'รัชดา', 'ratchadaphisek'] },
  'house-rent-rama-9':              { type: 'Apartment', terms: ['rama 9', 'พระราม 9', 'rama9'] },
  'condo-rent-mrt-lat-phrao':       { type: 'Condo',     terms: ['lat phrao', 'ลาดพร้าว'] },
  'coworking-rent-sukhumvit':       { type: 'Condo',     terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':     { type: 'Condo',     terms: ['saphan kwai', 'สะพานควาย'] },
  'condo-rent-bts-ari':             { type: 'Condo',     terms: ['ari', 'อารีย์', 'aree'] },
  'apartment-rent-bang-na':         { type: 'Apartment', terms: ['bang na', 'บางนา', 'bangna'] },
  'condo-rent-mrt-phahon-yothin':   { type: 'Condo',     terms: ['phahon', 'พหลโยธิน', 'phahonyothin'] },
  'office-rent-sathorn':            { type: 'Office',    terms: ['sathorn', 'สาทร'] },
}

// Compute counts from static property data
const withCounts = AREA_KEYWORDS.map(area => {
  const match = MATCH_MAP[area.slug]
  if (!match) return { ...area, count: 0 }

  const count = properties.filter(p => {
    if (p.propertyType !== match.type) return false
    const haystack = [p.neighborhood, p.address]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return match.terms.some(t => haystack.includes(t.toLowerCase()))
  }).length

  return { ...area, count }
})

const sorted = [...withCounts].sort((a, b) => b.count - a.count)

export default function AreaLinks() {
  return (
    <section className="py-12 bg-spacemate-bgLight border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">ค้นหาตามทำเลยอดนิยม</h2>
        <p className="text-gray-500 text-sm mb-8">สถานี BTS · MRT · ย่านยอดนิยมในกรุงเทพ</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sorted.map((area) => (
            <Link
              key={area.slug}
              href={`/search?type=${area.property_type}&area=${encodeURIComponent(area.label_en)}`}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {area.label_th}
              </span>
              <span className="text-sm font-semibold text-spacemate-brandTeal ml-3 flex-shrink-0 tabular-nums">
                {area.count.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
