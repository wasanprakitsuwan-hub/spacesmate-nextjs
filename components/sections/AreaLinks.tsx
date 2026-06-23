import Link from 'next/link'
import { AREA_KEYWORDS } from '@/lib/constants'

// Mock counts — in production these come from Supabase
const MOCK_COUNTS: Record<string, number> = {
  'condo-rent-bts-asok':          131,
  'apartment-rent-sukhumvit':     1022,
  'condo-rent-bts-ekkamai':       101,
  'house-rent-lat-phrao':         165,
  'condo-rent-bts-thonglor':      180,
  'office-rent-silom':            50,
  'condo-rent-bts-on-nut':        237,
  'apartment-rent-ratchada':      1137,
  'house-rent-rama-9':            165,
  'condo-rent-mrt-lat-phrao':     216,
  'coworking-rent-sukhumvit':     97,
  'condo-rent-bts-saphan-kwai':   142,
  'condo-rent-bts-ari':           143,
  'apartment-rent-bang-na':       210,
  'condo-rent-mrt-phahon-yothin': 189,
  'office-rent-sathorn':          62,
}

export default function AreaLinks() {
  return (
    <section className="py-12 bg-spacemate-bgLight border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">ค้นหาตามทำเลยอดนิยม</h2>
        <p className="text-gray-500 text-sm mb-8">สถานี BTS · MRT · ย่านยอดนิยมในกรุงเทพ</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AREA_KEYWORDS.map((area) => (
            <Link
              key={area.slug}
              href={`/search/${area.slug}`}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {area.label_th}
              </span>
              <span className="text-sm font-semibold text-spacemate-brandTeal ml-3 flex-shrink-0">
                {(MOCK_COUNTS[area.slug] ?? 0).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
