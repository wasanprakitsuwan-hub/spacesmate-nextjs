// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'
import { C, WRAP } from '@/lib/ui'
import { listRentPages, TYPE_PHRASE, FOLDED_AREAS, type RentPageSummary } from '@/lib/rent-pages'

/**
 * Homepage links to the busiest "rent near" pages.
 *
 * This used to list the 16 hand-written /area guides, counted in the browser
 * by matching words in addresses. Those guides were folded into the /rent
 * pages on 25 Oct 2026, so the section now links straight to the rent pages
 * with the most listings, counted on the server so crawlers see the numbers
 * and the links. Indexable pages come first; if fewer than SHOW have stock,
 * the pages that took over the old guides fill the rest, so the section never
 * shrinks to nothing on a quiet week.
 */
const SHOW = 16

function label(r: RentPageSummary, locale: Locale): string {
  const place = locale === 'en' ? r.placeEn : r.placeTh
  if (!r.type) return locale === 'en' ? `Rentals near ${place}` : `ห้องเช่าใกล้${place}`
  return locale === 'en' ? `${TYPE_PHRASE.en[r.type]} near ${place}` : `${TYPE_PHRASE.th[r.type]} ใกล้${place}`
}

export default async function AreaLinks({ locale = 'th' }: { locale?: Locale }) {
  const t = SITE_T[locale]
  const all = await listRentPages()

  const picked = all.filter(r => r.indexable).sort((a, b) => b.count - a.count).slice(0, SHOW)
  if (picked.length < SHOW) {
    const have = new Set(picked.map(r => r.slug))
    const folded = new Set(Object.values(FOLDED_AREAS).map(f => `${f.place}|${f.type}`))
    for (const r of all) {
      if (picked.length >= SHOW) break
      if (!have.has(r.slug) && folded.has(`${r.placeKey}|${r.type}`)) picked.push(r)
    }
  }

  return (
    <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '24px 24px 40px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: C.green }}>{t.areaHeading}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px 32px', fontSize: 14 }}>
        {picked.map(r => (
          <Link key={r.slug} href={`/rent/${r.slug}`} className="sm-row-link"
            style={{ color: C.ink, display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: `1px solid ${C.line2}`, textDecoration: 'none' }}>
            <span>{label(r, locale)}</span>
            <span style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{r.count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
