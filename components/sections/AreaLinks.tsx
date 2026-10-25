// Link here is LocaleLink: it keeps the reader in the language they are already
// reading. See components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import { SITE_T, type Locale } from '@/lib/site-i18n'
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
    <section className="py-12 bg-spacemate-bgLight border-t border-spacemate-borderLight">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-2">{t.areaHeading}</h2>
        <p className="text-gray-500 text-sm mb-8">{t.areaSub}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {picked.map(r => (
            <Link
              key={r.slug}
              href={`/rent/${r.slug}`}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-spacemate-borderLight hover:border-spacemate-brandTeal hover:shadow-premium transition-all duration-200"
            >
              <span className="text-sm font-medium text-spacemate-textCharcoal group-hover:text-spacemate-brandDark leading-tight transition-colors">
                {label(r, locale)}
              </span>
              <span className="text-sm font-semibold text-spacemate-brandTeal ml-3 flex-shrink-0 tabular-nums">
                {r.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
