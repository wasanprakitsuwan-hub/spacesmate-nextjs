// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { createServerClient } from '@/lib/supabase'
import { LANDMARKS } from '@/lib/landmarks'
import { haversineKm } from '@/lib/search-match'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { C, WRAP } from '@/lib/ui'
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
    <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '8px 24px 72px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: C.green }}>{t.uniAreaHeading}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px 32px', fontSize: 14 }}>
        {unis.map(u => (
          <Link key={u.id} href={rentPath({ kind: 'landmark', id: u.id, landmark: u })} className="sm-row-link"
            style={{ color: C.ink, display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: `1px solid ${C.line2}`, textDecoration: 'none' }}>
            <span>{locale === 'en' ? u.en : u.th}</span>
            <span style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{u.count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
