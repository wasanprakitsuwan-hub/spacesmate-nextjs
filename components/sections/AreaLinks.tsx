import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { AREA_KEYWORDS } from '@/lib/constants'

// Match terms for each keyword slug — Thai + English so we catch both
const MATCH_MAP: Record<string, { type: string; terms: string[] }> = {
  'condo-rent-bts-asok':            { type: 'condo',     terms: ['asok', 'อโศก', 'sukhumvit 21', 'สุขุมวิท 21'] },
  'apartment-rent-sukhumvit':       { type: 'apartment', terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-ekkamai':         { type: 'condo',     terms: ['ekkamai', 'เอกมัย'] },
  'house-rent-lat-phrao':           { type: 'house',     terms: ['lat phrao', 'ลาดพร้าว'] },
  'condo-rent-bts-thonglor':        { type: 'condo',     terms: ['thonglor', 'ทองหล่อ', 'thong lor'] },
  'office-rent-silom':              { type: 'office',    terms: ['silom', 'สีลม'] },
  'condo-rent-bts-on-nut':          { type: 'condo',     terms: ['on nut', 'อ่อนนุช', 'on-nut'] },
  'apartment-rent-ratchada':        { type: 'apartment', terms: ['ratchada', 'รัชดา', 'ratchadaphisek'] },
  'house-rent-rama-9':              { type: 'house',     terms: ['rama 9', 'พระราม 9', 'rama9', 'พระราม9'] },
  'condo-rent-mrt-lat-phrao':       { type: 'condo',     terms: ['lat phrao', 'ลาดพร้าว'] },
  'coworking-rent-sukhumvit':       { type: 'coworking', terms: ['sukhumvit', 'สุขุมวิท'] },
  'condo-rent-bts-saphan-kwai':     { type: 'condo',     terms: ['saphan kwai', 'สะพานควาย'] },
  'condo-rent-bts-ari':             { type: 'condo',     terms: ['ari', 'อารีย์', 'aree'] },
  'apartment-rent-bang-na':         { type: 'apartment', terms: ['bang na', 'บางนา', 'bangna'] },
  'condo-rent-mrt-phahon-yothin':   { type: 'condo',     terms: ['phahon', 'พหลโยธิน', 'phahonyothin'] },
  'office-rent-sathorn':            { type: 'office',    terms: ['sathorn', 'สาทร'] },
}

export default async function AreaLinks() {
  // Fetch all active listing locations in one query
  const sb = createServerClient()
  const { data } = await sb
    .from('properties')
    .select('property_type, district, area, address')
    .eq('listing_status', 'active')

  const listings = data || []

  // Count matching listings per keyword
  const withCounts = AREA_KEYWORDS.map(area => {
    const match = MATCH_MAP[area.slug]
    if (!match) return { ...area, count: 0 }

    const count = listings.filter(p => {
      if (p.property_type !== match.type) return false
      const haystack = [p.district, p.area, p.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return match.terms.some(t => haystack.includes(t.toLowerCase()))
    }).length

    return { ...area, count }
  })

  // Sort highest count first
  const sorted = [...withCounts].sort((a, b) => b.count - a.count)

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
