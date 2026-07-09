import Link from 'next/link'
import { AREA_KEYWORDS } from '@/lib/constants'


// Counts will come from DB in the future; show 0 for now
const sorted = [...AREA_KEYWORDS].map(area => ({ ...area, count: 0 }))

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
              href={`/area/${area.slug}`}
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
