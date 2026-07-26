import Link from 'next/link'
import { getGeneratedAreas } from '@/lib/areas'

/**
 * Homepage links to the data-driven area pages.
 *
 * Generated pages are useless if nothing links to them — Google follows links,
 * and a sitemap entry alone is a weak discovery signal. This is a server
 * component so the links exist in the initial HTML, which the hand-written
 * AreaLinks does not manage: it fetches counts client-side, so a crawler sees
 * the anchors but not the inventory behind them.
 *
 * Renders nothing when there is no inventory, rather than an empty heading.
 */
export default async function GeneratedAreaLinks() {
  const areas = await getGeneratedAreas()
  if (!areas.length) return null

  return (
    <section className="py-12 bg-white border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">
          ห้องเช่าตามเขต
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          รวมประกาศให้เช่าแยกตามเขตและประเภทที่พักในกรุงเทพฯ
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {areas.map(area => (
            <Link
              key={area.slug}
              href={`/area/${encodeURI(area.slug)}`}
              className="group flex items-center justify-between p-4 bg-spacemate-bgLight rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {area.labelTh}
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
