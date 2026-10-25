// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { createServerClient } from '@/lib/supabase'
import { LANDMARKS } from '@/lib/landmarks'
import { haversineKm } from '@/lib/search-match'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { RADIUS_KM, rentPath } from '@/lib/rent-slugs'

/**
 * Homepage links to rentals near Bangkok universities.
 *
 * Each tile opens that university's /rent page (listings within RADIUS_KM,
 * the same radius /search uses), and counts the active listings inside that
 * radius here on the server, so the number matches the page. They used to open
 * /search?landmark=…, which canonicalises to /search and so passed no ranking
 * value to anything. Busiest first; universities with nothing nearby yet stay
 * listed, last, because the search behind them is still the right answer.
 *
 * Replaced the district list (GeneratedAreaLinks) on 24 Oct 2026; the
 * district pages themselves remain, linked from the sitemap.
 */
const UNIVERSITIES = LANDMARKS.filter(l => l.kind === 'university')

async function activePoints(): Promise<{ lat: number; lng: number }[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('properties')
      .select('lat, lng')
      .eq('listing_status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(5000)
    if (error) {
      console.error('university links: query failed —', error.message)
      return []
    }
    return (data ?? [])
      .map(r => ({ lat: Number(r.lat), lng: Number(r.lng) }))
      .filter(p => isFinite(p.lat) && isFinite(p.lng))
  } catch (e) {
    console.error('university links: query threw —', e)
    return []
  }
}

export default async function UniversityLinks({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const points = await activePoints()

  const unis = UNIVERSITIES
    .map(u => ({
      ...u,
      count: points.filter(p => haversineKm(u.lat, u.lng, p.lat, p.lng) <= RADIUS_KM).length,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <section className="py-12 bg-white border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">
          {t.uniAreaHeading}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {t.uniAreaSub}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {unis.map(u => (
            <Link
              key={u.id}
              href={rentPath({ kind: 'landmark', id: u.id, landmark: u })}
              className="group flex items-center justify-between p-4 bg-spacemate-bgLight rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {locale === 'en' ? u.en : u.th}
              </span>
              <span className="text-sm font-semibold text-spacemate-brandTeal ml-3 flex-shrink-0 tabular-nums">
                {u.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
